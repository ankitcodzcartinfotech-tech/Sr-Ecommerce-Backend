const CART = require('../model/cart.model');
const PDFDocument = require('pdfkit');
const UserOrder = require('../model/userOrder.model');
const Address = require('../model/address.model');
const PRODUCT = require('../model/product.model');
const USER = require('../model/user.model');
const { sendNotification } = require('../services/notification.service');
const { generatePremiumInvoiceBuffer } = require('../helper/pdfInvoiceGenerator');
const smsService = require('../services/smsService');

exports.createOrder = async (req, res) => {
    try {
        const userId = req.user._id;
        const { addressId, paymentMethod = 'COD', notes = '', shippingCost = 0 } = req.body;

        // Normalize paymentMethod — frontend may send uppercase values like RAZORPAY, COD, UPI
        const PAYMENT_METHOD_MAP = {
            razorpay:  'Razorpay',
            RAZORPAY:  'Razorpay',
            online:    'Online',
            ONLINE:    'Online',
            upi:       'UPI',
            UPI:       'UPI',
            card:      'Card',
            CARD:      'Card',
            cod:       'COD',
            COD:       'COD',
        };
        const normalizedPayment = PAYMENT_METHOD_MAP[paymentMethod] || paymentMethod;

        if (!addressId) {
            return res.status(400).json({ success: false, message: 'Shipping address is required' });
        }

        const address = await Address.findOne({ _id: addressId, user: userId });
        if (!address) {
            return res.status(404).json({ success: false, message: 'Address not found' });
        }

        const cart = await CART.findOne({ user: userId }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: 'Cart is empty' });
        }

        const orderItems = [];
        let subtotal = 0;
        let totalGst = 0;
        const removedItemIds = [];

        for (const item of cart.items) {
            if (!item.product) {
                removedItemIds.push(item._id.toString());
                continue;
            }

            const product = await PRODUCT.findById(item.product._id);
            if (!product) {
                removedItemIds.push(item._id.toString());
                continue;
            }

            const availableStock = product.stockDetails.openingQuantity || 0;
            if (product.productDetail.checkNegativeStock === 1 && availableStock < item.quantity) {
                return res.status(400).json({
                    success: false,
                    message: `Insufficient stock for "${product.productDetail.name}". Available: ${availableStock}`,
                    availableStock
                });
            }

            const livePrice = product.saleDetails?.salePrice || item.price;
            const itemSubtotal = livePrice * item.quantity;
            subtotal += itemSubtotal;

            const gstRate = product.purchaseDetails?.gstTax || 0;
            totalGst += (itemSubtotal * gstRate) / 100;

            orderItems.push({
                product: product._id,
                productName: product.productDetail.name,
                productImage: (product.productDetail.images && product.productDetail.images.length > 0) ? product.productDetail.images[0] : '',
                quantity: item.quantity,
                price: livePrice,
                subtotal: itemSubtotal
            });
        }

        if (orderItems.length === 0) {
            return res.status(400).json({ success: false, message: 'No valid products in cart to place an order' });
        }

        const totalAmount = subtotal + Number(shippingCost) + Math.round(totalGst);
        const totalItems = orderItems.reduce((sum, item) => sum + item.quantity, 0);

        const shippingAddress = {
            fullName: address.fullName,
            phone: address.phone,
            addressLine1: address.addressLine1,
            addressLine2: address.addressLine2,
            city: address.city,
            state: address.state,
            pincode: address.pincode,
            country: address.country
        };

        const order = await UserOrder.create({
            user: userId,
            items: orderItems,
            shippingAddress,
            paymentMethod: normalizedPayment,
            totalItems,
            subtotal,
            totalGst: Math.round(totalGst),
            shippingCost: Number(shippingCost),
            totalAmount,
            notes
        });

        for (const item of orderItems) {
            await PRODUCT.findByIdAndUpdate(item.product, {
                $inc: { 'stockDetails.openingQuantity': -item.quantity }
            });
        }

        cart.items = [];
        cart.calculateTotals();
        await cart.save();

        // ── Fire-and-forget notifications — do NOT await these ──────────
        // Sending the HTTP response immediately; notifications run in background.
        sendNotification({
            type: 'ORDER_PLACED',
            message: `Your order ${order.orderNumber} has been placed successfully!`,
            userId,
            metadata: { orderId: order._id, orderNumber: order.orderNumber }
        }).catch(err => console.error('[Order] ORDER_PLACED notification failed:', err));

        sendNotification({
            type: 'ADMIN_NEW_ORDER',
            message: `New order ${order.orderNumber} has been received!`,
            isAdmin: true,
            metadata: { orderId: order._id, orderNumber: order.orderNumber }
        }).catch(err => console.error('[Order] ADMIN_NEW_ORDER notification failed:', err));

        // SMS is also fire-and-forget (non-blocking)
        USER.findById(userId).then(user => {
            if (user) smsService.sendOrderStatusSMS(order, user, 'Placed');
        }).catch(err => console.error('Error sending order SMS:', err));

        res.status(201).json({
            success: true,
            message: 'Order placed successfully',
            order,
            ...(removedItemIds.length > 0 && { warning: 'Some unavailable products were automatically removed from your cart' })
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.getOrders = async (req, res) => {
    try {
        const userId = req.user._id;
        const { page = 1, limit = 10, status } = req.query;

        const filter = { user: userId };
        if (status) filter.orderStatus = status;

        const skip = (parseInt(page) - 1) * parseInt(limit);

        const [orders, total] = await Promise.all([
            UserOrder.find(filter)
                .sort({ createdAt: -1 })
                .skip(skip)
                .limit(parseInt(limit))
                .populate('items.product', 'productDetail.name productDetail.images'),
            UserOrder.countDocuments(filter)
        ]);

        res.status(200).json({
            success: true,
            message: 'Orders fetched successfully',
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

exports.getOrderById = async (req, res) => {
    try {
        const userId = req.user._id;
        const { orderId } = req.params;

        const order = await UserOrder.findOne({ _id: orderId, user: userId })
            .populate('items.product', 'productDetail saleDetails');

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        res.status(200).json({
            success: true,
            message: 'Order fetched successfully',
            order
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.cancelOrder = async (req, res) => {
    try {
        const userId = req.user._id;
        const { orderId } = req.params;
        const { cancelReason = '' } = req.body || {};

        const order = await UserOrder.findOne({ _id: orderId, user: userId });
        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        if (order.orderStatus !== 'Pending' && order.orderStatus !== 'Confirmed') {
            return res.status(400).json({
                success: false,
                message: `Order cannot be cancelled. Current status: ${order.orderStatus}`
            });
        }

        for (const item of order.items) {
            await PRODUCT.findByIdAndUpdate(item.product, {
                $inc: { 'stockDetails.openingQuantity': item.quantity }
            });
        }

        order.orderStatus = 'Cancelled';
        order.cancelReason = cancelReason;
        order.cancelledAt = new Date();
        await order.save();

        // Fire-and-forget — don't block the response
        sendNotification({
            type: 'ORDER_CANCELLED',
            message: `Your order ${order.orderNumber} has been cancelled.`,
            userId,
            metadata: { orderId: order._id, orderNumber: order.orderNumber }
        }).catch(err => console.error('[Order] ORDER_CANCELLED notification failed:', err));

        USER.findById(userId).then(user => {
            if (user) smsService.sendOrderStatusSMS(order, user, 'Cancelled');
        }).catch(err => console.error('Error sending cancel SMS:', err));

        res.status(200).json({
            success: true,
            message: 'Order cancelled successfully',
            order
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.trackOrder = async (req, res) => {
    try {
        const userId = req.user._id;
        const { orderId } = req.params;

        const order = await UserOrder.findOne({ _id: orderId, user: userId })
            .select('orderNumber orderStatus paymentStatus shippingAddress createdAt updatedAt cancelledAt cancelReason');

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const statusTimeline = [
            { status: 'Pending', label: 'Order Placed' },
            { status: 'Confirmed', label: 'Order Confirmed' },
            { status: 'Processing', label: 'Processing' },
            { status: 'Shipped', label: 'Shipped' },
            { status: 'Delivered', label: 'Delivered' }
        ];

        const currentStatusIndex = statusTimeline.findIndex(s => s.status === order.orderStatus);

        res.status(200).json({
            success: true,
            message: 'Order tracking fetched successfully',
            tracking: {
                orderNumber: order.orderNumber,
                currentStatus: order.orderStatus,
                paymentStatus: order.paymentStatus,
                shippingAddress: order.shippingAddress,
                timeline: statusTimeline.map((step, index) => ({
                    ...step,
                    completed: index <= currentStatusIndex && order.orderStatus !== 'Cancelled',
                    isCurrent: index === currentStatusIndex && order.orderStatus !== 'Cancelled'
                })),
                cancelledAt: order.cancelledAt,
                cancelReason: order.cancelReason,
                createdAt: order.createdAt,
                updatedAt: order.updatedAt
            }
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.generateInvoice = async (req, res) => {
    try {
        const userId = req.user._id;
        const { orderId } = req.params;

        const order = await UserOrder.findOne({ _id: orderId, user: userId })
            .populate('user', 'name email phone');

        if (!order) {
            return res.status(404).json({ success: false, message: 'Order not found' });
        }

        const invoiceNumber = `INV-${order.orderNumber || order._id.toString().slice(-8).toUpperCase()}`;
        const orderDate = new Date(order.createdAt).toLocaleDateString('en-IN', {
            day: 'numeric', month: 'long', year: 'numeric'
        });

        const pdfBuffer = await generatePremiumInvoiceBuffer(order);

        res.setHeader('Content-Type', 'application/pdf');
        res.setHeader('Content-Disposition', `attachment; filename="${invoiceNumber}.pdf"`);
        res.end(pdfBuffer);
    } catch (error) {
        console.error('Invoice generation error:', error);
        if (!res.headersSent) {
            res.status(500).json({ success: false, message: 'Could not generate invoice' });
        }
    }
};
