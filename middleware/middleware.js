const db = require('../config/db');
const authenticateAdmin = async (req, res, next) => {
    const userId = req.session.userId;

    if (!userId) {
        return res.status(403).json({ message: 'Forbidden: Admin access required' });
    }

    try {
        const sql = 'SELECT isAdmin FROM users WHERE id = ?';
        db.query(sql, [userId], (err, results) => {
            if (err) {
                console.error('Database error:', err);
                return res.status(500).json({ message: 'Internal server error' });
            }

            if (results.length === 0 || !results[0].isAdmin) {
                return res.status(403).json({ message: 'Forbidden: Admin access required' });
            }

            next();
        });
    } catch (error) {
        console.error('Error during authentication:', error);
        res.status(500).json({ message: 'Internal server error' });
    }
};

module.exports = { authenticateAdmin };
