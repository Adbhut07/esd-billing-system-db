import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api';

interface Mohalla {
  id: string;
  sectorNumber: string;
  sectorName: string;
  totalHouses: number;
  activeHouses: number;
  createdAt: string;
}

interface MohallaState {
  mohallas: Mohalla[];
  currentMohalla: Mohalla | null;
  loading: boolean;
  error: string | null;
  pagination: { page: number; limit: number; total: number };
  filters: { search: string };
}

const initialState: MohallaState = {
  mohallas: [],
  currentMohalla: null,
  loading: false,
  error: null,
  pagination: { page: 1, limit: 50, total: 0 },
  filters: { search: '' }
};

export const fetchMohallas = createAsyncThunk(
  'mohalla/fetchMohallas',
  async (params: any, { getState, rejectWithValue }: any) => {
    try {
      const state = getState();
      // Skip fetch if data already exists and no filters changed
      if (state.mohalla.mohallas.length > 0 && !params.search && !params.sector) {
        return state.mohalla;
      }
      const response = await api.get('/mohallas', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sectors');
    }
  }
);

export const fetchMohallaById = createAsyncThunk(
  'mohalla/fetchMohallaById',
  async (id: string, { getState, rejectWithValue }: any) => {
    try {
      const state = getState();
      // Skip fetch if data already cached
      if (state.mohalla.currentMohalla && state.mohalla.currentMohalla.id === id) {
        return state.mohalla.currentMohalla;
      }
      const response = await api.get(`/mohallas/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch sector');
    }
  }
);

export const createMohalla = createAsyncThunk(
  'mohalla/createMohalla',
  async (data: any, { rejectWithValue }: any) => {
    try {
      const response = await api.post('/mohallas', data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create sector');
    }
  }
);

export const updateMohalla = createAsyncThunk(
  'mohalla/updateMohalla',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }: any) => {
    try {
      const response = await api.put(`/mohallas/${id}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update sector');
    }
  }
);

export const deleteMohalla = createAsyncThunk(
  'mohalla/deleteMohalla',
  async (id: string, { rejectWithValue }: any) => {
    try {
      await api.delete(`/mohallas/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete sector');
    }
  }
);

const mohallaSlice = createSlice({
  name: 'mohalla',
  initialState,
  reducers: {
    setFilters: (state, action: any) => {
      state.filters = action.payload;
      state.pagination.page = 1;
    },
    setPagination: (state, action: any) => {
      state.pagination = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchMohallas.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMohallas.fulfilled, (state, action: any) => {
        state.loading = false;
        state.mohallas = action.payload.data || [];
        state.pagination.total = action.payload.total || 0;
      })
      .addCase(fetchMohallas.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchMohallaById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMohallaById.fulfilled, (state, action: any) => {
        state.loading = false;
        state.currentMohalla = action.payload.data || action.payload;
      })
      .addCase(fetchMohallaById.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createMohalla.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createMohalla.fulfilled, (state, action: any) => {
        state.loading = false;
        state.mohallas.push(action.payload.data || action.payload);
      })
      .addCase(createMohalla.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateMohalla.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateMohalla.fulfilled, (state, action: any) => {
        state.loading = false;
        const index = state.mohallas.findIndex((m: any) => m.id === action.payload.data.id);
        if (index !== -1) {
          state.mohallas[index] = action.payload.data || action.payload;
        }
      })
      .addCase(updateMohalla.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteMohalla.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteMohalla.fulfilled, (state, action: any) => {
        state.loading = false;
        state.mohallas = state.mohallas.filter((m: any) => m.id !== action.payload);
      })
      .addCase(deleteMohalla.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { setFilters, setPagination, clearError } = mohallaSlice.actions;
export default mohallaSlice.reducer;
