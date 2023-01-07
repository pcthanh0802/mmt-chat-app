const conn = require('../db/conn');
const query = require('../db/query');

async function findUser(req, res) {
    try {
        let result;

        if(!req.query.username && !req.query.id) {
            result = await query(conn, 'SELECT id, username, email, image FROM user WHERE ?', { username: req.user.username });
        }
        else if(req.query.id) {
            result = await query(conn, 'SELECT id, username, image FROM user WHERE ?', { id: req.query.id });
        }
        else{
            const selfId = (await query(conn, "SELECT id FROM user WHERE ?", { username: req.user.username }))[0]['id'];
            result = await query(
                conn, 
                `SELECT U.id, U.username, U.image, getFriendStatus('${selfId}', U.id) AS friendStatus
                FROM user U WHERE U.username LIKE '${req.query.username}%' AND NOT U.username = '${req.user.username}' 
                LIMIT 10`
            );
        } 
        res.send(result);
    } catch(err) {
        console.log(err);
        res.status(500).send(err.message);
    }
}

async function getFriendsList(req, res) {
    try {
        const q = await query(conn, "SELECT id FROM user WHERE ?", { username: req.user.username });
        const result = await query(
            conn, 
            `
                SELECT id, username, image 
                FROM user 
                WHERE id IN 
                    (
                        SELECT user2Id AS id FROM friend WHERE user1Id = ?
                        UNION
                        SELECT user1Id AS id FROM friend WHERE user2Id = ?
                    )
            `, 
            [q[0].id, q[0].id]
        )
        res.send(result);
    } catch(err) {
        res.status(500).send(err.message);
    }
}

module.exports =  {
    findUser,
    getFriendsList
}