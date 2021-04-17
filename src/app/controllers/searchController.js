const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');

const jwt = require('jsonwebtoken');
const regexEmail = require('regex-email');
const crypto = require('crypto');
const secret_config = require('../../../config/secret');

const searchDao = require('../dao/searchDao');
const { constants } = require('buffer');

/**
 * update - 2020.11.12
 * 39. 검색어 입력 API
 */
exports.createSearch = async function (req, res) {
    const userId = req.verifiedToken.userId;
    const {
        word
    } = req.query;

    if (!word) return res.json({ isSuccess: false, code: 300, message: "검색어 입력 필요" });
    if (word.length > 15) return res.json({ isSuccess: false, code: 301, message: "검색어를 15자 미만으로 줄여주세요" });

    try {     
        const searchRows = searchDao.setSearch(userId, word);

        if (!searchRows) {
            return res.json({
            isSuccess: false,
            code: 302,
            message: "검색어 입력 실패"
            });
        };

        res.json({
            isSuccess: true,
            code: 200,
            message: "검색어 입력 성공"
        });
    } catch (err) {
        logger.error(`App - createSearch Query error\n: ${JSON.stringify(err)}`);
        return false;
    }
}

/**
 * update - 2020.11.13
 * 40. 검색 결과 스토어 탭 조회 API
 */
exports.getSearchStore = async function (req, res) {
    const userId = req.verifiedToken.userId;
    let {
        word, page, size
    } = req.query;

    if (!word) return res.json({ isSuccess: false, code: 300, message: "검색어 입력 필요" });
    if (word.length > 15) return res.json({ isSuccess: false, code: 301, message: "검색어를 15자 미만으로 줄여주세요" });
    if (!page) return res.json({ isSuccess: false, code: 302, message: "페이지 입력 필요" });
    if (!size) return res.json({ isSuccess: false, code: 303, message: "사이즈 입력 필요" });
    if (page < 1) return res.json({ isSuccess: false, code: 304, message: "페이지 번호 확인" });

    page = size * (page-1);

    try {     
        const searchRows = await searchDao.searchStore(word, page, size);
        
        if (!searchRows) {
            return res.json({
            isSuccess: false,
            code: 305,
            message: "검색 결과 스토어 탭 조회 실패"
            });
        };

        res.json({
            result: {countProduct: searchRows[0][0].countProduct, productList: searchRows[1]},
            isSuccess: true,
            code: 200,
            message: "검색 결과 스토어 탭 조회 성공"
        });
    } catch (err) {
        logger.error(`App - getSearchStore Query error\n: ${JSON.stringify(err)}`);
        return false;
    }
}

/**
 * update - 2020.11.13
 * 41. 검색 결과 매거진 탭 조회 API
 */
exports.getSearchMagazine = async function (req, res) {
    const userId = req.verifiedToken.userId;
    let {
        word, page, size
    } = req.query;

    if (!word) return res.json({ isSuccess: false, code: 300, message: "검색어 입력 필요" });
    if (word.length > 15) return res.json({ isSuccess: false, code: 301, message: "검색어를 15자 미만으로 줄여주세요" });
    if (!page) return res.json({ isSuccess: false, code: 302, message: "페이지 입력 필요" });
    if (!size) return res.json({ isSuccess: false, code: 303, message: "사이즈 입력 필요" });
    if (page < 1) return res.json({ isSuccess: false, code: 304, message: "페이지 번호 확인" });

    page = size * (page-1);

    try {     
        const searchRows = await searchDao.searchMagazine(word, page, size);
        
        if (!searchRows) {
            return res.json({
            isSuccess: false,
            code: 305,
            message: "검색 결과 매거진 탭 조회 실패"
            });
        };

        res.json({
            result: {countMagazine: searchRows[0][0].countHouseIntro, magazineList: searchRows[1]},
            isSuccess: true,
            code: 200,
            message: "검색 결과 매거진 탭 조회 성공"
        });
    } catch (err) {
        logger.error(`App - getSearchMagazine Query error\n: ${JSON.stringify(err)}`);
        return false;
    }
}

/**
 * update - 2020.11.13
 * 42. 검색 결과 사진 탭 조회 API
 */
exports.getSearchPhoto = async function (req, res) {
    const userId = req.verifiedToken.userId;
    let {
        word, page, size
    } = req.query;

    if (!word) return res.json({ isSuccess: false, code: 300, message: "검색어 입력 필요" });
    if (word.length > 15) return res.json({ isSuccess: false, code: 301, message: "검색어를 15자 미만으로 줄여주세요" });
    if (!page) return res.json({ isSuccess: false, code: 302, message: "페이지 입력 필요" });
    if (!size) return res.json({ isSuccess: false, code: 303, message: "사이즈 입력 필요" });
    if (page < 1) return res.json({ isSuccess: false, code: 304, message: "페이지 번호 확인" });

    page = size * (page-1);

    try {     
        const searchRows = await searchDao.searchPhoto(word, page, size);
        
        if (!searchRows) {
            return res.json({
            isSuccess: false,
            code: 305,
            message: "검색 결과 사진 탭 조회 실패"
            });
        };

        res.json({
            result: {countPhoto: searchRows[0][0].countPhoto, photoList: searchRows[1]},
            isSuccess: true,
            code: 200,
            message: "검색 결과 사진 탭 조회 성공"
        });
    } catch (err) {
        logger.error(`App - getSearchPhoto Query error\n: ${JSON.stringify(err)}`);
        return false;
    }
}

/**
 * update - 2020.11.12
 * 43. 최근 검색어 조회 API
 */
exports.getRecentSearch = async function (req, res) {
    const userId = req.verifiedToken.userId;

    try {     
        const searchRows = await searchDao.getRecent(userId);

        if (!searchRows) {
            return res.json({
            isSuccess: false,
            code: 300,
            message: "최근 검색어 조회 실패"
            });
        };
        
        res.json({
            result: searchRows,
            isSuccess: true,
            code: 200,
            message: "최근 검색어 조회 성공"
        });
    } catch (err) {
        logger.error(`App - deleteRecentSearch Query error\n: ${JSON.stringify(err)}`);
        return false;
    }
}

/**
 * update - 2020.11.12
 * 44. 최근 검색어 삭제 API
 */
exports.deleteRecentSearch = async function (req, res) {
    const userId = req.verifiedToken.userId;
    let status;
    const {
        word
    } = req.query;

    if (word == '전체') status = 0 
    else status = 1;
    if (!word) return res.json({ isSuccess: false, code: 300, message: "검색어 입력 필요" });
    // if (await searchDao.checkWord(word, userId) === 0) return res.json({ isSuccess: false, code: 301, message: "존재하지 않는 검색어" });
    

    try {     
        const searchRows = await searchDao.deleteRecent(userId, status, word);

        if (!searchRows) {
            return res.json({
            isSuccess: false,
            code: 302,
            message: "최근 검색어 삭제 실패"
            });
        };
        
        if (status = 0) {
            res.json({
                isSuccess: true,
                code: 200,
                message: "전체 검색어 삭제 성공"
            });
        } 
        else {
            res.json({
                isSuccess: true,
                code: 201,
                message: "검색어 <" + word + "> 삭제 성공"
            });
        }
    } catch (err) {
        logger.error(`App - deleteRecentSearch Query error\n: ${JSON.stringify(err)}`);
        return false;
    }
}

/**
 * update - 2020.11.12
 * 45. 인기 검색어 조회 API
 */
exports.getBestSearch = async function (req, res) {
    const userId = req.verifiedToken.userId;

    try {     
        const searchRows = await searchDao.getBest();

        if (!searchRows) {
            return res.json({
            isSuccess: false,
            code: 300,
            message: "인기 검색어 조회 실패"
            });
        };

        res.json({
            result: {updateTime: searchRows[0][0].updateTime, wordList: searchRows[1]},
            isSuccess: true,
            code: 200,
            message: "인기 검색어 조회 성공"
        });
    } catch (err) {
        logger.error(`App - getBestSearch Query error\n: ${JSON.stringify(err)}`);
        return false;
    }
}