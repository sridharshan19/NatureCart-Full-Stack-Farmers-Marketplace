export const authInitialState = {
  user: null,
  token: null,
};

export const setAuthState = (state, payload) => ({
  ...state,
  user: payload.user,
  token: payload.token,
});

export const clearAuthState = () => authInitialState;
