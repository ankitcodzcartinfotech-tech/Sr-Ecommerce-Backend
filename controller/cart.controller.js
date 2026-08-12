const CART = require('../model/cart.model');
const PRODUCT = require('../model/product.model');

exports.addToCart = async (req, res) => {
    try {
        const userId = req.user._id;
        const { productId, quantity = 1 } = req.body;

        if (!productId) {
            return res.status(400).json({ success: false, message: 'Product ID is required' });
        }

        if (quantity < 1) {
            return res.status(400).json({ success: false, message: 'Quantity must be at least 1' });
        }

        const product = await PRODUCT.findById(productId);
        if (!product) {
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
            const existingItemIndex = cart.items.findIndex(
                item => item.product.toString() === productId
            );

            if (existingItemIndex > -1) {
                const newQuantity = cart.items[existingItemIndex].quantity + quantity;

                if (product.productDetail.checkNegativeStock === 1 && availableStock < newQuantity) {
                    return res.status(400).json({
                        success: false,
                        message: 'Insufficient stock for requested quantity',
                        availableStock,
                        currentCartQuantity: cart.items[existingItemIndex].quantity
                    });
                }

                cart.items[existingItemIndex].quantity = newQuantity;
                cart.items[existingItemIndex].subtotal = price * newQuantity;
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

        const populatedCart = await CART.findById(cart._id).populate('items.product');

        res.status(200).json({
            success: true,
            message: 'Product added to cart successfully',
            cart: populatedCart
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.getCart = async (req, res) => {
    try {
        const userId = req.user._id;

        let cart = await CART.findOne({ user: userId }).populate('items.product');

        if (!cart) {
            cart = await CART.create({ user: userId, items: [] });
        }

        res.status(200).json({
            success: true,
            message: 'Cart fetched successfully',
            cart
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.updateQuantity = async (req, res) => {
    try {
        const userId = req.user._id;
        const { itemId } = req.params;
        const { quantity } = req.body;

        if (!quantity || quantity < 1) {
            return res.status(400).json({ success: false, message: 'Valid quantity is required' });
        }

        const cart = await CART.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ success: false, message: 'Cart not found' });
        }

        const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
        if (itemIndex === -1) {
            return res.status(404).json({ success: false, message: 'Item not found in cart' });
        }

        const product = await PRODUCT.findById(cart.items[itemIndex].product);
        if (!product) {
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

        cart.items[itemIndex].quantity = quantity;
        cart.items[itemIndex].subtotal = cart.items[itemIndex].price * quantity;

        cart.calculateTotals();
        await cart.save();

        const populatedCart = await CART.findById(cart._id).populate('items.product');

        res.status(200).json({
            success: true,
            message: 'Cart quantity updated successfully',
            cart: populatedCart
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.removeItem = async (req, res) => {
    try {
        const userId = req.user._id;
        const { itemId } = req.params;

        const cart = await CART.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ success: false, message: 'Cart not found' });
        }

        const itemIndex = cart.items.findIndex(item => item._id.toString() === itemId);
        if (itemIndex === -1) {
            return res.status(404).json({ success: false, message: 'Item not found in cart' });
        }

        cart.items.splice(itemIndex, 1);
        cart.calculateTotals();
        await cart.save();

        const populatedCart = await CART.findById(cart._id).populate('items.product');

        res.status(200).json({
            success: true,
            message: 'Item removed from cart successfully',
            cart: populatedCart
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.clearCart = async (req, res) => {
    try {
        const userId = req.user._id;

        const cart = await CART.findOne({ user: userId });
        if (!cart) {
            return res.status(404).json({ success: false, message: 'Cart not found' });
        }

        cart.items = [];
        cart.calculateTotals();
        await cart.save();

        res.status(200).json({
            success: true,
            message: 'Cart cleared successfully',
            cart
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};

exports.validateStock = async (req, res) => {
    try {
        const userId = req.user._id;

        const cart = await CART.findOne({ user: userId }).populate('items.product');
        if (!cart || cart.items.length === 0) {
            return res.status(400).json({ success: false, message: 'Cart is empty' });
        }

        const unavailableItems = [];
        const availableItems = [];

        for (const item of cart.items) {
            if (!item.product) {
                unavailableItems.push({
                    itemId: item._id,
                    reason: 'Product no longer exists'
                });
                continue;
            }

            const availableStock = item.product.stockDetails.openingQuantity || 0;

            if (item.product.productDetail.checkNegativeStock === 1 && availableStock < item.quantity) {
                unavailableItems.push({
                    itemId: item._id,
                    productId: item.product._id,
                    productName: item.product.productDetail.name,
                    requestedQuantity: item.quantity,
                    availableStock,
                    reason: 'Insufficient stock'
                });
            } else {
                availableItems.push({
                    itemId: item._id,
                    productId: item.product._id,
                    productName: item.product.productDetail.name,
                    quantity: item.quantity,
                    availableStock
                });
            }
        }

        const isValid = unavailableItems.length === 0;

        res.status(200).json({
            success: true,
            message: isValid ? 'All items are available' : 'Some items are unavailable',
            isValid,
            availableItems,
            unavailableItems
        });
    } catch (error) {
        console.error(error);
        res.status(500).json({ success: false, message: 'Internal server error' });
    }
};