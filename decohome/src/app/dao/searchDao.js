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
        and timestampdiff(hour, createdAt, now()) < 12
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

// 검색 탭
async function searchStore(word, page, size) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const countQuery = `
        select count(*) as countProduct
        from Product p
        join Category c on p.categoryId = c.categoryId
        join Brand b on p.brandId = b.brandId
        join ProductImage pi on p.productId = pi.productId
        left join (select count(reviewId) as countReview, pr.productId
        from ProductReview pr
        join Product p on pr.productId = p.productId
        where pr.isDeleted = 'N'
        group by pr.productId) v on p.productId = v.productId
        left join (select count(viewId) as countView, rv.productId
        from RecentView rv
        right join Product p on rv.productId = p.productId
        where rv.isDeleted = 'N'
        group by rv.productId) w on p.productId = w.productId
        where pi.isThumbnailed = 'Y'
        and p.isDeleted = 'N'
        and b.brandName like '%` + word + `%' or p.productName like '%` + word + `%';
        `
        const searchQuery = `
        select p.productId,
        brandName,
        productName,
        concat(format(originalPrice, 0), '원')                                                 as originalPrice,
        if(salePrice = -1, -1, concat(format(salePrice, 0), '원'))                             as salePrice,
        if(p.isSoldedOut = 'Y', '품절',
        if(salePrice = -1, -1, concat(round((1 - salePrice / originalPrice) * 100), '%'))) as saleRatio,
        productImage
        from Product p
        join Category c on p.categoryId = c.categoryId
        join Brand b on p.brandId = b.brandId
        join ProductImage pi on p.productId = pi.productId
        left join (select count(reviewId) as countReview, pr.productId
        from ProductReview pr
        join Product p on pr.productId = p.productId
        where pr.isDeleted = 'N'
        group by pr.productId) v on p.productId = v.productId
        left join (select count(viewId) as countView, rv.productId
        from RecentView rv
        right join Product p on rv.productId = p.productId
        where rv.isDeleted = 'N'
        group by rv.productId) w on p.productId = w.productId
        where pi.isThumbnailed = 'Y'
        and p.isDeleted = 'N'
        and b.brandName like '%` + word + `%' or p.productName like '%` + word + `%'
        limit ` + page + `, ` + size + `;
        `;
        const searchParams = [word, page, size];
        const [searchRows] = await connection.query(
        countQuery + searchQuery,
        searchParams
        );
        connection.release();

        return searchRows;
    } catch (err) {
        logger.error(`App - searchStore DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}

async function searchMagazine(word, page, size) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const countQuery = `
        select count(*) as countHouseIntro
        from (select hi.houseIntroId from HouseIntro hi
        join SpaceImage si on hi.houseIntroId = si.houseIntroId
        join (select houseIntroId,
        tagStatus,
        group_concat(distinct hashTagId order by tagStatus separator '/')                as hashTagId,
        group_concat(distinct concat('#', hashTagName) order by tagStatus separator ' ') as hashTagName
        from HashTag ht
        group by houseIntroId) w on w.houseIntroId = hi.houseIntroId
        join HouseIntroText hit on hi.houseIntroId = hit.houseIntroId
        where si.isThumbnailed = 'Y'
        and hi.isDeleted = 'N'
        and si.isDeleted = 'N'
        and title like '%` + word + `%'
        or hashTagName like '%` + word + `%'
        or hit.content like '%` + word + `%'
        group by hi.houseIntroId) v;
        `
        const searchQuery = `
        select hi.houseIntroId,
        spaceImage,
        title,
        w.hashTagName,
        case
        when timestampdiff(second, hi.createdAt, now()) < 60
        then concat(timestampdiff(second, hi.createdAt, now()), '초 전')
        when timestampdiff(minute, hi.createdAt, now()) < 60
        then concat(timestampdiff(minute, hi.createdAt, now()), '분 전')
        when timestampdiff(hour, hi.createdAt, now()) < 24
        then concat(timestampdiff(hour, hi.createdAt, now()), '시간 전')
        when timestampdiff(day, hi.createdAt, now()) < 7
        then concat(timestampdiff(day, hi.createdAt, now()), '일 전')
        when timestampdiff(week, hi.createdAt, now()) < 4
        then concat(timestampdiff(week, hi.createdAt, now()), '주 전')
        when timestampdiff(month, hi.createdAt, now()) < 6
        then concat(timestampdiff(month, hi.createdAt, now()), '달 전')
        else date_format(hi.createdAt, '%Y-%m-%d')
        end as updateTime
        from HouseIntro hi
        join SpaceImage si on hi.houseIntroId = si.houseIntroId
        join (select houseIntroId,
        tagStatus,
        group_concat(distinct hashTagId order by tagStatus separator '/')                as hashTagId,
        group_concat(distinct concat('#', hashTagName) order by tagStatus separator ' ') as hashTagName
        from HashTag ht
        group by houseIntroId) w on w.houseIntroId = hi.houseIntroId
        join HouseIntroText hit on hi.houseIntroId = hit.houseIntroId
        where si.isThumbnailed = 'Y'
        and hi.isDeleted = 'N'
        and si.isDeleted = 'N'
        and (hi.houseIntroId, hi.createdAt) in (
        select houseIntroId, max(createdAt) from HouseIntro group by houseIntroId
        ) and title like '%` + word + `%'
        or hashTagName like '%` + word + `%'
        or hit.content like '%` + word + `%'
        group by hi.houseIntroId
        limit ` + page + `, ` + size + `;
        `;
        const searchParams = [word, page, size];
        const [searchRows] = await connection.query(
        countQuery + searchQuery,
        searchParams
        );
        connection.release();

        return searchRows;
    } catch (err) {
        logger.error(`App - searchMagazine DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}

async function searchPhoto(word, page, size) {
    try {
        const connection = await pool.getConnection(async (conn) => conn);
        const countQuery = `
        select count(*) as countPhoto
        from SpaceImage si
        join (select houseIntroId,
        tagStatus,
        group_concat(distinct hashTagId order by tagStatus separator '/')   as hashTagId,
        group_concat(distinct hashTagName order by tagStatus separator '/') as hashTagName
        from HashTag ht
        group by houseIntroId) w on w.houseIntroId = si.houseIntroId
        join SpaceTag st on si.spaceTagId = st.spaceTagId
        where si.isDeleted = 'N' and w.hashTagName like '%` + word + `%'
        or st.spaceTagName like '%` + word + `%';
        `
        const searchQuery = `
        select spaceId, spaceImage
        from SpaceImage si
        join (select houseIntroId,
        tagStatus,
        group_concat(distinct hashTagId order by tagStatus separator '/')   as hashTagId,
        group_concat(distinct hashTagName order by tagStatus separator '/') as hashTagName
        from HashTag ht
        group by houseIntroId) w on w.houseIntroId = si.houseIntroId
        join SpaceTag st on si.spaceTagId = st.spaceTagId
        where si.isDeleted = 'N' and w.hashTagName like '%` + word + `%'
        or st.spaceTagName like '%` + word + `%'
        limit ` + page + `, ` + size + `;
        `;
        const searchParams = [word, page, size];
        const [searchRows] = await connection.query(
        countQuery + searchQuery,
        searchParams
        );
        connection.release();

        return searchRows;
    } catch (err) {
        logger.error(`App - searchPhoto DB Connection error\n: ${err.message}`);
        return res.status(500).send(`Error: ${err.message}`);
    }
}


module.exports = {
    setSearch,
    getBest,
    getRecent,
    deleteRecent, 
    checkWord,
    searchStore,
    searchMagazine,
    searchPhoto,
};