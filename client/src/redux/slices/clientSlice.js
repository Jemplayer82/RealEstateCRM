import { createAsyncThunk, createSlice } from "@reduxjs/toolkit";
import { getApi } from "services/api";

export const fetchClientData = createAsyncThunk(
  "fetchClientData",
  async () => {
    const user = JSON.parse(localStorage.getItem("user"));
    try {
      const response = await getApi(
        user.role === "superAdmin"
          ? "api/client/"
          : `api/client/?createBy=${user._id}`,
      );
      return response.data;
    } catch (error) {
      throw error;
    }
  },
);

const getClientSlice = createSlice({
  name: "clientData",
  initialState: {
    data: [],
    isLoading: false,
    error: "",
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchClientData.pending, (state) => {
        state.isLoading = true;
      })
      .addCase(fetchClientData.fulfilled, (state, action) => {
        state.isLoading = false;
        state.data = action.payload;
        state.error = "";
      })
      .addCase(fetchClientData.rejected, (state, action) => {
        state.isLoading = false;
        state.data = [];
        state.error = action.error.message;
      });
  },
});

export default getClientSlice.reducer;
