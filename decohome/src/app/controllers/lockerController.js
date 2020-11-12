const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');

const jwt = require('jsonwebtoken');
const regexEmail = require('regex-email');
const crypto = require('crypto');
const secret_config = require('../../../config/secret');

const lockerDao = require('../dao/lockerDao');
const { constants } = require('buffer');
const { checkLocker } = require('../dao/lockerDao');

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
 * update - 2020.11.12
 * 30. 보관함 목록 조회 API
 */
exports.getLockerList = async function (req, res) {
    const userId = req.verifiedToken.userId;    
    let {
        page, size, filter
    } = req.query;

    if (filter != 0 && filter != 1) return res.json({ isSuccess: false, code: 300, message: "존재하지 않는 필터링" });
    if (!page) return res.json({ isSuccess: false, code: 301, message: "페이지 입력 필요" });
    if (!size) return res.json({ isSuccess: false, code: 302, message: "사이즈 입력 필요" });
    if (page < 1) return res.json({ isSuccess: false, code: 303, message: "페이지 번호 확인" });

    page = size * (page-1);

    try {        
        if (filter == 0) {
            const lockerRows = await lockerDao.getAllLocker(userId, page, size);
            if (!lockerRows) {
                return res.json({
                isSuccess: false,
                code: 304,
                message: "전체 조회 실패"
                });
            };
    
            res.json({
                result: {count: lockerRows[0][0].count, list: lockerRows[1]},
                isSuccess: true,
                code: 200,
                message: "전체 조회 성공"
            });
        } else {
            const lockerRows = await lockerDao.getLockerList(userId, page, size);
            if (!lockerRows) {
                return res.json({
                isSuccess: false,
                code: 305,
                message: "보관함 목록 조회 실패"
                });
            };
    
            res.json({
                result: {locker: lockerRows[0], images: lockerRows[1]},
                isSuccess: true,
                code: 201,
                message: "보관함 목록 조회 성공"
            });
        }

        
    } catch (err) {
        logger.error(`App - LockerList Query error\n: ${JSON.stringify(err)}`);
        return false;
    }
}

/**
 * update - 2020.11.12
 * 31. 개별 보관함 조회 API
 */
exports.getLocker = async function (req, res) {
    const userId = req.verifiedToken.userId;    
    const {
        lockerId
    } = req.params;
    let {
        page, size
    } = req.query;

    if (await checkLocker(userId, lockerId) === 0) return res.json({ isSuccess: false, code: 300, message: "존재하지 않는 보관함" });
    if (!page) return res.json({ isSuccess: false, code: 301, message: "페이지 입력 필요" });
    if (!size) return res.json({ isSuccess: false, code: 302, message: "사이즈 입력 필요" });
    if (page < 1) return res.json({ isSuccess: false, code: 303, message: "페이지 번호 확인" });

    page = size * (page-1);

    try {       
        const lockerRows = await lockerDao.getLockerDetail(lockerId, page, size);

        if (!lockerRows) {
            return res.json({
            isSuccess: false,
            code: 304,
            message: "개별 보관함 조회 실패"
            });
        };

        res.json({
            result: {count: lockerRows[0][0], images: lockerRows[1]},
            isSuccess: true,
            code: 200,
            message: "개별 보관함 조회 성공"
        });
        
    } catch (err) {
        logger.error(`App - Locker Query error\n: ${JSON.stringify(err)}`);
        return false;
    }
}

/**
 * update - 2020.11.12
 * 32. 보관함에 상품 저장 API
 */
exports.setLocker = async function (req, res) {
    const userId = req.verifiedToken.userId;    
    const {
        lockerId
    } = req.params;
    const {
        houseIntroId, spaceId, productId
    } = req.query;

    if (await checkLocker(userId, lockerId) === 0) return res.json({ isSuccess: false, code: 300, message: "존재하지 않는 보관함" });
    if (!houseIntroId && !spaceId && !productId) return res.json({ isSuccess: false, code: 301, message: "집소개/공간/상품 중 하나는 반드시 입력" });

    try {      
        let lockerRows; 
        if (houseIntroId) {
            lockerRows = await lockerDao.setLockerHouseIntro(lockerId, houseIntroId);
            res.json({
                isSuccess: true,
                code: 200,
                message: "보관함에 집소개 게시글 저장 성공"
            });
        } else if (spaceId) {
            lockerRows = await lockerDao.setLockerSpace(lockerId, spaceId);
            res.json({
                isSuccess: true,
                code: 201,
                message: "보관함에 공간 이미지 저장 성공"
            });
        } else {
            lockerRows = await lockerDao.setLockerProduct(lockerId, productId);
            res.json({
                isSuccess: true,
                code: 202,
                message: "보관함에 상품 저장 성공"
            });
        }

        if (!lockerRows) {
            return res.json({
            isSuccess: false,
            code: 302,
            message: "보관함에 상품 저장 실패"
            });
        };        
    } catch (err) {
        logger.error(`App - Locker Query error\n: ${JSON.stringify(err)}`);
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