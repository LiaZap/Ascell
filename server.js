import express from 'express';
import path from 'path';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';
import bcrypt from 'bcryptjs';
import jwt from 'jsonwebtoken';

const JWT_SECRET = process.env.JWT_SECRET || 'fallback_secret_key_change_in_production';

dotenv.config();

const { Pool } = pg;

const app = express();
const port = process.env.PORT || 3000;

// Fix __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database Connection
// We rely on the connection string to handle SSL (e.g. ?sslmode=require or disable)
const pool = new Pool({
    connectionString: process.env.DATABASE_URL
});

// Auto-Run Migration
const initDb = async () => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS logs (
                id SERIAL PRIMARY KEY,
                date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                agent VARCHAR(255) NOT NULL,
                client VARCHAR(255) NOT NULL,
                type VARCHAR(50) NOT NULL,
                status VARCHAR(50) NOT NULL,
                protocol VARCHAR(50) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                password VARCHAR(255) NOT NULL DEFAULT '$2a$10$X7.1j/1.1/1.1/1.1/1.1', -- Default hash if needed
                role VARCHAR(50) NOT NULL DEFAULT 'Operador',
                status VARCHAR(50) NOT NULL DEFAULT 'Ativo',
                last_login TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS settings (
                key VARCHAR(50) PRIMARY KEY,
                value TEXT
            );
        `);

        // Add password column if it doesn't exist (migration for existing dbs)
        await pool.query(`
            DO $$ 
            BEGIN 
                IF NOT EXISTS (SELECT 1 FROM information_schema.columns WHERE table_name='users' AND column_name='password') THEN 
                    ALTER TABLE users ADD COLUMN password VARCHAR(255) NOT NULL DEFAULT '$2a$10$X7.1j/1.1/1.1/1.1/1.1'; 
                END IF; 
            END $$;
        `);

        // Create Default Admin if no users exist
        const userCountResult = await pool.query('SELECT COUNT(*) FROM users');
        const userCount = parseInt(userCountResult.rows[0].count);

        if (userCount === 0) {
            const hashedPassword = await bcrypt.hash('admin123', 10);
            await pool.query(
                `INSERT INTO users (name, email, password, role, status) VALUES ($1, $2, $3, $4, $5)`,
                ['Administrador', 'admin@ascel.com', hashedPassword, 'Administrador', 'Ativo']
            );
            console.log('Default admin user created: admin@ascel.com / admin123');
        }

        console.log('Database tables verified/created successfully.');
    } catch (err) {
        console.error('Failed to initialize database:', err);
    }
};

initDb();

// Middleware
app.use(cors());
app.use(express.json());

// 4. Proxy for WhatsApp Status (Legacy DB lookup)
app.get('/api/whatsapp/status', async (req, res) => {
    try {
        const client = await pool.connect();
        const settingsResult = await client.query('SELECT key, value FROM settings WHERE key IN ($1, $2)', ['serverUrl', 'instanceToken']);
        client.release();

        const settings = settingsResult.rows.reduce((acc, row) => {
            acc[row.key] = row.value;
            return acc;
        }, {});

        const { serverUrl, instanceToken } = settings;

        if (!serverUrl) {
            return res.json({ status: 'disconnected', reason: 'no_credentials' });
        }

        const headers = {
            'Content-Type': 'application/json'
        };
        if (instanceToken) headers['token'] = instanceToken;

        // Smart Proxy Logic: Use POST for n8n webhooks
        let response;
        try {
            // Use POST directly (n8n webhooks require POST)
            response = await fetch(serverUrl, { method: 'POST', headers, body: JSON.stringify({}) });

            // Fallback: If URL doesn't look like a webhook, try appending endpoint with GET
            if (!response.ok && !serverUrl.includes('webhook')) {
                const appendUrl = `${serverUrl.replace(/\/$/, '')}/instance/status`;
                const responseAppend = await fetch(appendUrl, { method: 'GET', headers });
                if (responseAppend.ok) response = responseAppend;
            }
        } catch (e) {
            console.error('Proxy fetch validation error:', e);
        }

        if (!response || !response.ok) {
            return res.json({ status: 'disconnected', reason: 'api_error' });
        }

        const rawData = await response.json();

        // Normalize n8n Array response: [{ instance: ... }] -> { instance: ... }
        const data = Array.isArray(rawData) ? rawData[0] : rawData;

        res.json(data);

    } catch (err) {
        console.error('Error proxying status check:', err);
        res.status(500).json({ error: 'Failed to check status' });
    }
});

// 4.1 Generic Proxy Check (For testing connections without CORS from frontend)
app.post('/api/proxy-check', async (req, res) => {
    const { url, token, method } = req.body; // Accept method param

    if (!url) {
        return res.status(400).json({ error: 'URL is required' });
    }

    try {
        const headers = { 'Content-Type': 'application/json' };
        if (token) headers['token'] = token;

        const fetchMethod = method || 'GET'; // Default to GET
        console.log(`Proxying ${fetchMethod} request to:`, url);

        const response = await fetch(url, { method: fetchMethod, headers });

        // We return the status and data regardless of 200 OK, so frontend can handle it
        const data = await response.json().catch(() => ({})); // Handle non-json responses elegantly

        res.json({
            ok: response.ok,
            status: response.status,
            data: data
        });

    } catch (err) {
        console.error('Proxy check failed:', err);
        res.status(500).json({ error: 'Failed to fetch URL via proxy: ' + err.message });
    }
});

// Serve Static Files (Vite Build)
app.use(express.static(path.join(__dirname, 'dist')));

// API Endpoints

// 0. Setup Database (Run once)
app.get('/api/setup', async (req, res) => {
    try {
        await pool.query(`
            CREATE TABLE IF NOT EXISTS logs (
                id SERIAL PRIMARY KEY,
                date TIMESTAMP DEFAULT CURRENT_TIMESTAMP,
                agent VARCHAR(255) NOT NULL,
                client VARCHAR(255) NOT NULL,
                type VARCHAR(50) NOT NULL,
                status VARCHAR(50) NOT NULL,
                protocol VARCHAR(50) NOT NULL,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS users (
                id SERIAL PRIMARY KEY,
                name VARCHAR(255) NOT NULL,
                email VARCHAR(255) UNIQUE NOT NULL,
                role VARCHAR(50) NOT NULL DEFAULT 'Operador',
                status VARCHAR(50) NOT NULL DEFAULT 'Ativo',
                last_login TIMESTAMP,
                created_at TIMESTAMP DEFAULT CURRENT_TIMESTAMP
            );

            CREATE TABLE IF NOT EXISTS settings (
                key VARCHAR(50) PRIMARY KEY,
                value TEXT
            );
        `);
        res.send('Tabelas Criadas com Sucesso! Agora você pode usar o sistema.');
    } catch (err) {
        console.error(err);
        res.status(500).send('Erro ao criar tabelas: ' + err.message);
    }
});

// 1. Get Logs
app.get('/api/logs', async (req, res) => {
    try {
        const { startDate, endDate, limit } = req.query;
        let query = 'SELECT * FROM logs';
        const params = [];
        
        // Add date filtering if provided
        if (startDate && endDate) {
            query += ' WHERE date >= $1 AND date <= $2';
            params.push(startDate, endDate);
        } else if (startDate) {
            query += ' WHERE date >= $1';
            params.push(startDate);
        }
        
        query += ' ORDER BY created_at DESC';
        
        // Use provided limit or default to 1000 for analytics
        const maxLimit = Math.min(parseInt(limit) || 1000, 5000);
        query += ` LIMIT ${maxLimit}`;
        
        const result = await pool.query(query, params);
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching logs:', err);
        res.json([]);
    }
});

app.post('/api/logs', async (req, res) => {
    const { date, agent, client, type, status, protocol } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO logs (date, agent, client, type, status, protocol) VALUES ($1, $2, $3, $4, $5, $6) RETURNING *',
            [new Date(), agent, client, type, status, protocol]
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error('Error creating log:', err);
        res.status(500).json({ error: 'Failed to create log' });
    }
});

// 2. Get Users
app.get('/api/users', async (req, res) => {
    try {
        const result = await pool.query('SELECT * FROM users ORDER BY name ASC');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching users:', err);
        res.json([]);
    }
});

// 3. Login Endpoint
app.post('/api/login', async (req, res) => {
    const { email, password } = req.body;
    try {
        const result = await pool.query('SELECT * FROM users WHERE email = $1', [email]);
        const user = result.rows[0];

        if (!user) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Check password (if user has no password set - legacy - allow generic or require reset? 
        // For now assuming all users will have password via migration or creation)
        const validPassword = await bcrypt.compare(password, user.password);
        if (!validPassword) {
            return res.status(401).json({ error: 'Invalid credentials' });
        }

        // Update last login
        await pool.query('UPDATE users SET last_login = NOW() WHERE id = $1', [user.id]);

        const token = jwt.sign({ id: user.id, role: user.role, name: user.name }, JWT_SECRET, { expiresIn: '8h' });

        // Return user without password
        const { password: _, ...userWithoutPassword } = user;
        res.json({ token, user: userWithoutPassword });

    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Login failed' });
    }
});

// 4. Create User
app.post('/api/users', async (req, res) => {
    const { name, email, role, password } = req.body;
    try {
        const hashedPassword = await bcrypt.hash(password, 10);
        const result = await pool.query(
            'INSERT INTO users (name, email, role, status, password) VALUES ($1, $2, $3, $4, $5) RETURNING *',
            [name, email, role, 'Ativo', hashedPassword]
        );
        const { password: _, ...newUser } = result.rows[0];
        res.json(newUser);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// 5. Update User
app.put('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    const { name, email, role, status, password } = req.body;

    try {
        let query = 'UPDATE users SET name = $1, email = $2, role = $3, status = $4';
        let values = [name, email, role, status];

        if (password) {
            const hashedPassword = await bcrypt.hash(password, 10);
            query += ', password = $' + (values.length + 1);
            values.push(hashedPassword);
        }

        query += ' WHERE id = $' + (values.length + 1) + ' RETURNING *';
        values.push(id);

        const result = await pool.query(query, values);

        if (result.rows.length === 0) {
            return res.status(404).json({ error: 'User not found' });
        }

        const { password: _, ...updatedUser } = result.rows[0];
        res.json(updatedUser);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to update user' });
    }
});

// 6. Delete User

// 4. Delete User
app.delete('/api/users/:id', async (req, res) => {
    const { id } = req.params;
    try {
        await pool.query('DELETE FROM users WHERE id = $1', [id]);
        res.json({ message: 'User deleted successfully' });
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to delete user' });
    }
});

// 7. Get Settings
app.get('/api/settings', async (req, res) => {
    try {
        const result = await pool.query('SELECT key, value FROM settings');

        // Convert rows [{key, value}] to object {key: value}
        const settings = result.rows.reduce((acc, row) => {
            acc[row.key] = row.value;
            return acc;
        }, {});

        // Return with defaults if missing
        res.json({
            webhookUrl: settings.webhookUrl || '',
            qrWebhookUrl: settings.qrWebhookUrl || '',
            instancePhone: settings.instancePhone || '',
            instanceStatus: settings.instanceStatus || 'disconnected',
            serverUrl: settings.serverUrl || '',
            instanceToken: settings.instanceToken || '',
            actionButtonDisabled: settings.actionButtonDisabled === 'true'
        });
    } catch (err) {
        console.error('Error fetching settings:', err);
        res.status(500).json({ error: 'Failed to fetch settings' });
    }
});

// 8. Update Settings
app.put('/api/settings', async (req, res) => {
    const settings = req.body; // Expect object with keys
    const client = await pool.connect();

    try {
        await client.query('BEGIN');

        for (const [key, value] of Object.entries(settings)) {
            // Only allow specific keys for safety
            if (['webhookUrl', 'qrWebhookUrl', 'instancePhone', 'instanceStatus', 'serverUrl', 'instanceToken', 'actionButtonDisabled'].includes(key)) {
                await client.query(
                    'INSERT INTO settings (key, value) VALUES ($1, $2) ON CONFLICT (key) DO UPDATE SET value = $2',
                    [key, String(value)]
                );
            }
        }

        await client.query('COMMIT');
        res.json({ message: 'Settings updated successfully' });
    } catch (err) {
        await client.query('ROLLBACK');
        console.error('Error updating settings:', err);
        res.status(500).json({ error: 'Failed to update settings' });
    } finally {
        client.release();
    }
});

// Basic root route
app.get('/', (req, res) => {
    res.send('API is running. Use /api routes.');
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
