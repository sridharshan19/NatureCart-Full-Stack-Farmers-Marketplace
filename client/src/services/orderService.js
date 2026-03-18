import api from "./api";

export const placeOrder = async (payload) => {
  const { data } = await api.post("/orders", payload);
  return data;
};

export const getConsumerOrders = async () => {
  const { data } = await api.get("/orders");
  return data;
};

export const getFarmerOrders = async (farmerId) => {
  const query = farmerId ? `?farmerId=${farmerId}` : "";
  const { data } = await api.get(`/farmer/orders${query}`);
  return data;
};

export const updateOrderStatus = async (orderId, status) => {
  const { data } = await api.put(`/farmer/orders/${orderId}`, { status });
  return data;
};
