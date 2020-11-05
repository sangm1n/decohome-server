const { pool } = require("../../../config/database");

// 전체 상품 조회
async function getAllProducts(condition, page, size, cateCond, brandCond, priceCond) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const getAllProductsQuery = `
        select p.productId,
        brandName,
        productName,
        format(originalPrice, 0)                                                                as originalPrice,
        if(salePrice = -1, null, format(salePrice, 0))                                          as salePrice,
        if(p.isSoldedOut = 'Y', '품절',
        if(salePrice = -1, null, concat(round((1 - salePrice / originalPrice) * 100), '%'))) as saleRatio,
        productImage
        from Product p
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
        where pi.isThumbnailed = 'Y'` + cateCond + ` ` + brandCond + ` ` + priceCond + `
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

// 상품 수
async function countProducts(cateCond, brandCond, priceCond) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const countAllProductsQuery = `
        select count(productId) as countProduct from Product where isDeleted = 'N'` + cateCond + ` ` + brandCond + ` ` + priceCond + `;
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

// 브랜드 목록
async function getBrandList() {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const getBrandListQuery = `
        select brandId, brandName from Brand where isDeleted = 'N';
        `;
        const brandRows = await connection.query(
            getBrandListQuery
        );
        connection.release();
        
        return brandRows[0];
    } catch (err) {
        logger.error(`App - getBrandList DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}

// 가격대

module.exports = {
    getAllProducts,
    countProducts,
    getBrandList,
};
