const Product = require('../models/Product');

const ProductController = {
    listAll: (req, res) => {
    Product.getAll((err, products) => {
        if (err) {
            return res.status(500).send('Error fetching products');
        }
        if (req.session.user && req.session.user.role === 'admin') {
            res.render('inventory', { products, user: req.session.user });
        } else {
            res.render('shopping', { products, user: req.session.user });
        }
    });
},

    getById: (req, res) => {
        const id = req.params.id;
        Product.getById(id, (err, results) => {
            if (err) {
                return res.status(500).send('Error fetching product');
            }
            if (results.length === 0) {
                return res.status(404).send('Product not found');
            }
            res.render('product', { product: results[0], user: req.session.user });
        });
    },

    // Add this method for JSON response (for cart logic)
    getByIdJson: (req, res) => {
        const id = req.params.id;
        Product.getById(id, (err, results) => {
            if (err) {
                return res.status(500).send('Error fetching product');
            }
            if (results.length === 0) {
                return res.status(404).send('Product not found');
            }
            res.json(results[0]);
        });
    },
    add: (req, res) => {
        const { productName, quantity, price, image } = req.body;
        Product.add({ productName, quantity, price, image }, (err, result) => {
            if (err) {
                return res.status(500).send('Error adding product');
            }
            res.redirect('/inventory');
        });
    },

    renderUpdateForm: (req, res) => {
        const id = req.params.id;
        Product.getById(id, (err, results) => {
            if (err) {
                return res.status(500).send('Error fetching product');
            }
            if (results.length === 0) {
                return res.status(404).send('Product not found');
            }
            res.render('updateProduct', { product: results[0], user: req.session.user });
        });
    },

    update: (req, res) => {
        const id = req.params.id;
        // Accept both productName and name for flexibility
        const productName = req.body.productName || req.body.name;
        const { quantity, price, image } = req.body;
        Product.update(id, { productName, quantity, price, image }, (err, result) => {
            if (err) {
                return res.status(500).send('Error updating product');
            }
            res.redirect('/inventory');
        });
    },

        delete: (req, res) => {
        const id = req.params.id;
        const db = require('../db');
        // Remove from cart_items first
        db.query('DELETE FROM cart_items WHERE productId = ?', [id], (err) => {
            if (err) return res.status(500).send('Error deleting product from carts');
            // Remove from order_items next
            db.query('DELETE FROM order_items WHERE productId = ?', [id], (err2) => {
                if (err2) return res.status(500).send('Error deleting product from orders');
                // Now delete the product itself
                require('../models/Product').delete(id, (err3) => {
                    if (err3) return res.status(500).send('Error deleting product');
                    res.redirect('/inventory');
                });
            });
        });
    },

    search: (req, res) => {
    const searchQuery = req.query.q || ''; // get input from shopping page
    Product.searchByName(searchQuery, (err, products) => {
        if (err) {
            return res.status(500).send('Error searching products');
        }
        // Render search page with results
        res.render('search', { products, searchQuery, user: req.session.user });
    });
}

};

module.exports = ProductController;