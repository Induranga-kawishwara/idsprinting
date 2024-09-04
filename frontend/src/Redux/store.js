// src/app/store.js
import { configureStore } from "@reduxjs/toolkit";
import customerReducer from "./customerSlice.js";

const store = configureStore({
  reducer: {
    customers: customerReducer,
  },
});
export default store;
