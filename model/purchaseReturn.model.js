const mongoose = require("mongoose");

const purchaseReturnItemSchema = new mongoose.Schema({
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

const purchaseReturnSchema = new mongoose.Schema({
    purchaseReturnNumber: {
        type: String,
        unique: true
    },
    purchaseBillNumber: {
        type: String,
        required: true
    },
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Parties',
        required: true
    },
    purchaseReturnDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    transport: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transports'
    },
    notes: {
        type: String,
        default: ""
    },
    items: [purchaseReturnItemSchema],
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
    terms: {
        type: [String],
        default: [
            "Goods once sold will not be taken back or exchanged.",
            "All disputes are subject to SURAT jurisdiction only.",
            "Any Complaints regarding goods should be made within 2 days from the receipt.",
            "Interest @ 24% per annum will be charged for delayed payment.",
            "Payment should be made bill to bill by A/c payee cheque / draft only."
        ]
    }
}, {
    versionKey: false,
    timestamps: true
});

// Pre-save hook to auto-increment the purchase return number if empty/not provided
purchaseReturnSchema.pre('save', async function () {
    if (this.isNew && (!this.purchaseReturnNumber || this.purchaseReturnNumber.trim() === "")) {
        const returns = await mongoose.model('PurchaseReturn').find({}, { purchaseReturnNumber: 1 });
        let nextNumber = 1;
        if (returns && returns.length > 0) {
            const numbers = returns
                .map(r => parseInt(r.purchaseReturnNumber, 10))
                .filter(num => !isNaN(num));
            if (numbers.length > 0) {
                nextNumber = Math.max(...numbers) + 1;
            }
        }
        this.purchaseReturnNumber = String(nextNumber);
    }
});

const PurchaseReturn = mongoose.model("PurchaseReturn", purchaseReturnSchema);
module.exports = PurchaseReturn;