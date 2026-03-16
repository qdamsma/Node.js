const Product = require('../models/product');
const Cart = require('../models/cart');

exports.getProducts = (req, res, next) => {
    Product.fetchAll((products) => {
        res.render('shop/product-list', { prods: products, pageTitle: 'All products', path: '/products' });
    });
};

exports.getProduct = (req, res, next) => {
    const prodId = req.params.productId;
    Product.findById(prodId, product => {
        res.render('shop/product-detail', { product: product, pageTitle: product.title, path: '/products'});
    })
};

exports.getIndex = (req, res, next) => {
    Product.fetchAll((products) => {
        res.render('shop/index', { prods: products, pageTitle: 'Shop', path: '/' });
    });
};

exports.getCart = (req, res, next) => {
    Cart.getProducts(cart => {
        Product.fetchAll(products => {
            const cartProdcts = [];
            for (const product of products){
                const cartProductData = cart.products.find(prod => prod.id === product.id);
                if(cartProductData){
                    cartProdcts.push({productData: product, qty: cartProductData.qty});
                }
            }
            res.render('shop/cart', { pageTitle: 'Your Cart', path: '/cart', products: cartProdcts });
        })
    })
};

exports.postCart = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findById(prodId, (product) => {
        if (!product) return res.redirect('/products');
        Cart.addProduct(prodId, product.price);
        res.redirect('/cart');
    });
};

exports.postCartDeleteProduct = (req, res, next) => {
    const prodId = req.body.productId;
    Product.findById(prodId, product =>{
        Cart.deleteProduct(prodId, product.price);
        res.redirect('/cart');
    });
};

exports.getOrders = (req, res, next) => {
    res.render('shop/orders', { pageTitle: 'Your Orders', path: '/orders' });
};

exports.getCheckout = (req, res, next) => {
    res.render('shop/checkout', { pageTitle: 'Checkout', path: '/checkout' });
};