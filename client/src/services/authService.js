import api from "./api";

export const registerUser = async (payload) => {
  const { data } = await api.post("/auth/register", payload);
  return data;
};

export const loginUser = async (payload) => {
  const { data } = await api.post("/auth/login", payload);
  return data;
};

export const forgotPassword = async (payload) => {
  const { data } = await api.post("/auth/forgot-password", payload);
  return data;
};

export const resetPassword = async (payload) => {
  const { data } = await api.post("/auth/reset-password", payload);
  return data;
};

export const getFarmers = async () => {
  const { data } = await api.get("/farmer/profile");
  return data;
};

export const createFarmerByAdmin = async (payload) => {
  const { data } = await api.post("/auth/admin/farmers", payload);
  return data;
};
