const RECEIPT = require("../model/receipt.model");
const SALES = require("../model/sales.model");
const { addReceiptSchema, updateReceiptSchema, validateBodyData } = require("../helper/validator");

exports.getReceipts = async (req, res) => {
    try {
        const receipts = await RECEIPT.find()
            .populate("customer")
            .populate("paymentMode") // paymentMode references Bank model
            .populate("settledInvoices.salesInvoice")
            .sort({ createdAt: -1 });

        res.status(200).json({ success: true, message: "Receipts fetched successfully", receipts });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.getReceipt = async (req, res) => {
    try {
        const { id } = req.params;
        const receipt = await RECEIPT.findById(id)
            .populate("customer")
            .populate("paymentMode")
            .populate("settledInvoices.salesInvoice");

        if (!receipt) {
            return res.status(404).json({ success: false, message: "Receipt not found" });
        }
        res.status(200).json({ success: true, message: "Receipt fetched successfully", receipt });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.getNextReceiptNumber = async (req, res) => {
    try {
        const receipts = await RECEIPT.find({}, { receiptNumber: 1 });
        let nextNumber = 1;
        if (receipts && receipts.length > 0) {
            const numbers = receipts
                .map(r => parseInt(r.receiptNumber, 10))
                .filter(num => !isNaN(num));
            if (numbers.length > 0) {
                nextNumber = Math.max(...numbers) + 1;
            }
        }
        res.status(200).json({ success: true, nextReceiptNumber: String(nextNumber) });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.addReceipt = async (req, res) => {
    try {
        const { error, value } = validateBodyData(addReceiptSchema, req.body);
        if (error) {
            return res.status(400).json({ success: false, ...error });
        }

        const receipt = await RECEIPT.create(value);

        // Update corresponding sales invoices with settled amounts
        if (value.settledInvoices && value.settledInvoices.length > 0) {
            for (const item of value.settledInvoices) {
                const sale = await SALES.findById(item.salesInvoice);
                if (sale) {
                    sale.amountReceived = Number((sale.amountReceived || 0) + item.settledAmount);
                    sale.markAsFullyPaid = sale.amountReceived >= sale.invoiceTotal;
                    await sale.save();
                }
            }
        }

        res.status(201).json({ success: true, message: "Receipt created successfully", receipt });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.updateReceipt = async (req, res) => {
    try {
        const { id } = req.params;
        const { error, value } = validateBodyData(updateReceiptSchema, req.body);
        if (error) {
            return res.status(400).json({ success: false, ...error });
        }

        const oldReceipt = await RECEIPT.findById(id);
        if (!oldReceipt) {
            return res.status(404).json({ success: false, message: "Receipt not found" });
        }

        // 1. Revert settled amounts on old sales invoices
        if (oldReceipt.settledInvoices && oldReceipt.settledInvoices.length > 0) {
            for (const item of oldReceipt.settledInvoices) {
                const sale = await SALES.findById(item.salesInvoice);
                if (sale) {
                    sale.amountReceived = Number(Math.max(0, (sale.amountReceived || 0) - item.settledAmount));
                    sale.markAsFullyPaid = sale.amountReceived >= sale.invoiceTotal;
                    await sale.save();
                }
            }
        }

        // 2. Update the Receipt in database
        const updatedReceipt = await RECEIPT.findByIdAndUpdate(id, value, { returnDocument: "after", runValidators: true })
            .populate("customer")
            .populate("paymentMode")
            .populate("settledInvoices.salesInvoice");

        // 3. Apply new settled amounts to the sales invoices
        if (value.settledInvoices && value.settledInvoices.length > 0) {
            for (const item of value.settledInvoices) {
                const sale = await SALES.findById(item.salesInvoice);
                if (sale) {
                    sale.amountReceived = Number((sale.amountReceived || 0) + item.settledAmount);
                    sale.markAsFullyPaid = sale.amountReceived >= sale.invoiceTotal;
                    await sale.save();
                }
            }
        }

        res.status(200).json({ success: true, message: "Receipt updated successfully", receipt: updatedReceipt });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};

exports.deleteReceipt = async (req, res) => {
    try {
        const { id } = req.params;
        const receipt = await RECEIPT.findByIdAndDelete(id);
        if (!receipt) {
            return res.status(404).json({ success: false, message: "Receipt not found" });
        }

        // Revert settled amounts on sales invoices
        if (receipt.settledInvoices && receipt.settledInvoices.length > 0) {
            for (const item of receipt.settledInvoices) {
                const sale = await SALES.findById(item.salesInvoice);
                if (sale) {
                    sale.amountReceived = Number(Math.max(0, (sale.amountReceived || 0) - item.settledAmount));
                    sale.markAsFullyPaid = sale.amountReceived >= sale.invoiceTotal;
                    await sale.save();
                }
            }
        }

        res.status(200).json({ success: true, message: "Receipt deleted successfully" });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: "Internal server error" });
    }
};
