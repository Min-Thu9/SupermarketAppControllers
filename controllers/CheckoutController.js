const db = require('../db');

const CheckoutController = {
    checkout: (req, res) => {
        const userId = req.session.user.id;

        // Get cart items with product info
        db.query(`
            SELECT c.productId, c.quantity, p.productName, p.price, p.image
            FROM cart_items c
            JOIN products p ON c.productId = p.id
            WHERE c.userId = ?
        `, [userId], (err, cartItems) => {
            if (err || cartItems.length === 0) {
                return res.redirect('/cart');
            }

            // Calculate total
            const totalAmount = cartItems.reduce((sum, item) => sum + item.price * item.quantity, 0);

            // Insert order
            db.query('INSERT INTO orders (userId, totalAmount) VALUES (?, ?)', [userId, totalAmount], (err2, result) => {
                if (err2) return res.status(500).send('Checkout failed');

                const orderId = result.insertId;

                // Insert order_items
                const orderItemsValues = cartItems.map(i => [orderId, i.productId, i.price, i.quantity]);
                db.query('INSERT INTO order_items (orderId, productId, price, quantity) VALUES ?', [orderItemsValues], (err3) => {
                    if (err3) return res.status(500).send('Failed to save order items');

                    // Deduct stock
                    cartItems.forEach(item => {
                        db.query('UPDATE products SET quantity = quantity - ? WHERE id=?', [item.quantity, item.productId]);
                    });

                    // Clear cart
                    db.query('DELETE FROM cart_items WHERE userId=?', [userId]);

                    // Render checkout success page
                    res.render('checkoutSuccess', { cart: cartItems, totalAmount, user: req.session.user });
                });
            });
        });
    }
};

module.exports = CheckoutController;
