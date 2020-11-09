const { pool } = require("../../../config/database");

// 전체 집소개 조회
async function getAllHouseIntro(page, size, condition, typeCond, pyungCond, styleCond) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const getAllHouseIntroQuery = `
        select hi.houseIntroId, spaceImage, title, w.hashTagId, w.hashTagName
        from HouseIntro hi
        join SpaceImage si on hi.houseIntroId = si.houseIntroId
        left join (select hi.houseIntroId, c.isDeleted, ifnull(count(commentId), 0) as countComment
        from Comment c
        join HouseIntro hi
        on hi.houseIntroId = c.houseIntroId
        group by c.houseIntroId) v on hi.houseIntroId = v.houseIntroId
        join (select houseIntroId,
        tagStatus,
        group_concat(distinct hashTagId order by tagStatus separator '/')   as hashTagId,
        group_concat(distinct hashTagName order by tagStatus separator '/') as hashTagName
        from HashTag ht
        group by houseIntroId) w on w.houseIntroId = hi.houseIntroId
        where si.isThumbnailed = 'Y'
        and hi.isDeleted = 'N'` + typeCond + pyungCond + styleCond + `
        and si.isDeleted = 'N'` + condition + ` limit ` + page + `, ` + size + `;
        `;
        const getAllHouseIntroParams = [page, size, condition, typeCond, pyungCond, styleCond];
        const [houseIntroRows] = await connection.query(
          getAllHouseIntroQuery,
          getAllHouseIntroParams
        );
        connection.release();
        
        return houseIntroRows;
    } catch (err) {
        logger.error(`App - getAllHouseIntro DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}

async function getHouseTag() {
  try {
      const connection = await pool.getConnection(async (conn) => conn);
      const getHouseTagQuery = `
      select distinct ht.houseIntroId, hashTagName
      from HashTag ht
      join HouseIntro hi on ht.houseIntroId = hi.houseIntroId order by hi.houseIntroId;
      `;
      const getHouseTagParams = [];
      const [houseIntroRows] = await connection.query(
        getHouseTagQuery,
        getHouseTagParams
      );
      connection.release();
      
      return houseIntroRows;
  } catch (err) {
      logger.error(`App - getHouseTag DB Connection error\n: ${err.message}`);
      return res.status(500).send(`Error: ${err.message}`);
  }
}

async function checkTypeTag(type) {
  try {
      const connection = await pool.getConnection(async (conn) => conn);
      const checkTypeQuery = `
      select exists(select * from HashTag where hashTagName = '` + type + `') as exist;
      `;
      const checkHouseTagParams = [type];
      const [checkTagRows] = await connection.query(
        checkTypeQuery,
        checkHouseTagParams
      );
      connection.release();
      
      return checkTagRows[0].exist;
  } catch (err) {
      logger.error(`App - checkTypeTag DB Connection error\n: ${err.message}`);
      return res.status(500).send(`Error: ${err.message}`);
  }
}

async function checkPyungTag(pyung) {
  try {
      const connection = await pool.getConnection(async (conn) => conn);
      const checkPyungQuery = `
      select exists(select * from HashTag where hashTagName = '` + pyung + `') as exist;
      `;
      const checkHouseTagParams = [pyung];
      const [checkTagRows] = await connection.query(
        checkPyungQuery,
        checkHouseTagParams
      );
      connection.release();
      
      return checkTagRows[0].exist;
  } catch (err) {
      logger.error(`App - checkPyungTag DB Connection error\n: ${err.message}`);
      return res.status(500).send(`Error: ${err.message}`);
  }
}

async function checkStyleTag(style) {
  try {
      const connection = await pool.getConnection(async (conn) => conn);
      const checkStyleQuery = `
      select exists(select * from HashTag where hashTagName = '` + style + `') as exist;
      `;
      const checkHouseTagParams = [style];
      const [checkTagRows] = await connection.query(
        checkStyleQuery,
        checkHouseTagParams
      );
      connection.release();
      
      return checkTagRows[0].exist;
  } catch (err) {
      logger.error(`App - checkStyleTag DB Connection error\n: ${err.message}`);
      return res.status(500).send(`Error: ${err.message}`);
  }
}

async function checkSpaceTag(space) {
  try {
      const connection = await pool.getConnection(async (conn) => conn);
      const checkSpaceQuery = `
      select exists(select * from SpaceTag where spaceTagName = '` + space + `') as exist;
      `;
      const checkSpaceParams = [space];
      const [checkTagRows] = await connection.query(
        checkSpaceQuery,
        checkSpaceParams
      );
      connection.release();
      
      return checkTagRows[0].exist;
  } catch (err) {
      logger.error(`App - checkSpaceTag DB Connection error\n: ${err.message}`);
      return res.status(500).send(`Error: ${err.message}`);
  }
}

async function checkHouseIntro(houseIntroId) {
  try {
      const connection = await pool.getConnection(async (conn) => conn);
      const checkHouseIntroQuery = `
      select exists(select * from HouseIntro where houseIntroId = '` + houseIntroId + `') as exist;
      `;
      const checkHouseIntroParams = [houseIntroId];
      const [checkIntroRows] = await connection.query(
        checkHouseIntroQuery,
        checkHouseIntroParams
      );
      connection.release();
      
      return checkIntroRows[0].exist;
  } catch (err) {
      logger.error(`App - checkHouseIntro DB Connection error\n: ${err.message}`);
      return res.status(500).send(`Error: ${err.message}`);
  }
}

// 집소개 수 조회
async function getIntroCount(typeCond, pyungCond, styleCond) {
  try {
      const connection = await pool.getConnection(async (conn) => conn);
      const getIntroCountQuery = `
      select count(hi.houseIntroId) as countHouseIntro
      from HouseIntro hi
      join (select houseIntroId,
      tagStatus,
      group_concat(distinct hashTagId order by tagStatus separator '/')   as hashTagId,
      group_concat(distinct hashTagName order by tagStatus separator '/') as hashTagName
      from HashTag ht
      group by houseIntroId) w on w.houseIntroId = hi.houseIntroId
      where hi.isDeleted = 'N' ` + typeCond + pyungCond + styleCond + `;
      `;
      const getIntroCountParams = [typeCond, pyungCond, styleCond];
      const [introCountRows] = await connection.query(
        getIntroCountQuery,
        getIntroCountParams
      );
      connection.release();
      
      return introCountRows[0];
  } catch (err) {
      logger.error(`App - getAllHouseIntro DB Connection error\n: ${err.message}`);
      return res.status(500).send(`Error: ${err.message}`);
  }
}

// 집소개 게시글 조회
async function getIntroInfo(houseIntroId) {
  try {
      const connection = await pool.getConnection(async (conn) => conn);
      const getIntroInfoQuery = `
      select title,
      si.spaceImage,
      date_format(hi.createdAt, '%Y.%c.%d %H:%i')          as createdAt,
      concat('조회수 ', format(hi.viewCount, 0))              as countView,
      concat('보관함 ', format(ifnull(v.countComment, 0), 0)) as countComment,
      concat('댓글 ', format(ifnull(w.countLocker, 0), 0))   as countLocker,
      u.name, u.facebook, u.instagram, u.rss
      from HouseIntro hi
      left join (select hi.houseIntroId, count(commentId) as countComment
      from Comment c
      join HouseIntro hi on hi.houseIntroId = c.houseIntroId
      group by c.houseIntroId) v on hi.houseIntroId = v.houseIntroId
      left join (select hi.houseIntroId, count(lockerId) as countLocker
      from Locker l
      join HouseIntro hi on hi.houseIntroId = l.houseIntroId) w
      on hi.houseIntroId = w.houseIntroId
      join SpaceImage si on hi.houseIntroId = si.houseIntroId
      join User u on u.userId = hi.userId
      where si.isThumbnailed = 'Y' and hi.isDeleted = 'N' and hi.houseIntroId = ` + houseIntroId + `;
      `;
      const getIntroInfoParams = [houseIntroId];
      const [introInfoRows] = await connection.query(
        getIntroInfoQuery,
        getIntroInfoParams
      );
      connection.release();
      
      return introInfoRows[0];
  } catch (err) {
      logger.error(`App - getIntroInfo DB Connection error\n: ${err.message}`);
      return res.status(500).send(`Error: ${err.message}`);
  }
}

async function getIntroTag(houseIntroId) {
  try {
      const connection = await pool.getConnection(async (conn) => conn);
      const getIntroTagQuery = `
      select hashTagId, hashTagName from HashTag ht join HouseIntro hi on ht.houseIntroId = hi.houseIntroId
      where hi.houseIntroId = ` + houseIntroId + `;
      `;
      const getIntroTagParams = [houseIntroId];
      const [introTagRows] = await connection.query(
        getIntroTagQuery,
        getIntroTagParams
      );
      connection.release();
      
      return introTagRows;
  } catch (err) {
      logger.error(`App - getIntroTag DB Connection error\n: ${err.message}`);
      return res.status(500).send(`Error: ${err.message}`);
  }
}

async function getIntroPost(houseIntroId) {
  try {
      const connection = await pool.getConnection(async (conn) => conn);
      const getIntroPostQuery = `
      select spaceId, spaceImage, content from HouseIntroText hit
      join SpaceImage si on hit.houseIntroId = si.houseIntroId
      where hit.isDeleted = 'N' and si.isDeleted = 'N' and hit.houseIntroId = ` + houseIntroId + `;
      `;
      const getIntroPostParams = [houseIntroId];
      const [introPostRows] = await connection.query(
        getIntroPostQuery,
        getIntroPostParams
      );
      connection.release();
      
      return introPostRows;
  } catch (err) {
      logger.error(`App - getIntroPost DB Connection error\n: ${err.message}`);
      return res.status(500).send(`Error: ${err.message}`);
  }
}

// 전체 공간 조회
async function getSpace(page, size, condition, spaceCond, pyungCond, styleCond) {
  try {
      const connection = await pool.getConnection(async (conn) => conn);
      const getSpaceQuery = `
      select spaceId, spaceImage
      from SpaceImage si
      join (select houseIntroId,
      tagStatus,
      group_concat(distinct hashTagId order by tagStatus separator '/')   as hashTagId,
      group_concat(distinct hashTagName order by tagStatus separator '/') as hashTagName
      from HashTag ht
      group by houseIntroId) w on w.houseIntroId = si.houseIntroId
      join SpaceTag st on si.spaceTagId = st.spaceTagId
      where si.isDeleted = 'N'` + spaceCond + pyungCond + styleCond + condition + ` limit ` + page + `, ` + size + `;
      `;
      const getSpaceParams = [page, size, condition, spaceCond, pyungCond, styleCond];
      const [spaceRows] = await connection.query(
        getSpaceQuery,
        getSpaceParams
      );
      connection.release();
      
      return spaceRows;
  } catch (err) {
      logger.error(`App - getSpace DB Connection error\n: ${err.message}`);
      return res.status(500).send(`Error: ${err.message}`);
  }
}

// 공간 수 조회
async function getSpaceTotalCount(spaceCond, pyungCond, styleCond) {
  try {
      const connection = await pool.getConnection(async (conn) => conn);
      const getSpaceTotalCountQuery = `
      select count(si.spaceId) as countSpace
      from SpaceImage si
      join (select houseIntroId,
      tagStatus,
      group_concat(distinct hashTagId order by tagStatus separator '/')   as hashTagId,
      group_concat(distinct hashTagName order by tagStatus separator '/') as hashTagName
      from HashTag ht
      group by houseIntroId) w on w.houseIntroId = si.houseIntroId
      join SpaceTag st on si.spaceTagId = st.spaceTagId
      where si.isDeleted = 'N' ` + spaceCond + pyungCond + styleCond + `;
      `;
      const getSpaceTotalCountParams = [spaceCond, pyungCond, styleCond];
      const [spaceCountRows] = await connection.query(
        getSpaceTotalCountQuery,
        getSpaceTotalCountParams
      );
      connection.release();
      
      return spaceCountRows[0];
  } catch (err) {
      logger.error(`App - getSpaceTotalCount DB Connection error\n: ${err.message}`);
      return res.status(500).send(`Error: ${err.message}`);
  }
}


module.exports = {
  getAllHouseIntro,
  getHouseTag,
  checkTypeTag,
  checkPyungTag,
  checkStyleTag,
  checkSpaceTag,
  checkHouseIntro,
  getIntroCount,
  getIntroInfo,
  getIntroTag,
  getIntroPost,
  getSpace,
  getSpaceTotalCount,
};
