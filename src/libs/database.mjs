import pool from "pg-pool";
// import "dotenv/config";
import pkg from "pg";
// eslint-disable-next-line no-unused-vars
const { Query } = pkg;
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

const client = await p.connect();

// (async () => {
//     const client = await p.connect();
//     try {
//         // const q = await client.query('DROP TABLE memberLog');
//         const q = await client.query('CREATE TABLE IF NOT EXISTS memberLog (user_id text NOT NULL, roll_assigned boolean DEFAULT FALSE, roll_id text, PRIMARY KEY (user_id))');
//         // const q = await client.query('SELECT * FROM memberLog');
//         console.log(q)
//     } catch (error) {
//         console.error(error)
//     } finally {
//         client.release()
//     }
// })();

/**
 * query statement to access database
 * @param {string} text 
 * @param {array} values 
 * @returns {Promise<Query>}
 */
const query = async (text, values) => {
    let q;
    try {
        q = await p.query(text, values);
    } catch (error) {
        console.error(error);
    } finally {
        client.release();
    }
    return q;
};

export default query;

/**
 * return database query result or a boolean
 * @param {import("discord.js").Snowflake} user 
 * @returns {Promise<boolean | {user_id:import("discord.js").Snowflake, roll_assigned:boolean, roll_id:import("discord.js").Snowflake}>}
 */
export async function validateUser(user) {
    if (!user) throw TypeError(`Parameter "user" cannot be blank`);
    if (typeof user != `string`) throw TypeError(`Parameter "user" must be a string`);
    const sql = `INSERT INTO memberLog (user_id) SELECT $1::text WHERE NOT EXISTS (SELECT 1 FROM memberLog WHERE user_id = $1::text)`;
    const result = await query(sql, [user]);
    if (!result) return false;
    const hasRoleSql = `SELECT * FROM memberLog WHERE user_id = $1::text`;
    const hasRoleResult = await query(hasRoleSql, [user]);
    if (hasRoleResult) return false;
    return hasRoleResult.rows[0];
}

/**
 * return roll id snowflake if exists
 * @param {import("discord.js").Snowflake} user 
 * @returns {Promise<boolean | import("discord.js").Snowflake>}
 */
export async function getRoleForUser(user) {
    if (!user) throw TypeError(`Parameter "user" cannot be blank`);
    if (typeof user != `string`) throw TypeError(`Parameter "user" must be a string`);
    const sql = `SELECT * FROM memberLog WHERE user_id = $1::text`;
    const result = await query(sql, [user]);
    if (!result) return false;
    const record = result.rows[0].roll_id;
    return record;
}

/**
 * Update database record to keep track of rolls if user leaves the guild
 * @param {import("discord.js").Snowflake} user 
 * @param {import("discord.js").Snowflake} roleId 
 * @returns {Promise<boolean>}
 */
export async function updateRecord(user, roleId) {
    if (!user) throw TypeError(`Parameter "user" cannot be blank`);
    if (typeof user != `string`) throw TypeError(`Parameter "user" must be a string`);
    if (!roleId) throw TypeError(`Parameter "roleId" cannot be blank`);
    if (typeof roleId != `string`) throw TypeError(`Parameter "roleId" must be a string`);
    await validateUser(user);
    const sql = `UPDATE memberLog SET roll_id = $1::text, roll_assigned = true WHERE user_id = $2::text`;
    const result = await query(sql, [roleId, user]);
    if (!result) return false;
    return true;
}

/**
 * Remove record from database
 * @param {import("discord.js").Snowflake} user 
 * @returns {Promise<boolean>}
 */
export async function resetUser(user) {
    if (!user) throw TypeError(`Parameter "user" cannot be blank`);
    if (typeof user != `string`) throw TypeError(`Parameter "user" must be a string`);
    const sql = `UPDATE memberLog SET roll_id = null, roll_assigned = false WHERE user_id = $1::text`;
    const result = await query(sql, [user]);
    if (!result) return false;
    return true;
}