const { pool } = require("../../../config/database");

// 회원가입
async function userEmailCheck(email) {
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
}

async function userNicknameCheck(nickname) {
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
}

async function insertUserInfo(insertUserInfoParams) {
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
}

// 로그인
async function selectUserInfo(email) {
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
}

// 프로필 조회
async function getUserProfile(userId) {
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
}

// 프로필 수정
async function updateUserProfile(name, nickname, phone, website, message, userId) {
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
}

// 프로필 삭제
async function deleteUserProfile(userId) {
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
}

// 프로필 이미지 수정
async function updateProfileImage(profileImage, userId, idx) {
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
