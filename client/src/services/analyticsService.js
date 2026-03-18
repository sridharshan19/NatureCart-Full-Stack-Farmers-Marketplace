import api from "./api";

const buildQuery = (filters = {}) => {
  const params = new URLSearchParams();

  Object.entries(filters).forEach(([key, value]) => {
    if (value) {
      params.append(key, value);
    }
  });

  const query = params.toString();
  return query ? `?${query}` : "";
};

export const getAdminAnalytics = async (filters = {}) => {
  const { data } = await api.get(`/admin/analytics${buildQuery(filters)}`);
  return data;
};

export const downloadAdminAnalyticsCsv = async (filters = {}) => {
  const response = await api.get(`/admin/analytics/export${buildQuery(filters)}`, {
    responseType: "blob",
  });

  const disposition = response.headers["content-disposition"] || "";
  const filenameMatch = disposition.match(/filename="([^"]+)"/i);

  return {
    blob: response.data,
    filename: filenameMatch?.[1] || "naturecart-analytics-report.csv",
  };
};
