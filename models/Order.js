const db = require('../db');

const Order = {
    getAllWithItemsAndUsers: (callback) => {
        db.query(
            `SELECT o.*, u.username 
             FROM orders o 
             JOIN users u ON o.userId = u.id 
             ORDER BY o.created_at DESC`,
            (err, orders) => {
                if (err) return callback(err);
                if (orders.length === 0) return callback(null, []);
                const orderIds = orders.map(o => o.id);
                db.query(
                    `SELECT oi.*, p.productName 
                     FROM order_items oi 
                     JOIN products p ON oi.productId = p.id 
                     WHERE oi.orderId IN (?)`,
                    [orderIds],
                    (err2, items) => {
                        if (err2) return callback(err2);
                        const itemsByOrder = {};
                        items.forEach(item => {
                            if (!itemsByOrder[item.orderId]) itemsByOrder[item.orderId] = [];
                            itemsByOrder[item.orderId].push(item);
                        });
                        const ordersWithItems = orders.map(order => ({
                            ...order,
                            items: itemsByOrder[order.id] || []
                        }));
                        callback(null, ordersWithItems);
                    }
                );
            }
        );
    }
};

Order.getTotalSpentPerUser = (callback) => {
    db.query(
        `SELECT u.id, u.username, SUM(o.totalAmount) AS totalSpent
         FROM users u
         JOIN orders o ON u.id = o.userId
         GROUP BY u.id, u.username
         ORDER BY totalSpent DESC`,
        callback
    );
};

Order.getUserOrdersWithItems = (userId, callback) => {
    db.query(
        `SELECT o.*, u.username 
         FROM orders o 
         JOIN users u ON o.userId = u.id 
         WHERE o.userId = ?
         ORDER BY o.created_at DESC`,
        [userId],
        (err, orders) => {
            if (err) return callback(err);
            if (orders.length === 0) return callback(null, []);
            const orderIds = orders.map(o => o.id);
            db.query(
                `SELECT oi.*, p.productName 
                 FROM order_items oi 
                 JOIN products p ON oi.productId = p.id 
                 WHERE oi.orderId IN (?)`,
                [orderIds],
                (err2, items) => {
                    if (err2) return callback(err2);
                    const itemsByOrder = {};
                    items.forEach(item => {
                        if (!itemsByOrder[item.orderId]) itemsByOrder[item.orderId] = [];
                        itemsByOrder[item.orderId].push(item);
                    });
                    const ordersWithItems = orders.map(order => ({
                        ...order,
                        items: itemsByOrder[order.id] || []
                    }));
                    callback(null, ordersWithItems);
                }
            );
        }
    );
};

module.exports = Order;