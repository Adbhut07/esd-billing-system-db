import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api';

interface Bill {
  id: string;
  houseId: string;
  month: number;
  year: number;
  bill1Amount: number;
  bill2Amount: number;
  totalAmount: number;
  paidAmount: number;
  remainingAmount: number;
  billStatus: 'PENDING' | 'GENERATED' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE';
  paidDate?: string;
  createdAt: string;
}

interface BillState {
  bills: Bill[];
  currentBill: Bill | null;
  loading: boolean;
  error: string | null;
  generateProgress: number;
  generateResults: { success: number; failed: number; errors: string[] };
  pagination: { page: number; limit: number; total: number };
  filters: { sector: string | null; status: string | null; month: number | null; dateRange: any };
}

const initialState: BillState = {
  bills: [],
  currentBill: null,
  loading: false,
  error: null,
  generateProgress: 0,
  generateResults: { success: 0, failed: 0, errors: [] },
  pagination: { page: 1, limit: 50, total: 0 },
  filters: { sector: null, status: null, month: null, dateRange: null }
};

export const fetchBills = createAsyncThunk(
  'bill/fetchBills',
  async (params: any, { rejectWithValue }: any) => {
    try {
      const response = await api.get('/bill', { params });
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch bills');
    }
  }
);

export const fetchBillById = createAsyncThunk(
  'bill/fetchBillById',
  async (id: string, { rejectWithValue }: any) => {
    try {
      const response = await api.get(`/bill/${id}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch bill');
    }
  }
);

export const generateSingleBill = createAsyncThunk(
  'bill/generateSingle',
  async (data: any, { rejectWithValue }: any) => {
    try {
      const response = await api.post('/bill/generate', data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate bill');
    }
  }
);

export const generateBulkBills = createAsyncThunk(
  'bill/generateBulk',
  async (data: any, { rejectWithValue }: any) => {
    try {
      const response = await api.post('/bill/bulk-generate', data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to generate bulk bills');
    }
  }
);

export const recordPayment = createAsyncThunk(
  'bill/recordPayment',
  async (data: any, { rejectWithValue }: any) => {
    try {
      const response = await api.put('/bill/record-payment', data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to record payment');
    }
  }
);

export const updateBillCharges = createAsyncThunk(
  'bill/updateCharges',
  async (data: any, { rejectWithValue }: any) => {
    try {
      const response = await api.put('/bill/update-charges', data);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to update charges');
    }
  }
);

export const deleteBill = createAsyncThunk(
  'bill/deleteBill',
  async (id: string, { rejectWithValue }: any) => {
    try {
      await api.delete(`/bill/${id}`);
      return id;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to delete bill');
    }
  }
);

export const fetchBillSummary = createAsyncThunk(
  'bill/fetchSummary',
  async (houseId: string, { rejectWithValue }: any) => {
    try {
      const response = await api.get(`/bill/summary/${houseId}`);
      return response.data;
    } catch (error: any) {
      return rejectWithValue(error.response?.data?.message || 'Failed to fetch summary');
    }
  }
);

const billSlice = createSlice({
  name: 'bill',
  initialState,
  reducers: {
    setFilters: (state, action: any) => {
      state.filters = action.payload;
      state.pagination.page = 1;
    },
    setPagination: (state, action: any) => {
      state.pagination = action.payload;
    },
    setGenerateProgress: (state, action: any) => {
      state.generateProgress = action.payload;
    },
    clearError: (state) => {
      state.error = null;
    },
    resetGenerateResults: (state) => {
      state.generateResults = { success: 0, failed: 0, errors: [] };
      state.generateProgress = 0;
    }
  },
  extraReducers: (builder) => {
    builder
      .addCase(fetchBills.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBills.fulfilled, (state, action: any) => {
        state.loading = false;
        state.bills = action.payload.data || [];
        state.pagination.total = action.payload.total || 0;
      })
      .addCase(fetchBills.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchBillById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBillById.fulfilled, (state, action: any) => {
        state.loading = false;
        state.currentBill = action.payload.data || action.payload;
      })
      .addCase(fetchBillById.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(generateSingleBill.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateSingleBill.fulfilled, (state, action: any) => {
        state.loading = false;
        state.currentBill = action.payload.data || action.payload;
      })
      .addCase(generateSingleBill.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(generateBulkBills.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateBulkBills.fulfilled, (state, action: any) => {
        state.loading = false;
        state.generateResults = action.payload;
      })
      .addCase(generateBulkBills.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(recordPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(recordPayment.fulfilled, (state, action: any) => {
        state.loading = false;
        state.currentBill = action.payload.data || action.payload;
      })
      .addCase(recordPayment.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateBillCharges.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBillCharges.fulfilled, (state, action: any) => {
        state.loading = false;
        state.currentBill = action.payload.data || action.payload;
      })
      .addCase(updateBillCharges.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteBill.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBill.fulfilled, (state, action: any) => {
        state.loading = false;
        state.bills = state.bills.filter((b: any) => b.id !== action.payload);
      })
      .addCase(deleteBill.rejected, (state, action: any) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { setFilters, setPagination, setGenerateProgress, clearError, resetGenerateResults } = billSlice.actions;
export default billSlice.reducer;
