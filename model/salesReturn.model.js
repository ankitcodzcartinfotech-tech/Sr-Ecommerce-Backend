const mongoose = require('mongoose');

const salesReturnItemSchema = new mongoose.Schema({
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
        type: String,
        default: ''
    },
    hsnCode: {
        type: String,
        default: ''
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

const salesReturnSchema = new mongoose.Schema({
    saleReturnNumber: {
        type: String,
        unique: true
    },
    returnDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Parties',
        required: true
    },
    transport: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transports'
    },
    items: [salesReturnItemSchema],
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
    amountReceived: {
        type: Number,
        default: 0
    },
    paymentType: {
        type: String,
        enum: ['Cash', 'Bank'],
        default: 'Cash'
    },
    bank: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bank'
    },
    markAsFullyPaid: {
        type: Boolean,
        default: false
    },
    notes: {
        type: String,
        default: ''
    },
    terms: {
        type: [String],
        default: [
            'Goods once sold will not be taken back or exchanged.',
            'All disputes are subject to SURAT jurisdiction only.',
            'Any Complaints regarding goods should be made within 2 days from the receipt.',
            'Interest @ 24% per annum will be charged for delayed payment.',
            'Payment should be made bill to bill by A/c payee cheque / draft only.'
        ]
    }
}, {
    versionKey: false,
    timestamps: true
});

// Pre-save hook to auto-increment the sale return number mathematically
salesReturnSchema.pre('save', async function () {
    if (this.isNew && (!this.saleReturnNumber || this.saleReturnNumber.trim() === '')) {
        const returns = await mongoose.model('SalesReturn').find({}, { saleReturnNumber: 1 });
        let nextNumber = 1;
        if (returns && returns.length > 0) {
            const numbers = returns
                .map(r => parseInt(r.saleReturnNumber, 10))
                .filter(num => !isNaN(num));
            if (numbers.length > 0) {
                nextNumber = Math.max(...numbers) + 1;
            }
        }
        this.saleReturnNumber = String(nextNumber);
    }
});

const SalesReturn = mongoose.model('SalesReturn', salesReturnSchema);
module.exports = SalesReturn;