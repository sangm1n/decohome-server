const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');

const jwt = require('jsonwebtoken');
const crypto = require('crypto');
const secret_config = require('../../../config/secret');

const houseIntroDao = require('../dao/houseIntroDao');
const { constants } = require('buffer');

/**
 * update - 2020.11.07
 * 21. 전체 집소개 조회 API
 */
exports.getHouseIntro = async function (req, res) {
    const userId = req.verifiedToken.userId;
    let condition = ' order by ';
    let typeCond = pyungCond = styleCond = ' and w.hashTagName like ';
    let {
        page, size, filter, type, pyung, style
    } = req.query;
    
    if (!page) return res.json({ isSuccess: false, code: 300, message: "페이지 입력 필요" });
    if (!size) return res.json({ isSuccess: false, code: 301, message: "사이즈 입력 필요" });
    if (page < 1) return res.json({ isSuccess: false, code: 302, message: "페이지 번호 확인" });

    page = size * (page-1);

    switch (filter) {
        case '1': condition += 'hi.createdAt desc'; break;
        case '2': condition += 'countComment desc'; break;
        case '3': condition += 'rand(100)'; break;
        case '4': condition += 'hi.viewCount desc'; break;
        default: return res.json({ isSuccess: false, code: 303, message: "존재하지 않는 필터링" });
    }

    typeCond += "'%" + type + "%'";
    pyungCond += "'%" + pyung + "%'";
    styleCond += "'%" + style + "%'";

    if (!type) typeCond = '';
    if (!pyung) pyungCond = '';
    if (!style) styleCond = '';

    try {        
        const houseIntroRows = await houseIntroDao.getAllHouseIntro(page, size, condition, typeCond, pyungCond, styleCond);
        if (type) {
            const checkTypeRows = await houseIntroDao.checkTypeTag(type);
            if (checkTypeRows === 0) return res.json({ isSuccess: false, code: 304, message: "존재하지 않는 주거형태 태그" });
        }
        if (pyung) {
            const checkPyungRows = await houseIntroDao.checkPyungTag(pyung);
            if (checkPyungRows === 0) return res.json({ isSuccess: false, code: 305, message: "존재하지 않는 평수 태그" });
        }
        if (style) {
            const checkStyleRows = await houseIntroDao.checkStyleTag(style);
            if (checkStyleRows === 0) return res.json({ isSuccess: false, code: 306, message: "존재하지 않는 스타일 태그" });
        }

        if (!houseIntroRows) {
            return res.json({
            isSuccess: false,
            code: 307,
            message: "전체 집소개 조회 실패"
            });
        };

        res.json({
            result: houseIntroRows,
            isSuccess: true,
            code: 200,
            message: "전체 집소개 조회 성공"
        });
    } catch (err) {
        logger.error(`App - HouseIntro Query error\n: ${JSON.stringify(err)}`);
        return false;
    }
}

/**
 * update - 2020.11.08
 * 22. 집소개 수 조회 API
 */
exports.getHouseIntroCount = async function (req, res) {
    const userId = req.verifiedToken.userId;
    let typeCond = pyungCond = styleCond = ' and w.hashTagName like ';
    const {
        type, pyung, style
    } = req.query;

    typeCond += "'%" + type + "%'";
    pyungCond += "'%" + pyung + "%'";
    styleCond += "'%" + style + "%'";

    if (!type) typeCond = '';
    if (!pyung) pyungCond = '';
    if (!style) styleCond = '';

    try {
        const introCountRows = await houseIntroDao.getIntroCount(typeCond, pyungCond, styleCond);

        if (!introCountRows) {
            return res.json({
            isSuccess: false,
            code: 300,
            message: "집소개 수 조회 실패"
            });
        };

        res.json({
            result: introCountRows,
            isSuccess: true,
            code: 200,
            message: "집소개 수 조회 성공"
        });
    } catch (err) {
        logger.error(`App - HouseIntroCount Query error\n: ${JSON.stringify(err)}`);
        return false;
    }
}

/**
 * update - 2020.11.08
 * 23. 집소개 게시글 조회 API
 */
exports.getHouseIntroPost = async function (req, res) {
    const userId = req.verifiedToken.userId;
    const {
        houseIntroId
    } = req.params;

    if (await houseIntroDao.checkHouseIntro(houseIntroId) === 0) return res.json({ isSuccess: false, code: 300, message: "존재하지 않는 집소개 게시글" });

    try {
        const introInfoRows = await houseIntroDao.getIntroInfo(houseIntroId);
        const introTagRows = await houseIntroDao.getIntroTag(houseIntroId);
        const introPostRows = await houseIntroDao.getIntroPost(userId, houseIntroId);

        if (!introInfoRows) return res.json({ isSuccess: false, code: 301, message: "집소개 게시글 정보 조회 실패" });
        if (!introTagRows) return res.json({ isSuccess: false, code: 302, message: "집소개 게시글 태그 조회 실패" });
        if (!introPostRows) return res.json({ isSuccess: false, code: 303, message: "집소개 게시글 콘텐츠 조회 실패" });

        res.json({
            result: {houseIntroInfo: introInfoRows, houseIntroTag: introTagRows, houseIntroPost: introPostRows},
            isSuccess: true,
            code: 200,
            message: "집소개 게시글 조회 성공"
        });
    } catch (err) {
        logger.error(`App - HouseIntroPost Query error\n: ${JSON.stringify(err)}`);
        return false;
    }
}

/**
 * update - 2020.11.08
 * 24. 전체 공간 조회 API
 */
exports.getAllSpace = async function (req, res) {
    const userId = req.verifiedToken.userId;
    let condition = ' order by ';
    let spaceCond = ' and st.spaceTagName like ';
    let pyungCond = styleCond = ' and w.hashTagName like ';
    let {
        page, size, filter, space, pyung, style
    } = req.query;
    
    if (!page) return res.json({ isSuccess: false, code: 300, message: "페이지 입력 필요" });
    if (!size) return res.json({ isSuccess: false, code: 301, message: "사이즈 입력 필요" });
    if (page < 1) return res.json({ isSuccess: false, code: 302, message: "페이지 번호 확인" });

    page = size * (page-1);

    switch (filter) {
        case '1': condition += 'viewCount desc'; break;
        case '2': condition += 'si.createdAt desc'; break;
        default: return res.json({ isSuccess: false, code: 303, message: "존재하지 않는 필터링" });
    }

    spaceCond += "'%" + space + "%'";
    pyungCond += "'%" + pyung + "%'";
    styleCond += "'%" + style + "%'";

    if (!space) spaceCond = '';
    if (!pyung) pyungCond = '';
    if (!style) styleCond = '';

    try {
        if (space) {
            const checkTypeRows = await houseIntroDao.checkSpaceTag(space);
            if (checkTypeRows === 0) return res.json({ isSuccess: false, code: 304, message: "존재하지 않는 공간 태그" });
        }
        if (pyung) {
            const checkPyungRows = await houseIntroDao.checkPyungTag(pyung);
            if (checkPyungRows === 0) return res.json({ isSuccess: false, code: 305, message: "존재하지 않는 평수 태그" });
        }
        if (style) {
            const checkStyleRows = await houseIntroDao.checkStyleTag(style);
            if (checkStyleRows === 0) return res.json({ isSuccess: false, code: 306, message: "존재하지 않는 스타일 태그" });
        }

        const spaceRows = await houseIntroDao.getSpace(page, size, condition, spaceCond, pyungCond, styleCond);
        
        if (!spaceRows) {
            return res.json({ 
            isSuccess: false, 
            code: 307, 
            message: "전체 공간 조회 실패" });
        }

        res.json({
            result: spaceRows,
            isSuccess: true,
            code: 200,
            message: "전체 공간 조회 성공"
        });
    } catch (err) {
        logger.error(`App - AllSpace Query error\n: ${JSON.stringify(err)}`);
        return false;
    }
}

/**
 * update - 2020.11.08
 * 25. 공간 수 조회 API
 */
exports.getSpaceCount = async function (req, res) {
    const userId = req.verifiedToken.userId;
    let spaceCond = ' and st.spaceTagName like ';
    let pyungCond = styleCond = ' and w.hashTagName like ';
    const {
        space, pyung, style
    } = req.query;

    spaceCond += "'%" + space + "%'";
    pyungCond += "'%" + pyung + "%'";
    styleCond += "'%" + style + "%'";

    if (!space) spaceCond = '';
    if (!pyung) pyungCond = '';
    if (!style) styleCond = '';

    try {
        const spaceCountRows = await houseIntroDao.getSpaceTotalCount(spaceCond, pyungCond, styleCond);
        if (space) {
            const checkTypeRows = await houseIntroDao.checkSpaceTag(space);
            if (checkTypeRows === 0) return res.json({ isSuccess: false, code: 300, message: "존재하지 않는 공간 태그" });
        }
        if (pyung) {
            const checkPyungRows = await houseIntroDao.checkPyungTag(pyung);
            if (checkPyungRows === 0) return res.json({ isSuccess: false, code: 301, message: "존재하지 않는 평수 태그" });
        }
        if (style) {
            const checkStyleRows = await houseIntroDao.checkStyleTag(style);
            if (checkStyleRows === 0) return res.json({ isSuccess: false, code: 302, message: "존재하지 않는 스타일 태그" });
        }

        if (!spaceCountRows) {
            return res.json({
            isSuccess: false,
            code: 303,
            message: "공간 수 조회 실패"
            });
        };

        res.json({
            result: spaceCountRows,
            isSuccess: true,
            code: 200,
            message: "공간 수 조회 성공"
        });
    } catch (err) {
        logger.error(`App - SpaceCount Query error\n: ${JSON.stringify(err)}`);
        return false;
    }
}

/**
 * update - 2020.11.10
 * 26. 공간 게시글 조회 API
 */
exports.getSpacePost = async function (req, res) {
    const userId = req.verifiedToken.userId;
    const {
        spaceId
    } = req.params;

    if (await houseIntroDao.checkSpace(spaceId) === 0) return res.json({ isSuccess: false, code: 300, message: "존재하지 않는 공간 게시글" });

    try {
        const idRows = await houseIntroDao.getHouseInfo(spaceId);
        const houseInfoRows = await houseIntroDao.getHouseId(idRows.houseIntroId);
        const tagRows = await houseIntroDao.getTag(houseInfoRows.houseIntroId);
        const spaceRows = await houseIntroDao.getSpaceInfo(spaceId);

        if (!houseInfoRows) return res.json({ isSuccess: false, code: 301, message: "집소개 정보 조회 실패" });
        if (!tagRows) return res.json({ isSuccess: false, code: 302, message: "태그 조회 실패" });
        if (!spaceRows) return res.json({ isSuccess: false, code: 303, message: "공간 게시글 조회 실패" });

        res.json({
            result: {houseInfo: houseInfoRows, tagList: tagRows, spaceInfo: spaceRows},
            isSuccess: true,
            code: 200,
            message: "공간 게시글 조회 성공"
        });
    } catch (err) {
        logger.error(`App - SpacePost Query error\n: ${JSON.stringify(err)}`);
        return false;
    }
}

/**
 * update - 2020.11.10
 * 27. 공간에 포함된 상품 조회 API
 */
exports.getSpaceProduct = async function (req, res) {
    const userId = req.verifiedToken.userId;
    const {
        spaceId
    } = req.params;
    let {
        page, size
    } = req.query;

    if (!page) return res.json({ isSuccess: false, code: 300, message: "페이지 입력 필요" });
    if (!size) return res.json({ isSuccess: false, code: 301, message: "사이즈 입력 필요" });
    page = size * (page-1);

    if (await houseIntroDao.checkSpace(spaceId) === 0) return res.json({ isSuccess: false, code: 302, message: "존재하지 않는 공간 게시글" });

    try {
        const productRows = await houseIntroDao.getSpaceProducts(spaceId, page, size);

        if (!productRows) {
            return res.json({
            isSuccess: false,
            code: 303,
            message: "공간에 포함된 상품 조회 실패"
            });
        };

        res.json({
            result: productRows,
            isSuccess: true,
            code: 200,
            message: "공간에 포함된 상품 조회 성공"
        });
    } catch (err) {
        logger.error(`App - SpacePost Query error\n: ${JSON.stringify(err)}`);
        return false;
    }
}

/**
 * update - 2020.11.10
 * 28. 이 집의 다른 공간 조회 API
 */
exports.getSpaceOther = async function (req, res) {
    const userId = req.verifiedToken.userId;
    const {
        spaceId
    } = req.params;
    let {
        page, size
    } = req.query;

    if (!page) return res.json({ isSuccess: false, code: 300, message: "페이지 입력 필요" });
    if (!size) return res.json({ isSuccess: false, code: 301, message: "사이즈 입력 필요" });
    page = size * (page-1);

    if (await houseIntroDao.checkSpace(spaceId) === 0) return res.json({ isSuccess: false, code: 302, message: "존재하지 않는 공간 게시글" });

    try {
        const houseInfoRows = await houseIntroDao.getIntroId(spaceId);
        const tagRows = await houseIntroDao.getSpaceOtherTag(spaceId);
        const imageRows = await houseIntroDao.getSpaceOtherImage(houseInfoRows.houseIntroId, page, size);

        if (!houseInfoRows) {
            return res.json({
            isSuccess: false,
            code: 303,
            message: "이 집의 다른 공간 조회 실패"
            });
        };

        res.json({
            result: {tagList: tagRows, imageList: imageRows},
            isSuccess: true,
            code: 200,
            message: "이 집의 다른 공간 조회 성공"
        });
    } catch (err) {
        logger.error(`App - SpacePost Query error\n: ${JSON.stringify(err)}`);
        return false;
    }
}