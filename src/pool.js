const pg = require('pg');
require('dotenv').config();

class Pool {
    _pool = null;

    connect(options) {
        this._pool = new pg.Pool(options);
        // When a pool is created, we need to create a client automatically and test the connection
        // by running a simple query to see if the connection is successful
        return this._pool.query('SELECT 1 + 1');
    }

    close() {
        return this._pool.end();
    }

    query(sql, params) {
        return this._pool.query(sql, params);
    }
}

const dbConfig = {
    host: process.env.DB_HOST,
    port: process.env.DB_PORT,
    database: process.env.DB_NAME,
    user: process.env.DB_USER_NAME,
    password: process.env.DB_PASSWORD,
};

module.exports = {
    pool: new Pool(),
    dbConfig,
};