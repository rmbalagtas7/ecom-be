const User = require("../models/users");

exports.getCart = async (req, res) => {
    try {
        const user = await User.findById(req.params.id).populate({
            path: "cart.productId",
            select: "productName productDescription price productImages category" 
        });


        if (!user) {
            return res.status(404).json({ success: false, error: "User not Found"});

        }

        res.send({ success: true, cart: user.cart });
        
    } catch (error) {
        res.status(500).json({ success: false, error: "Internal Server Error"});
        
    }
}

exports.addToCart = async (req, res) => {
    try {

        const { userId, productId, quantity } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            res.status(404).json({ success: false, error: "User not Found" });
        }

        user.cart = user.cart.filter(item => item.productId); 

        const cartItem = user.cart.find(item => item.productId.toString() === productId.toString());

        if (cartItem) {
            cartItem.quantity += quantity;
        }else {
            user.cart.push({ productId, quantity });
        }

        await user.save();

        res.send({ success: true, cart: user.cart, message: "Product Added to cart"});

    } catch (error) {
        res.status(500).json({ success: false, error: "Internal Server Error"});
    }
}


exports.removeFromCart = async (req, res) => {
    try {
        const { userId, productId } = req.body;

        const user = await User.findById(userId);

        if (!user) {
            res.status(404).json({ success: false, error: "User not Found "});
        }

        const cartIndex = user.cart.findIndex(item => item.productId.toString() === productId.toString());

        if (cartIndex === -1) {
            return res.status(404).json({ success: false, error: "Product not found in cart" });
        }

        user.cart.splice(cartIndex, 1);

        await user.save();

        res.send({ success: true, message: "Product has been removed from the cart "});
        
    } catch (error) {
        res.status(500).json({ success: false, error: "Internal Server Error "});
    }
}