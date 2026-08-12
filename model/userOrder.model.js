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
        const now = new Date();
        const year = now.getFullYear();
        const month = String(now.getMonth() + 1).padStart(2, '0');
        const day = String(now.getDate()).padStart(2, '0');
        const dateStr = `${year}${month}${day}`;
        
        // SOLUTION: Add User's unique short code to the prefix
        // This makes order numbers user-wise sequential but globally unique for the Admin Panel.
        // Also prevents MongoDB "duplicate key error" since orderNumber has `unique: true`.
        const userShortCode = this.user.toString().slice(-4).toUpperCase();
        
        // Generate order number in KRG-[USERCODE]-YYYYMMDD-XXXX format
        const prefix = `KRG-${userShortCode}-${dateStr}-`;
        
        // Find the last order for THIS user today to get the user-wise sequence number
        const lastOrder = await mongoose.model('UserOrder').findOne(
            { user: this.user, orderNumber: { $regex: `^${prefix}` } },
            {},
            { sort: { orderNumber: -1 } }
        );
        
        let sequenceNum = 1;
        if (lastOrder) {
            const lastSeq = parseInt(lastOrder.orderNumber.split('-').pop());
            sequenceNum = lastSeq + 1;
        }
        
        this.orderNumber = `${prefix}${String(sequenceNum).padStart(4, '0')}`;
    }
});

const UserOrder = mongoose.model('UserOrder', userOrderSchema);
module.exports = UserOrder;
