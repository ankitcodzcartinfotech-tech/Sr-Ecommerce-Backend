const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    productName: {
        type: String,
        required: true
    },
    productImage: {
        type: String,
        default: ''
    },
    quantity: {
        type: Number,
        required: true,
        min: 1
    },
    price: {
        type: Number,
        required: true
    },
    subtotal: {
        type: Number,
        required: true
    }
}, { _id: true });

const userOrderSchema = new mongoose.Schema({
    user: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'User',
        required: true
    },
    orderNumber: {
        type: String,
        unique: true
    },
    items: [orderItemSchema],
    shippingAddress: {
        fullName: { type: String, required: true },
        phone: { type: String, required: true },
        addressLine1: { type: String, required: true },
        addressLine2: { type: String, default: '' },
        city: { type: String, required: true },
        state: { type: String, required: true },
        pincode: { type: String, required: true },
        country: { type: String, default: 'India' }
    },
    paymentMethod: {
        type: String,
        enum: ['COD', 'Online', 'UPI', 'Card', 'Razorpay'],
        default: 'COD'
    },
    paymentStatus: {
        type: String,
        enum: ['Pending', 'Paid', 'Failed', 'Refunded'],
        default: 'Pending'
    },
    orderStatus: {
        type: String,
        enum: ['Pending', 'Confirmed', 'Processing', 'Shipped', 'Delivered', 'Cancelled'],
        default: 'Pending'
    },
    totalItems: {
        type: Number,
        required: true,
        default: 0
    },
    subtotal: {
        type: Number,
        required: true,
        default: 0
    },
    shippingCost: {
        type: Number,
        default: 0
    },
    discount: {
        type: Number,
        default: 0
    },
    couponCode: {
        type: String,
        default: null
    },
    totalGst: {
        type: Number,
        default: 0
    },
    totalAmount: {
        type: Number,
        required: true,
        default: 0
    },
    notes: {
        type: String,
        default: ''
    },
    cancelReason: {
        type: String,
        default: ''
    },
    cancelledAt: {
        type: Date
    }
}, {
    versionKey: false,
    timestamps: true
});

userOrderSchema.pre('save', async function () {
    if (this.isNew && !this.orderNumber) {
        // Find the last order to get the global sequence number
        const lastOrder = await mongoose.model('UserOrder').findOne(
            {},
            {},
            { sort: { orderNumber: -1 } }
        );
        
        let sequenceNum = 1;
        if (lastOrder && lastOrder.orderNumber) {
            const lastSeq = parseInt(lastOrder.orderNumber, 10);
            if (!isNaN(lastSeq)) {
                sequenceNum = lastSeq + 1;
            }
        }
        
        this.orderNumber = String(sequenceNum).padStart(6, '0');
    }
});

const UserOrder = mongoose.model('UserOrder', userOrderSchema);
module.exports = UserOrder;
