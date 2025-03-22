import { createSlice } from "@reduxjs/toolkit";

const initialState = {
  currentUser: null,
  isLoggedIn: false,
};

const userSlice = createSlice({
  name: "user",
  initialState,
  reducers: {
    login(state, action) {
      console.log("login", action.payload);
      state.currentUser = action.payload;
      state.isLoggedIn = true;
    },
    logout(state) {
      console.log("logout");
      state.currentUser = null;
      state.isLoggedIn = false;
    },
  },
});

export default userSlice.reducer;
export const { login, logout } = userSlice.actions;