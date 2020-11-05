const { pool } = require("../../../config/database");

// 전체 상품 조회
async function getAllProducts() {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const getAllProductsQuery = `
        select exists(select nickname from User where nickname = ? and isDeleted = 'N') as exist;
        `;
        const [productRows] = await connection.query(
        getAllProductsQuery
        );
        connection.release();
        
        return productRows;
    } catch (err) {
        logger.error(`App - CheckNickname DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}


module.exports = {
};
