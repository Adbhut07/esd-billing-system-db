import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api';

interface House {
  id: string;
  mohallaId: string;
  houseNumber: string;
  consumerCode: string;
  licenseeName: string;
  department?: string;
  mobileNumber?: string;
  email?: string;
  electricityMeterNumber?: string;
  waterMeterNumber?: string;
  licenseFee: number;
  residenceFee: number;
  isActive: boolean;
  createdAt: string;
}

interface HouseState {
  houses: House[];
  currentHouse: House | null;
  loading: boolean;
  error: string | null;
  pagination: { page: number; limit: number; total: number };
  filters: { sector: string | null; status: boolean | null; search: string };
}

const initialState: HouseState = {
  houses: [],
  currentHouse: null,
  loading: false,
  error: null,
  pagination: { page: 1, limit: 50, total: 0 },
  filters: { sector: null, status: true, search: '' }
};

// API Calls
export const fetchHouses = createAsyncThunk(
  'house/fetchHouses',
  async (params: any, { getState, rejectWithValue }: any) => {
    try {
      const state = getState();
      // Skip fetch if data already exists and no filters changed
      if (state.house.houses.length > 0 && !params.search && !params.sector) {
        return state.house;
      }
      const response = await api.get('/houses', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch houses');
    }
  }
);

export const fetchHouseById = createAsyncThunk(
  'house/fetchHouseById',
  async (id: string, { getState, rejectWithValue }: any) => {
    try {
      const state = getState();
      // Skip fetch if data already cached
      if (state.house.currentHouse && state.house.currentHouse.id === id) {
        return state.house.currentHouse;
      }
      const response = await api.get(`/houses/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch house');
    }
  }
);

export const createHouse = createAsyncThunk(
  'house/createHouse',
  async (data: any, { rejectWithValue }: any) => {
    try {
      const response = await api.post('/houses', data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create house');
    }
  }
);

export const updateHouse = createAsyncThunk(
  'house/updateHouse',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }: any) => {
    try {
      const response = await api.put(`/houses/${id}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update house');
    }
  }
);

export const deleteHouse = createAsyncThunk(
  'house/deleteHouse',
  async (id: string, { rejectWithValue }: any) => {
    try {
      await api.delete(`/houses/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete house');
    }
  }
);

export const updateHouseFees = createAsyncThunk(
  'house/updateHouseFees',
  async ({ id, licenseFee, residenceFee }: any, { rejectWithValue }: any) => {
    try {
      const response = await api.put(`/houses/${id}`, { licenseFee, residenceFee });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update fees');
    }
  }
);

const houseSlice = createSlice({
  name: 'house',
  initialState,
  reducers: {
    setFilters: (state, action) => {
      state.filters = action.payload;
      state.pagination.page = 1;
    },
    setPagination: (state, action) => {
      state.pagination = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    }
  },
  extraReducers: (builder) => {
    builder
      // Fetch houses
      .addCase(fetchHouses.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHouses.fulfilled, (state, action) => {
        state.loading = false;
        state.houses = action.payload.data || [];
        state.pagination.total = action.payload.total || 0;
      })
      .addCase(fetchHouses.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Fetch house by ID
      .addCase(fetchHouseById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchHouseById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentHouse = action.payload.data || action.payload;
      })
      .addCase(fetchHouseById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Create house
      .addCase(createHouse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createHouse.fulfilled, (state, action) => {
        state.loading = false;
        state.houses.push(action.payload.data || action.payload);
      })
      .addCase(createHouse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Update house
      .addCase(updateHouse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateHouse.fulfilled, (state, action) => {
        state.loading = false;
        const index = state.houses.findIndex(h => h.id === action.payload.data.id);
        if (index !== -1) {
          state.houses[index] = action.payload.data || action.payload;
        }
        state.currentHouse = action.payload.data || action.payload;
      })
      .addCase(updateHouse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      // Delete house
      .addCase(deleteHouse.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteHouse.fulfilled, (state, action) => {
        state.loading = false;
        state.houses = state.houses.filter(h => h.id !== action.payload);
      })
      .addCase(deleteHouse.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { setFilters, setPagination, clearError } = houseSlice.actions;
export default houseSlice.reducer;
