const express = require("express");
const cors = require("cors");
const app = express();

const mysql = require('mysql2');

let mysqlConnection = mysql.createConnection({
    host: "localhost",
    user: "root",
    password: "131213",
    database: "task_system"
});

app.use(cors({
    origin: 'http://localhost:3000',
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

let connections = {}

let newConnection = async(data, res) => {
    console.log(data)
    let newToken = Math.random().toString(36).substring(2)+Math.random().toString(36).substring(2)
    connections[newToken] = {
        id: data.id,
        email: data.email
    }

    console.log(`New connection, token: ${newToken}`)
    res.json({ data: data, token: newToken })
}


app.post("/register-user", (req, res) => {
    let data = req.body
    if (!data.email || !data.pass) return res.status(500).json({ error: 'Email e Senha inválidos' });

    //let sql = `INSERT INTO users (email, pass) VALUES ('${data.email}', '${data.pass}')`;
    let sql = `
        INSERT INTO users (name, email, password_hash)
        VALUES ('${data.email}', '${data.email}', '${data.pass}');
    `
    mysqlConnection.query(sql, function (err, result) {
        if (err) {
            console.error(err);
            res.status(500).json({ error: err });
        } else {
            console.log("New user registred")
            newConnection(result, res)
        }
    });
});

app.post("/login-user", (req, res) => {
    let data = req.body
    if (!data.email || !data.pass) return res.status(500).json({ error: 'Email e Senha inválidos' });

    let sql = `SELECT * from users WHERE email = '${data.email}' and password_hash = '${data.pass}'`;
    mysqlConnection.query(sql, function (err, result) {
        if (err) {
            console.error(err);
            res.status(500).json({ error: err });
        } else {
            if (!result[0]) return res.status(500).json({ error: 'Email e Senha inválidos' });
            else newConnection(result[0], res)
        }
    });
});

app.post("/get-connection-data", (req, res) => {
    let reqToken = req.body?.token
    let data = connections[reqToken]
    if (!data) return res.status(500).json({ error: 'Conexão inválida' });

    res.json({ data: data, token: reqToken })
});

app.post("/get-tasks", (req, res) => {
    let reqToken = req.body?.token
    let data = connections[reqToken]
    if (!data) return res.status(500).json({ error: 'Conexão inválida' });

    let sql = `
        SELECT * FROM tasks
        WHERE user_id = ${data.id}
        ORDER BY due_date ASC,
        FIELD(priority, 'high', 'medium', 'low');
    `;
    mysqlConnection.query(sql, function (err, result) {
        if (err) {
            console.error(err);
            res.status(500).json({ error: err });
        } else {
            newConnection(result, res)
        }
    });

    /*SELECT * FROM tasks
ORDER BY due_date ASC,
  FIELD(priority, 'high', 'medium', 'low');

  SELECT * FROM tasks
WHERE user_id = 1
ORDER BY due_date ASC,
FIELD(priority, 'high', 'medium', 'low');
  
  INSERT INTO tasks (user_id, title, description, due_date, priority, status)
VALUES (1, 'Finish task system', 'Create database and task list', '2026-06-25', 'high', 'pending');
*/
})


mysqlConnection.connect(function(err) {
    if (err) throw err;
    console.log("MYSQL Connected!");
});

app.listen(3003, () => {
    console.log("Server on http://localhost:3003");
});