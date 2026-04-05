import { BrowserRouter as Router, Routes, Route, Navigate } from 'react-router-dom';
import { Provider } from 'react-redux';
import { store } from './store/store';
import { Layout } from './layout/Layout';
import { Dashboard } from './pages/Dashboard';
import { Transactions } from './pages/Transactions';
import { Insights } from './pages/Insights';
import { Landing } from './pages/Landing';
import { Toaster } from 'sonner';

function App() {
  return (
    <Provider store={store}>
      <Toaster
        position="top-right"
        richColors
        theme="system"
        toastOptions={{
          style: { backdropFilter: 'blur(10px)' },
          className: 'dark:bg-slate-900/90 dark:border-slate-800 dark:text-white'
        }}
      />
      <Router>
        <Routes>
          <Route path="/" element={<Landing />} />
          <Route element={<Layout />}>
            <Route path="/dashboard" element={<Dashboard />} />
            <Route path="/transactions" element={<Transactions />} />
            <Route path="/insights" element={<Insights />} />
          </Route>
          <Route path="*" element={<Navigate to="/" replace />} />
        </Routes>
      </Router>
    </Provider>
  );
}

export default App;
