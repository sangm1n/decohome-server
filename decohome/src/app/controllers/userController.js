const {pool} = require('../../../config/database');
const {logger} = require('../../../config/winston');

const jwt = require('jsonwebtoken');
const regexEmail = require('regex-email');
const crypto = require('crypto');
const secret_config = require('../../../config/secret');

const userDao = require('../dao/userDao');
const { constants } = require('buffer');

const regexPassword = /^[A-Za-z0-9]{8,}$/;

/**
 * update - 2020.11.01
 * 1. 회원가입 API
 */
exports.signUp = async function (req, res) {
    const {
        email, password, nickname, phone
    } = req.body;

    if (!email || !regexEmail.test(email)) return res.json({ isSuccess: false, code: 300, message: "이메일을 확인해주세요" });
    if (email.length > 45) return res.json({ isSuccess: false, code: 301,  message: "이메일을 45자 미만으로 입력해주세요" });

    if (!password || !regexPassword.test(password)) return res.json({ isSuccess: false, code: 302, message: "비밀번호를 확인해주세요 "});
    if (password.length > 20) return res.json({ isSuccess: false, code: 303, message: "비밀번호를 20자 미만으로 입력해주세요" });

    if (!nickname || nickname < 4) return res.json({ isSuccess: false, code: 304, message: "닉네임은 4자 이상 적어주세요" });
    if (nickname.length > 20) return res.json({ isSuccess: false, code: 305, message: "닉네임을 20자 미만으로 입력해주세요" });

    if (!phone || phone.length > 11) return res.json({ isSuccess: false, code: 306, message: "휴대폰 번호를 확인해주세요" }); 

    try {
        try {
            // 이메일 중복 확인
            const emailRows = await userDao.userEmailCheck(email);
            if (emailRows[0].exist === 1) {
                return res.json({
                    isSuccess: false,
                    code: 307,
                    message: "이미 존재하는 이메일 입니다"
                });
            }

            // 닉네임 중복 확인
            const nicknameRows = await userDao.userNicknameCheck(nickname);
            if (nicknameRows[0].exist === 1) {
                return res.json({
                    isSuccess: false,
                    code: 308,
                    message: "이미 존재하는 닉네임 입니다"
                });
            }

            // TRANSACTION : advanced
           // await connection.beginTransaction(); // START TRANSACTION
            const hashedPassword = await crypto.createHash('sha512').update(password).digest('hex');
            const insertUserInfoParams = [email, hashedPassword, nickname, phone];
            
            const insertUserRows = await userDao.insertUserInfo(insertUserInfoParams);

          //  await connection.commit(); // COMMIT
           // connection.release();
            return res.json({
                isSuccess: true,
                code: 200,
                message: "회원가입 성공"
            });
        } catch (err) {
           // await connection.rollback(); // ROLLBACK
           // connection.release();
            logger.error(`App - SignUp Query error\n: ${err.message}`);
            return res.status(500).send(`Error: ${err.message}`);
        }
    } catch (err) {
        logger.error(`App - SignUp DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
};

/**
 * update - 2020.11.01
 * 2. 로그인 API
 **/
exports.signIn = async function (req, res) {
    const {
        email, password
    } = req.body;

    try {
        try {
            const userInfoRows = await userDao.selectUserInfo(email);
            const emailCheck = await userDao.userEmailCheck(email);
            const hashedPassword = await crypto.createHash('sha512').update(password).digest('hex');
            
            if (emailCheck[0].exist === 0 || userInfoRows[0].password !== hashedPassword) {
                return res.json({
                    isSuccess: false,
                    code: 300,
                    message: "이메일 주소 혹은 비밀번호가 일치하지 않습니다"
                });
            }

            //토큰 생성
            let token = await jwt.sign({
                    userId: userInfoRows[0].userId,
                }, // 토큰의 내용(payload)
                secret_config.jwtsecret, // 비밀 키
                {
                    expiresIn: '365d',
                    subject: 'userId',
                } // 유효 시간은 365일
            );

            res.json({
                result: {jwt: token},
                isSuccess: true,
                code: 200,
                message: "로그인 성공"
            });
        } catch (err) {
            logger.error(`App - SignIn Query error\n: ${JSON.stringify(err)}`);
            return false;
        }
    } catch (err) {
        logger.error(`App - SignIn DB Connection error\n: ${JSON.stringify(err)}`);
        return false;
    }
};

/**
 * update - 2019.09.23
 * 3. JWT 검증 API
 **/
exports.check = async function (req, res) {
    res.json({
        isSuccess: true,
        code: 200,
        message: "검증 성공",
        info: req.verifiedToken
    })
};