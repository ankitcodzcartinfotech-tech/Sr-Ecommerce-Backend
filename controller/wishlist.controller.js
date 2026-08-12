const WISHLIST = require('../model/wishlist.model');
const CART = require('../model/cart.model');
const PRODUCT = require('../model/product.model');

exports.addToWishlist = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId } = req.body;

        if (!productId) {
            return res.status(400).json({ success: false, message: 'Product ID is required' });
        }

        const product = await PRODUCT.findById(productId);
        if (!product) {
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        let wishlist = await WISHLIST.findOne({ user: userId });

        if (!wishlist) {
            wishlist = await WISHLIST.create({
                user: userId,
                items: [{ product: productId }]
            });
        } else {
            const existingItem = wishlist.items.find(
                item => item.product.toString() === productId
            );

            if (existingItem) {
                return res.status(400).json({ 
                    success: false, 
                    message: 'Product already in wishlist' 
                });
            }

            wishlist.items.push({ product: productId });
        }

        wishlist.calculateTotal();
        await wishlist.save();

        const populatedWishlist = await WISHLIST.findById(wishlist._id).populate('items.product');

        res.status(200).json({ 
            success: true, 
            message: 'Product added to wishlist successfully', 
            wishlist: populatedWishlist 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.getWishlist = async (req, res) => {
    try {
        const userId = req.user._id;

        let wishlist = await WISHLIST.findOne({ user: userId }).populate('items.product');

        if (!wishlist) {
            wishlist = await WISHLIST.create({ user: userId, items: [] });
        }

        res.status(200).json({ 
            success: true, 
            message: 'Wishlist fetched successfully', 
            wishlist 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.removeFromWishlist = async (req, res) => {
    try {
        const userId = req.user._id;
        const { itemId } = req.params;

        const wishlist = await WISHLIST.findOne({ user: userId });
        if (!wishlist) {
            return res.status(404).json({ success: false, message: 'Wishlist not found' });
        }

        const itemIndex = wishlist.items.findIndex(item => item._id.toString() === itemId);
        if (itemIndex === -1) {
            return res.status(404).json({ success: false, message: 'Item not found in wishlist' });
        }

        wishlist.items.splice(itemIndex, 1);
        wishlist.calculateTotal();
        await wishlist.save();

        const populatedWishlist = await WISHLIST.findById(wishlist._id).populate('items.product');

        res.status(200).json({ 
            success: true, 
            message: 'Item removed from wishlist successfully', 
            wishlist: populatedWishlist 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.moveToCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const { itemId } = req.params;
        const { quantity = 1 } = req.body;

        if (quantity < 1) {
            return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
        }

        const wishlist = await WISHLIST.findOne({ user: userId });
        if (!wishlist) {
            return res.status(404).json({ success: false, message: 'Wishlist not found' });
        }

        const itemIndex = wishlist.items.findIndex(item => item._id.toString() === itemId);
        if (itemIndex === -1) {
            return res.status(404).json({ success: false, message: 'Item not found in wishlist' });
        }

        const productId = wishlist.items[itemIndex].product;
        const product = await PRODUCT.findById(productId);
        if (!product) {
            wishlist.items.splice(itemIndex, 1);
            wishlist.calculateTotal();
            await wishlist.save();
            return res.status(404).json({ success: false, message: 'Product not found' });
        }

        const availableStock = product.stockDetails.openingQuantity || 0;
        if (product.productDetail.checkNegativeStock === 1 && availableStock < quantity) {
            return res.status(400).json({ 
                success: false, 
                message: 'Insufficient stock available',
                availableStock 
            });
        }

        const price = product.saleDetails.salePrice || 0;
        const subtotal = price * quantity;

        let cart = await CART.findOne({ user: userId });

        if (!cart) {
            cart = await CART.create({
                user: userId,
                items: [{
                    product: productId,
                    quantity,
                    price,
                    subtotal
                }]
            });
        } else {
            const existingCartItemIndex = cart.items.findIndex(
                item => item.product.toString() === productId.toString()
            );

            if (existingCartItemIndex > -1) {
                const newQuantity = cart.items[existingCartItemIndex].quantity + quantity;
                
                if (product.productDetail.checkNegativeStock === 1 && availableStock < newQuantity) {
                    return res.status(400).json({ 
                        success: false, 
                        message: 'Insufficient stock for requested quantity',
                        availableStock,
                        currentCartQuantity: cart.items[existingCartItemIndex].quantity
                    });
                }

                cart.items[existingCartItemIndex].quantity = newQuantity;
                cart.items[existingCartItemIndex].subtotal = price * newQuantity;
            } else {
                cart.items.push({
                    product: productId,
                    quantity,
                    price,
                    subtotal
                });
            }
        }

        cart.calculateTotals();
        await cart.save();

        wishlist.items.splice(itemIndex, 1);
        wishlist.calculateTotal();
        await wishlist.save();

        const [populatedCart, populatedWishlist] = await Promise.all([
            CART.findById(cart._id).populate('items.product'),
            WISHLIST.findById(wishlist._id).populate('items.product')
        ]);

        res.status(200).json({ 
            success: true, 
            message: 'Item moved to cart successfully', 
            cart: populatedCart,
            wishlist: populatedWishlist
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.clearWishlist = async (req, res) => {
    try {
        const userId = req.user._id;

        const wishlist = await WISHLIST.findOne({ user: userId });
        if (!wishlist) {
            return res.status(404).json({ success: false, message: 'Wishlist not found' });
        }

        wishlist.items = [];
        wishlist.calculateTotal();
        await wishlist.save();

        res.status(200).json({ 
            success: true, 
            message: 'Wishlist cleared successfully', 
            wishlist 
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};
