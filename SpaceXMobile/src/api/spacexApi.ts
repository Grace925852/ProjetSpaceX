import axios from 'axios';

const spacexApi = axios.create({
  baseURL: 'http://10.0.2.2:8000/api', 
  timeout: 5000,
});

export default spacexApi;