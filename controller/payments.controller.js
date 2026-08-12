const PAYMENT = require("../model/payments.model");
const PURCHASE = require("../model/purchase.model");
const { addPaymentSchema, updatePaymentSchema, validateBodyData } = require("../helper/validator");

exports.getPayments = async (req, res) => {
    try {
        const payments = await PAYMENT.find()
            .populate("customer")
            .populate("paymentMode") // paymentMode references Bank model
            .populate("settledInvoices.purchaseInvoice")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, message: "Payments fetched successfully", payments });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.getPayment = async (req, res) => {
    try {
        const { id } = req.params;
        const payment = await PAYMENT.findById(id)
            .populate("customer")
            .populate("paymentMode")
            .populate("settledInvoices.purchaseInvoice");

        if (!payment) {
            return res.status(404).json({ success: false, message: "Payment not found" });
        }
        res.status(200).json({ success: true, message: "Payment fetched successfully", payment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.getNextPaymentNumber = async (req, res) => {
    try {
        const payments = await PAYMENT.find({}, { paymentNumber: 1 });
        let nextNumber = 1;
        if (payments && payments.length > 0) {
            const numbers = payments
                .map(p => parseInt(p.paymentNumber, 10))
                .filter(num => !isNaN(num));
            if (numbers.length > 0) {
                nextNumber = Math.max(...numbers) + 1;
            }
        }
        res.status(200).json({ success: true, nextPaymentNumber: String(nextNumber) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.addPayment = async (req, res) => {
    try {
        const { error, value } = validateBodyData(addPaymentSchema, req.body);
        if (error) {
            return res.status(400).json({ success: false, ...error });
        }

        const payment = await PAYMENT.create(value);

        // Update corresponding purchase invoices with settled amounts
        if (value.settledInvoices && value.settledInvoices.length > 0) {
            for (const item of value.settledInvoices) {
                const purchase = await PURCHASE.findById(item.purchaseInvoice);
                if (purchase) {
                    purchase.amountReceived = Number((purchase.amountReceived || 0) + item.settledAmount);
                    purchase.markAsFullyPaid = purchase.amountReceived >= purchase.totalPayableAmount;
                    await purchase.save();
                }
            }
        }

        res.status(201).json({ success: true, message: "Payment created successfully", payment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.updatePayment = async (req, res) => {
    try {
        const { id } = req.params;
        const { error, value } = validateBodyData(updatePaymentSchema, req.body);
        if (error) {
            return res.status(400).json({ success: false, ...error });
        }

        const oldPayment = await PAYMENT.findById(id);
        if (!oldPayment) {
            return res.status(404).json({ success: false, message: "Payment not found" });
        }

        // 1. Revert settled amounts on old purchase invoices
        if (oldPayment.settledInvoices && oldPayment.settledInvoices.length > 0) {
            for (const item of oldPayment.settledInvoices) {
                const purchase = await PURCHASE.findById(item.purchaseInvoice);
                if (purchase) {
                    purchase.amountReceived = Number(Math.max(0, (purchase.amountReceived || 0) - item.settledAmount));
                    purchase.markAsFullyPaid = purchase.amountReceived >= purchase.totalPayableAmount;
                    await purchase.save();
                }
            }
        }

        // 2. Update the Payment in database
        const updatedPayment = await PAYMENT.findByIdAndUpdate(id, value, { returnDocument: "after", runValidators: true })
            .populate("customer")
            .populate("paymentMode")
            .populate("settledInvoices.purchaseInvoice");

        // 3. Apply new settled amounts to the purchase invoices
        if (value.settledInvoices && value.settledInvoices.length > 0) {
            for (const item of value.settledInvoices) {
                const purchase = await PURCHASE.findById(item.purchaseInvoice);
                if (purchase) {
                    purchase.amountReceived = Number((purchase.amountReceived || 0) + item.settledAmount);
                    purchase.markAsFullyPaid = purchase.amountReceived >= purchase.totalPayableAmount;
                    await purchase.save();
                }
            }
        }

        res.status(200).json({ success: true, message: "Payment updated successfully", payment: updatedPayment });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.deletePayment = async (req, res) => {
    try {
        const { id } = req.params;
        const payment = await PAYMENT.findByIdAndDelete(id);
        if (!payment) {
            return res.status(404).json({ success: false, message: "Payment not found" });
        }

        // Revert settled amounts on purchase invoices
        if (payment.settledInvoices && payment.settledInvoices.length > 0) {
            for (const item of payment.settledInvoices) {
                const purchase = await PURCHASE.findById(item.purchaseInvoice);
                if (purchase) {
                    purchase.amountReceived = Number(Math.max(0, (purchase.amountReceived || 0) - item.settledAmount));
                    purchase.markAsFullyPaid = purchase.amountReceived >= purchase.totalPayableAmount;
                    await purchase.save();
                }
            }
        }

        res.status(200).json({ success: true, message: "Payment deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
