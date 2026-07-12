import axios from 'axios';

const API_BASE = '/api/ai/knowledge';

export const fetchDashboardData = async () => {
  const res = await axios.get(`${API_BASE}/dashboard`);
  return res.data;
};

export const fetchDocuments = async (query = {}) => {
  const params = new URLSearchParams(query).toString();
  const res = await axios.get(`${API_BASE}?${params}`);
  return res.data;
};

export const uploadDocument = async (formData) => {
  const res = await axios.post(`${API_BASE}/upload`, formData, {
    headers: { 'Content-Type': 'multipart/form-data' }
  });
  return res.data;
};

export const fetchDocumentDetails = async (id) => {
  const res = await axios.get(`${API_BASE}/${id}`);
  return res.data;
};

export const deleteDocument = async (id) => {
  const res = await axios.delete(`${API_BASE}/${id}`);
  return res.data;
};

export const searchPreview = async (query) => {
  const res = await axios.post(`${API_BASE}/search-preview`, { query });
  return res.data;
};
