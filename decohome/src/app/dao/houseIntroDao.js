const { pool } = require("../../../config/database");

// 전체 집소개 조회
async function getAllHouseIntro(page, size, condition, typeCond, pyungCond, styleCond) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const getAllHouseIntroQuery = `
        select hi.houseIntroId, spaceImage, title, w.hashTagId,  w.hashTagName,
        concat('조회수 ', format(hi.viewCount, 0)) as countView,
        concat('보관함 ', format(ifnull(x.countLocker, 0), 0)) as countLocker
        from HouseIntro hi
        join SpaceImage si on hi.houseIntroId = si.houseIntroId
        left join (select hi.houseIntroId, c.isDeleted, ifnull(count(commentId), 0) as countComment
        from Comment c
        join HouseIntro hi
        on hi.houseIntroId = c.houseIntroId
        group by c.houseIntroId) v on hi.houseIntroId = v.houseIntroId
        join (select houseIntroId,
        tagStatus,
        group_concat(distinct hashTagId order by tagStatus separator '/')                as hashTagId,
        group_concat(distinct concat('#', hashTagName) order by tagStatus separator ' ') as hashTagName
        from HashTag ht
        group by houseIntroId) w on w.houseIntroId = hi.houseIntroId
        left join (select hi.houseIntroId, count(userLockerId) as countLocker
        from UserLocker ul
        join HouseIntro hi on ul.houseIntroId = hi.houseIntroId
        group by hi.houseIntroId) x on x.houseIntroId = hi.houseIntroId
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

async function checkSpace(spaceId) {
  try {
      const connection = await pool.getConnection(async (conn) => conn);
      const checkSpaceQuery = `
      select exists(select * from SpaceImage where spaceId = '` + spaceId + `') as exist;
      `;
      const checkSpaceParams = [spaceId];
      const [checkSpaceRows] = await connection.query(
        checkSpaceQuery,
        checkSpaceParams
      );
      connection.release();
      
      return checkSpaceRows[0].exist;
  } catch (err) {
      logger.error(`App - checkSpace DB Connection error\n: ${err.message}`);
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
      concat('보관함 ', format(ifnull(w.countLocker, 0), 0)) as countLocker,
      concat('댓글 ', format(ifnull(v.countComment, 0), 0))   as countComment,
      ifnull(u.name, -1) as name, ifnull(u.facebook, -1) as facebook, ifnull(u.instagram, -1) as instagram, ifnull(u.rss, -1) as rss
      from HouseIntro hi
      left join (select hi.houseIntroId, count(commentId) as countComment
      from Comment c
      join HouseIntro hi on hi.houseIntroId = c.houseIntroId
      group by c.houseIntroId) v on hi.houseIntroId = v.houseIntroId
      left join (select hi.houseIntroId, count(lockerId) as countLocker
      from UserLocker ul
      join HouseIntro hi on hi.houseIntroId = ul.houseIntroId) w
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

async function getIntroPost(userId, houseIntroId) {
  try {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        connection.beginTransaction();
        const getIntroPostQuery = `
        select v.spaceId, v.spaceImage, w.content
        from (select houseIntroId, spaceId, spaceImage, ROW_NUMBER() OVER (PARTITION BY houseIntroId) as imageRN
        from SpaceImage) v
        join (select houseIntroId, content, ROW_NUMBER() OVER (PARTITION BY houseIntroId) as textRN
        from HouseIntroText) w on v.houseIntroId = w.houseIntroId
        where v.houseIntroId = ` + houseIntroId + `
        and v.imageRN = w.textRN;
        `;
        const getIntroPostParams = [houseIntroId];
        const [introPostRows] = await connection.query(
          getIntroPostQuery,
          getIntroPostParams
        );
        const existQuery = `select exists(select userId from RecentView where userId = ` + userId + ` and houseIntroId = ` + houseIntroId + ` and isDeleted = 'N') as exist;`;
        const insertQuery = `insert into RecentView (userId, houseIntroId, productId)
        values (` + userId + `, ` + houseIntroId + `, default);`;
        const selectQuery = `select if((select houseIntroId from RecentView where isDeleted = 'N' userId = ` + userId + ` and houseIntroId = ` + houseIntroId + `) = -1, 0, 1) as exist;`;
        const updateQuery = `update RecentView set updatedAt = default where houseIntroId = ` + houseIntroId + ` and userId = ` + userId + `;`;
        const viewCountQuery = `update HouseIntro set viewCount = viewCount + 1 where houseIntroId = ` + houseIntroId + `;`
        const params = [userId, houseIntroId];
        const [existRows] = await connection.query(existQuery, params);
        if (existRows[0].exist === 0) {
            await connection.query(insertQuery, params);
        } else {
            const [selectRows] = await connection.query(selectQuery, params);
            if (selectRows[0].exist === 1) {
                await connection.query(updateQuery, params);
            } else {
                await connection.query(insertQuery, params);
            }
        }
        await connection.query(viewCountQuery, params);
        connection.commit();
        connection.release();
        
        return introPostRows;
    } catch (err) {
        connection.rollback();
        connection.release();
        logger.error(`App - getIntroPost Transaction error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
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

// 공간 게시글 조회
async function getIntroId(spaceId) {
  try {
      const connection = await pool.getConnection(async (conn) => conn);
      const getIntroIdQuery = `
      select houseIntroId from SpaceImage where spaceId = ?;
      `;
      const getIntroIdParams = [spaceId];
      const [houseInfoRows] = await connection.query(
        getIntroIdQuery,
        getIntroIdParams
      );
      connection.release();
      
      return houseInfoRows[0];
  } catch (err) {
      logger.error(`App - getIntroId DB Connection error\n: ${err.message}`);
      return res.status(500).send(`Error: ${err.message}`);
  }
}

async function getHouseId(houseId) {
  try {
      const connection = await pool.getConnection(async (conn) => conn);
      const getIntroIdQuery = `
      select hi.houseIntroId, title, spaceImage
      from HouseIntro hi
      join SpaceImage si on hi.houseIntroId = si.houseIntroId
      where hi.isDeleted = 'N'
      and isThumbnailed = 'Y'
      and si.isDeleted = 'N'
      and hi.houseIntroId = ` + houseId + `;
      `;
      const getIntroIdParams = [houseId];
      const [houseInfoRows] = await connection.query(
        getIntroIdQuery,
        getIntroIdParams
      );
      connection.release();
      
      return houseInfoRows[0];
  } catch (err) {
      logger.error(`App - getIntroId DB Connection error\n: ${err.message}`);
      return res.status(500).send(`Error: ${err.message}`);
  }
}

async function getHouseInfo(spaceId) {
  try {
      const connection = await pool.getConnection(async (conn) => conn);
      const getHouseInfoQuery = `
      select hi.houseIntroId, title, spaceImage
      from HouseIntro hi
      join SpaceImage si on hi.houseIntroId = si.houseIntroId
      where hi.isDeleted = 'N'
      and si.isDeleted = 'N'
      and spaceId = ` + spaceId + `;
      `;
      const getHouseInfoParams = [spaceId];
      const [houseInfoRows] = await connection.query(
        getHouseInfoQuery,
        getHouseInfoParams
      );
      connection.release();
      
      return houseInfoRows[0];
  } catch (err) {
      logger.error(`App - getHouseInfo DB Connection error\n: ${err.message}`);
      return res.status(500).send(`Error: ${err.message}`);
  }
}

async function getTag(houseIntroId) {
  try {
      const connection = await pool.getConnection(async (conn) => conn);
      const getTagQuery = `
      select distinct hashTagId, hashTagName
      from HashTag
      where houseIntroId = ` + houseIntroId + `;
      `;
      const getTagParams = [houseIntroId];
      const [tagRows] = await connection.query(
        getTagQuery,
        getTagParams
      );
      connection.release();
      
      return tagRows;
  } catch (err) {
      logger.error(`App - getTag DB Connection error\n: ${err.message}`);
      return res.status(500).send(`Error: ${err.message}`);
  }
}

async function getSpaceInfo(spaceId) {
  try {
    const connection = await pool.getConnection(async (conn) => conn);
    try {
        connection.beginTransaction();
        const getSpaceInfoQuery = `
        select spaceImage,
        concat('조회수 ', format(viewCount, 0))       as viewCount,
        concat('보관함 ', format(count(lockerId), 0)) as lockerCount
        from SpaceImage si
        left join UserLocker ul on si.spaceId = ul.spaceId
        where si.spaceId = ?; 
        `;
        const viewCountQuery = `update SpaceImage set viewCount = viewCount + 1 where spaceId = ?; `
        const getSpaceInfoParams = [spaceId, spaceId];
        const productRows = await connection.query(
          getSpaceInfoQuery + viewCountQuery,
          getSpaceInfoParams
        );
        connection.commit();
        connection.release();
        
        return productRows[0];
    } catch (err) {
        connection.rollback();
        connection.release();
        logger.error(`App - getSpaceInfo Transaction error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
  } catch (err) {
    logger.error(`App - getSpaceInfo DB Connection error\n: ${err.message}`);
    return res.status(500).send(`Error: ${err.message}`);
  }
}

async function getSpaceProducts(spaceId, page, size) {
  try {
      const connection = await pool.getConnection(async (conn) => conn);
      const getSpaceProductsQuery = `
      select p.productId,
      brandName,
      productName,
      concat(format(originalPrice, 0), '원')                                                 as originalPrice,
      if(salePrice = -1, -1, concat(format(salePrice, 0), '원'))                             as salePrice,
      if(p.isSoldedOut = 'Y', '품절',
      if(salePrice = -1, -1, concat(round((1 - salePrice / originalPrice) * 100), '%'))) as saleRatio,
      productImage
      from Product p
      join Brand b on p.brandId = b.brandId
      join ProductImage pi on p.productId = pi.productId
      where pi.isThumbnailed = 'Y'
      and p.isDeleted = 'N'
      and spaceId = ` + spaceId + `
      limit ` + page + `, ` + size + `;
      `;
      const getSpaceProductsParams = [spaceId, page, size];
      const [productRows] = await connection.query(
        getSpaceProductsQuery,
        getSpaceProductsParams
      );
      connection.release();
      
      return productRows;
  } catch (err) {
      logger.error(`App - getSpaceProducts DB Connection error\n: ${err.message}`);
      return res.status(500).send(`Error: ${err.message}`);
  }
}

async function getSpaceOtherTag(houseIntroId) {
  try {
      const connection = await pool.getConnection(async (conn) => conn);
      const getSpaceOthersQuery = `
      select distinct si.spaceTagId, spaceTagName
      from SpaceImage si
      join SpaceTag st
      on si.spaceTagId = st.spaceTagId
      join HouseIntro hi on si.houseIntroId = hi.houseIntroId
      where hi.houseIntroId = ?;
      `;
      const getSpaceOthersParams = [houseIntroId];
      const [spaceRows] = await connection.query(
        getSpaceOthersQuery,
        getSpaceOthersParams
      );
      connection.release();
      
      return spaceRows;
  } catch (err) {
      logger.error(`App - getSpaceOtherTag DB Connection error\n: ${err.message}`);
      return res.status(500).send(`Error: ${err.message}`);
  }
}

async function getSpaceOtherImage(houseIntroId, page, size) {
  try {
      const connection = await pool.getConnection(async (conn) => conn);
      const getSpaceOthersQuery = `
      select spaceId, spaceImage
      from SpaceImage
      where houseIntroId = ` + houseIntroId + `
      limit ` + page + `, ` + size + `;
      `;
      const getSpaceOthersParams = [houseIntroId, page, size];
      const [spaceRows] = await connection.query(
        getSpaceOthersQuery,
        getSpaceOthersParams
      );
      connection.release();
      
      return spaceRows;
  } catch (err) {
      logger.error(`App - getSpaceOtherImage DB Connection error\n: ${err.message}`);
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
  checkSpace,
  getIntroCount,
  getIntroInfo,
  getIntroTag,
  getIntroPost,
  getSpace,
  getSpaceTotalCount,
  getHouseInfo,
  getTag,
  getSpaceInfo,
  getSpaceProducts,
  getSpaceOtherTag,
  getSpaceOtherImage,
  getIntroId,
  getHouseId,
};
