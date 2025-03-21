const express = require("express");
const router = express.Router();
const ProductsController = require("../controllers/products");

router.get("/", ProductsController.getAllProducts);
router.post("/add-new-product", ProductsController.addProducts);
router.put("/update-product/:id", ProductsController.updateProduct);
router.delete("/remove-product/:id", ProductsController.removeProduct);
module.exports = router;