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

// 보관함 조회
async function getAllLocker(userId, page, size) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const countQuery = `
        select case ul.houseIntroId and ul.spaceId and ul.productId
        when ul.houseIntroId = -1 and ul.spaceId = -1 and ul.productId = -1
        then 0
        else
        count(ul.lockerId) end as count
        from UserLocker ul
        join Locker l
        on ul.lockerId = l.lockerId
        where l.isDeleted = 'N'
        and ul.isDeleted = 'N'
        and userId = ?;
        `;
        const lockerQuery = `
        select
        ifnull(v.houseIntroId, -1) as houseIntroId,
        ifnull(v.title, -1)        as houseIntroTitle,
        ifnull(v.spaceImage, -1)   as houseIntroImage,
        ifnull(w.spaceId, -1)      as spaceId,
        ifnull(w.spaceImage, -1)   as spaceImage,
        ifnull(x.productId, -1)    as productId,
        ifnull(x.productImage, -1) as productImage,
        ifnull(x.productName, -1)  as productName
        from UserLocker ul
        left join (select hi.houseIntroId, hi.title, si.spaceImage
        from HouseIntro hi
        join SpaceImage si on hi.houseIntroId = si.houseIntroId
        where si.isThumbnailed = 'Y'
        and hi.isDeleted = 'N'
        and si.isDeleted = 'N'
        group by hi.houseIntroId) v on ul.houseIntroId = v.houseIntroId
        left join (select si.spaceId, si.spaceImage from SpaceImage si where si.isDeleted = 'N') w
        on w.spaceId = ul.spaceId
        left join (select p.productId, productImage, productName, originalPrice, salePrice
        from Product p
        join ProductImage pi on p.productId = pi.productId
        where pi.isThumbnailed = 'Y'
        and p.isDeleted = 'N'
        and pi.isDeleted = 'N') x on x.productId = ul.productId
        join Locker l on ul.lockerId = l.lockerId
        where l.userId = ?
        and ul.isDeleted = 'N'
        and l.isDeleted = 'N'
        order by ul.updatedAt
        limit ?, ?;
        `
        const lockerParams = [userId, userId, Number(page), Number(size)];
        const [lockerRows] = await connection.query(
            countQuery + lockerQuery,
            lockerParams
        );
        connection.release();
        
        return lockerRows;
    } catch (err) {
        logger.error(`App - getAllLocker DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}

async function getLockerList(userId, page, size) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const countQuery = `
        select ul.lockerId,
        lockerName,
        v.count,
        case
        when timestampdiff(second, ul.updatedAt, now()) < 60
        then concat(timestampdiff(second, ul.updatedAt, now()), '초 전')
        when timestampdiff(minute, ul.updatedAt, now()) < 60
        then concat(timestampdiff(minute, ul.updatedAt, now()), '분 전')
        when timestampdiff(hour, ul.updatedAt, now()) < 24
        then concat(timestampdiff(hour, ul.updatedAt, now()), '시간 전')
        when timestampdiff(day, ul.updatedAt, now()) < 7
        then concat(timestampdiff(day, ul.updatedAt, now()), '일 전')
        when timestampdiff(week, ul.updatedAt, now()) < 4
        then concat(timestampdiff(week, ul.updatedAt, now()), '주 전')
        when timestampdiff(month, ul.updatedAt, now()) < 12
        then concat(timestampdiff(month, ul.updatedAt, now()), '달 전')
        else date_format(ul.createdAt, '%Y-%m-%d')
        end as updateTime
        from UserLocker ul
        join Locker l on ul.lockerId = l.lockerId
        join (select ul.lockerId, count(ul.lockerId) as count
        from UserLocker ul
        join Locker l on ul.lockerId = l.lockerId
        where ul.isDeleted = 'N'
        group by ul.lockerId) v on ul.lockerId = v.lockerId
        where l.userId = ?
        and (ul.lockerId, ul.updatedAt) in (
        select lockerId, max(updatedAt)
        from UserLocker
        group by lockerId
        )
        group by ul.lockerId;
        `;
        const lockerQuery = `
        select ul.lockerId,
        l.lockerName,
        ifnull(v.spaceImage, -1)   as houseIntroImage,
        ifnull(w.spaceImage, -1)   as spaceImage,
        ifnull(x.productImage, -1) as productImage
        from UserLocker ul
        left join (select hi.houseIntroId, hi.title, si.spaceImage
        from HouseIntro hi
        join SpaceImage si on hi.houseIntroId = si.houseIntroId
        where si.isThumbnailed = 'Y'
        and hi.isDeleted = 'N'
        and si.isDeleted = 'N'
        group by hi.houseIntroId) v on ul.houseIntroId = v.houseIntroId
        left join (select si.spaceId, si.spaceImage from SpaceImage si where si.isDeleted = 'N') w
        on w.spaceId = ul.spaceId
        left join (select p.productId, productImage, productName, originalPrice, salePrice
        from Product p
        join ProductImage pi on p.productId = pi.productId
        where pi.isThumbnailed = 'Y'
        and p.isDeleted = 'N'
        and pi.isDeleted = 'N') x on x.productId = ul.productId
        join Locker l on ul.lockerId = l.lockerId
        where l.userId = ?
        and ul.isDeleted = 'N' and l.isDeleted = 'N'
        order by ul.lockerId;
        `
        const lockerParams = [userId, userId];
        const [lockerRows] = await connection.query(
            countQuery + lockerQuery,
            lockerParams
        );
        connection.release();
        
        return lockerRows;
    } catch (err) {
        logger.error(`App - getLockerList DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}

// 개별 보관함 조회
async function getLockerDetail(lockerId, page, size) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const countQuery = `
        select ul.lockerId,
        lockerName,
        v.count,
        case
        when timestampdiff(second, ul.updatedAt, now()) < 60
        then concat(timestampdiff(second, ul.updatedAt, now()), '초 전')
        when timestampdiff(minute, ul.updatedAt, now()) < 60
        then concat(timestampdiff(minute, ul.updatedAt, now()), '분 전')
        when timestampdiff(hour, ul.updatedAt, now()) < 24
        then concat(timestampdiff(hour, ul.updatedAt, now()), '시간 전')
        when timestampdiff(day, ul.updatedAt, now()) < 7
        then concat(timestampdiff(day, ul.updatedAt, now()), '일 전')
        when timestampdiff(week, ul.updatedAt, now()) < 4
        then concat(timestampdiff(week, ul.updatedAt, now()), '주 전')
        when timestampdiff(month, ul.updatedAt, now()) < 12
        then concat(timestampdiff(month, ul.updatedAt, now()), '달 전')
        else date_format(ul.createdAt, '%Y-%m-%d')
        end as updateTime
        from UserLocker ul
        join Locker l on ul.lockerId = l.lockerId
        join (select ul.lockerId, count(ul.lockerId) as count
        from UserLocker ul
        join Locker l on ul.lockerId = l.lockerId
        where ul.isDeleted = 'N'
        group by ul.lockerId) v on ul.lockerId = v.lockerId
        where ul.lockerId = ?
        and (ul.lockerId, ul.updatedAt) in (
        select lockerId, max(updatedAt)
        from UserLocker
        group by lockerId
        )
        group by ul.lockerId;
        `
        const lockerQuery = `
        select ifnull(v.houseIntroId, -1) as houseIntroId,
        ifnull(v.title, -1)        as houseIntroTitle,
        ifnull(v.spaceImage, -1)   as houseIntroImage,
        ifnull(w.spaceId, -1)      as spaceId,
        ifnull(w.spaceImage, -1)   as spaceImage,
        ifnull(x.productId, -1)    as productId,
        ifnull(x.productName, -1)  as productName,
        ifnull(x.productImage, -1) as productImage
        from UserLocker ul
        left join (select hi.houseIntroId, hi.title, si.spaceImage
        from HouseIntro hi
        join SpaceImage si on hi.houseIntroId = si.houseIntroId
        where si.isThumbnailed = 'Y'
        and hi.isDeleted = 'N'
        and si.isDeleted = 'N'
        group by hi.houseIntroId) v on ul.houseIntroId = v.houseIntroId
        left join (select si.spaceId, si.spaceImage from SpaceImage si where si.isDeleted = 'N') w
        on w.spaceId = ul.spaceId
        left join (select p.productId, productImage, productName, originalPrice, salePrice
        from Product p
        join ProductImage pi on p.productId = pi.productId
        where pi.isThumbnailed = 'Y'
        and p.isDeleted = 'N'
        and pi.isDeleted = 'N') x on x.productId = ul.productId
        join Locker l on ul.lockerId = l.lockerId
        where ul.lockerId = ?
        and ul.isDeleted = 'N'
        order by ul.updatedAt desc
        limit ?, ?;
        `
        const lockerParams = [lockerId, lockerId, Number(page), Number(size)];
        const [lockerRows] = await connection.query(
            countQuery + lockerQuery,
            lockerParams
        );
        connection.release();
        
        return lockerRows;
    } catch (err) {
        logger.error(`App - getLockerDetail DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}

// 보관함에 상품 저장
async function setLockerHouseIntro(lockerId, houseIntroId) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const lockerQuery = `
        insert into UserLocker (lockerId, houseIntroId, spaceId, productId)
        values (?, ?, default, default)
        `
        const lockerParams = [lockerId, houseIntroId];
        const [lockerRows] = await connection.query(
            lockerQuery,
            lockerParams
        );
        connection.release();
        
        return lockerRows;
    } catch (err) {
        logger.error(`App - setLockerHouseIntro DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}

async function setLockerSpace(lockerId, spaceId) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const lockerQuery = `
        insert into UserLocker (lockerId, houseIntroId, spaceId, productId)
        values (?, default, ?, default)
        `
        const lockerParams = [lockerId, spaceId];
        const [lockerRows] = await connection.query(
            lockerQuery,
            lockerParams
        );
        connection.release();
        
        return lockerRows;
    } catch (err) {
        logger.error(`App - setLockerSpace DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}

async function setLockerProduct(lockerId, productId) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const lockerQuery = `
        insert into UserLocker (lockerId, houseIntroId, spaceId, productId)
        values (?, default, default, ?)
        `
        const lockerParams = [lockerId, productId];
        const [lockerRows] = await connection.query(
            lockerQuery,
            lockerParams
        );
        connection.release();
        
        return lockerRows;
    } catch (err) {
        logger.error(`App - setLockerProduct DB Connection error\n: ${err.message}`);
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
    getAllLocker,
    getLockerList,
    getLockerDetail,
    setLockerHouseIntro,
    setLockerSpace,
    setLockerProduct,
};
