import api from "./api";

export const getProducts = async () => {
  const { data } = await api.get("/products");
  return data;
};

export const createProduct = async (payload) => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      formData.append(key, value);
    }
  });

  const { data } = await api.post("/products", formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });
  return data;
};

export const getManagedProducts = async (farmerId) => {
  const query = farmerId ? `?farmerId=${farmerId}` : "";
  const { data } = await api.get(`/farmer/products${query}`);
  return data;
};

export const deleteManagedProduct = async (productId) => {
  const { data } = await api.delete(`/farmer/products/${productId}`);
  return data;
};

export const updateManagedProduct = async (productId, payload) => {
  const formData = new FormData();

  Object.entries(payload).forEach(([key, value]) => {
    if (value !== undefined && value !== null && value !== "") {
      formData.append(key, value);
    }
  });

  const { data } = await api.put(`/farmer/products/${productId}`, formData, {
    headers: {
      "Content-Type": "multipart/form-data",
    },
  });

  return data;
};
