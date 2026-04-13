import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getApi } from "../../services/api";

export const fetchClientCustomFiled = createAsyncThunk(
  "fetchClientCustomFiled",
  async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    try {
      const response = await getApi(`api/custom-field/?moduleName=Clients`);
      return response;
    } catch (error) {
      throw error;
    }
  },
);

const clientCustomFiledSlice = createSlice({
  name: "clientCustomFiledData",
  initialState: {
    data: [],
    isLoading: false,
    error: "",
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClientCustomFiled.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchClientCustomFiled.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
        state.error = "";
      })
      .addCase(fetchClientCustomFiled.rejected, (state, action) => {
        state.isLoading = false;
        state.data = [];
        state.error = action.error.message;
      });
  },
});

export default clientCustomFiledSlice.reducer;
