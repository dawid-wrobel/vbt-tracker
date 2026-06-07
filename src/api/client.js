import axios from 'axios';

const BASE_URL = 'https://web-production-90596.up.railway.app/api';

const client = axios.create({ baseURL: BASE_URL });

// Hardcoded single user — run register once then paste token here
const SINGLE_USER_TOKEN = 'eyJhbGciOiJIUzI1NiIsInR5cCI6IkpXVCJ9.eyJpZCI6IjZhMjUyNGM5Yzk2NmMyYmNjOTg2Y2QwNSIsImlhdCI6MTc4MDgxOTE0NSwiZXhwIjoxNzgzNDExMTQ1fQ.OpDvo36rVSXAqFXzstPhcGISIqbmp017_O2rUZ76t4w';

client.interceptors.request.use((config) => {
  config.headers.Authorization = `Bearer ${SINGLE_USER_TOKEN}`;
  return config;
});

export const api = {
  getExercises: () => client.get('/exercises'),
  startSession: (data) => client.post('/sessions/start', data),
  addRep: (data) => client.post('/sessions/rep', data),
  finishSession: (id) => client.put(`/sessions/${id}/finish`),
  getSessions: () => client.get('/sessions'),
  getSession: (id) => client.get(`/sessions/${id}`),
  exportSession: (id, format) => client.get(`/sessions/${id}/export?format=${format}`),
};

export default client;