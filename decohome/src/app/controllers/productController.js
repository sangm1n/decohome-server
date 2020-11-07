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

    if (!page) return res.json({ isSuccess: false, code: 300, message: "페이지 입력 필요" });
    if (!size) return res.json({ isSuccess: false, code: 301, message: "사이즈 입력 필요" });
    if (page < 1) return res.json({ isSuccess: false, code: 302, message: "페이지 번호 확인" });
    if (large > 7 || large < 1) return res.json({ isSuccess: false, code: 303, message: "존재하지 않는 대분류" });
    if (medium > 35 || medium < 8) return res.json({ isSuccess: false, code: 304, message: "존재하지 않는 중분류" });
    if (small > 158 || small < 36) return res.json({ isSuccess: false, code: 305, message: "존재하지 않는 소분류" });
    if (min < 0) return res.json({ isSuccess: false, code: 306, message: "최소 금액 오류" });

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
            return res.json({ isSuccess: false, code: 307, message: "존재하지 않는 필터링" });
    }

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
        if (large) {
            const cateIdRows = await productDao.getCategoryId(large);
            const first = cateIdRows[0].categoryId;
            const last = cateIdRows[cateIdRows.length - 1].categoryId;

            if (large && !medium && !small) {
                cateCond = 'and (categoryRef >= ' + first + ' and categoryRef <= ' + last + ')';
            } else if (large && medium && !small) {
                cateCond = 'and categoryRef = ' + medium;
            } else if (large && medium && small) {
                cateCond = 'and p.categoryId = ' + small;
            }
        } else cateCond = '';
        
        const productRows = await productDao.getAllProducts(condition, page, size, cateCond, brandCond, priceCond);

        if (!productRows) {
            return res.json({
            isSuccess: false,
            code: 308,
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

    if (large > 7 || large < 1) return res.json({ isSuccess: false, code: 300, message: "존재하지 않는 대분류" });
    if (medium > 35 || medium < 8) return res.json({ isSuccess: false, code: 301, message: "존재하지 않는 중분류" });
    if (small > 158 || small < 36) return res.json({ isSuccess: false, code: 302, message: "존재하지 않는 소분류" });
    if (min < 0) return res.json({ isSuccess: false, code: 303, message: "최소 금액 오류" });

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
        if (large) {
            const cateIdRows = await productDao.getCategoryId(large);
            const first = cateIdRows[0].categoryId;
            const last = cateIdRows[cateIdRows.length - 1].categoryId;

            if (large && !medium && !small) {
                cateCond = 'and (categoryRef >= ' + first + ' and categoryRef <= ' + last + ')';
            } else if (large && medium && !small) {
                cateCond = 'and categoryRef = ' + medium;
            } else if (large && medium && small) {
                cateCond = 'and p.categoryId = ' + small;
            }
        } else cateCond = '';

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
 * update - 2020.11.06
 * 10. 상품 조회 API
 */
exports.getProduct = async function (req, res) {
    const userId = req.verifiedToken.userId;
    const {
        productId
    } = req.params;

    if (await productDao.checkProduct(productId) === 0) return res.json({ isSuccess: false, code: 300, message: "존재하지 않는 상품" });

    try {
        const smallCate = await productDao.getSmallCategory(productId);
        const totalCate = await productDao.getCategory(Number(smallCate[0].categoryId));

        const large = Number(smallCate[0].categoryId);
        const medium = Number(totalCate[0].categoryId);
        const small = Number(totalCate[0].categoryRef);
        const condition = ' categoryId = ' + large + ' or categoryId = ' + medium + ' or categoryId = ' + small;
        
        const category = await productDao.getCategoryName(condition, 4);
        const imageRows = await productDao.getProductImage(productId);
        const productRows = await productDao.getProductInfo(productId);      
        
        if (!category) return res.json({ isSuccess: false, code: 301, message: "카테고리 조회 실패" });
        if (!imageRows) return res.json({ isSuccess: false, code: 302, message: "상품 이미지 조회 실패" });
        if (!productRows) return res.json({ isSuccess: false, code: 303, message: "상품 조회 실패" });

        res.json({
            result: {category, images: imageRows, product: productRows},
            isSuccess: true,
            code: 200,
            message: "상품 조회 성공"
        });
    } catch (err) {
        logger.error(`App - Product Query error\n: ${JSON.stringify(err)}`);
        return false;
    }
}

/**
 * update - 2020.11.06
 * 11. 상품 정보 조회 API
 */
exports.getProductDetail = async function (req, res) {
    const userId = req.verifiedToken.userId;
    const {
        productId
    } = req.params;

    if (await productDao.checkProduct(productId) === 0) return res.json({ isSuccess: false, code: 300, message: "존재하지 않는 상품" });    

    try {
        const productDetailRows = await productDao.getProductDetail(productId);

        if (!productDetailRows) {
            return res.json({
            isSuccess: false,
            code: 301,
            message: "현재 판매 중인 상품이 아닙니다"
            });
        };

        res.json({
            result: productDetailRows,
            isSuccess: true,
            code: 200,
            message: "상품 정보 조회 성공"
        });
    } catch (err) {
        logger.error(`App - ProductDetail Query error\n: ${JSON.stringify(err)}`);
        return false;
    }
}

/**
 * update - 2020.11.07
 * 13. 신상품 조회 API
 */
exports.getNewProduct = async function (req, res) {
    const userId = req.verifiedToken.userId;
    let {
        page, size 
    } = req.query;

    if (!page) return res.json({ isSuccess: false, code: 300, message: "페이지 입력 필요" });
    if (!size) return res.json({ isSuccess: false, code: 301, message: "사이즈 입력 필요" });
    if (page < 1) return res.json({ isSuccess: false, code: 302, message: "페이지 번호 확인" });
    page = size * (page-1);

    try {
        const newProductRows = await productDao.getNewProductItem(page, size);

        if (!newProductRows) {
            return res.json({
            isSuccess: false,
            code: 303,
            message: "신상품 목록 조회 실패"
            });
        };

        res.json({
            result: newProductRows,
            isSuccess: true,
            code: 200,
            message: "신상품 목록 조회 성공"
        });
    } catch (err) {
        logger.error(`App - NewProduct Query error\n: ${JSON.stringify(err)}`);
        return false;
    }
}

/**
 * update - 2020.11.07
 * 14. 실시간 랭킹 Top 3 조회 API
 */
exports.getRankingProduct = async function (req, res) {
    const userId = req.verifiedToken.userId;

    try {
        const rankingRows = await productDao.getRankingProduct();

        if (!rankingRows) {
            return res.json({
            isSuccess: false,
            code: 300,
            message: "실시간 랭킹 top 3 조회 실패"
            });
        };

        res.json({
            result: rankingRows,
            isSuccess: true,
            code: 200,
            message: "실시간 랭킹 top 3 조회 성공"
        });
    } catch (err) {
        logger.error(`App - RankingProduct Query error\n: ${JSON.stringify(err)}`);
        return false;
    }
}

/**
 * update - 2020.11.05
 * 16. 카테고리 조회 API
 */
exports.getCategory = async function (req, res) {
    const userId = req.verifiedToken.userId;
    let condition, idx;
    const {
        large, medium, small
    } = req.query;

    if (!large && !medium && !small) {
        condition = ' categoryRef = 0';
        idx = 1;
    } else if (large && !medium && !small) {
        condition = ' categoryRef = ' + large + ' or categoryId = ' + large;
        idx = 2;
    } else if (large && medium && !small) {
        condition = ' categoryId = ' + large + ' or (categoryRef = ' + large + ' and categoryId = ' + medium + ') or categoryRef = ' + medium;
        idx = 3;
    } else if (large && medium && small) {
        condition = ' categoryId = ' + large + ' or categoryId = ' + medium + ' or categoryId = ' + small;
        idx = 4;
    } else return res.json({ isSuccess: false, code: 300, message: "잘못된 카테고리" });

    try {
        const categoryRows = await productDao.getCategoryName(condition, idx);

        if (!categoryRows) {
            return res.json({
            isSuccess: false,
            code: 301,
            message: "카테고리 목록 조회 실패"
            });
        };

        res.json({
            result: categoryRows,
            isSuccess: true,
            code: 200,
            message: "카테고리 목록 조회 성공"
        });
    } catch (err) {
        logger.error(`App - CategoryName Query error\n: ${JSON.stringify(err)}`);
        return false;
    }
}

/**
 * update - 2020.11.06
 * 17. 전체 브랜드 조회 API
 */
exports.getBrands = async function (req, res) {
    const userId = req.verifiedToken.userId;
    let condition;
    const {
        filter 
    } = req.query;

    switch (filter) {
        case '1':
            condition = 'rand(100)';
            break;
        case '2':
            condition = 'countProduct desc';
            break;
        case '3':
            condition = 'b.createdAt desc';
            break;
        default:
            return res.json({ isSuccess: false, code: 300, message: "존재하지 않는 필터링" });
    }

    try {
        const brandRows = await productDao.getBrandList(condition);
        let arr = "";
        for (let i = 0; i < brandRows.length; i++) {
            if (i !== brandRows.length-1)
                arr += brandRows[i].brandId + ', ';
            else
                arr += brandRows[i].brandId;
        }
        const brandImageRows = await productDao.getBrandImage(arr);

        if (!brandRows) {
            return res.json({
            isSuccess: false,
            code: 301,
            message: "전체 브랜드 목록 조회 실패"
            });
        };

        res.json({
            result: {brand: brandRows, brandImage: brandImageRows},
            isSuccess: true,
            code: 200,
            message: "전체 브랜드 목록 조회 성공"
        });
    } catch (err) {
        logger.error(`App - BrandList Query error\n: ${JSON.stringify(err)}`);
        return false;
    }
}
