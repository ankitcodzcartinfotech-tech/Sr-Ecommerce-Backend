const mongoose = require("mongoose");

const purchaseItemSchema = new mongoose.Schema({
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

const purchaseSchema = new mongoose.Schema({
    purchaseInvoiceNumber: {
        type: String,
        unique: true
    },
    originalInvoiceNumber: {
        type: String,
        required: true
    },
    supplier: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Parties',
        required: true
    },
    purchaseDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    dueDate: {
        type: Date,
        required: true
    },
    transport: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Transports'
    },
    items: [purchaseItemSchema],
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
    applyTds: {
        type: Boolean,
        default: false
    },
    totalPayableAmount: {
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
        default: ""
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

// Pre-save hook to auto-increment the purchase invoice number if empty/not provided
purchaseSchema.pre('save', async function () {
    if (this.isNew && (!this.purchaseInvoiceNumber || this.purchaseInvoiceNumber.trim() === "")) {
        const purchases = await mongoose.model('Purchase').find({}, { purchaseInvoiceNumber: 1 });
        let nextNumber = 1;
        if (purchases && purchases.length > 0) {
            const numbers = purchases
                .map(p => parseInt(p.purchaseInvoiceNumber, 10))
                .filter(num => !isNaN(num));
            if (numbers.length > 0) {
                nextNumber = Math.max(...numbers) + 1;
            }
        }
        this.purchaseInvoiceNumber = String(nextNumber);
    }
});

const Purchase = mongoose.model("Purchase", purchaseSchema);
module.exports = Purchase;