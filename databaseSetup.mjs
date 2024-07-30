import "dotenv/config";
import pool from "pg-pool";

const { PG_USER, PG_HOST, PG_DB, PG_PASS, PG_PORT } = process.env;

// const { Pool } = pkg
const p = new pool({
    user: PG_USER,
    host: PG_HOST,
    database: PG_DB,
    password: PG_PASS,
    port: PG_PORT,
    max: 20,
    idleTimeoutMillis: 1000,
    connectionTimeoutMillis: 1000, // return an error after 1 second if connection could not be established
    maxUses: 7500, // close (and replace) a connection after it has been used 7500 times (see below for discussion)
});

(async () => {
    const client = await p.connect();
    try {
        // const q = await client.query('DROP TABLE memberLog');
        const q = await client.query('CREATE TABLE IF NOT EXISTS memberLog (user_id text NOT NULL, roll_assigned boolean DEFAULT FALSE, roll_id text, PRIMARY KEY (user_id))');
        // const q = await client.query('SELECT * FROM memberLog');
        console.log(q)
    } catch (error) {
        console.error(error)
    } finally {
        client.release()
    }
})();