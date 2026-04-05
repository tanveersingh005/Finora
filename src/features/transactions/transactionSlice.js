import { createSlice } from '@reduxjs/toolkit';
import { initialTransactions } from '../../data/mockData';

// Load from local storage if available
const loadTransactions = () => {
  const saved = localStorage.getItem('fintech_transactions');
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch (e) {
      console.error('Failed to parse transactions from local storage', e);
    }
  }
  return initialTransactions;
};

const initialState = {
  items: loadTransactions(),
  filterCategory: 'All',
  filterType: 'All',
  searchQuery: '',
};

const transactionSlice = createSlice({
  name: 'transactions',
  initialState,
  reducers: {
    addTransaction: (state, action) => {
      state.items.unshift(action.payload);
      localStorage.setItem('fintech_transactions', JSON.stringify(state.items));
    },
    updateTransaction: (state, action) => {
      const index = state.items.findIndex(t => t.id === action.payload.id);
      if (index !== -1) {
        state.items[index] = action.payload;
        localStorage.setItem('fintech_transactions', JSON.stringify(state.items));
      }
    },
    deleteTransaction: (state, action) => {
      state.items = state.items.filter(t => t.id !== action.payload);
      localStorage.setItem('fintech_transactions', JSON.stringify(state.items));
    },
    setFilterCategory: (state, action) => {
      state.filterCategory = action.payload;
    },
    setFilterType: (state, action) => {
      state.filterType = action.payload;
    },
    setSearchQuery: (state, action) => {
      state.searchQuery = action.payload;
    }
  }
});

export const { 
  addTransaction, updateTransaction, deleteTransaction, 
  setFilterCategory, setFilterType, setSearchQuery 
} = transactionSlice.actions;

export default transactionSlice.reducer;
