import axios from 'axios';

const API_BASE_URL = '/api';

const apiClient = axios.create({
    baseURL: API_BASE_URL,
    timeout: 5000,
    headers: {
        'Accept': 'application/json',
        'Content-Type': 'application/json',
    },
});

const handleApiError = (error) => {
    if (error.response) {
        const message = error.response.data?.error || `HTTP ${error.response.status}`;
        throw new Error(message);
    } else if (error.request) {
        throw new Error('Network error - no response received');
    } else {
        throw new Error(error.message || 'Unknown error occurred');
    }
};

export const getRate = async (code, date = null) => {
    try {
        const params = {};
        if (date) {
            params.date = date;
        }
        
        const response = await apiClient.get(`/rates/${code}`, { params });
        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};

export const getHistory = async (code, date = null) => {
    try {
        const params = {};
        if (date) {
            params.date = date;
        }
        
        const response = await apiClient.get(`/rates/${code}/history`, { params });
        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};

export const getCantorQuote = async (code, side, date = null) => {
    try {
        const params = { side };
        if (date) {
            params.date = date;
        }
        
        const response = await apiClient.get(`/cantor/quote/${code}`, { params });
        return response.data;
    } catch (error) {
        handleApiError(error);
    }
};

export default {
    getRate,
    getHistory,
    getCantorQuote,
};
