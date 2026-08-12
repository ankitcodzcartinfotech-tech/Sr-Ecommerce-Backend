const UserOrder = require('../model/userOrder.model');
const { emitToOrderRoom } = require('../socket.io');
const { sendNotification } = require('../services/notification.service');
const smsService = require('../services/smsService');

// Map order status values to notification types
const STATUS_TO_NOTIFICATION_TYPE = {
    Confirmed:        'ORDER_CONFIRMED',
    Processing:       'ORDER_PACKED',
    Shipped:          'ORDER_SHIPPED',
    OutForDelivery:   'ORDER_OUT_FOR_DELIVERY',
    Delivered:        'ORDER_DELIVERED',
    Cancelled:        'ORDER_CANCELLED',
    Returned:         'ORDER_RETURNED',
    Refunded:         'REFUND_PROCESSED',
};

const STATUS_TO_MESSAGE = {
    Confirmed:        (orderNumber) => `Your order ${orderNumber} has been confirmed!`,
    Processing:       (orderNumber) => `Your order ${orderNumber} is being packed.`,
    Shipped:          (orderNumber) => `Your order ${orderNumber} has been shipped and is on its way!`,
    OutForDelivery:   (orderNumber) => `Your order ${orderNumber} is out for delivery today!`,
    Delivered:        (orderNumber) => `Your order ${orderNumber} has been delivered. Enjoy your purchase!`,
    Cancelled:        (orderNumber) => `Your order ${orderNumber} has been cancelled.`,
    Returned:         (orderNumber) => `Return for order ${orderNumber} has been processed.`,
    Refunded:         (orderNumber) => `Refund for order ${orderNumber} has been processed.`,
};

exports.getAllUserOrders = async (req, res) => {
    try {
        const { search, page = 1, limit = 10 } = req.query;
        
        let filter = {};
        
        if (search) {
            filter.$or = [
                { orderNumber: { $regex: search, $options: 'i' } },
                { 'shippingAddress.fullName': { $regex: search, $options: 'i' } },
                { 'shippingAddress.phone': { $regex: search, $options: 'i' } }
            ];
        }
        
        const skip = (parseInt(page) - 1) * parseInt(limit);
        
        const [orders, total] = await Promise.all([
            UserOrder.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .populate('user', 'name email'),
            UserOrder.countDocuments(filter)
        ]);
        
        res.status(200).json({
            success: true,
            orders,
            pagination: {
                total,
                page: parseInt(page),
                limit: parseInt(limit),
                totalPages: Math.ceil(total / parseInt(limit))
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.getUserOrderById = async (req, res) => {
    try {
        const { id } = req.params;
        
        const order = await UserOrder.findById(id)
            .populate('user', 'name email');
        
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        
        res.status(200).json({
            success: true,
            order
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.updateUserOrderStatus = async (req, res) => {
    try {
        const { id } = req.params;
        const { orderStatus, paymentStatus } = req.body;
        
        const updateData = {};
        if (orderStatus) updateData.orderStatus = orderStatus;
        if (paymentStatus !== undefined) updateData.paymentStatus = paymentStatus;
        
        const updatedOrder = await UserOrder.findByIdAndUpdate(
            id,
            updateData,
            { new: true }
        ).populate('user', 'name email');
        
        if (!updatedOrder) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }
        
        // ── Fire-and-forget: SMS + Socket notification — do NOT await ──────
        // Respond immediately; background tasks run independently.

        // 1. Send persisted notification + Socket.IO push to user's personal room
        const notifType = STATUS_TO_NOTIFICATION_TYPE[orderStatus];
        const notifMessage = STATUS_TO_MESSAGE[orderStatus];
        if (notifType && notifMessage && updatedOrder.user?._id) {
            sendNotification({
                type: notifType,
                message: notifMessage(updatedOrder.orderNumber),
                userId: updatedOrder.user._id,
                metadata: { orderId: updatedOrder._id, orderNumber: updatedOrder.orderNumber }
            }).catch(err => console.error(`[Admin] ${notifType} notification failed:`, err));
        }

        // 2. Emit real-time update to any client listening on the order room
        try {
            emitToOrderRoom(updatedOrder._id.toString(), 'order:updated', {
                orderId: updatedOrder._id,
                orderStatus: updatedOrder.orderStatus,
                paymentStatus: updatedOrder.paymentStatus
            });
        } catch (socketErr) {
            console.error('[Admin] Socket emission error:', socketErr);
        }

        // 3. SMS is non-blocking
        if (orderStatus && updatedOrder.user) {
            smsService.sendOrderStatusSMS(updatedOrder, updatedOrder.user, orderStatus)
                .catch(smsErr => console.error('[Admin] Status SMS error:', smsErr));
        }

        res.status(200).json({
            success: true,
            message: 'Order updated successfully',
            order: updatedOrder
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
