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
    origin: ['http://localhost:3000', 'http://26.180.163.91:3000'],
    methods: ['GET', 'POST', 'PUT', 'DELETE', 'OPTIONS'],
    allowedHeaders: ['Content-Type', 'Authorization']
}));
app.use(express.json());

let connections = {}

let newConnection = async(data, res) => {
    let newToken = Math.random().toString(36).substring(2)+Math.random().toString(36).substring(2)
    connections[newToken] = {
        id: data.id,
        name: data.name,
        email: data.email,
        created_at: data.created_at,
        updated_at: data.updated_at
    }

    console.log(`New connection, token: ${newToken}`)
    res.json({ data: data, token: newToken })
}


app.post("/register-user", async(req, res) => {
    let data = req.body
    if (!data.email || !data.pass) return res.status(500).json({ error: 'Email e Senha inválidos' });

    
    let sql = `
        INSERT INTO users (name, email, password_hash)
        VALUES ('${data.email}', '${data.email}', '${data.pass}');
    `
    mysqlConnection.query(sql, (err, result) => {
        if (err) {
            if (err.errno == 1062) res.status(500).json({ error: 'Email já registrado' });
            else {
                console.error(err);
                res.status(500).json({ error: err });
            }
        } else {
            console.log("New user registred")

            mysqlConnection.query(`SELECT * from users WHERE email = '${data.email}'`, (err, result) => {
                if (!err) newConnection(result[0], res)
            });
        }
    });
});

app.post("/login-user", (req, res) => {
    let data = req.body
    if (!data.email || !data.pass) return res.status(500).json({ error: 'Email e Senha inválidos' });

    let sql = `SELECT * from users WHERE email = '${data.email}' and password_hash = '${data.pass}'`;
    mysqlConnection.query(sql, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: err });
        } else {
            if (!result[0]) return res.status(500).json({ error: 'Email e Senha inválidos' });
            else newConnection(result[0], res)
        }
    });
});

app.post("/get-user-info", (req, res) => {
    let reqData = req.body
    let data = connections[reqData?.token]
    if (!data) return res.status(500).json({ error: 'Conexão inválida' });
    
    res.json({ data: data, token: reqData?.token })
});

app.post("/get-task-info", (req, res) => {
    let reqData = req.body
    let data = connections[reqData?.token]
    if (!data) return res.status(500).json({ error: 'Conexão inválida' });
    
    mysqlConnection.query(`
        SELECT * FROM tasks
        WHERE user_id = ${data.id} and id = ${reqData.id}
    `, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: err });
        } else {
            res.json({ data: result[0] })
        }
    });
});

app.post("/delete-task", (req, res) => {
    let reqData = req.body
    let data = connections[reqData?.token]
    if (!data) return res.status(500).json({ error: 'Conexão inválida' });

    mysqlConnection.query(`
        DELETE FROM tasks
        WHERE id = ${reqData.id} AND user_id = ${data.id};
    `, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: err });
        } else {
            res.json({ message: 'Success' })
        }
    })
})

app.post("/save-task", (req, res) => {
    let reqData = req.body
    let data = connections[reqData?.token]
    if (!data) return res.status(500).json({ error: 'Conexão inválida' });
    
    mysqlConnection.query(`
        SELECT * FROM tasks
        WHERE user_id = ${data.id} and id = ${reqData.id}
    `, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: err });
        } else if(result[0]) {
            mysqlConnection.query(`
                UPDATE tasks
                SET
                title = '${reqData.title}',
                description = '${reqData.description}',
                due_date = '${reqData.due_date}',
                priority = '${reqData.priority}',
                status = '${reqData.status}'
                WHERE id = ${reqData.id} AND user_id = ${data.id};
            `, (err, result) => {
                if (err) {
                    console.error(err);
                    res.status(500).json({ error: err });
                } else {
                    res.json({ message: 'Success' })
                }
            });
        } else {
            mysqlConnection.query(`
                INSERT INTO tasks (user_id, title, description, due_date, priority, status) VALUES
                (${data.id}, '${reqData.title}', '${reqData.description}', '${reqData.due_date}', '${reqData.priority}', '${reqData.status}');
            `, (err, result) => {
                if (err) {
                    console.error(err);
                    res.status(500).json({ error: err });
                } else {
                    res.json({ message: 'Success' })
                }
            });
        }
    });
});

app.post("/get-tasks", (req, res) => {
    let reqData = req.body
    let data = connections[reqData?.token]
    if (!data) return res.status(500).json({ error: 'Conexão inválida' });

    mysqlConnection.query(`
        SELECT * FROM tasks
        WHERE user_id = ${data.id}
        ORDER BY 
            CASE WHEN status = 'completed' THEN 1 ELSE 0 END ASC,
            due_date ASC,
            FIELD(priority, 'high', 'medium', 'low') ASC;
    `, (err, result) => {
        if (err) {
            console.error(err);
            res.status(500).json({ error: err });
        } else {
            res.json({ data: result })
        }
    });
})


mysqlConnection.connect(function(err) {
    if (err) throw err;
    console.log("MYSQL Connected!");
});

app.listen(3003, () => {
    console.log("Server on http://localhost:3003");
});