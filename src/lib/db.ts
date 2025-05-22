import * as mssql from 'mssql';
import fs from 'fs';
import path from 'path';

const config = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'connection.json'), 'utf8'));

const dbConfig: mssql.config = {
    user: config.username,
    password: config.password,
    database: config.database,
    server: config.server.split(',')[0],
    port: parseInt(config.server.split(',')[1]) || 1433,
    options: {
        encrypt: false,
        trustServerCertificate: true
    }
};

let pool: mssql.ConnectionPool | null = null;

export async function connectToDatabase() {
    try {
        if (!pool) {
            pool = await mssql.connect(dbConfig);
        }
        return pool;
    } catch (err) {
        console.error('Database connection failed:', err);
        throw err;
    }
}

export const sql = mssql;