const User = require('../models/User');

const UserController = {
    renderRegister: (req, res) => {
        res.render('register', { messages: req.flash('error'), formData: req.flash('formData')[0] });
    },

    register: (req, res) => {
        const { username, email, password, address, contact, role } = req.body;

        if (!username || !email || !password || !address || !contact || !role) {
            return res.status(400).send('All fields are required.');
        }
        if (password.length < 6) {
            req.flash('error', 'Password should be at least 6 or more characters long');
            req.flash('formData', req.body);
            return res.redirect('/register');
        }

        User.register({ username, email, password, address, contact, role }, (err) => {
            if (err) throw err;
            req.flash('success', 'Registration successful! Please log in.');
            res.redirect('/login');
        });
    },

    renderLogin: (req, res) => {
        res.render('login', { messages: req.flash('success'), errors: req.flash('error') });
    },

    login: (req, res) => {
        const { email, password } = req.body;
        if (!email || !password) {
            req.flash('error', 'All fields are required.');
            return res.redirect('/login');
        }

        User.login(email, password, (err, results) => {
            if (err) throw err;

            if (results.length > 0) {
                req.session.user = results[0];
                req.flash('success', 'Login successful!');
                if (req.session.user.role === 'user')
                    res.redirect('/shopping');
                else
                    res.redirect('/inventory');
            } else {
                req.flash('error', 'Invalid email or password.');
                res.redirect('/login');
            }
        });
    },

    logout: (req, res) => {
        req.session.destroy();
        res.redirect('/');
    }
};

module.exports = UserController;
