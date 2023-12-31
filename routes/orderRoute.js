const express = require("express");
const router = express.Router();

const {
  newOrder,
  getSingleOrder,
  getAllOrders,
  deleteTrip,
  intializePayment,
  paymentSuccessCallback,
  paymentVerification,
  createPdf,
} = require("../controllers/orderController");

const {
  isAuthenticatedUser,
  authorizeRole,
  checkVerified,
} = require("../middlewares/auth");

router.route("/new").post(isAuthenticatedUser, checkVerified, newOrder);
router
  .route("/single/:id")
  .get(isAuthenticatedUser, checkVerified, getSingleOrder);
router.route("/all").get(isAuthenticatedUser, checkVerified, getAllOrders);
router.route("/remove").delete(isAuthenticatedUser, checkVerified, deleteTrip);
router
  .route("/initialize/:orderId")
  .get(isAuthenticatedUser, checkVerified, intializePayment);
// router.route("/payment/success").get(paymentSuccessCallback);
router.route("/payment/verify").get(paymentVerification);
router.route("/create/pdf").get(isAuthenticatedUser, checkVerified, createPdf);

module.exports = router;
