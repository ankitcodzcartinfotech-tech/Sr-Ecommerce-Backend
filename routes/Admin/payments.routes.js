const express = require("express");
const router = express.Router();
const paymentsController = require("../../controller/payments.controller");

router.get("/", paymentsController.getPayments);
router.get("/next-payment-number", paymentsController.getNextPaymentNumber);
router.get("/:id", paymentsController.getPayment);
router.post("/", paymentsController.addPayment);
router.put("/:id", paymentsController.updatePayment);
router.delete("/:id", paymentsController.deletePayment);

module.exports = router;
