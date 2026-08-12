const mongoose = require('mongoose');

// Sub-schema to hold list of settled invoices under this payment receipt
const settledInvoiceSchema = new mongoose.Schema({
    purchaseInvoice: {
        type: mongoose.Schema.Types.ObjectId,
        ref: "Purchase",
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

const paymentSchema = new mongoose.Schema({
    paymentNumber: {
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
    chequeNo: {
        type: String,
        default: ""
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

},{
    versionKey: false,
    timestamps: true
});

// Pre-save hook to auto-increment the receipt number if not provided
paymentSchema.pre("save", async function () {
    if (this.isNew && (!this.paymentNumber || this.paymentNumber.trim() === "")) {
        const payments = await mongoose.model("Payment").find({}, { paymentNumber: 1 });
        let nextNumber = 1;
        if (payments && payments.length > 0) {
            const numbers = payments
                .map(r => parseInt(r.paymentNumber, 10))
                .filter(num => !isNaN(num));
            if (numbers.length > 0) {
                nextNumber = Math.max(...numbers) + 1;
            }
        }
        this.paymentNumber = String(nextNumber);
    }
});

const Payment = mongoose.model('Payment', paymentSchema);
module.exports = Payment;