import axios from "axios";

const api = axios.create({
  baseURL: "https://ai-interviewer-5.onrender.com",
  withCredentials: true,
});

export const register = async ({ username, email, password }) => {
  const response = await api.post("/api/auth/Register", {
    username,
    email,
    password,
  });

  return response.data;
};

export const login = async ({ email, password }) => {
  const response = await api.post("/api/auth/Login", {
    email,
    password,
  });

  return response.data;
};

export const logout = async () => {
  const response = await api.get("/api/auth/Logout");

  return response.data;
};

export const getme = async () => {
  const response = await api.get("/api/auth/Get-me");

  return response.data;
};