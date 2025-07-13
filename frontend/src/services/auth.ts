// src/services/auth.ts
import api from "../lip/api";

export async function loginUser(username: string, password: string) {
  const res = await api.post("token/", { username, password });
  localStorage.setItem("accessToken", res.data.access);
  localStorage.setItem("refreshToken", res.data.refresh);
  return res.data;
}

export async function getCurrentUser() {
  const res = await api.get("users/me/");
  return res.data;
}
