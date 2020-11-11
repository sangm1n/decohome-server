module.exports = function(app){
    const locker = require('../controllers/lockerController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    app.route('/user/locker').post(jwtMiddleware, locker.createLocker);
    app.route('/user/lockers/:lockerId').put(jwtMiddleware, locker.updateLocker);
    app.route('/user/lockers/:lockerId').delete(jwtMiddleware, locker.deleteLocker);
};