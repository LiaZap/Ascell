import express from 'express';
import path from 'path';
import cors from 'cors';
import pg from 'pg';
import dotenv from 'dotenv';
import { fileURLToPath } from 'url';

dotenv.config();

const { Pool } = pg;

const app = express();
const port = process.env.PORT || 3000;

// Fix __dirname for ES Modules
const __filename = fileURLToPath(import.meta.url);
const __dirname = path.dirname(__filename);

// Database Connection
const pool = new Pool({
    connectionString: process.env.DATABASE_URL,
    ssl: process.env.NODE_ENV === 'production' ? { rejectUnauthorized: false } : false
});

// Middleware
app.use(cors());
app.use(express.json());

// Serve Static Files (Vite Build)
app.use(express.static(path.join(__dirname, 'dist')));

// API Endpoints

// 1. Get Logs
app.get('/api/logs', async (req, res) => {
    try {
        // Check if table exists, if not return mock/empty to avoid crash on fresh deploy
        // In production, you'd run migrations. Here we'll just try to query.
        const result = await pool.query('SELECT * FROM logs ORDER BY created_at DESC LIMIT 100');
        res.json(result.rows);
    } catch (err) {
        console.error('Error fetching logs:', err);
        // Fallback Mock Data for Demo if DB fails or is empty
        res.json([
            { id: 1, date: '13/01/2026 10:45', agent: 'Sistema', client: 'Exemplo Falha Conexão DB', type: 'Alerta', status: 'Erro', protocol: 'ERR-001' }
        ]);
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

// 3. Create User (Mock Implementation for now, or real Insert)
app.post('/api/users', async (req, res) => {
    const { name, email, role } = req.body;
    try {
        const result = await pool.query(
            'INSERT INTO users (name, email, role, status) VALUES ($1, $2, $3, $4) RETURNING *',
            [name, email, role, 'Ativo']
        );
        res.json(result.rows[0]);
    } catch (err) {
        console.error(err);
        res.status(500).json({ error: 'Failed to create user' });
    }
});

// Handle SPA Routing - Send all other requests to index.html
app.get(/.*/, (req, res) => {
    res.sendFile(path.join(__dirname, 'dist', 'index.html'));
});

app.listen(port, () => {
    console.log(`Server running on port ${port}`);
});
