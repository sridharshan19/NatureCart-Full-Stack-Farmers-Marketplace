import { useCallback, useEffect, useState } from "react";
import {
  addToCart,
  clearCart,
  getCart,
  removeCartItem,
  updateCartItem,
} from "../services/cartService";
import { getErrorMessage, getStoredUser } from "../utils/helpers";

export function useCart() {
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
      setCart(data);
    } catch (err) {
      setError(getErrorMessage(err));
    } finally {
      setLoading(false);
    }
  }, [userId, userRole]);

  useEffect(() => {
    refreshCart();
  }, [refreshCart]);

  const addItem = async (productId, quantity) => {
    const data = await addToCart({ productId, quantity });
    setCart(data);
    return data;
  };

  const updateItem = async (productId, quantity) => {
    const data = await updateCartItem(productId, { quantity });
    setCart(data);
    return data;
  };

  const removeItem = async (productId) => {
    const data = await removeCartItem(productId);
    setCart(data);
    return data;
  };

  const clearAll = async () => {
    const data = await clearCart();
    setCart(data);
    return data;
  };

  return {
    cart,
    loading,
    error,
    refreshCart,
    addItem,
    updateItem,
    removeItem,
    clearAll,
  };
}
