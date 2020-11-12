module.exports = function(app){
    const search = require('../controllers/searchController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    app.route('/search').post(jwtMiddleware, search.createSearch);
    app.route('/search/recent').get(jwtMiddleware, search.getRecentSearch);
    app.route('/search/recent').delete(jwtMiddleware, search.deleteRecentSearch);
    app.route('/search/best').get(jwtMiddleware, search.getBestSearch);
};