require('dotenv').config();

const conn = require('../db/conn');
const query = require('../db/query');
const bcrypt = require('bcrypt');
const jwt = require('jsonwebtoken');
const crypto = require('crypto');

function generateAccessToken(user) {
    // generate JWT from given user
    return jwt.sign(user, process.env.ACCESS_TOKEN_SECRET, { expiresIn: '3h' });
};

async function register(req, res) {
    try{
        // generate id 
        let id = crypto.randomBytes(5).toString('hex');
        let findId = await query(conn, "SELECT id FROM user WHERE ?", { id });
        while(findId.length){
            id = crypto.randomBytes(5).toString('hex');
            findId = await query(conn, "SELECT id FROM user WHERE ?", { id });
        }

        // hash password
        const hashedPassword = await bcrypt.hash(req.body.password, 10);

        // insert new user to db
        const params = [
            id,
            req.body.username,
            req.body.email,
            hashedPassword
        ];
        await query(conn, "INSERT INTO user(id, username, email, password) VALUES (?,?,?,?)", params);

        // response
        res.sendStatus(201);
    }
    catch(err){
        console.log(err);
        res.sendStatus(500)
    }
}

async function login(req, res) {
    // search for user in db
    const username = req.body.username;
    const q = await query(conn, "SELECT id, username, password FROM user WHERE username = ?", [username]);
    if(q.length === 0) return res.status(404).send("Username not found");

    try{
        const user = q[0];
        // check for correct password
        const isCorrectPw = await bcrypt.compare(req.body.password, user.password);

        if(isCorrectPw){
            // grant access token and refresh token
            const accessToken = generateAccessToken({ username });
            const refreshToken = jwt.sign(user, process.env.REFRESH_TOKEN_SECRET);

            // store refresh token to db
            await query(conn, "INSERT INTO refreshToken(token) VALUES (?)", [refreshToken]);
            
            // response
            res.json({ accessToken, refreshToken });
        }
        else{
            res.status(401).send("Incorrect password");
        }
    }
    catch(err){
        console.log(err);
        res.status(500).send(err.message);
    }
}

async function regrantToken(req, res) {
    // check if refresh token is available in the payload
    const refreshToken = req.body.token;
    if (refreshToken == null) return res.sendStatus(401);
   
    // check for refresh token authenticity
    const query = await query(conn, "SELECT * FROM refreshToken WHERE ?", { token: refreshToken });
    if (query.length === 0) return res.sendStatus(403);

    // verify token
    jwt.verify(refreshToken, process.env.REFRESH_TOKEN_SECRET, (err, user) => {
        if (err) return res.sendStatus(403)

        // regrant access token 
        const accessToken = generateAccessToken({ name: user.username })
        res.json({ accessToken })
    })
}

async function verifyToken(req, res) {
    // extract token from header
    const token = req.body.token;
    
    // verify token
    jwt.verify(token, process.env.ACCESS_TOKEN_SECRET, (err, user) => {
        if (err) return res.status(403).send(err.message);
        res.status(200).send("Token verified");        
    })
}

async function logout(req, res) {
    try {
        await query(conn, "DELETE FROM refreshToken WHERE ?", { token: req.body.token });
        res.sendStatus(204);
    } catch(err) {
        res.status(500).send(err.message);
    }
}

module.exports = {
    register,
    login,
    regrantToken,
    verifyToken,
    logout
}