const express = require("express");
const router = express.Router();
const CartController = require("../controllers/cart");

router.get("/cart-details/:id", CartController.getCart);
router.post("/add-cart", CartController.addToCart);
router.post("/remove-product", CartController.removeFromCart);
module.exports = router;