const express = require("express");
const cors = require("cors");
const app = express();

const mysql = require('mysql2');

let mysqlConnection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "131213",
    database: "site_db"
});

app.use(cors());
app.use(express.json());

app.post("/register-user", (req, res) => {
    let data = req.body
    if (!data.email || !data.pass) return res.status(500).json({ error: 'Email e Senha inválidos' });

    let sql = `INSERT INTO users (email, pass) VALUES ('${data.email}', '${data.pass}')`;
    mysqlConnection.query(sql, function (err, result) {
        if (err) {
            console.error(err);
            res.status(500).json({ error: err });
        } else {
            console.log("New user registred");
            res.json({ data: result })
        }
    });
});

app.post("/login-user", (req, res) => {
    let data = req.body
    if (!data.email || !data.pass) return res.status(500).json({ error: 'Email e Senha inválidos' });

    let sql = `SELECT * from users WHERE email = '${data.email}' and pass = '${data.pass}'`;
    mysqlConnection.query(sql, function (err, result) {
        if (err) {
            console.error(err);
            res.status(500).json({ error: err });
        } else {
            res.json({ data: result })
        }
    });
});


mysqlConnection.connect(function(err) {
    if (err) throw err;
    console.log("MYSQL Connected!");
});

app.listen(3001, () => {
    console.log("Server on http://localhost:3001");
});