const db = require('../db');

const Product = {
    getAll: (callback) => {
        db.query('SELECT * FROM products', callback);
    },

    getById: (id, callback) => {
        db.query('SELECT * FROM products WHERE id = ?', [id], callback);
    },

    add: (product, callback) => {
        const { productName, quantity, price, image } = product;
        db.query(
            'INSERT INTO products (productName, quantity, price, image) VALUES (?, ?, ?, ?)',
            [productName, quantity, price, image],
            callback
        );
    },

    update: (id, product, callback) => {
        const { productName, quantity, price, image } = product;
        db.query(
            'UPDATE products SET productName = ?, quantity = ?, price = ?, image = ? WHERE id = ?',
            [productName, quantity, price, image, id],
            callback
        );
    },

    delete: (id, callback) => {
        db.query('DELETE FROM products WHERE id = ?', [id], callback);
    },

    searchByName: (name, callback) => {
    db.query('SELECT * FROM products WHERE productName LIKE ?', [`%${name}%`], callback);
}
};

module.exports = Product;