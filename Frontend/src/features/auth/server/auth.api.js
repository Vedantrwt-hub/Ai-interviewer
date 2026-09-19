import axios from "axios";

const api = axios.create({
  baseURL: "http://localhost:3000",
  withCredentials: true,
});

export const register = async ({ username, email, password }) => {
  try {
    const response = await api.post("/api/auth/Register", {
      username, email, password,});

    return response.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const login = async ({ email, password }) => {
  try {
    const response = await api.post("/api/auth/Login", {
      email,
      password,
    });

    return response.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const logout = async () => {
  try {
    const response = await api.get("/api/auth/Logout");

    return response.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
};

export const getme = async () => {
  try {
    const response = await api.get("/api/auth/Get-me");

    return response.data;
  } catch (err) {
    console.log(err);
    throw err;
  }
};