const { pool } = require("../../../config/database");

// 전체 상품 조회
async function getAllProducts(condition, page, size, cateCond, brandCond, priceCond) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const getAllProductsQuery = `
        select p.productId, brandName, productName,
        concat(format(originalPrice, 0), '원')                                         as originalPrice,
        if(salePrice = -1, -1, concat(format(salePrice, 0), '원'))                                 as salePrice,
        if(p.isSoldedOut = 'Y', '품절',
        if(salePrice = -1, -1, concat(round((1 - salePrice / originalPrice) * 100), '%'))) as saleRatio, productImage
        from Product p
        join Category c on p.categoryId = c.categoryId
        join Brand b on p.brandId = b.brandId
        join ProductImage pi on p.productId = pi.productId
        left join (select count(reviewId) as countReview, pr.productId
        from ProductReview pr
        join Product p on pr.productId = p.productId
        where pr.isDeleted = 'N'
        group by pr.productId) v on p.productId = v.productId
        left join (select count(viewId) as countView, rv.productId
        from RecentView rv
        right join Product p on rv.productId = p.productId
        where rv.isDeleted = 'N'
        group by rv.productId) w on p.productId = w.productId
        where pi.isThumbnailed = 'Y' and p.isDeleted = 'N' ` + cateCond + ` ` + brandCond + ` ` + priceCond + `
        order by ` + condition + `
        limit ` + page + `, ` + size + `;
        `;
        const getAllProductsParams = [condition, page, size, cateCond, brandCond, priceCond];
        const [productRows] = await connection.query(
        getAllProductsQuery,
        getAllProductsParams
        );
        connection.release();
        
        return productRows;
    } catch (err) {
        logger.error(`App - AllProducts DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}

async function getCategoryId(ref) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const getCategoryRefQuery = `
        select categoryId from Category where categoryRef = ?;
        `;
        const getCategoryRefParams = [ref];
        const [cateRows] = await connection.query(
            getCategoryRefQuery,
            getCategoryRefParams
        );
        connection.release();

        return cateRows;
    } catch (err) {
        logger.error(`App - countProducts DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}

// 상품 수
async function countProducts(cateCond, brandCond, priceCond) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const countAllProductsQuery = `
        select count(productId) as countProduct from Product p
        join Category c on p.categoryId = c.categoryId
        where isDeleted = 'N'` + cateCond + ` ` + brandCond + ` ` + priceCond + `;
        `;
        const countAllProductsParams = [cateCond, brandCond, priceCond];
        const [countRows] = await connection.query(
            countAllProductsQuery,
            countAllProductsParams
        );
        connection.release();

        return countRows[0];
    } catch (err) {
        logger.error(`App - countProducts DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}

// 카테고리
async function getCategoryName(condition, idx) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const getCategoryNameQuery = `
        select categoryId, categoryName from Category where ` + condition + `;
        `;
        const getCategoryNameParams = [condition, idx];
        const [categoryName] = await connection.query(
            getCategoryNameQuery,
            getCategoryNameParams
        );
        connection.release();

        if (idx === 1) {
            return {large: categoryName};
        } else if (idx === 2) {
            return {large: categoryName[0], medium: categoryName.slice(1, )};
        } else if (idx === 3) {
            return {large: categoryName[0], medium: categoryName[1], small: categoryName.slice(2, )};
        } else {
            return {large: categoryName[0], medium: categoryName[1], small: categoryName[2]};
        }
    } catch (err) {
        logger.error(`App - getCategoryName DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}

async function getSmallCategory(productId) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const getSmallCategoryQuery = `
        select categoryId from Product where productId = ?;
        `;
        const getSmallCategoryParams = [productId];
        const [categoryName] = await connection.query(
            getSmallCategoryQuery,
            getSmallCategoryParams
        );
        connection.release();
        
        return categoryName;
    } catch (err) {
        logger.error(`App - getSmallCategory DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}

async function getCategory(smallCateId) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const getCategoryQuery = `
        select categoryId, categoryRef
        from Category
        where categoryId = (select categoryRef from Category where categoryId = ?);
        `;
        const getCategoryParams = [smallCateId];
        const [category] = await connection.query(
            getCategoryQuery,
            getCategoryParams
        );
        connection.release();
        
        return category;
    } catch (err) {
        logger.error(`App - getCategory DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}

// 상품 조회
async function getProductImage(productId) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const getProductImageQuery = `
        select productImage from ProductImage where productId = ? order by isThumbnailed desc;
        `;
        const getProductImageParams = [productId];
        const [productImageRows] = await connection.query(
            getProductImageQuery,
            getProductImageParams
        );
        connection.release();
        
        return productImageRows;
    } catch (err) {
        logger.error(`App - getProductImage DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}

async function getProductInfo(productId) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const getProductInfoQuery = `   
        select if(p.isSoldedOut = 'Y', '품절', -1)                                                   as isSoldedOut,
        if(isFreeShipped = 'Y', '무료배송', -1)                                                     as isFreeShipped,
        if(isLowestPrice = 'Y', '최저가', -1)                                                       as isLowestPrice,
        if(isOnlyLowest = 'Y', '단독 최저가', -1)                                                    as isOnlyLowest,
        ifnull(v.averageScore, 0)                                                                             as averageScore,
        ifnull(v.countReview, 0)                                                                          as countReview,
        brandName,
        productName,
        if(p.isSoldedOut = 'Y', -1,
        if(salePrice = -1, -1,
        concat(round((1 - salePrice / originalPrice) * 100), '%')))                                            as saleRatio,
        if(p.isSoldedOut = 'Y', -1,
        if(salePrice = -1, -1, concat(format(salePrice, 0), '원')))                            as salePrice,
        format(originalPrice, 0)                                                                as originalPrice,
        if(salePrice = -1, concat('최대 ', round(originalPrice * 0.02, 0), '원 적립'),
        concat('최대 ', format(round(salePrice * 0.02, 0), 0), '원 적립'))                            as accumulate,
        shippingPrice,
        if(arrivalDate = -1, -1, if(arrivalWeekend = 'Y', concat('지금 주문 시, ', arrivalDate, '일 소요 예상 (주말 포함)'),
        concat('지금 주문 시, ', arrivalDate, '일 소요 예상 (주말 미포함)')))                         as arrivalDate,
        case
        when payMethod = 'P' then '선불'
        when payMethod = 'C' then '착불'
        when payMethod = 'I'
        then '선불 (+설치비)' end                                                                 as payMethod,
        case
        when shippingType = 'A' then '택배'
        when shippingType = 'B' then '일반배송'
        when shippingType = 'C' then '화물배송'
        when shippingType = 'D' then '직접배송'
        end                                                                                         as shippingType,
        if(mountainous = -1, '상세하단 참고',
        concat('배송비 별도 추가 (제주도 : ', format(mountainous, 0), '원)'))                       as mountainous
        from Product p
        join Brand b on p.brandId = b.brandId
        left join (select p.productId,
        concat('리뷰 ', count(reviewId), '개') as countReview,
        round(avg(score), 0)                as averageScore
        from ProductReview pr
        join Product p on p.productId = pr.productId
        where pr.isDeleted = 'N'
        group by pr.productId) v on p.productId = v.productId
        join ProductShipping ps on p.productId = ps.productId
        where p.productId = ?
        and p.isDeleted = 'N';
        `;
        const getProductInfoParams = [productId];
        const [productRows] = await connection.query(
            getProductInfoQuery,
            getProductInfoParams
        );
        connection.release();
        
        return productRows[0];
    } catch (err) {
        logger.error(`App - getProductInfo DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}

async function checkProduct(productId) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const checkProductQuery = `
        select exists (select productId from Product where productId = ?) as exist;
        `;
        const checkProductParams = [productId];
        const [checkProductRows] = await connection.query(
            checkProductQuery,
            checkProductParams
        );
        connection.release();
        
        return checkProductRows[0].exist;
    } catch (err) {
        logger.error(`App - checkProduct DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}

async function checkBrand(brandId) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const checkBrandQuery = `
        select exists (select brandId from Brand where brandId = ?) as exist;
        `;
        const checkBrandParams = [brandId];
        const [checkBrandRows] = await connection.query(
            checkBrandQuery,
            checkBrandParams
        );
        connection.release();
        
        return checkBrandRows[0].exist;
    } catch (err) {
        logger.error(`App - checkBrand DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}

// 상품 정보 조회
async function getProductDetail(productId) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const getProductDetailQuery = `
        select productInfo from Product where productId = ? and isDeleted = 'N';
        `;
        const getProductDetailParams = [productId];
        const [productRows] = await connection.query(
            getProductDetailQuery,
            getProductDetailParams
        );
        connection.release();
        
        return productRows[0];
    } catch (err) {
        logger.error(`App - getProductImage DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}

// 브랜드 목록
async function getBrandList(page, size, condition) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const getBrandListQuery = `
        select b.brandId, brandIntroImage, brandName, brandIntro, concat('총 ', count(p.productId), '개 상품') as countProduct
        from Brand b
        join Product p on b.brandId = p.brandId
        where b.isDeleted = 'N'
        and p.isDeleted = 'N' group by b.brandId order by ` + condition + `
        limit ` + page + `, ` + size + `;
        `;
        const getBrandListParams = [page, size, condition]
        const brandRows = await connection.query(
            getBrandListQuery,
            getBrandListParams
        );
        connection.release();
        
        return brandRows[0];
    } catch (err) {
        logger.error(`App - getBrandList DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}

async function getBrandImage(arr, size) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const getBrandListQuery = `
        select b.brandId, v.productId, v.productImage
        from Brand b
        join (select p.productId, brandId, productImage, row_number() over (partition by brandId order by rand(100)) as rn
        from Product p
        join ProductImage pi on p.productId = pi.productId
        where p.isDeleted = 'N' group by p.productId) v
        on b.brandId = v.brandId
        where v.rn <= 3 order by field(b.brandId, ` + arr + `, b.brandId)
        limit ` + size*3 + `;
        `;
        const getBrandListParams = [arr, size]
        const brandRows = await connection.query(
            getBrandListQuery,
            getBrandListParams
        );
        connection.release();
        
        return brandRows[0];
    } catch (err) {
        logger.error(`App - getBrandImage DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}

async function getBrandInfo(brandId) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const getBrandInfoQuery = `
        select brandName, brandThumbnail, brandIntro, count(productId) as countProduct
        from Brand b
        join Product p on b.brandId = p.brandId
        where p.isDeleted = 'N'
        and b.isDeleted = 'N'
        and p.brandId = ?;
        `;
        const getBrandInfoParams = [brandId]
        const brandRows = await connection.query(
            getBrandInfoQuery,
            getBrandInfoParams
        );
        connection.release();
        
        return brandRows[0];
    } catch (err) {
        logger.error(`App - getBrandInfo DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}

// 신상품
async function getNewProductItem(page, size) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const getNewProductItemQuery = `
        select p.productId, productName, productImage, concat(round((1 - salePrice / originalPrice) * 100), '%') as saleRatio
        from Product p
        join ProductImage pi on p.productId = pi.productId
        where p.isDeleted = 'N'
        and pi.isDeleted = 'N'
        and p.isSoldedOut = 'N'
        and salePrice != -1
        group by p.productId
        order by p.createdAt desc
        limit ` + page + `, ` + size + `;
        `;
        const getNewProductItemParams = [page, size];
        const [newProductRows] = await connection.query(
            getNewProductItemQuery,
            getNewProductItemParams
        );
        connection.release();
        
        return newProductRows;
    } catch (err) {
        logger.error(`App - getNewProductItem DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}

// 실시간 랭킹
async function getRankingProduct(page, size, cateCond) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const getRankingProductQuery = `
        select p.productId,
        brandName,
        productName,
        productImage,
        concat(format(originalPrice, 0), '원')                    as originalPrice,
        concat(format(salePrice, 0), '원')                        as salePrice,
        concat(round((1 - salePrice / originalPrice) * 100), '%') as saleRatio,
        v.averageScore,
        concat('(리뷰 ', ifnull(v.countReview, 0), ')')             as countReview
        from Product p
        join ProductImage pi on p.productId = pi.productId
        join Brand b on p.brandId = b.brandId
        join (select p.productId, count(reviewId) as countReview, round(avg(score), 1) as averageScore
        from ProductReview pr
        join Product p on p.productId = pr.productId
        group by pr.productId) v on p.productId = v.productId
        join Category c on p.categoryId = c.categoryId
        where salePrice != -1
        and p.isDeleted = 'N'
        and p.isSoldedOut = 'N' ` + cateCond + `
        group by p.productId
        order by v.averageScore desc
        limit ` + page + `, ` + size + `;
        `;
        const getRankingProductParams = [page, size, cateCond];
        const [rankProductRows] = await connection.query(
            getRankingProductQuery,
            getRankingProductParams
        );
        connection.release();
        
        return rankProductRows;
    } catch (err) {
        logger.error(`App - getRankingProduct DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}

// 단독 세일 상품
async function getOnlySaleProduct(page, size) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const getOnlySaleProductQuery = `
        select p.productId,
        brandName,
        productName,
        concat(format(salePrice, 0), '원')                         as salePrice,
        concat(round((1 - salePrice / originalPrice) * 100), '%') as saleRatio,
        productImage
        from Product p
        join Category c on p.categoryId = c.categoryId
        join Brand b on p.brandId = b.brandId
        join ProductImage pi on p.productId = pi.productId
        left join (select count(reviewId) as countReview, pr.productId
        from ProductReview pr
        join Product p on pr.productId = p.productId
        where pr.isDeleted = 'N'
        group by pr.productId) v on p.productId = v.productId
        where pi.isThumbnailed = 'Y'
        and p.isSoldedOut = 'N'
        and salePrice != -1
        and p.isDeleted = 'N'
        and p.isOnlyLowest = 'Y'
        order by v.countReview desc
        limit ` + page + `, ` + size + `;
        `;
        const getOnlySaleProductParams = [page, size];
        const [rankProductRows] = await connection.query(
            getOnlySaleProductQuery,
            getOnlySaleProductParams
        );
        connection.release();
        
        return rankProductRows;
    } catch (err) {
        logger.error(`App - getOnlySaleProduct DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}

// 추천상품 탭
async function getRecomTab(condition) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const getRecomTabQuery = `
        select r.recommendId,
        recomThumbnail,
        recomTitle,
        recomIntro,
        concat('~', max(round((1 - salePrice / originalPrice) * 100)), '%') as maxSaleRatio
        from Recommend r
        join Product p on r.recommendId = p.recommendId
        where salePrice != -1
        group by r.recommendId ` + condition + `;
        `;
        const getRecomTabParams = [condition];
        const [recomRows] = await connection.query(
            getRecomTabQuery,
            getRecomTabParams
        );
        connection.release();
        
        return recomRows;
    } catch (err) {
        logger.error(`App - getRecomTab DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}

async function getRecomPost(recommendId, page, size) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const getRecomPostQuery = `
        select p.productId,
        productImage,
        brandName,
        productName,
        concat(format(originalPrice, 0), '원')                                                       as originalPrice,
        if(salePrice = -1, -1, concat(format(salePrice, 0), '원'))                                 as salePrice,
        if(isSoldedOut = 'Y', '품절',
        if(salePrice = -1, -1, concat(round((1 - salePrice / originalPrice) * 100), '%'))) as saleRatio,
        if(isFreeShipped = 'Y', '무료배송', -1)                                                   as isFreeShipped,
        if(isSoldedOut = 'Y', '재고없음', -1)                                                     as isSoldedOut,
        if(isLowestPrice = 'Y', '최저가', -1)                                                    as isLowestPrice,
        if(isOnlyLowest = 'Y', '단독 최저가', -1)                                                  as isOnlyLowest,
        if(isVideo = 'Y', '영상속제품', -1)                                                        as isVideo
        from Product p
        join ProductImage pi on p.productId = pi.productId
        join Brand b on p.brandId = b.brandId
        where pi.isThumbnailed = 'Y'
        and p.isDeleted = 'N'
        and b.isDeleted = 'N'
        and recommendId = ?
        group by p.productId
        limit ` + page + `, ` + size + `;
        `;
        const getRecomPostParams = [recommendId, page, size];
        const [recomRows] = await connection.query(
            getRecomPostQuery,
            getRecomPostParams
        );
        connection.release();
        
        return recomRows;
    } catch (err) {
        logger.error(`App - getRecomPost DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}

async function getRecomImage(recommendId) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const getRecomImageQuery = `
        select recomImage from Recommend where recommendId = ?;
        `;
        const getRecomImageParams = [recommendId];
        const [recomRows] = await connection.query(
            getRecomImageQuery,
            getRecomImageParams
        );
        connection.release();
        
        return recomRows[0];
    } catch (err) {
        logger.error(`App - getRecomImage DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}

async function checkRecommend(recommendId) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const checkRecommendQuery = `
        select exists (select recommendId from Recommend where recommendId = ?) as exist;
        `;
        const checkRecommendParams = [recommendId];
        const [checkRecommendRows] = await connection.query(
            checkRecommendQuery,
            checkRecommendParams
        );
        connection.release();
        
        return checkRecommendRows[0].exist;
    } catch (err) {
        logger.error(`App - checkRecommend DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}

module.exports = {
    getAllProducts,
    getCategoryId,
    countProducts,
    getBrandList,
    getCategoryName,
    getSmallCategory,
    getCategory,
    getProductImage,
    getProductInfo,
    checkProduct,
    getBrandImage,
    getBrandInfo,
    checkBrand,
    getProductDetail,
    getNewProductItem,
    getRankingProduct,
    getOnlySaleProduct,
    getRecomTab,
    getRecomPost,
    checkRecommend,
    getRecomImage,
};
