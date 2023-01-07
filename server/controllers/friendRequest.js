const conn = require('../db/conn');
const query = require('../db/query');

async function sendFriendRequest(req, res) {
    try {
        const q = await query(conn, "SELECT id FROM user WHERE ?", { username: req.user.username });
        if(q[0].id === req.query.id) return res.send("You cannot send a friend request to yourself");
        await query(conn, "INSERT INTO friendRequest(senderId, receiverId) VALUES (?,?)", [q[0].id, req.query.id]);
        res.sendStatus(200);
    } catch(err) {
        res.status(500).send(err.message);
    }
}

async function getFriendRequest(req, res) {
    try {
        const q = await query(conn, "SELECT id FROM user WHERE ?", { username: req.user.username });
        const result = await query(
            conn, 
            `
                SELECT id, username, image 
                FROM user 
                WHERE id IN (SELECT senderId AS id FROM friendRequest WHERE receiverId = ?)
            `, 
            [q[0].id]
        )
        res.send(result);
    } catch(err) {
        res.status(500).send(err.message);
    }
}

async function acceptFriendRequest(req, res) {
    try {
        const q = await query(conn, "SELECT id FROM user WHERE ?", { username: req.user.username });
        const findRequest = await query(conn, "SELECT * FROM friendRequest WHERE senderId = ? AND receiverId = ?", [req.query.id, q[0].id]);
        if(findRequest.length === 0) return res.status(404).send("Friend request not found");
        await query(conn, "DELETE FROM friendRequest WHERE senderId = ? AND receiverId = ?", [req.query.id, q[0].id]);
        await query(conn, "INSERT INTO friend(user1Id, user2Id) VALUES (?,?)", [req.query.id, q[0].id]);
        res.send("Friend request accepted");
    } catch(err) {
        console.log(err);
        res.status(500).send(err.message);
    }
}

async function rejectFriendRequest(req, res) {
    try {
        const q = await query(conn, "SELECT id FROM user WHERE ?", { username: req.user.username });
        const findRequest = await query(conn, "SELECT * FROM friendRequest WHERE senderId = ? AND receiverId = ?", [req.query.id, q[0].id]);
        if(findRequest.length === 0) return res.status(404).send("Friend request not found");
        await query(conn, "DELETE FROM friendRequest WHERE senderId = ? AND receiverId = ?", [req.query.id, q[0].id]);
        res.send("Friend request rejected");
    } catch(err) {
        res.status(500).send(err.message);
    }
}

module.exports =  {
    sendFriendRequest,
    getFriendRequest,
    acceptFriendRequest,
    rejectFriendRequest
}