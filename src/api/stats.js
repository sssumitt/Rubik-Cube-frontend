import axios from "axios";

const BASE_URL = "https://rubik-cube-backend-multiplayer.onrender.com/api/stats";
// const BASE_URL = "http://localhost:5000/api/stats";

const api = axios.create({
    baseURL: BASE_URL,
    withCredentials: true,
});

// Use the same CSRF logic as auth.js if needed, but usually GET requests don't need CSRF token if they don't modify state.
// However, if we add POST requests later, we might need it.
// For now, just GET.

export const getDashboardData = async () => {
    const response = await api.get("/dashboard");
    return response.data;
};

export const getLeaderboard = async () => {
    const response = await api.get("/leaderboard");
    return response.data;
};
