module.exports = function(app){
    const product = require('../controllers/productController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    app.route('/recommend').get(jwtMiddleware, product.getRecommendTab);
    app.route('/recommend/:recommendId').get(jwtMiddleware, product.getRecommendPost);
    app.route('/products').get(jwtMiddleware, product.getProducts);
    app.route('/brands').get(jwtMiddleware, product.getBrands);
    app.route('/brands/:brandId').get(jwtMiddleware, product.getBrandProduct);
    app.route('/category').get(jwtMiddleware, product.getCategory);
    app.route('/products/count').get(jwtMiddleware, product.getProductCount);
    app.route('/products/new').get(jwtMiddleware, product.getNewProduct);
    app.route('/products/rank').get(jwtMiddleware, product.getRankingProduct);
    app.route('/products/sale').get(jwtMiddleware, product.getOnlySale);
    app.route('/products/:productId').get(jwtMiddleware, product.getProduct);
    app.route('/products/:productId/info').get(jwtMiddleware, product.getProductDetail);
    app.route('/products/:productId/score').get(jwtMiddleware, product.getProductScore);
    app.route('/products/:productId/image-review').get(jwtMiddleware, product.getPhotoReview);
    app.route('/products/:productId/review').get(jwtMiddleware, product.getReview);
    app.route('/products/:productId/option').get(jwtMiddleware, product.getProductOption);
    app.route('/products/:productId/option/:optionId').get(jwtMiddleware, product.getAdditionalOption);
};