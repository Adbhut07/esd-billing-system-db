import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api';

interface Admin {
  id: string;
  username: string;
  email: string;
  fullName: string;
  role: 'SUPER_ADMIN' | 'ADMIN' | 'OPERATOR';
  isActive: boolean;
  createdAt: string;
}

interface AdminState {
  admins: Admin[];
  currentAdmin: Admin | null;
  loading: boolean;
  error: string | null;
  pagination: { page: number; limit: number; total: number };
  filters: { role: string | null; status: boolean | null; search: string };
}

const initialState: AdminState = {
  admins: [],
  currentAdmin: null,
  loading: false,
  error: null,
  pagination: { page: 1, limit: 50, total: 0 },
  filters: { role: null, status: true, search: '' }
};

export const fetchAdmins = createAsyncThunk(
  'admin/fetchAdmins',
  async (params: any, { getState, rejectWithValue }: any) => {
    try {
      const state = getState();
      // Skip fetch if data already exists
      if (state.admin.admins.length > 0) {
        return state.admin;
      }
      const response = await api.get('/auth/users', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch admins');
    }
  }
);

export const fetchAdminById = createAsyncThunk(
  'admin/fetchAdminById',
  async (id: string, { getState, rejectWithValue }: any) => {
    try {
      const state = getState();
      // Skip fetch if data already cached
      if (state.admin.currentAdmin && state.admin.currentAdmin.id === id) {
        return state.admin.currentAdmin;
      }
      const response = await api.get(`/auth/users/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch admin');
    }
  }
);

export const createAdmin = createAsyncThunk(
  'admin/createAdmin',
  async (data: any, { rejectWithValue }: any) => {
    try {
      const response = await api.post('/auth/register', data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to create admin');
    }
  }
);

export const updateAdmin = createAsyncThunk(
  'admin/updateAdmin',
  async ({ id, data }: { id: string; data: any }, { rejectWithValue }: any) => {
    try {
      const response = await api.put(`/auth/users/${id}`, data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update admin');
    }
  }
);

export const deleteAdmin = createAsyncThunk(
  'admin/deleteAdmin',
  async (id: string, { rejectWithValue }: any) => {
    try {
      await api.delete(`/auth/users/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete admin');
    }
  }
);

export const changePassword = createAsyncThunk(
  'admin/changePassword',
  async (data: any, { rejectWithValue }: any) => {
    try {
      const response = await api.post('/auth/change-password', data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to change password');
    }
  }
);

const adminSlice = createSlice({
  name: 'admin',
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
      .addCase(fetchAdmins.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdmins.fulfilled, (state, action: any) => {
        state.loading = false;
        state.admins = action.payload.data || [];
        state.pagination.total = action.payload.total || 0;
      })
      .addCase(fetchAdmins.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchAdminById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchAdminById.fulfilled, (state, action: any) => {
        state.loading = false;
        state.currentAdmin = action.payload.data || action.payload;
      })
      .addCase(fetchAdminById.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(createAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(createAdmin.fulfilled, (state, action: any) => {
        state.loading = false;
        state.admins.push(action.payload.data || action.payload);
      })
      .addCase(createAdmin.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateAdmin.fulfilled, (state, action: any) => {
        state.loading = false;
        const index = state.admins.findIndex((a: any) => a.id === action.payload.data.id);
        if (index !== -1) {
          state.admins[index] = action.payload.data || action.payload;
        }
      })
      .addCase(updateAdmin.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteAdmin.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteAdmin.fulfilled, (state, action: any) => {
        state.loading = false;
        state.admins = state.admins.filter((a: any) => a.id !== action.payload);
      })
      .addCase(deleteAdmin.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { setFilters, setPagination, clearError } = adminSlice.actions;
export default adminSlice.reducer;
