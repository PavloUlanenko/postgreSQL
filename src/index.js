const app = require('./app');
const {
    pool,
    dbConfig,
} = require('./pool');
require('dotenv').config();


(async () => {
    try {
        await pool.connect(dbConfig);
        
        app().listen(process.env.SERVER_PORT, () => {
            console.log(`Server is listening on port ${process.env.SERVER_PORT}`);
        });
    } catch (err) {
        console.error(err);
        process.exit(1);
    }
})();