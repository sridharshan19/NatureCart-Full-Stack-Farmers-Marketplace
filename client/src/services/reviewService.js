import api from "./api";

export const getReviews = async () => {
  const { data } = await api.get("/reviews");
  return data;
};

export const createReview = async (payload) => {
  const { data } = await api.post("/reviews", payload);
  return data;
};
