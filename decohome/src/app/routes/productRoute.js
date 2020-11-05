module.exports = function(app){
    const product = require('../controllers/productController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    app.route('/products').get(jwtMiddleware, product.getProducts);
    app.route('/brands').get(jwtMiddleware, product.getBrands);
    app.route('/counts/product').get(jwtMiddleware, product.getProductCount);
};