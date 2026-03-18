export const productInitialState = {
  items: [],
};

export const setProductsState = (state, items) => ({
  ...state,
  items,
});
