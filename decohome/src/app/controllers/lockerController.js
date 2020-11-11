const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');

const jwt = require('jsonwebtoken');
const regexEmail = require('regex-email');
const crypto = require('crypto');
const secret_config = require('../../../config/secret');

const lockerDao = require('../dao/lockerDao');
const { constants } = require('buffer');

/**
 * update - 2020.11.10
 * 29. 보관함 생성 API
 */
exports.createLocker = async function (req, res) {
    const userId = req.verifiedToken.userId;    
    const {
        lockerName
    } = req.body;

    if (lockerName.length > 30) return res.json({ isSuccess: false, code: 300,  message: "보관함명 (최대 30자)" });

    try {        
        const lockerRows = await lockerDao.addLocker(userId, lockerName);

        if (!lockerRows) {
            return res.json({
            isSuccess: false,
            code: 301,
            message: "보관함 생성 실패"
            });
        };

        res.json({
            isSuccess: true,
            code: 200,
            message: "보관함 생성 성공"
        });
    } catch (err) {
        logger.error(`App - CreateLocker Query error\n: ${JSON.stringify(err)}`);
        return false;
    }
}

/**
 * update - 2020.11.10
 * 33. 보관함 수정 API
 */
exports.updateLocker = async function (req, res) {
    const userId = req.verifiedToken.userId;    
    const {
        lockerId
    } = req.params;
    const {
        filter
    } = req.query;
    const {
        lockerName
    } = req.body;
    
    if (await lockerDao.checkLocker(userId, lockerId) === 0) return res.json({ isSuccess: false, code: 300,  message: "존재하지 않는 보관함" });

    try {        
        let lockerRows;

        if (filter === '1') {
            if (!lockerName) return res.json({ isSuccess: false, code: 301,  message: "보관함 이름을 적어주세요" });
            if (lockerName.length > 30) return res.json({ isSuccess: false, code: 302,  message: "보관함명 (최대 30자)" });
            lockerRows = await lockerDao.updateLockerName(lockerName, userId, lockerId);
        } else if (filter === '2') {
            lockerRows = await lockerDao.updateLockerPrivate(userId, lockerId);
            const status = await lockerDao.lockerStatus(userId, lockerId);

            if (status === 'Y') return res.json({ isSuccess: true, code: 201,  message: "보관함 비공개 전환 성공" });
            else return res.json({ isSuccess: true, code: 202,  message: "보관함 공개 전환 성공" });
        } 
        else return res.json({ isSuccess: false, code: 303,  message: "존재하지 않는 필터링" });

        if (!lockerRows) {
            return res.json({
            isSuccess: false,
            code: 304,
            message: "보관함 수정 실패"
            });
        };

        res.json({
            isSuccess: true,
            code: 200,
            message: "보관함 이름 수정 성공"
        });
    } catch (err) {
        logger.error(`App - DeleteLocker Query error\n: ${JSON.stringify(err)}`);
        return false;
    }
}

/**
 * update - 2020.11.10
 * 34. 보관함 삭제 API
 */
exports.deleteLocker = async function (req, res) {
    const userId = req.verifiedToken.userId;    
    const {
        lockerId
    } = req.params;

    if (await lockerDao.checkLocker(userId, lockerId) === 0) return res.json({ isSuccess: false, code: 300,  message: "존재하지 않는 보관함" });

    try {        
        const lockerRows = await lockerDao.deleteLock(userId, lockerId);

        if (!lockerRows) {
            return res.json({
            isSuccess: false,
            code: 301,
            message: "보관함 삭제 실패"
            });
        };

        res.json({
            isSuccess: true,
            code: 200,
            message: "보관함 삭제 성공"
        });
    } catch (err) {
        logger.error(`App - DeleteLocker Query error\n: ${JSON.stringify(err)}`);
        return false;
    }
}