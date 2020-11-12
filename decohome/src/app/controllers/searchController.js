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

    if (word.length > 15) return res.json({ isSuccess: false, code: 300, message: "검색어를 15자 미만으로 줄여주세요" });

    try {     
        const searchRows = searchDao.setSearch(userId, word);

        if (!searchRows) {
            return res.json({
            isSuccess: false,
            code: 301,
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

    if (!word) return res.json({ isSuccess: false, code: 300, message: "검색어 입력 필요" });
    if (await searchDao.checkWord(word, userId) === 0) return res.json({ isSuccess: false, code: 301, message: "존재하지 않는 검색어" });
    if (word === '전체') status = 0 
    else status = 1;

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