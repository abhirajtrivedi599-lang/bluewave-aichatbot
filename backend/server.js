const express = require("express");
const cors = require("cors");
const db = require("./database/db");
const path = require("path");

const app = express();

app.use(cors());
app.use(express.json());
app.use(express.static(path.join(__dirname, "..")));

// Create Database Tables
db.serialize(() => {
    db.run(`
CREATE TABLE IF NOT EXISTS users (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    name TEXT,
    age INTEGER,
    gender TEXT,
    weight REAL,
    created_at DATETIME DEFAULT CURRENT_TIMESTAMP
)
`);
db.run(`
CREATE TABLE IF NOT EXISTS messages (
    id INTEGER PRIMARY KEY AUTOINCREMENT,
    user_id INTEGER,
    sender TEXT NOT NULL,
    message TEXT NOT NULL,
    timestamp DATETIME DEFAULT CURRENT_TIMESTAMP,
    FOREIGN KEY (user_id) REFERENCES users(id)
)
`);
});
// Save User Information
app.post("/users", (req, res) => {

    const { name, age, gender, weight } = req.body;

    db.run(
        `INSERT INTO users (name, age, gender, weight)
         VALUES (?, ?, ?, ?)`,
        [name, age, gender, weight],
        function (err) {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            res.json({
                success: true,
                userId: this.lastID,
                message: "User saved successfully!"
            });
        }
    );
});
app.post("/messages", (req, res) => {

    const { user_id, sender, message } = req.body;

    db.run(
        `INSERT INTO messages (user_id, sender, message)
         VALUES (?, ?, ?)`,
        [user_id, sender, message],
        function (err) {

            if (err) {
                return res.status(500).json({
                    success: false,
                    message: err.message
                });
            }

            res.json({
                success: true,
                messageId: this.lastID,
                message: "Message saved successfully!"
            });
        }
    );
});

app.get("/", (req, res) => {
    res.sendFile(path.join(__dirname, "..", "index.html"));
});

const PORT = 5000;

app.listen(PORT, "0.0.0.0", () => {
    console.log(`Server running on http://0.0.0.0:${PORT}`);
});