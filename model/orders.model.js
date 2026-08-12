const mongoose = require('mongoose');

const orderItemSchema = new mongoose.Schema({
    product: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Product',
        required: true
    },
    description: {
        type: String,
        required: true
    },
    designNo: {
        type: String
    },
    hsnCode: {
        type: String
    },
    pcs: {
        type: Number,
        required: true,
        default: 1
    },
    rate: {
        type: Number,
        required: true,
        default: 0
    },
    total: {
        type: Number,
        required: true
    },
    discPercent: {
        type: Number,
        default: 0
    },
    discAmount: {
        type: Number,
        default: 0
    },
    taxableAmount: {
        type: Number,
        required: true
    },
    cgstPercent: {
        type: Number,
        default: 0
    },
    cgstAmount: {
        type: Number,
        default: 0
    },
    sgstPercent: {
        type: Number,
        default: 0
    },
    sgstAmount: {
        type: Number,
        default: 0
    },
    igstPercent: {
        type: Number,
        default: 0
    },
    igstAmount: {
        type: Number,
        default: 0
    },
    netAmount: {
        type: Number,
        required: true
    }
});

const orderSchema = new mongoose.Schema({
    orderType: {
        type: String,
        enum: ['Sales', 'Purchase', 'Job Work'],
        required: true
    },
    spoNo: {
        type: Number,
        unique: true
    },
    spoDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    party: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Parties',
        required: true
    },
    validDate: {
        type: Date,
        required: true
    },
    transport: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transports'
    },
    agent: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Agent'
    },
    items: [orderItemSchema],
    taxableAmountTotal: {
        type: Number,
        required: true,
        default: 0
    },
    cgstTotal: {
        type: Number,
        required: true,
        default: 0
    },
    sgstTotal: {
        type: Number,
        required: true,
        default: 0
    },
    igstTotal: {
        type: Number,
        required: true,
        default: 0
    },
    extraDiscountPercent: {
        type: Number,
        default: 0
    },
    extraDiscountAmount: {
        type: Number,
        default: 0
    },
    shippingCost: {
        type: Number,
        default: 0
    },
    invoiceTotal: {
        type: Number,
        required: true,
        default: 0
    },
    notes: {
        type: String,
        default: ""
    },
    terms: {
        type: [String],
        default: [
            "Goods once sold will not be taken back or exchanged",
            "All disputes are subject to Surat jurisdiction only"
        ]
    }
}, {
    versionKey: false,
    timestamps: true
});

// Pre-save hook to auto-increment the unique spoNo
orderSchema.pre('save', async function () {
    if (this.isNew && !this.spoNo) {
        const lastOrder = await mongoose.model('Orders').findOne({}, {}, { sort: { spoNo: -1 } });
        this.spoNo = lastOrder && lastOrder.spoNo ? lastOrder.spoNo + 1 : 1;
    }
});

const Orders = mongoose.model('Orders', orderSchema);
module.exports = Orders;
