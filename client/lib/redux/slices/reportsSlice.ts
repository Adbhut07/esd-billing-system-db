import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api';

interface ReportsState {
  metrics: { totalRevenue: number; collectionRate: number; pending: number; overdue: number };
  chartData: { monthlyRevenue: any[]; billStatus: any[]; topPending: any[]; bySector: any[] };
  collectionData: any[];
  pendingData: any[];
  arrearsData: any[];
  recentActivity: any[];
  loading: boolean;
  error: string | null;
  pagination: { page: number; limit: number; total: number };
  filters: { sector: string | null; dateRange: any; daysOverdue: number | null; minAmount: number | null };
}

const initialState: ReportsState = {
  metrics: { totalRevenue: 0, collectionRate: 0, pending: 0, overdue: 0 },
  chartData: { monthlyRevenue: [], billStatus: [], topPending: [], bySector: [] },
  collectionData: [],
  pendingData: [],
  arrearsData: [],
  recentActivity: [],
  loading: false,
  error: null,
  pagination: { page: 1, limit: 50, total: 0 },
  filters: { sector: null, dateRange: null, daysOverdue: null, minAmount: null }
};

export const fetchMetrics = createAsyncThunk(
  'reports/fetchMetrics',
  async (_, { rejectWithValue }: any) => {
    try {
      const response = await api.get('/reports/metrics');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch metrics');
    }
  }
);

export const fetchCharts = createAsyncThunk(
  'reports/fetchCharts',
  async (_, { rejectWithValue }: any) => {
    try {
      const response = await api.get('/reports/charts');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch charts');
    }
  }
);

export const fetchRecentActivity = createAsyncThunk(
  'reports/fetchActivity',
  async (_, { rejectWithValue }: any) => {
    try {
      const response = await api.get('/reports/activity');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch activity');
    }
  }
);

export const fetchCollectionReport = createAsyncThunk(
  'reports/fetchCollection',
  async (params: any, { rejectWithValue }: any) => {
    try {
      const response = await api.get('/reports/collection', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch collection report');
    }
  }
);

export const fetchPendingReport = createAsyncThunk(
  'reports/fetchPending',
  async (params: any, { rejectWithValue }: any) => {
    try {
      const response = await api.get('/reports/pending', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch pending report');
    }
  }
);

export const fetchArrearsReport = createAsyncThunk(
  'reports/fetchArrears',
  async (params: any, { rejectWithValue }: any) => {
    try {
      const response = await api.get('/reports/arrears', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch arrears report');
    }
  }
);

const reportsSlice = createSlice({
  name: 'reports',
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
      .addCase(fetchMetrics.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchMetrics.fulfilled, (state, action: any) => {
        state.loading = false;
        state.metrics = action.payload.data || action.payload;
      })
      .addCase(fetchMetrics.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCharts.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchCharts.fulfilled, (state, action: any) => {
        state.loading = false;
        state.chartData = action.payload.data || action.payload;
      })
      .addCase(fetchCharts.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchRecentActivity.pending, (state) => {
        state.loading = true;
      })
      .addCase(fetchRecentActivity.fulfilled, (state, action: any) => {
        state.loading = false;
        state.recentActivity = action.payload.data || [];
      })
      .addCase(fetchRecentActivity.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchCollectionReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchCollectionReport.fulfilled, (state, action: any) => {
        state.loading = false;
        state.collectionData = action.payload.data || [];
        state.pagination.total = action.payload.total || 0;
      })
      .addCase(fetchCollectionReport.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchPendingReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchPendingReport.fulfilled, (state, action: any) => {
        state.loading = false;
        state.pendingData = action.payload.data || [];
        state.pagination.total = action.payload.total || 0;
      })
      .addCase(fetchPendingReport.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchArrearsReport.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchArrearsReport.fulfilled, (state, action: any) => {
        state.loading = false;
        state.arrearsData = action.payload.data || [];
        state.pagination.total = action.payload.total || 0;
      })
      .addCase(fetchArrearsReport.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { setFilters, setPagination, clearError } = reportsSlice.actions;
export default reportsSlice.reducer;
