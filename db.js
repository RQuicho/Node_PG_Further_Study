/** Database setup for BizTime. */

const { Client } = require("pg");

let DB_NAME;

if (process.env.NODE_ENV === "test") {
    DB_NAME = "biztime_test";
} else {
    DB_NAME = "biztime";
}

const db = new Client({
    host: "/var/run/postgresql/",
    database: DB_NAME
})

db.connect();

module.exports = db;