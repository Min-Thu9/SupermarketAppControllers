const db = require('../db');

const User = {
    register: (user, callback) => {
        const { username, email, password, address, contact, role } = user;
        db.query(
            'INSERT INTO users (username, email, password, address, contact, role) VALUES (?, ?, SHA1(?), ?, ?, ?)',
            [username, email, password, address, contact, role],
            callback
        );
    },

    login: (email, password, callback) => {
        db.query(
            'SELECT * FROM users WHERE email = ? AND password = SHA1(?)',
            [email, password],
            callback
        );
    },

    getById: (id, callback) => {
        db.query('SELECT * FROM users WHERE id = ?', [id], callback);
    }
};

module.exports = User;
