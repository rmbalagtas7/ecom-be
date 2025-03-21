const Products = require("../models/products");

exports.getAllProducts = async (req, res) => {
    try {
        const products = await Products.find(req.query);
        res.send({ success: true, products});
    } catch (error) {
        res.status(500).json({ success: false, error: "Internal Server Error"});
    }
}

exports.addProducts = async (req, res) => {
    try {

        const productExits = await Products.findOne({ productName: req.body.productName });

        if (productExits) {
            return res.status(400).json({ success: false, error: "Product Already Added"});
        }

        const newProduct = new Products(req.body);

        await newProduct.save();

        res.send({ success: true, product: newProduct, message: "Product added successfully"});
        
    } catch (error) {
        res.status(500).json({ success: false, error: "Internal Server Error"});
    }
}


//validation not working
exports.updateProduct = async (req, res) => {
    try {
        const product = await Products.findByIdAndUpdate(req.params.id, req.body, { new: true, runValidators: true});

        if (!product) {
            return res.status(404).json({ success: false, error: "Product not Found"});
        }

        res.send({ success: true, product });
    } catch (error) {
        res.status(500).json({ success: false, error: "Internal Server Error"});
    }
}

exports.removeProduct = async (req, res) => {
    try {
        const product = await Products.findByIdAndRemove(req.params.id);

        if (!product) {
            return res.status(404).json({ success: false, error: "Product not Found"});
            
        }

        res.send({ success: true, message: "Product already removed"});
    } catch (error) {
        res.status(500).json({ success: false, error: "Internal Server Error"});
        
    }
}