const mongoose = require("mongoose");

// Sub-schema to hold list of settled invoices under this payment receipt
const settledInvoiceSchema = new mongoose.Schema({
    salesInvoice: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Sales",
        required: true
    },
    invoiceNumber: {
        type: String,
        required: true
    },
    invoiceDate: {
        type: Date,
        required: true
    },
    invoiceAmount: {
        type: Number,
        required: true
    },
    pendingAmount: {
        type: Number,
        required: true
    },
    settledAmount: {
        type: Number,
        required: true,
        default: 0
    }
}, { _id: false });

const receiptSchema = new mongoose.Schema({
    receiptNumber: {
        type: String,
        unique: true
    },
    customer: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Parties",
        required: true
    },
    paymentDate: {
        type: Date,
        required: true,
        default: Date.now
    },
    paymentMode: {
        type: mongoose.Schema.Types.ObjectId,
        ref: 'Bank',
        required: true
    },
    notes: {
        type: String,
        default: ""
    },
    settledInvoices: [settledInvoiceSchema],
    amount: {
        type: Number,
        required: true,
        default: 0
    }
}, {
    versionKey: false,
    timestamps: true
});

// Pre-save hook to auto-increment the receipt number if not provided
receiptSchema.pre("save", async function () {
    if (this.isNew && (!this.receiptNumber || this.receiptNumber.trim() === "")) {
        const receipts = await mongoose.model("Receipt").find({}, { receiptNumber: 1 });
        let nextNumber = 1;
        if (receipts && receipts.length > 0) {
            const numbers = receipts
                .map(r => parseInt(r.receiptNumber, 10))
                .filter(num => !isNaN(num));
            if (numbers.length > 0) {
                nextNumber = Math.max(...numbers) + 1;
            }
        }
        this.receiptNumber = String(nextNumber);
    }
});

const Receipt = mongoose.model("Receipt", receiptSchema);
module.exports = Receipt;