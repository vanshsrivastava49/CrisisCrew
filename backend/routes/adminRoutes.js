const express = require('express');
const router = express.Router();
const db = require('../config/db');
const { authenticateAdmin } = require('../middleware/middleware');
router.get('/users', authenticateAdmin, (req, res) => {
    const sql = 'SELECT id, username FROM users';
    db.query(sql, (err, results) => {
        if (err) return res.status(500).json({ message: 'Error retrieving users', error: err });
        res.status(200).json(results);
    });
});
router.post('/users/:id/role', authenticateAdmin, (req, res) => {
    const userId = req.params.id;
    const { role } = req.body;

    const sql = 'UPDATE users SET role = ? WHERE id = ?';
    db.query(sql, [role, userId], (err) => {
        if (err) return res.status(500).json({ message: 'Error updating user role', error: err });
        res.status(200).json({ message: 'User role updated successfully!' });
    });
});
router.get('/admin', authenticateAdmin, (req, res) => {

    res.render('adminPanel');
});
module.exports = router;
