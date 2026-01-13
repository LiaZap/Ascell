const API_URL = import.meta.env.PROD ? '/api' : '/api'; // Relative path works for both if proxied or served static

export const api = {
    // Logs
    getLogs: async () => {
        try {
            const response = await fetch(`${API_URL}/logs`);
            if (!response.ok) throw new Error('Failed to fetch logs');
            return await response.json();
        } catch (error) {
            console.error('API Error:', error);
            return [];
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
    }
};
