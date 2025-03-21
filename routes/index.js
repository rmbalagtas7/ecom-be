const express = require("express")
const router = express.Router()

router.use("/api/user", require("./users"))
router.use("/api/products", require("./products"));
router.use("/api/cart", require("./cart"));

module.exports = router;