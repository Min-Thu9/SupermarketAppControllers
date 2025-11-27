const express = require('express');
const session = require('express-session');
const flash = require('connect-flash');
const multer = require('multer');
const app = express();
const ProductController = require('./controllers/ProductController');
const UserController = require('./controllers/UserController');
const CartController = require('./controllers/CartController');
const CheckoutController = require('./controllers/CheckOutController');
const OrderController = require('./controllers/OrderController');
const db = require('./db');
const middleware = require('./middleware'); // <-- Import your middleware

// Set up multer for file uploads
const storage = multer.diskStorage({
    destination: (req, file, cb) => {
        cb(null, 'public/images');
    },
    filename: (req, file, cb) => {
        cb(null, file.originalname);
    }
});
const upload = multer({ storage: storage });

// Set up view engine
app.set('view engine', 'ejs');
app.use(express.static('public'));
app.use(express.urlencoded({ extended: false }));

app.use(session({
    secret: 'secret',
    resave: false,
    saveUninitialized: true,
    cookie: { maxAge: 1000 * 60 * 60 * 24 * 7 }
}));
app.use(flash());

app.use((req, res, next) => {
    res.locals.messages = req.flash('error');
    next();
});

// Home route
app.get('/', (req, res) => {
    res.render('index', { user: req.session.user });
});

// Inventory (list all products)
app.get('/inventory', middleware.checkAuthenticated, middleware.checkAdmin, (req, res) => {
    ProductController.listAll(req, res);
});

// User related routes
app.get('/register', UserController.renderRegister);
app.post('/register', UserController.register);

// Login routes
app.get('/login', UserController.renderLogin);
app.post('/login', UserController.login);

// Logout
app.get('/logout', UserController.logout);

// Shopping (list all products for users)
app.get('/shopping', middleware.checkAuthenticated, (req, res) => {
    ProductController.listAll(req, res);
});

// Cart routes
app.post('/add-to-cart/:id', middleware.checkAuthenticated, CartController.addToCart);
app.get('/cart', middleware.checkAuthenticated, CartController.viewCart);
app.post('/cart/update/:cartId', middleware.checkAuthenticated, CartController.updateItem);
app.get('/cart/remove/:cartId', middleware.checkAuthenticated, CartController.removeItem);
app.get('/cart/clear', middleware.checkAuthenticated, CartController.clearCart);

// Checkout route
app.post('/checkout', middleware.checkAuthenticated, CheckoutController.checkout);

// Product routes
app.get('/product/:id', middleware.checkAuthenticated, (req, res) => {
    ProductController.getById(req, res);
});

// Add product (form)
app.get('/addProduct', middleware.checkAuthenticated, middleware.checkAdmin, (req, res) => {
    res.render('addProduct', { user: req.session.user });
});

// Add product (submit)
app.post('/addProduct', middleware.checkAuthenticated, middleware.checkAdmin, upload.single('image'), (req, res) => {
    req.body.image = req.file ? req.file.filename : null;
    ProductController.add(req, res);
});

// Update product (form)
app.get('/updateProduct/:id', middleware.checkAuthenticated, middleware.checkAdmin, (req, res) => {
    ProductController.renderUpdateForm(req, res);
});

// Update product (submit)
app.post('/updateProduct/:id', middleware.checkAuthenticated, middleware.checkAdmin, upload.single('image'), (req, res) => {
    req.body.image = req.file ? req.file.filename : req.body.currentImage;
    ProductController.update(req, res);
});

// Delete product
app.get('/deleteProduct/:id', middleware.checkAuthenticated, middleware.checkAdmin, (req, res) => {
    ProductController.delete(req, res);
});

//View Orders 
app.get('/orders', middleware.checkAuthenticated, middleware.checkAdmin, OrderController.adminOrders);

//View spentAmounts
app.get('/orders/amounts', middleware.checkAuthenticated, middleware.checkAdmin, OrderController.amountPerCustomer);

// Search products (renders search.ejs)
app.get('/search', middleware.checkAuthenticated, ProductController.search);

const PORT = process.env.PORT || 3000;
app.listen(PORT, () => console.log(`Server running on port ${PORT}`));