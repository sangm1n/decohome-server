const { pool } = require("../../../config/database");

// 검색어 입력
async function setSearch(userId, word) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const searchQuery = `
        insert into Search (userId, searchName)
        values (?, ?);
        `;
        const searchParams = [userId, word];
        const [searchRows] = await connection.query(
        searchQuery,
        searchParams
        );
        connection.release();
        
        return searchRows;
    } catch (err) {
        logger.error(`App - setSearch DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}

// 인기 검색어
async function getBest() {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const timeQuery = `
        select concat(date_format(now(), '%Y.%m.%d %H:'), '00 업데이트') as updateTime;
        `;
        const searchQuery = `
        select searchName
        from Search
        where isDeleted = 'N'
        and createdAt >= timestamp(date_format(date_add(now(), interval -100 hour), '%Y.%m.%d %H'))
        and createdAt <= timestamp(date_format(now(), '%Y.%m.%d %H'))
        group by searchName
        order by count(searchName) desc limit 5;
        `
        const [searchRows] = await connection.query(
        timeQuery + searchQuery
        );
        connection.release();
        
        return searchRows;
    } catch (err) {
        logger.error(`App - getBest DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}

// 최근 검색어
async function getRecent(userId) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const searchQuery = `
        select distinct searchName
        from Search
        where userId = ?
        and isDeleted = 'N'
        and timestampdiff(hour, createdAt, now()) < 6
        order by createdAt desc;
        `;
        const searchParams = [userId];
        const [searchRows] = await connection.query(
        searchQuery,
        searchParams
        );
        connection.release();
        
        return searchRows;
    } catch (err) {
        logger.error(`App - getRecent DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}

async function deleteRecent(userId, status, word) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const allQuery = `
        update Search set isDeleted = 'Y' where userId = ?;
        `;
        const notAllQuery = `
        update Search set isDeleted = 'Y' where userId = ? and searchName = ?;
        `
        let searchRows;
        if (status === 0) {
            searchRows = await connection.query(allQuery, [userId]);
        } else {
            searchRows = await connection.query(notAllQuery, [userId, word]);
        }
        connection.release();
        
        return searchRows;
    } catch (err) {
        logger.error(`App - deleteRecent DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}

async function checkWord(word, userId) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const searchQuery = `
        select exists(select * from Search where searchName = ? and userId = ? and isDeleted = 'N') as exist;
        `;
        const searchParams = [word, userId];
        const [searchRows] = await connection.query(
        searchQuery,
        searchParams
        );
        connection.release();
        
        return searchRows[0].exist;
    } catch (err) {
        logger.error(`App - checkWord DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}


module.exports = {
    setSearch,
    getBest,
    getRecent,
    deleteRecent, 
    checkWord,
};