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
    const {
        size, pageNo
    } = req.query;

    console.log(Math.random());

    try {
        const productRows = await productDato.getAllProducts();
        
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
        logger.error(`App - UserProfile Query error\n: ${JSON.stringify(err)}`);
        return false;
    }
}