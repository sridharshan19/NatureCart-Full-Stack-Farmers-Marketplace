import { STORAGE_KEYS } from "./constants";

export const formatCurrency = (value) =>
  `Rs. ${Number(value || 0).toFixed(2)}`;

export const getErrorMessage = (error) =>
  error?.response?.data?.msg ||
  error?.response?.data?.message ||
  error?.response?.data?.error ||
  error?.message ||
  "Something went wrong. Please try again.";

export const validateRequiredFields = (fields) => {
  const missingField = fields.find(
    ({ value }) => value === undefined || value === null || String(value).trim() === ""
  );

  return missingField ? `${missingField.label} is required.` : "";
};

export const storeAuthData = (data) => {
  localStorage.setItem(STORAGE_KEYS.token, data.token);
  localStorage.setItem(STORAGE_KEYS.user, JSON.stringify(data.user));
};

export const getStoredUser = () => {
  const raw = localStorage.getItem(STORAGE_KEYS.user);

  if (!raw) {
    return null;
  }

  try {
    return JSON.parse(raw);
  } catch {
    return null;
  }
};

export const clearAuthStorage = () => {
  localStorage.removeItem(STORAGE_KEYS.token);
  localStorage.removeItem(STORAGE_KEYS.user);
};
