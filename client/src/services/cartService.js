import api from "./api";

export const getCart = async () => {
  const { data } = await api.get("/cart");
  return data;
};

export const addToCart = async (payload) => {
  const { data } = await api.post("/cart", payload);
  return data;
};

export const updateCartItem = async (productId, payload) => {
  const { data } = await api.put(`/cart/${productId}`, payload);
  return data;
};

export const removeCartItem = async (productId) => {
  const { data } = await api.delete(`/cart/${productId}`);
  return data;
};

export const clearCart = async () => {
  const { data } = await api.delete("/cart");
  return data;
};
