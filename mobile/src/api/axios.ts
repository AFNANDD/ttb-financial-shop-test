import axios from 'axios';

const api = axios.create({
  baseURL: 'http://10.202.239.242:5033/api', // Replace with your API base URL
  headers: {
    'Content-Type': 'application/json',
  },
});

export default api;