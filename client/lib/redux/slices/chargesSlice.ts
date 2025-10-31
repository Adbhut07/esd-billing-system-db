import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api';

interface Charges {
  id: string;
  fixedCharge: number;
  electricityCharge: number;
  electricityDuty: number;
  waterCharge: number;
  maintenanceCharge: number;
  licenseFee: number;
  residenceFee: number;
  updatedAt: string;
}

interface ChargesState {
  charges: Charges | null;
  loading: boolean;
  error: string | null;
  success: boolean;
  lastUpdated: string | null;
}

const initialState: ChargesState = {
  charges: null,
  loading: false,
  error: null,
  success: false,
  lastUpdated: null
};

export const fetchCharges = createAsyncThunk(
  'charges/fetchCharges',
  async (_, { rejectWithValue }: any) => {
    try {
      const response = await api.get('/charges');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch charges');
    }
  }
);

export const updateCharges = createAsyncThunk(
  'charges/updateCharges',
  async (data: any, { rejectWithValue }: any) => {
    try {
      const response = await api.post('/charges', data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update charges');
    }
  }
);

const chargesSlice = createSlice({
  name: 'charges',
  initialState,
  reducers: {
    clearError: (state) => {
      state.error = null;
    },
    clearSuccess: (state) => {
      state.success = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchCharges.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCharges.fulfilled, (state, action: any) => {
        state.loading = false;
        state.charges = action.payload.data || action.payload;
      })
      .addCase(fetchCharges.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateCharges.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateCharges.fulfilled, (state, action: any) => {
        state.loading = false;
        state.charges = action.payload.data || action.payload;
        state.success = true;
        state.lastUpdated = new Date().toISOString();
      })
      .addCase(updateCharges.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      });
  }
});

export const { clearError, clearSuccess } = chargesSlice.actions;
export default chargesSlice.reducer;
