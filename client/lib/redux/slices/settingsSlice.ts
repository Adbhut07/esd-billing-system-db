import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api';

interface Settings {
  systemName: string;
  financialYearStartMonth: number;
  penaltyPercentage: number;
  defaultPageSize: number;
  emailNotifications: boolean;
  smsNotifications: boolean;
}

interface AuditLog {
  id: string;
  admin: string;
  action: string;
  entity: string;
  details: string;
  timestamp: string;
  ipAddress: string;
}

interface SettingsState {
  settings: Settings | null;
  auditLogs: AuditLog[];
  loading: boolean;
  error: string | null;
  success: boolean;
  pagination: { page: number; limit: number; total: number };
  filters: { admin: string | null; action: string | null; dateRange: any };
}

const initialState: SettingsState = {
  settings: null,
  auditLogs: [],
  loading: false,
  error: null,
  success: false,
  pagination: { page: 1, limit: 50, total: 0 },
  filters: { admin: null, action: null, dateRange: null }
};

export const fetchSettings = createAsyncThunk(
  'settings/fetchSettings',
  async (_, { rejectWithValue }: any) => {
    try {
      const response = await api.get('/settings');
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch settings');
    }
  }
);

export const updateSettings = createAsyncThunk(
  'settings/updateSettings',
  async (data: any, { rejectWithValue }: any) => {
    try {
      const response = await api.post('/settings', data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update settings');
    }
  }
);

export const fetchAuditLogs = createAsyncThunk(
  'settings/fetchAuditLogs',
  async (params: any, { rejectWithValue }: any) => {
    try {
      const response = await api.get('/audit-log', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch audit logs');
    }
  }
);

const settingsSlice = createSlice({
  name: 'settings',
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
    },
    clearSuccess: (state) => {
      state.success = false;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchSettings.fulfilled, (state, action: any) => {
        state.loading = false;
        state.settings = action.payload.data || action.payload;
      })
      .addCase(fetchSettings.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateSettings.pending, (state) => {
        state.loading = true;
        state.error = null;
        state.success = false;
      })
      .addCase(updateSettings.fulfilled, (state, action: any) => {
        state.loading = false;
        state.settings = action.payload.data || action.payload;
        state.success = true;
      })
      .addCase(updateSettings.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
        state.success = false;
      })
      .addCase(fetchAuditLogs.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAuditLogs.fulfilled, (state, action: any) => {
        state.loading = false;
        state.auditLogs = action.payload.data || [];
        state.pagination.total = action.payload.total || 0;
      })
      .addCase(fetchAuditLogs.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { setFilters, setPagination, clearError, clearSuccess } = settingsSlice.actions;
export default settingsSlice.reducer;
