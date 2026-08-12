const express = require("express");
const router = express.Router();
const receiptController = require("../../controller/receipt.controller");

router.get("/", receiptController.getReceipts);
router.get("/next-receipt-number", receiptController.getNextReceiptNumber);
router.get("/:id", receiptController.getReceipt);
router.post("/", receiptController.addReceipt);
router.put("/:id", receiptController.updateReceipt);
router.delete("/:id", receiptController.deleteReceipt);

module.exports = router;
