import { createSlice } from '@reduxjs/toolkit';

export const authSlice = createSlice({
  name: 'auth',
  initialState: {
    uploadedImage: null,
    aadhaarDetails: null,
  },
  reducers: {
    setUploadedImage: (state, action) => {
      state.uploadedImage = action.payload;
    },
    setAadhaarDetails: (state, action) => {
      state.aadhaarDetails = action.payload;
    },
  },
});

export const { setUploadedImage, setAadhaarDetails } = authSlice.actions;

export default authSlice.reducer;
