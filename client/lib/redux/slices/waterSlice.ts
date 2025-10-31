import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api';

interface WaterReading {
  id: string;
  houseId: string;
  month: number;
  year: number;
  waterReading: number;
  consumption: number;
  waterCharge: number;
  createdAt: string;
}

interface WaterState {
  readings: WaterReading[];
  currentReading: WaterReading | null;
  loading: boolean;
  error: string | null;
  uploadProgress: number;
  uploadResults: { success: number; failed: number; errors: string[] };
  pagination: { page: number; limit: number; total: number };
  filters: { sector: string | null; month: number | null; dateRange: any };
}

const initialState: WaterState = {
  readings: [],
  currentReading: null,
  loading: false,
  error: null,
  uploadProgress: 0,
  uploadResults: { success: 0, failed: 0, errors: [] },
  pagination: { page: 1, limit: 50, total: 0 },
  filters: { sector: null, month: null, dateRange: null }
};

export const fetchWaterReadings = createAsyncThunk(
  'water/fetchReadings',
  async (params: any, { rejectWithValue }: any) => {
    try {
      const response = await api.get('/water', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch readings');
    }
  }
);

export const fetchWaterReadingById = createAsyncThunk(
  'water/fetchReadingById',
  async (id: string, { rejectWithValue }: any) => {
    try {
      const response = await api.get(`/water/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch reading');
    }
  }
);

export const uploadSingleWaterReading = createAsyncThunk(
  'water/uploadSingle',
  async (data: any, { rejectWithValue }: any) => {
    try {
      const response = await api.post('/water', data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload reading');
    }
  }
);

export const uploadBulkWaterReadings = createAsyncThunk(
  'water/uploadBulk',
  async (data: any, { rejectWithValue }: any) => {
    try {
      const response = await api.post('/water/bulk', data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to upload bulk readings');
    }
  }
);

export const updateWaterReading = createAsyncThunk(
  'water/updateReading',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }: any) => {
    try {
      const response = await api.put(`/water/${id}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update reading');
    }
  }
);

export const deleteWaterReading = createAsyncThunk(
  'water/deleteReading',
  async (id: string, { rejectWithValue }: any) => {
    try {
      await api.delete(`/water/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete reading');
    }
  }
);

const waterSlice = createSlice({
  name: 'water',
  initialState,
  reducers: {
    setFilters: (state, action: any) => {
      state.filters = action.payload;
      state.pagination.page = 1;
    },
    setPagination: (state, action: any) => {
      state.pagination = action.payload;
    },
    setUploadProgress: (state, action: any) => {
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
      .addCase(fetchWaterReadings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWaterReadings.fulfilled, (state, action: any) => {
        state.loading = false;
        state.readings = action.payload.data || [];
        state.pagination.total = action.payload.total || 0;
      })
      .addCase(fetchWaterReadings.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchWaterReadingById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchWaterReadingById.fulfilled, (state, action: any) => {
        state.loading = false;
        state.currentReading = action.payload.data || action.payload;
      })
      .addCase(fetchWaterReadingById.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(uploadSingleWaterReading.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadSingleWaterReading.fulfilled, (state, action: any) => {
        state.loading = false;
        state.readings.push(action.payload.data || action.payload);
      })
      .addCase(uploadSingleWaterReading.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(uploadBulkWaterReadings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(uploadBulkWaterReadings.fulfilled, (state, action: any) => {
        state.loading = false;
        state.uploadResults = action.payload;
      })
      .addCase(uploadBulkWaterReadings.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateWaterReading.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateWaterReading.fulfilled, (state, action: any) => {
        state.loading = false;
        const index = state.readings.findIndex((r: any) => r.id === action.payload.data.id);
        if (index !== -1) {
          state.readings[index] = action.payload.data || action.payload;
        }
      })
      .addCase(updateWaterReading.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteWaterReading.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteWaterReading.fulfilled, (state, action: any) => {
        state.loading = false;
        state.readings = state.readings.filter((r: any) => r.id !== action.payload);
      })
      .addCase(deleteWaterReading.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { setFilters, setPagination, setUploadProgress, clearError, resetUploadResults } = waterSlice.actions;
export default waterSlice.reducer;
