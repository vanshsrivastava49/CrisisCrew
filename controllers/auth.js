const bcrypt = require('bcrypt');
const db = require('../config/db');
const login = async (req, res) => {
    const { username, password } = req.body;

    const sql = 'SELECT * FROM users WHERE username = ?';
    db.query(sql, [username], async (err, results) => {
        if (err || results.length === 0) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        const user = results[0];
        const match = await bcrypt.compare(password, user.password);
        if (!match) {
            return res.status(400).json({ message: 'Invalid credentials' });
        }
        req.session.userId = user.id;
        res.status(200).json({ message: 'Login successful', userId: user.id, role: user.role });
    });
};
const logout = (req, res) => {
    req.session.destroy((err) => {
        if (err) {
            return res.status(500).json({ message: 'Error logging out', error: err });
        }
        res.status(200).json({ message: 'Logout successful' });
    });
};
module.exports = { login, logout };
