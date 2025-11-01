import { createSlice, createAsyncThunk } from '@reduxjs/toolkit';
import api from '../../api';

interface Bill {
  id: number;
  month: string;
  electricityImportReading: number;
  electricityExportReading: number;
  electricityExportCarryForward: number;
  electricityConsumption: number;
  electricityBilledEnergy: number;
  electricityReadingUploadDate?: string;
  maxDemand: number;
  waterReading: number;
  waterConsumption: number;
  waterReadingUploadDate?: string;
  bill1Upto15: number;
  bill1After15: number;
  bill2Upto15: number;
  bill2After15: number;
  totalBillUpto15: number;
  totalBillAfter15: number;
  bill1Arrear: number;
  bill2Arrear: number;
  fixedCharge: number;
  electricityCharge: number;
  electricityDuty: number;
  waterCharge: number;
  maintenanceCharge: number;
  otherCharges: number;
  paidAmount?: number;
  paidOn?: string;
  billStatus: 'PENDING' | 'GENERATED' | 'PARTIALLY_PAID' | 'PAID' | 'OVERDUE';
  billGeneratedAt?: string;
  createdAt: string;
  updatedAt: string;
  house: {
    id: number;
    houseNumber: string;
    consumerCode: string;
    licenseeName: string;
    mohalla: {
      id: number;
      name: string;
      number: string;
    };
  };
}

interface BillState {
  bills: Bill[];
  currentBill: Bill | null;
  loading: boolean;
  error: string | null;
  generateProgress: number;
  generateResults: { success: number; failed: number; errors: string[] };
  pagination: { page: number; limit: number; total: number };
  filters: { status: string | null; month: string | null; dateRange: { start: string; end: string } | null; search: string };
}

const initialState: BillState = {
  bills: [],
  currentBill: null,
  loading: false,
  error: null,
  generateProgress: 0,
  generateResults: { success: 0, failed: 0, errors: [] },
  pagination: { page: 1, limit: 50, total: 0 },
  filters: { status: null, month: null, dateRange: null, search: '' }
};

export const fetchBills = createAsyncThunk(
  'bill/fetchBills',
  async (params: { page?: number; limit?: number; search?: string; status?: string; month?: string; mohallaId?: string }, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { bill: BillState };
      // Skip fetch if data already exists and no filters changed
      if (state.bill.bills.length > 0 && !params.search && params.status !== undefined && params.month === undefined && params.mohallaId === undefined) {
        return state.bill;
      }
      const response = await api.get('/bills', { params });
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch bills');
    }
  }
);

export const fetchBillById = createAsyncThunk(
  'bill/fetchBillById',
  async (id: string, { getState, rejectWithValue }) => {
    try {
      const state = getState() as { bill: BillState };
      // Skip fetch if data already cached
      if (state.bill.currentBill && state.bill.currentBill.id === Number(id)) {
        return state.bill.currentBill;
      }
      const response = await api.get(`/bills/${id}`);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch bill');
    }
  }
);

export const generateSingleBill = createAsyncThunk(
  'bill/generateSingle',
  async (data: { houseId: number; month: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/bills/generate', data);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to generate bill');
    }
  }
);

export const generateBulkBills = createAsyncThunk(
  'bill/generateBulk',
  async (data: { mohallaId: number; month: string }, { rejectWithValue }) => {
    try {
      const response = await api.post('/bills/bulk-generate', data);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to generate bulk bills');
    }
  }
);

export const recordPayment = createAsyncThunk(
  'bill/recordPayment',
  async (data: { readingId: number; amount: number; paidOn: string }, { rejectWithValue }) => {
    try {
      const response = await api.put('/bills/record-payment', data);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to record payment');
    }
  }
);

export const updateBillCharges = createAsyncThunk(
  'bill/updateCharges',
  async (data: { houseId: number; month: string; otherCharges: number }, { rejectWithValue }) => {
    try {
      const response = await api.put('/bills/update-charges', data);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to update charges');
    }
  }
);

export const deleteBill = createAsyncThunk(
  'bill/deleteBill',
  async (id: string, { rejectWithValue }) => {
    try {
      await api.delete(`/bills/${id}`);
      return id;
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to delete bill');
    }
  }
);

export const fetchBillSummary = createAsyncThunk(
  'bill/fetchSummary',
  async (houseId: string, { rejectWithValue }) => {
    try {
      const response = await api.get(`/bills/summary/${houseId}`);
      return response.data;
    } catch (error: unknown) {
      return rejectWithValue(error instanceof Error ? error.message : 'Failed to fetch summary');
    }
  }
);

const billSlice = createSlice({
  name: 'bill',
  initialState,
  reducers: {
    setFilters: (state, action: { payload: Partial<BillState['filters']> }) => {
      state.filters = { ...state.filters, ...action.payload };
      state.pagination.page = 1;
    },
    setPagination: (state, action: { payload: BillState['pagination'] }) => {
      state.pagination = action.payload;
    },
    setGenerateProgress: (state, action: { payload: number }) => {
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
      .addCase(fetchBills.fulfilled, (state, action) => {
        state.loading = false;
        state.bills = action.payload.data || [];
        state.pagination.total = action.payload.total || 0;
      })
      .addCase(fetchBills.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(fetchBillById.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(fetchBillById.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBill = action.payload.data || action.payload;
      })
      .addCase(fetchBillById.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(generateSingleBill.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateSingleBill.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBill = action.payload.data || action.payload;
      })
      .addCase(generateSingleBill.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(generateBulkBills.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(generateBulkBills.fulfilled, (state, action) => {
        state.loading = false;
        state.generateResults = action.payload;
      })
      .addCase(generateBulkBills.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(recordPayment.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(recordPayment.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBill = action.payload.data || action.payload;
      })
      .addCase(recordPayment.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(updateBillCharges.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(updateBillCharges.fulfilled, (state, action) => {
        state.loading = false;
        state.currentBill = action.payload.data || action.payload;
      })
      .addCase(updateBillCharges.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      })
      .addCase(deleteBill.pending, (state) => {
        state.loading = true;
        state.error = null;
      })
      .addCase(deleteBill.fulfilled, (state, action) => {
        state.loading = false;
        state.bills = state.bills.filter((b) => b.id !== Number(action.payload));
      })
      .addCase(deleteBill.rejected, (state, action) => {
        state.loading = false;
        state.error = action.payload as string;
      });
  }
});

export const { setFilters, setPagination, setGenerateProgress, clearError, resetGenerateResults } = billSlice.actions;
export default billSlice.reducer;
export type { Bill };
