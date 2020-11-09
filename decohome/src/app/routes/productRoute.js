module.exports = function(app){
    const product = require('../controllers/productController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    app.route('/recommend').get(jwtMiddleware, product.getRecommendTab);
    app.route('/recommend/:recommendId').get(jwtMiddleware, product.getRecommendPost);
    app.route('/products').get(jwtMiddleware, product.getProducts);
    app.route('/brands').get(jwtMiddleware, product.getBrands);
    app.route('/category').get(jwtMiddleware, product.getCategory);
    app.route('/products/count').get(jwtMiddleware, product.getProductCount);
    app.route('/products/new').get(jwtMiddleware, product.getNewProduct);
    app.route('/products/rank').get(jwtMiddleware, product.getRankingProduct);
    app.route('/products/:productId').get(jwtMiddleware, product.getProduct);
    app.route('/products/:productId/info').get(jwtMiddleware, product.getProductDetail);
};