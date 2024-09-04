import { createSlice } from "@reduxjs/toolkit";
import axios from "axios";

const initialState = {
  customers: [],
  loading: false,
  error: null,
};

const customerSlice = createSlice({
  name: "customer",
  initialState,
  reducers: {
    fetchCustomersStart: (state) => {
      state.loading = true;
    },
    fetchCustomersSuccess: (state, action) => {
      state.customers = action.payload;
      state.loading = false;
      state.error = null;
    },
    fetchCustomersFailure: (state, action) => {
      state.error = action.payload;
      state.loading = false;
    },
    addCustomer: (state, action) => {
      state.customers.unshift(action.payload);
    },
    updateCustomer: (state, action) => {
      state.customers = state.customers.map((customer) =>
        customer.id === action.payload.id ? action.payload : customer
      );
    },
    deleteCustomer: (state, action) => {
      state.customers = state.customers.filter(
        (customer) => customer.id !== action.payload
      );
    },
  },
});

export const {
  fetchCustomersStart,
  fetchCustomersSuccess,
  fetchCustomersFailure,
  addCustomer,
  updateCustomer,
  deleteCustomer,
} = customerSlice.actions;

export const fetchCustomers = () => async (dispatch) => {
  dispatch(fetchCustomersStart());
  try {
    const response = await axios.get(
      "https://idsprinting.vercel.app/customers/"
    );
    const formattedCustomers = response.data.map((customer) => {
      const utcDate = new Date(customer.addedDateAndTime);
      const sltDate = new Date(
        utcDate.toLocaleString("en-US", { timeZone: "Asia/Colombo" })
      );
      return {
        id: customer.id,
        name: customer.name,
        surname: customer.surName,
        email: customer.email,
        phone: customer.contactNumber,
        totalSpent: "100", // Example data
        houseNo: customer.houseNo,
        street: customer.street,
        city: customer.city,
        postalCode: customer.postalcode,
        customerType: customer.customerType,
        addedDate: sltDate.toLocaleDateString("en-US", {
          year: "numeric",
          month: "2-digit",
          day: "2-digit",
        }),
        addedTime: sltDate.toLocaleTimeString("en-US", {
          hour: "2-digit",
          minute: "2-digit",
        }),
      };
    });
    dispatch(fetchCustomersSuccess(formattedCustomers));
  } catch (error) {
    dispatch(fetchCustomersFailure(error.toString()));
  }
};

export const createCustomer = (customerData) => async (dispatch) => {
  try {
    const response = await axios.post(
      "https://idsprinting.vercel.app/customers/customer",
      customerData
    );
    dispatch(addCustomer(response.data));
  } catch (error) {
    console.error("Error adding customer:", error);
  }
};

export const modifyCustomer = (id, customerData) => async (dispatch) => {
  try {
    await axios.put(
      `https://idsprinting.vercel.app/customers/customer/${id}`,
      customerData
    );
    dispatch(updateCustomer({ id, ...customerData }));
  } catch (error) {
    console.error("Error updating customer:", error);
  }
};

export const removeCustomer = (id) => async (dispatch) => {
  try {
    await axios.delete(
      `https://idsprinting.vercel.app/customers/customer/${id}`
    );
    dispatch(deleteCustomer(id));
  } catch (error) {
    console.error("Error deleting customer:", error);
  }
};

export default customerSlice.reducer;
