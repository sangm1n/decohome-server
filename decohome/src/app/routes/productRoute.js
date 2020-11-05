module.exports = function(app){
    const product = require('../controllers/productController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    app.route('/products').get(jwtMiddleware, product.getProducts);
};