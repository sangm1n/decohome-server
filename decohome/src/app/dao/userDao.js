const { pool } = require("../../../config/database");

// 회원가입
async function userEmailCheck(email) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const selectEmailQuery = `
        select exists(select email from User where email = ? and isDeleted = 'N') as exist;
        `;
        const selectEmailParams = [email];
        const [emailRows] = await connection.query(
        selectEmailQuery,
        selectEmailParams
        );
        connection.release();
        
        return emailRows;
    } catch (err) {
        logger.error(`App - CheckEmail DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}

async function userNicknameCheck(nickname) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const selectNicknameQuery = `
        select exists(select nickname from User where nickname = ? and isDeleted = 'N') as exist;
        `;
        const selectNicknameParams = [nickname];
        const [nicknameRows] = await connection.query(
        selectNicknameQuery,
        selectNicknameParams
        );
        connection.release();
        
        return nicknameRows;
    } catch (err) {
        logger.error(`App - CheckNickname DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}

async function insertUserInfo(email, hashedPassword, nickname, phone) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        try {
            await connection.beginTransaction();
            const insertUserInfoQuery = `
            insert into User (email, password, nickname, phone) values (?, ?, ?, ?);
            `;
            const insertUserInfoParams = [email, hashedPassword, nickname, phone];
            const insertUserInfoRow = await connection.query(
            insertUserInfoQuery,
            insertUserInfoParams
            );
            const getUserIdQuery = `
            select userId from User where email = ?;
            `
            const [getUserInfoRow] = await connection.query(
                getUserIdQuery, email
            );
            const insertLockerQuery = `
            insert into Locker (userId, lockerName, isPrivated)
            values (?, '매거진', default ), (?, '가구 & 소품', default);
            `
            const selectLockerQuery = `
            select lockerId from Locker where userId = ? and isDeleted = 'N';
            `
            const insertLockerParmas = [getUserInfoRow[0].userId, getUserInfoRow[0].userId, getUserInfoRow[0].userId];
            const [result] = await connection.query(
                insertLockerQuery + selectLockerQuery, 
                insertLockerParmas
            );
            const insertUserLockerQuery = `
            insert into UserLocker (lockerId) values (?), (?);
            `
            await connection.query(
                insertUserLockerQuery, [result[1][0].lockerId, result[1][1].lockerId]
            );
            await connection.commit();
            connection.release();
            
            return insertUserInfoRow;
        } catch (err) {
            await connection.rollback();
            connection.release();
            logger.error(`App - InsertUserInfo Transaction error\n: ${err.message}`);
            return res.status(500).send(`Error: ${err.message}`);
        }
    } catch (err) {
        logger.error(`App - InsertUserInfo DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}

// 로그인
async function selectUserInfo(email) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const selectUserInfoQuery = `
        select userId, email, password from User where email = ? and isDeleted = 'N';
        `;

        const selectUserInfoParams = [email];
        const [userInfoRows] = await connection.query(
        selectUserInfoQuery,
        selectUserInfoParams
        );
        connection.release();
        
        return userInfoRows;
    } catch (err) {
        logger.error(`App - SignIn DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}

// 프로필 조회
async function getUserProfile(userId) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const getUserProfileQuery = `
        select name, nickname, email, phone, website, message, profileImage, concat(grade, '층이웃') as grade
        from User
        where userId = ? and isDeleted = 'N';
        `;
        const getUserProfileParams = [userId];
        const [userProfileRows] = await connection.query(
            getUserProfileQuery,
            getUserProfileParams
        );
        connection.release();

        return userProfileRows[0];
    } catch (err) {
        logger.error(`App - UserProfile DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}

// 프로필 수정
async function updateUserProfile(name, nickname, phone, website, message, userId) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const updateUserProfileQuery = `
        update User set name = ?, nickname = ?, phone = ?, 
        website = ?, message = ?
        where userId = ? and isDeleted = 'N';
        `;
        const updateUserProfileParams = [name, nickname, phone, website, message, userId];
        const [userProfileRows] = await connection.query(
            updateUserProfileQuery,
            updateUserProfileParams
        );
        connection.release();
    } catch (err) {
        logger.error(`App - UpdateProfile DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}

// 프로필 삭제
async function deleteUserProfile(userId) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const deleteUserProfileQuery = `
        update User set isDeleted = 'Y' where userId = ?;
        `;
        const deleteUserProfileParams = [userId];
        const [userProfileRows] = await connection.query(
            deleteUserProfileQuery,
            deleteUserProfileParams
        );
        connection.release();
    } catch (err) {
        logger.error(`App - DeleteProfile DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}

// 프로필 이미지 수정
async function updateProfileImage(profileImage, userId, idx) {
    try {
    const connection = await pool.getConnection(async (conn) => conn);
    
    let updateProfileImageQuery;
    if (idx === 1) {
        updateProfileImageQuery = `
        update User set profileImage = ? where userId = ?;
        `;
    } else if (idx === 2) {
        updateProfileImageQuery = `
        update User set profileImage = default where userId = ` + userId + `;
        `;
    }
    
    const updateProfileImageParams = [profileImage, userId, idx];
    const [userProfileRows] = await connection.query(
        updateProfileImageQuery,
        updateProfileImageParams
    );
    connection.release();
    } catch (err) {
        logger.error(`App - UpdateProfileImage DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}

// 최근 본 상품/컨텐츠
async function getRecentProduct(userId, page, size) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        try {
        connection.beginTransaction();
        const updateQuery = `
        update RecentView
        set isDeleted = case
        when timestampdiff(hour, updatedAt, now()) > 6
        then 'Y' else 'N' end where userId = ?;
        `
        const recentQuery = `
        select p.productId,
        productImage,
        brandName,
        productName,
        concat(format(salePrice, 0), '원') as salePrice,
        if(isSoldedOut = 'Y', '품절',
        if(salePrice = -1, null, concat(round((1 - salePrice / originalPrice) * 100), '%'))) as saleRatio
        from Product p
        join Brand b on p.brandId = b.brandId
        join ProductImage pi on p.productId = pi.productId
        join RecentView rv on p.productId = rv.productId
        where pi.isThumbnailed = 'Y'
        and rv.isDeleted = 'N'
        and rv.productId != -1
        and rv.userId = ?
        order by rv.updatedAt desc
        limit ?, ?;
        `;
        const recentParams = [userId, userId, Number(page), Number(size)];
        const [recentRows] = await connection.query(
            updateQuery + recentQuery,
            recentParams
        );
        connection.release();
        
        return recentRows[1];
        } catch (err) {
            logger.error(`App - getRecentProduct Transaction error\n: ${err.message}`);
            return res.status(500).send(`Error: ${err.message}`);
        }
    } catch (err) {
        logger.error(`App - getRecentProduct DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}

async function getRecentHouse(userId, page, size) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        try {
        connection.beginTransaction();
        const updateQuery = `
        update RecentView
        set isDeleted = case
        when timestampdiff(hour, updatedAt, now()) > 6
        then 'Y' else 'N' end where userId = ?;
        `
        const recentQuery = `
        select hi.houseIntroId, spaceImage, title, v.hashTagName
        from HouseIntro hi
        join SpaceImage si on hi.houseIntroId = si.houseIntroId
        join RecentView rv on hi.houseIntroId = rv.houseIntroId
        join (select houseIntroId,
        tagStatus,
        group_concat(distinct '#', hashTagName order by tagStatus separator ' ') as hashTagName
        from HashTag ht
        group by houseIntroId) v on v.houseIntroId = hi.houseIntroId
        where si.isDeleted = 'N'
        and si.isThumbnailed = 'Y'
        and rv.houseIntroId != -1
        and rv.userId = ?
        order by rv.updatedAt desc
        limit ?, ?;
        `;
        const recentParams = [userId, userId, Number(page), Number(size)];
        const [recentRows] = await connection.query(
            updateQuery + recentQuery,
            recentParams
        );
        connection.release();
        
        return recentRows[1];
        } catch (err) {
            logger.error(`App - getRecentHouse Transaction error\n: ${err.message}`);
            return res.status(500).send(`Error: ${err.message}`);
        }
    } catch (err) {
        logger.error(`App - getRecentHouse DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}


module.exports = {
    userEmailCheck,
    userNicknameCheck,
    insertUserInfo,
    selectUserInfo,
    getUserProfile,
    updateUserProfile,
    deleteUserProfile,
    updateProfileImage,
    getRecentProduct,
    getRecentHouse,
};
