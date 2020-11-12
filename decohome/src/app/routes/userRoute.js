module.exports = function(app){
    const user = require('../controllers/userController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    app.route('/signup').post(user.signUp);
    app.route('/login').post(user.signIn);
    app.route('/user/profile').get(jwtMiddleware, user.getProfile);
    app.route('/user/profile').put(jwtMiddleware, user.updateProfile);
    app.route('/user/profile').delete(jwtMiddleware, user.deleteProfile);
    app.route('/user/nickname').get(jwtMiddleware, user.checkNickname);
    app.route('/user/profile-image').put(jwtMiddleware, user.updateProfileImage);
    app.route('/user/recent-view').get(jwtMiddleware, user.getRecentView);
};