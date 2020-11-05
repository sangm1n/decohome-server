const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');

const jwt = require('jsonwebtoken');
const regexEmail = require('regex-email');
const crypto = require('crypto');
const secret_config = require('../../../config/secret');

const productDao = require('../dao/productDao');
const { constants } = require('buffer');

/**
 * update - 2020.11.05
 * 8. 전체 상품 조회 API
 */
exports.getProducts = async function (req, res) {
    const userId = req.verifiedToken.userId;
    let condition;
    let {
        page, size, filter, large, medium, small, brand, min, max
    } = req.query;
    
    if (page < 1) return res.json({ isSuccess: false, code: 300, message: "페이지 번호 확인" });
    if (large > 7 || large < 1) return res.json({ isSuccess: false, code: 301, message: "존재하지 않는 대분류" });
    if (medium > 28 || medium < 1) return res.json({ isSuccess: false, code: 302, message: "존재하지 않는 중분류" });
    if (small > 128 || small < 1) return res.json({ isSuccess: false, code: 303, message: "존재하지 않는 소분류" });
    if (min < 0) return res.json({ isSuccess: false, code: 304, message: "최소 금액 오류" });

    page = size * (page-1);

    switch (filter) {
        case '1':
            condition = 'rand(100)';
            break;
        case '2':
            condition = 'p.createdAt desc, productId desc';
            break;
        case '3':
            condition = 'salePrice is not null';
            break;
        case '4':
            condition = 'salePrice desc';
            break;
        case '5':
            condition = 'v.countReview desc';
            break;
        case '6':
            condition = 'w.countView desc';
            break;
        default:
            return res.json({ isSuccess: false, code: 305, message: "조회 필터링 실패" });
    }

    if (large && !medium && !small) {
        cateCond = 'and largeCateId = ' + large;
    } else if (large && medium && !small) {
        cateCond = 'and largeCateId = ' + large + ' and mediumCateId = ' + medium;
    } else if (large && medium && small) {
        cateCond = 'and largeCateId = ' + large + ' and mediumCateId = ' + medium + ' and smallCateId = ' + small;
    } else cateCond = '';

    if (brand) {
        brandCond = 'and p.brandId = ' + brand;
    } else brandCond = '';

    if (min && !max) {
        priceCond = 'and salePrice >= ' + min;
    } else if (!min && max) {
        priceCond = 'and salePrice < ' + max;
    } else if (min && max) {
        priceCond = 'and salePrice > ' + min + ' and salePrice <= ' + max;
    } else priceCond = '';

    try {
        const productRows = await productDao.getAllProducts(condition, page, size, cateCond, brandCond, priceCond);

        if (!productRows) {
            return res.json({
            isSuccess: false,
            code: 306,
            message: "전체 상품 조회 실패"
            });
        };

        res.json({
            result: productRows,
            isSuccess: true,
            code: 200,
            message: "전체 상품 조회 성공"
        });
    } catch (err) {
        logger.error(`App - AllProducts Query error\n: ${JSON.stringify(err)}`);
        return false;
    }
}

/**
 * update - 2020.11.05
 * 9. 상품 수 조회 API
 */
exports.getProductCount = async function (req, res) {
    const userId = req.verifiedToken.userId;
    let cateCond = '';
    let brandCond = '';
    let priceCond = '';
    let {
        large, medium, small, brand, min, max
    } = req.query;

    if (large > 7 || large < 1) return res.json({ isSuccess: false, code: 300, message: "존재하지 않는 대분류 카테고리" });
    if (medium > 28 || medium < 1) return res.json({ isSuccess: false, code: 301, message: "존재하지 않는 중분류 카테고리" });
    if (small > 128 || small < 1) return res.json({ isSuccess: false, code: 302, message: "존재하지 않는 소분류 카테고리" });
    if (min < 0) return res.json({ isSuccess: false, code: 303, message: "최소 금액 오류" });

    if (large && !medium && !small) {
        cateCond = 'and largeCateId = ' + large;
    } else if (large && medium && !small) {
        cateCond = 'and largeCateId = ' + large + ' and mediumCateId = ' + medium;
    } else if (large && medium && small) {
        cateCond = 'and largeCateId = ' + large + ' and mediumCateId = ' + medium + ' and smallCateId = ' + small;
    } else cateCond = '';

    if (brand) {
        brandCond = 'and brandId = ' + brand;
    } else brandCond = '';

    if (min && !max) {
        priceCond = 'and salePrice >= ' + min;
    } else if (!min && max) {
        priceCond = 'and salePrice < ' + max;
    } else if (min && max) {
        priceCond = 'and salePrice > ' + min + ' and salePrice <= ' + max;
    } else priceCond = '';

    try {
        const countRows = await productDao.countProducts(cateCond, brandCond, priceCond);

        if (!countRows) {
            return res.json({
            isSuccess: false,
            code: 304,
            message: "상품 수 조회 실패"
            });
        };

        res.json({
            result: countRows,
            isSuccess: true,
            code: 200,
            message: "상품 수 조회 성공"
        });
    } catch (err) {
        logger.error(`App - ProductCount Query error\n: ${JSON.stringify(err)}`);
        return false;
    }
}

/**
 * update - 2020.11.05
 * 9. 브랜드 목록 조회 API
 */
exports.getBrands = async function (req, res) {
    const userId = req.verifiedToken.userId;

    try {
        const brandRows = await productDao.getBrandList();

        if (!brandRows) {
            return res.json({
            isSuccess: false,
            code: 300,
            message: "브랜드 목록 조회 실패"
            });
        };

        res.json({
            result: brandRows,
            isSuccess: true,
            code: 200,
            message: "브랜드 목록 조회 성공"
        });
    } catch (err) {
        logger.error(`App - BrandList Query error\n: ${JSON.stringify(err)}`);
        return false;
    }
}



/**
 * update - 2020.11.05
 * 9. 카테고리 이름 조회 API
 */
exports.getCategoryName = async function (req, res) {
    const userId = req.verifiedToken.userId;
    let {
        page, size
    } = req.query;
    page = size * (page-1);

    try {
        const productRows = await productDao.getCateName(page, size);

        if (!productRows) {
            res.json({
            isSuccess: false,
            code: 300,
            message: "전체 상품 조회 실패"
            });

            return false;
        };

        res.json({
            result: productRows,
            isSuccess: true,
            code: 200,
            message: "전체 상품 조회 성공"
        });
    } catch (err) {
        logger.error(`App - CategoryProducts Query error\n: ${JSON.stringify(err)}`);
        return false;
    }
}