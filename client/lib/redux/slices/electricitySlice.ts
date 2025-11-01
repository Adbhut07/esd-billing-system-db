import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api';

interface ElectricityReading {
  id: string;
  houseId: string;
  month: number;
  year: number;
  importReading: number;
  exportReading: number;
  consumption: number;
  billedEnergy: number;
  carryForward: number;
  maxDemand?: number;
  fixedCharge: number;
  electricityCharge: number;
  electricityDuty: number;
  maintenanceCharge: number;
  createdAt: string;
}

interface ElectricityState {
  readings: ElectricityReading[];
  currentReading: ElectricityReading | null;
  loading: boolean;
  error: string | null;
  uploadProgress: number;
  uploadResults: { success: number; failed: number; errors: string[] };
  pagination: { page: number; limit: number; total: number };
  filters: { sector: string | null; month: number | null; dateRange: any };
}

const initialState: ElectricityState = {
  readings: [],
  currentReading: null,
  loading: false,
  error: null,
  uploadProgress: 0,
  uploadResults: { success: 0, failed: 0, errors: [] },
  pagination: { page: 1, limit: 50, total: 0 },
  filters: { sector: null, month: null, dateRange: null }
};

// API Calls
export const fetchElectricityReadings = createAsyncThunk(
  'electricity/fetchReadings',
  async (params: any, { rejectWithValue }: any) => {
    try {
      const response = await api.get('/electricity', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch readings');
    }
  }
);

export const fetchElectricityReadingById = createAsyncThunk(
  'electricity/fetchReadingById',
  async (id: string, { rejectWithValue }: any) => {
    try {
      const response = await api.get(`/electricity/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reading');
    }
  }
);

export const uploadSingleElectricityReading = createAsyncThunk(
  'electricity/uploadSingle',
  async (data: any, { rejectWithValue }: any) => {
    try {
      const response = await api.post('/electricity', data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload reading');
    }
  }
);

export const uploadBulkElectricityReadings = createAsyncThunk(
  'electricity/uploadBulk',
  async (data: any, { rejectWithValue }: any) => {
    try {
      const response = await api.post('/electricity/bulk-upload', data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload bulk readings');
    }
  }
);

export const updateElectricityReading = createAsyncThunk(
  'electricity/updateReading',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }: any) => {
    try {
      const response = await api.put(`/electricity/${id}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update reading');
    }
  }
);

export const deleteElectricityReading = createAsyncThunk(
  'electricity/deleteReading',
  async (id: string, { rejectWithValue }: any) => {
    try {
      await api.delete(`/electricity/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete reading');
    }
  }
);

export const recalculateElectricityConsumption = createAsyncThunk(
  'electricity/recalculate',
  async (id: string, { rejectWithValue }: any) => {
    try {
      const response = await api.post(`/electricity/${id}/recalculate`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to recalculate');
    }
  }
);

const electricitySlice = createSlice({
  name: 'electricity',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = action.payload;
      state.pagination.page = 1;
    },
    setPagination: (state, action) => {
      state.pagination = action.payload;
    },
    setUploadProgress: (state, action) => {
      state.uploadProgress = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetUploadResults: (state) => {
      state.uploadResults = { success: 0, failed: 0, errors: [] };
      state.uploadProgress = 0;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch readings
      .addCase(fetchElectricityReadings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchElectricityReadings.fulfilled, (state, action) => {
        state.loading = false;
        state.readings = action.payload.data || [];
        state.pagination.total = action.payload.total || 0;
      })
      .addCase(fetchElectricityReadings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch reading by ID
      .addCase(fetchElectricityReadingById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchElectricityReadingById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentReading = action.payload.data || action.payload;
      })
      .addCase(fetchElectricityReadingById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Upload single
      .addCase(uploadSingleElectricityReading.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadSingleElectricityReading.fulfilled, (state, action) => {
        state.loading = false;
        state.readings.push(action.payload.data || action.payload);
      })
      .addCase(uploadSingleElectricityReading.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Upload bulk
      .addCase(uploadBulkElectricityReadings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadBulkElectricityReadings.fulfilled, (state, action) => {
        state.loading = false;
        state.uploadResults = action.payload;
      })
      .addCase(uploadBulkElectricityReadings.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update reading
      .addCase(updateElectricityReading.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateElectricityReading.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.readings.findIndex(r => r.id === action.payload.data.id);
        if (index !== -1) {
          state.readings[index] = action.payload.data || action.payload;
        }
      })
      .addCase(updateElectricityReading.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete reading
      .addCase(deleteElectricityReading.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteElectricityReading.fulfilled, (state, action) => {
        state.loading = false;
        state.readings = state.readings.filter(r => r.id !== action.payload);
      })
      .addCase(deleteElectricityReading.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { setFilters, setPagination, setUploadProgress, clearError, resetUploadResults } = electricitySlice.actions;
export default electricitySlice.reducer;
