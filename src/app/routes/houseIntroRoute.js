module.exports = function(app){
    const houseIntro = require('../controllers/houseIntroController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    app.route('/houseintro').get(jwtMiddleware, houseIntro.getHouseIntro);
    app.route('/houseintro/count').get(jwtMiddleware, houseIntro.getHouseIntroCount);
    app.route('/houseintro/:houseIntroId').get(jwtMiddleware, houseIntro.getHouseIntroPost);
    app.route('/spaces').get(jwtMiddleware, houseIntro.getAllSpace);
    app.route('/spaces/count').get(jwtMiddleware, houseIntro.getSpaceCount);
    app.route('/spaces/:spaceId').get(jwtMiddleware, houseIntro.getSpacePost);
    app.route('/spaces/:spaceId/product').get(jwtMiddleware, houseIntro.getSpaceProduct);
    app.route('/spaces/:spaceId/other').get(jwtMiddleware, houseIntro.getSpaceOther);
};