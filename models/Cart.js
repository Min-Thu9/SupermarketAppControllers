const db = require('../db');

const Cart = {
    addItem: (userId, productId, quantity, callback) => {
        db.query('SELECT quantity FROM products WHERE id=?', [productId], (err, prodResults) => {
            if (err) return callback(err);
            if (prodResults.length === 0) return callback(new Error('Product not found'));
            const stock = prodResults[0].quantity;

            if (stock <= 0) return callback(new Error('This product is out of stock.'));

            db.query('SELECT * FROM cart_items WHERE userId=? AND productId=?', [userId, productId], (err, results) => {
                if (err) return callback(err);

                let newQuantity = quantity;
                if (results.length > 0) {
                    newQuantity = results[0].quantity + quantity;
                }
                if (newQuantity > stock) newQuantity = stock;

                if (results.length > 0) {
                    db.query('UPDATE cart_items SET quantity=? WHERE id=?', [newQuantity, results[0].id], callback);
                } else {
                    db.query('INSERT INTO cart_items (userId, productId, quantity) VALUES (?, ?, ?)', [userId, productId, newQuantity], callback);
                }
            });
        });
    },

    getCart: (userId, callback) => {
        db.query(`
            SELECT c.id AS cartId, c.quantity AS cartQuantity, p.productName, p.price, p.quantity AS productStock, p.image
            FROM cart_items c
            JOIN products p ON c.productId = p.id
            WHERE c.userId = ?
        `, [userId], callback);
    },

    updateItem: (cartId, quantity, callback) => {
        db.query('SELECT productId FROM cart_items WHERE id=?', [cartId], (err, cartResults) => {
            if (err) return callback(err);
            if (cartResults.length === 0) return callback(new Error('Cart item not found'));
            const productId = cartResults[0].productId;

            db.query('SELECT quantity FROM products WHERE id=?', [productId], (err, prodResults) => {
                if (err) return callback(err);
                if (prodResults.length === 0) return callback(new Error('Product not found'));
                const stock = prodResults[0].quantity;

                if (quantity > stock) {
                    return callback(new Error('Cannot set quantity higher than available stock.'));
                }
                if (quantity < 1) return callback(new Error('Quantity must be at least 1.'));

                db.query('UPDATE cart_items SET quantity=? WHERE id=?', [quantity, cartId], callback);
            });
        });
    },

    removeItem: (cartId, callback) => {
        db.query('DELETE FROM cart_items WHERE id=?', [cartId], callback);
    },

    clear: (userId, callback) => {
        db.query('DELETE FROM cart_items WHERE userId=?', [userId], callback);
    }
};

module.exports = Cart;