const request = require('supertest');
const buildApp = require('../../app');
const { pool, dbConfig } = require('../../pool');
const UsersRepo = require('../../repos/users-repo');
const { randomBytes } = require('crypto');
const { default: migrate } = require('node-pg-migrate');
const format = require('pg-format');

jest.setTimeout(70 * 1000);

describe('users route', () => {
    const app = buildApp();
    let userName;

    beforeAll(async () => {
        // Randomly generate a string to create a user name.
        userName = 'a' + randomBytes(4).toString('hex');
    
        // Connect to the DB as usual
        await pool.connect({
            ...dbConfig,
            database: process.env.DB_NAME + '-test',
        });
    
        // Create a new role
        await pool.query(format(
            'CREATE ROLE %I WITH LOGIN PASSWORD %L;', userName, userName
        ));
    
        // Create a new schema
        await pool.query(format(
            'CREATE SCHEMA %I AUTHORIZATION %I', userName, userName
        ));
    
        // Disconnect entirely from PG
        await pool.close();
    
        // Run migrations
        const newDbConfig = {
            host: dbConfig.host,
            port: dbConfig.port,
            database: process.env.DB_NAME + '-test',
            user: userName,
            password: userName,
        };
        await migrate({
            schema: userName,
            direction: 'up',
            log: () => {},
            noLock: true,
            dir: 'migrations',
            databaseUrl: newDbConfig,
        });
    
        // Connect to PG as a newly created role
        await pool.connect(newDbConfig);
    });

    afterAll(async () => {
         // Disconnect from PG
        await pool.close();

        // Reconnect as our root user
        await pool.connect({
            ...dbConfig,
            database: process.env.DB_NAME + '-test',
        });

        // Delete the role and schema we created
        await pool.query(format('DROP SCHEMA %I CASCADE;', userName));
        await pool.query(format('DROP ROLE %I;', userName));

        // Disconnect
        await pool.close();
    });

    it('should return empty array of users initially', async () => {
        const response = await request(app).get('/users');

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual([]);
    });

    it('create a user', async () => {
        const startingCount = await UsersRepo.count();
        
        await request(app)
            .post('/users')
            .send({ username: 'testuser', bio: 'test bio' })
            .expect(200);
        
        const finishCount = await UsersRepo.count();

        expect(finishCount - startingCount).toEqual(1);
    });
      

    it('should return 404 if user does not exist', async () => {
        const response = await request(app).get('/users/176676767');

        expect(response.statusCode).toBe(404);
    });

    it('updates a user', async () => {
        const response = await request(app)
            .put('/users/1')
            .send({ username: 'alice', bio: 'updated bio' });

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ id: 1, username: 'alice', bio: 'updated bio', createdAt: expect.any(String), updatedAt: expect.any(String) });
    });

    it('deletes a user', async () => {
        const response = await request(app).delete('/users/1');

        expect(response.statusCode).toBe(200);
        expect(response.body).toEqual({ id: 1, username: 'alice', bio: 'updated bio', createdAt: expect.any(String), updatedAt: expect.any(String) });
    });
});