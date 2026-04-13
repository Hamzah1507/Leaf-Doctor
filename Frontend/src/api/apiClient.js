import axios from 'axios';

const BASE_URL = '';

const apiClient = axios.create({
    baseURL: BASE_URL,
    timeout: 60000,
    headers: {
        'Accept': 'application/json',
    },
});

export { BASE_URL };
export default apiClient;
