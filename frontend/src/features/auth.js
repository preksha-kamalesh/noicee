// frontend/features/auth.js
import axios from 'axios';

export const isAuthenticated = async () => {
    try 
    {
        const response = await axios.get('http://localhost:9000/api/check-auth', { withCredentials: true });
        return response.status === 200;
    } 
    catch (error) {return false;}
};

export const logout = async () => {
    try {
        await axios.post('http://localhost:9000/logout', {}, { withCredentials: true });
        return true;
    } catch (error) {
        console.error("Logout failed:", error);
        return false;
    }
};
