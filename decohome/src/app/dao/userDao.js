const { pool } = require("../../../config/database");

// 회원가입
async function userEmailCheck(email) {
    const connection = await pool.getConnection(async (conn) => conn);
    const selectEmailQuery = `
    select exists(select email from User where email = ?) as exist;
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
    select exists(select nickname from User where nickname = ?) as exist;
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

module.exports = {
    userEmailCheck,
    userNicknameCheck,
    insertUserInfo,
    selectUserInfo,
};
