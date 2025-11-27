const Order = require('../models/Order');

const OrderController = {
    adminOrders: (req, res) => {
        Order.getAllWithItemsAndUsers((err, orders) => {
            if (err) return res.status(500).send('Error fetching orders');
            res.render('order', { orders, user: req.session.user });
        });
    }
};

OrderController.amountPerCustomer = (req, res) => {
    Order.getTotalSpentPerUser((err, results) => {
        if (err) return res.status(500).send('Error fetching totals');
        res.render('order_amounts', { customers: results, user: req.session.user });
    });
};

module.exports = OrderController;