module.exports = function(app){
    const locker = require('../controllers/lockerController');
    const jwtMiddleware = require('../../../config/jwtMiddleware');

    app.route('/user/locker').post(jwtMiddleware, locker.createLocker);
    app.route('/user/lockers').get(jwtMiddleware, locker.getLockerList);
    app.route('/user/lockers/:lockerId').get(jwtMiddleware, locker.getLocker);
    app.route('/user/lockers/:lockerId').post(jwtMiddleware, locker.setLocker);
    app.route('/user/lockers/:lockerId').put(jwtMiddleware, locker.updateLocker);
    app.route('/user/lockers/:lockerId').delete(jwtMiddleware, locker.deleteLocker);
};