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

async function insertUserInfo(insertUserInfoParams) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const insertUserInfoQuery = `
        insert into User (email, password, nickname, phone)
        values (?, ?, ?, ?);
        `;
        const insertUserInfoRow = await connection.query(
        insertUserInfoQuery,
        insertUserInfoParams
        );
        connection.release();
        
        return insertUserInfoRow;
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

module.exports = {
    userEmailCheck,
    userNicknameCheck,
    insertUserInfo,
    selectUserInfo,
    getUserProfile,
    updateUserProfile,
    deleteUserProfile,
    updateProfileImage,
};
