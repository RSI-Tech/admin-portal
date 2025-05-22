import * as mssql from 'mssql';
import fs from 'fs';
import path from 'path';

function getConnectionConfig() {
    const configFile = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'connection.json'), 'utf8'));
    const currentEnv = configFile.current_env || 'dev';
    const envConfig = configFile.environments[currentEnv];
    
    if (!envConfig) {
        throw new Error(`Environment '${currentEnv}' not found in connection.json`);
    }
    
    return {
        ...envConfig,
        currentEnv
    };
}

function getDbConfig(): mssql.config {
    const config = getConnectionConfig();
    return {
        user: config.username,
        password: config.password,
        database: config.database,
        server: config.server.split(',')[0],
        port: parseInt(config.server.split(',')[1]) || 1433,
        options: {
            encrypt: config.encrypt !== undefined ? config.encrypt : false,
            trustServerCertificate: config.trustServerCertificate !== undefined ? config.trustServerCertificate : true
        }
    };
}

let pool: mssql.ConnectionPool | null = null;

export async function connectToDatabase() {
    try {
        // Always get fresh config to handle environment changes
        const currentConfig = getDbConfig();
        
        // Close existing pool if config has changed
        if (pool) {
            const existingConfig = (pool as any).config;
            if (existingConfig.database !== currentConfig.database || 
                existingConfig.server !== currentConfig.server) {
                await pool.close();
                pool = null;
            }
        }
        
        if (!pool) {
            pool = await mssql.connect(currentConfig);
            console.log(`Connected to database: ${currentConfig.database} on ${currentConfig.server}`);
        }
        return pool;
    } catch (err) {
        console.error('Database connection failed:', err);
        throw err;
    }
}

export const sql = mssql;

export function getCurrentEnvironment() {
    const configFile = JSON.parse(fs.readFileSync(path.join(process.cwd(), 'connection.json'), 'utf8'));
    return {
        current: configFile.current_env || 'dev',
        name: configFile.environments[configFile.current_env]?.name || 'Development',
        available: Object.keys(configFile.environments || {})
    };
}

export async function switchEnvironment(newEnv: string) {
    const configPath = path.join(process.cwd(), 'connection.json');
    const configFile = JSON.parse(fs.readFileSync(configPath, 'utf8'));
    
    if (!configFile.environments[newEnv]) {
        throw new Error(`Environment '${newEnv}' not found`);
    }
    
    configFile.current_env = newEnv;
    fs.writeFileSync(configPath, JSON.stringify(configFile, null, 2));
    
    // Reset connection pool to use new environment
    if (pool) {
        await pool.close();
        pool = null;
    }
    
    return configFile.environments[newEnv];
}