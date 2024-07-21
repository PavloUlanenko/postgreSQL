const { pool } = require('../pool');
const { toCamelCase } = require('../utils');

class Users {
    static async find() {
        const { rows } = await pool.query('SELECT * from users;');
        const parsedRows = toCamelCase(rows);

        return parsedRows;
    }

    static async findById(id) {
        const { rows } = await pool.query('SELECT * from users WHERE id = $1;', [id]);
        const parsedRows = toCamelCase(rows);
        
        return parsedRows[0];
    }

    static async insert(username, bio) {
        const { rows } = await pool.query(
            'INSERT INTO users (username, bio) VALUES ($1, $2) RETURNING *;',
            [username, bio]
        );

        return toCamelCase(rows)[0];
    }

    static async update(id, username, bio) {
        const { rows } = await pool.query(
            'UPDATE users SET username = $1, bio = $2 WHERE id = $3 RETURNING *;',
            [username, bio, id]
        );

        return toCamelCase(rows)[0];
    }

    static async delete(id) {
        const { rows } = await pool.query('DELETE FROM users WHERE id = $1 RETURNING *;', [id]);

        return toCamelCase(rows)[0];
    }

    static async count() {
        const { rows } = await pool.query('SELECT COUNT(*) FROM users;');
        const count = parseInt(rows[0].count);

        return count;
    }
}

module.exports = Users;