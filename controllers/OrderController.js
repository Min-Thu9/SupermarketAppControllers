const Order = require('../models/Order');

const OrderController = {
    // Admin: View all orders with items and user info
    adminOrders: (req, res) => {
        Order.getAllWithItemsAndUsers((err, orders) => {
            if (err) return res.status(500).send('Error fetching orders');
            res.render('order', { orders, user: req.session.user });
        });
    },

    // Admin: View total spent per customer
    amountPerCustomer: (req, res) => {
        Order.getTotalSpentPerUser((err, results) => {
            if (err) return res.status(500).send('Error fetching totals');
            res.render('order_amounts', { customers: results, user: req.session.user });
        });
    },

    // User: View their own purchase history
    userHistory: (req, res) => {
        const userId = req.session.user.id;
        Order.getUserOrdersWithItems(userId, (err, orders) => {
            if (err) return res.status(500).send('Error fetching your orders');
            res.render('purchase_history', { orders, user: req.session.user });
        });
    }
};

module.exports = OrderController;