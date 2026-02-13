const API_URL = import.meta.env.VITE_API_URL || '/api';

export const api = {
    // Auth
    login: async (email, password) => {
        try {
            const response = await fetch(`${API_URL}/login`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify({ email, password })
            });
            if (!response.ok) throw new Error('Login failed');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // Logs
    getLogs: async () => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/logs`, {
                headers: token ? { 'Authorization': `Bearer ${token}` } : {}
            });
            if (!response.ok) throw new Error('Failed to fetch logs');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return [];
        }
    },

    createLog: async (logData) => {
        try {
            const token = localStorage.getItem('token');
            const response = await fetch(`${API_URL}/logs`, {
                method: 'POST',
                headers: {
                    'Content-Type': 'application/json',
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {})
                },
                body: JSON.stringify(logData)
            });
            if (!response.ok) throw new Error('Failed to create log');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            // Non-blocking error
            return null;
        }
    },

    // Users
    getUsers: async () => {
        try {
            const response = await fetch(`${API_URL}/users`);
            if (!response.ok) throw new Error('Failed to fetch users');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return [];
        }
    },

    createUser: async (userData) => {
        try {
            const response = await fetch(`${API_URL}/users`, {
                method: 'POST',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(userData)
            });
            if (!response.ok) throw new Error('Failed to create user');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    deleteUser: async (id) => {
        try {
            const response = await fetch(`${API_URL}/users/${id}`, {
                method: 'DELETE'
            });
            if (!response.ok) throw new Error('Failed to delete user');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    },

    // Settings
    getSettings: async () => {
        try {
            const token = localStorage.getItem('token');
            // Prevent caching with timestamp and headers
            const response = await fetch(`${API_URL}/settings?t=${Date.now()}`, {
                headers: {
                    ...(token ? { 'Authorization': `Bearer ${token}` } : {}),
                    'Cache-Control': 'no-cache',
                    'Pragma': 'no-cache'
                }
            });
            if (!response.ok) throw new Error('Failed to fetch settings');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return { webhookUrl: '' }; // Fallback
        }
    },

    updateSettings: async (settings) => {
        try {
            const response = await fetch(`${API_URL}/settings`, {
                method: 'PUT',
                headers: { 'Content-Type': 'application/json' },
                body: JSON.stringify(settings)
            });
            if (!response.ok) throw new Error('Failed to update settings');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            throw error;
        }
    }
};
