const express = require("express")
const router = express.Router()

router.use("/api/user", require("./users"))
module.exports = router;