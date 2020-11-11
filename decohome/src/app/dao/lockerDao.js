const { pool } = require("../../../config/database");

// 보관함 생성
async function addBasicLocker(userId) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const addBasicLockerQuery = `
        insert into Locker (userId, lockerName, isPrivated)
        values (` + userId + `, '매거진', default ), (` + userId + `, '가구 & 소품', default);
        `;
        const addBasicLockerParams = [userId];
        const [lockerRows] = await connection.query(
            addBasicLockerQuery,
            addBasicLockerParams
        );
        connection.release();
        
        return lockerRows;
    } catch (err) {
        logger.error(`App - addBasicLocker DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}

async function addLocker(userId, lockerName) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const addLockerQuery = `
        insert into Locker (userId, lockerName, isPrivated)
        values (?, ?, default );
        `;
        const addLockerParams = [userId, lockerName];
        const [lockerRows] = await connection.query(
            addLockerQuery,
            addLockerParams
        );
        connection.release();
        
        return lockerRows;
    } catch (err) {
        logger.error(`App - addLocker DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}

async function checkLocker(userId, lockerId) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const checkLockerQuery = `
        select exists(select lockerId from Locker where userId = ? and lockerId = ? and isDeleted = 'N') as exist;
        `;
        const checkLockerParams = [userId, lockerId];
        const [lockerRows] = await connection.query(
            checkLockerQuery,
            checkLockerParams
        );
        connection.release();
        
        return lockerRows[0].exist;
    } catch (err) {
        logger.error(`App - checkLocker DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}

// 보관함 수정
async function updateLockerName(lockerName, userId, lockerId) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const updateLockerQuery = `
        update Locker set lockerName = ? where userId = ? and lockerId = ?
        `;
        const updateLockerParams = [lockerName, userId, lockerId];
        const [lockerRows] = await connection.query(
            updateLockerQuery,
            updateLockerParams
        );
        connection.release();
        
        return lockerRows;
    } catch (err) {
        logger.error(`App - updateLockerName DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}

async function lockerStatus(userId, lockerId) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const lockerStatusQuery = `
        select isPrivated from Locker where userId = ? and lockerId = ?;
        `;
        const lockerStatusParams = [userId, lockerId];
        const [lockerRows] = await connection.query(
            lockerStatusQuery,
            lockerStatusParams
        );
        connection.release();
        
        return lockerRows[0].isPrivated;
    } catch (err) {
        logger.error(`App - lockerStatus DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}

async function updateLockerPrivate(userId, lockerId) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const updateLockerQuery = `
        update Locker
        set isPrivated = case
        when isPrivated = 'Y' then 'N'
        when isPrivated = 'N' then 'Y' end
        where userId = ? and lockerId = ?;
        `;
        const updateLockerParams = [userId, lockerId];
        const [lockerRows] = await connection.query(
            updateLockerQuery,
            updateLockerParams
        );
        connection.release();
        
        return lockerRows;
    } catch (err) {
        logger.error(`App - updateLockerPrivate DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}

// 보관함 삭제
async function deleteLock(userId, lockerId) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const deleteLockerQuery = `
        update Locker set isDeleted = 'Y' where userId = ? and lockerId = ?;
        `;
        const deleteLockerParams = [userId, lockerId];
        const [lockerRows] = await connection.query(
            deleteLockerQuery,
            deleteLockerParams
        );
        connection.release();
        
        return lockerRows;
    } catch (err) {
        logger.error(`App - deleteLocker DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}

module.exports = {
    addBasicLocker,
    addLocker,
    checkLocker,
    lockerStatus,
    updateLockerName,
    updateLockerPrivate,
    deleteLock,
};
