const Cart = require('../models/Cart');

const CartController = {
    // Add to cart
    addToCart: (req, res) => {
        const userId = req.session.user.id;
        const productId = parseInt(req.params.id, 10);
        let quantity = parseInt(req.body.quantity, 10);
        if (isNaN(quantity) || quantity < 1) quantity = 1;

        Cart.addItem(userId, productId, quantity, (err) => {
            if (err) {
                req.flash('error', err.message || 'Could not add to cart');
                return res.redirect('/shopping');
            }
            res.redirect('/cart');
        });
    },

    // View cart
    viewCart: (req, res) => {
        const userId = req.session.user.id;
        Cart.getCart(userId, (err, cartItems) => {
            if (err) {
                req.flash('error', 'Error fetching cart');
                return res.render('cart', { cart: [], user: req.session.user, messages: req.flash('error') });
            }
            res.render('cart', { cart: cartItems, user: req.session.user, messages: req.flash('error') });
        });
    },

    // Update item quantity
    updateItem: (req, res) => {
        const cartId = parseInt(req.params.cartId, 10);
        let quantity = parseInt(req.body.quantity, 10);
        if (isNaN(quantity) || quantity < 1) quantity = 1;

        Cart.updateItem(cartId, quantity, (err) => {
            if (err && err.message) {
                req.flash('error', err.message);
            } else if (err) {
                req.flash('error', 'Error updating cart');
            }
            res.redirect('/cart');
        });
    },

    // Remove item
    removeItem: (req, res) => {
        const cartId = parseInt(req.params.cartId, 10);
        Cart.removeItem(cartId, (err) => {
            if (err) req.flash('error', 'Error removing item');
            res.redirect('/cart');
        });
    },

    // Clear cart
    clearCart: (req, res) => {
        const userId = req.session.user.id;
        Cart.clear(userId, (err) => {
            if (err) req.flash('error', 'Error clearing cart');
            res.redirect('/cart');
        });
    }
};

module.exports = CartController;