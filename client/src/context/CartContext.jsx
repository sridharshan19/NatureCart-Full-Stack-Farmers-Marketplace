/* eslint-disable react-refresh/only-export-components */
import { createContext, useCallback, useContext, useEffect, useMemo, useState } from "react";
import {
  addToCart,
  clearCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from "../services/cartService";
import { getErrorMessage, getStoredUser } from "../utils/helpers";

const CartContext = createContext(null);

export function CartProvider({ children }) {
  const user = getStoredUser();
  const userId = user?._id || user?.id || "";
  const userRole = user?.role || "";
  const [cart, setCart] = useState({ items: [], totalItems: 0, totalAmount: 0 });
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState("");

  const refreshCart = useCallback(async () => {
    if (!userId || userRole !== "consumer") {
      setCart({ items: [], totalItems: 0, totalAmount: 0 });
      setLoading(false);
      setError("");
      return;
    }

    setLoading(true);
    setError("");

    try {
      const data = await getCart();
      setCart(data || { items: [], totalItems: 0, totalAmount: 0 });
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [userId, userRole]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addItem = useCallback(async (productId, quantity) => {
    const data = await addToCart({ productId, quantity });
    setCart(data);
    return data;
  }, []);

  const updateItem = useCallback(async (productId, quantity) => {
    const data = await updateCartItem(productId, { quantity });
    setCart(data);
    return data;
  }, []);

  const removeItem = useCallback(async (productId) => {
    const data = await removeCartItem(productId);
    setCart(data);
    return data;
  }, []);

  const clearAll = useCallback(async () => {
    const data = await clearCart();
    setCart(data);
    return data;
  }, []);

  const value = useMemo(
    () => ({
      cart,
      loading,
      error,
      refreshCart,
      addItem,
      updateItem,
      removeItem,
      clearAll,
    }),
    [cart, loading, error, refreshCart, addItem, updateItem, removeItem, clearAll]
  );

  return <CartContext.Provider value={value}>{children}</CartContext.Provider>;
}

export function useCartContext() {
  const context = useContext(CartContext);
  if (!context) {
    throw new Error("useCartContext must be used within CartProvider.");
  }
  return context;
}
