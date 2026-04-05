import { createSlice } from '@reduxjs/toolkit';

const initialState = {
  role: 'Viewer', // 'Viewer' or 'Admin'
  theme: localStorage.getItem('theme') || 'light',
  isMobileMenuOpen: false
};

const uiSlice = createSlice({
  name: 'ui',
  initialState,
  reducers: {
    setRole: (state, action) => {
      state.role = action.payload;
    },
    toggleTheme: (state) => {
      state.theme = state.theme === 'light' ? 'dark' : 'light';
      localStorage.setItem('theme', state.theme);
      if (state.theme === 'dark') {
        document.documentElement.classList.add('dark');
      } else {
        document.documentElement.classList.remove('dark');
      }
    },
    initTheme: (state) => {
      if (state.theme === 'dark' || (!('theme' in localStorage) && window.matchMedia('(prefers-color-scheme: dark)').matches)) {
        document.documentElement.classList.add('dark');
        state.theme = 'dark';
      } else {
        document.documentElement.classList.remove('dark');
        state.theme = 'light';
      }
    },
    setMobileMenuOpen: (state, action) => {
      state.isMobileMenuOpen = action.payload;
    }
  }
});

export const { setRole, toggleTheme, initTheme, setMobileMenuOpen } = uiSlice.actions;
export default uiSlice.reducer;
