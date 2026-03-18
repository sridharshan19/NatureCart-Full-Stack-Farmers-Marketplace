export const cartInitialState = {
  items: [],
  totalItems: 0,
  totalAmount: 0,
};

export const setCartState = (state, payload) => ({
  ...state,
  ...payload,
});

export const clearCartState = () => cartInitialState;
