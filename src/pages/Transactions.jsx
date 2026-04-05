import { useState, useMemo } from 'react';
import { useSelector, useDispatch } from 'react-redux';
import { motion } from 'framer-motion';
import { Plus, Search, Filter, Download, Trash2, Edit2 } from 'lucide-react';
import { toast } from 'sonner';
import { Card } from '../components/ui/Card';
import { Button } from '../components/ui/Button';
import { Modal } from '../components/ui/Modal';
import { formatCurrency, formatDate, cn } from '../utils/formatters';
import { 
  addTransaction, deleteTransaction, updateTransaction, 
  setFilterCategory, setFilterType, setSearchQuery 
} from '../features/transactions/transactionSlice';

export const Transactions = () => {
  const dispatch = useDispatch();
  const { items, filterCategory, filterType, searchQuery } = useSelector(state => state.transactions);
  const role = useSelector(state => state.ui.role);
  
  const [isModalOpen, setIsModalOpen] = useState(false);
  const [editingTx, setEditingTx] = useState(null);

  // Form State
  const [formData, setFormData] = useState({
    description: '', amount: '', category: 'General', type: 'expense', date: new Date().toISOString().split('T')[0]
  });

  const categories = ['All', 'Housing', 'Food', 'Transport', 'Entertainment', 'Salary', 'Investment', 'Other'];
  
  const filteredTransactions = useMemo(() => {
    return items.filter(tx => {
      const matchSearch = tx.description.toLowerCase().includes(searchQuery.toLowerCase()) || 
                          tx.category.toLowerCase().includes(searchQuery.toLowerCase());
      const matchCategory = filterCategory === 'All' || tx.category === filterCategory;
      const matchType = filterType === 'All' || tx.type === filterType;
      return matchSearch && matchCategory && matchType;
    });
  }, [items, searchQuery, filterCategory, filterType]);

  const handleOpenModal = (tx = null) => {
    if (tx) {
      setEditingTx(tx);
      setFormData({ ...tx });
    } else {
      setEditingTx(null);
      setFormData({ description: '', amount: '', category: 'Other', type: 'expense', date: new Date().toISOString().split('T')[0] });
    }
    setIsModalOpen(true);
  };

  const handleSave = (e) => {
    e.preventDefault();
    if (!formData.description || !formData.amount) return;

    const parsedAmount = parseFloat(formData.amount);
    const payload = {
      ...formData,
      amount: parsedAmount,
      id: editingTx ? editingTx.id : `t${Date.now()}`
    };

    if (editingTx) {
      dispatch(updateTransaction(payload));
      toast.success('Transaction updated successfully', { icon: '📝' });
    } else {
      dispatch(addTransaction(payload));
      
      // Dynamic Interlinked Notification System
      if (formData.type === 'income') {
         toast.success(`${formatCurrency(parsedAmount)} has been added to your account!`, {
            icon: '💰',
            className: 'border-emerald-500/20 bg-emerald-50 dark:bg-emerald-500/10 dark:text-emerald-400 font-bold'
         });
      } else {
         toast.error(`${formatCurrency(parsedAmount)} has been deducted from your account!`, {
            icon: '💸',
            className: 'border-rose-500/20 bg-rose-50 dark:bg-rose-500/10 dark:text-rose-400 font-bold'
         });
      }
    }
    setIsModalOpen(false);
  };

  const exportCSV = () => {
    const csvRows = [];
    const headers = ['Date', 'Description', 'Category', 'Type', 'Amount'];
    csvRows.push(headers.join(','));
    
    filteredTransactions.forEach(tx => {
      csvRows.push(`${tx.date},"${tx.description}",${tx.category},${tx.type},${tx.amount}`);
    });
    
    const blob = new Blob([csvRows.join('\n')], { type: 'text/csv' });
    const url = window.URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.setAttribute('hidden', '');
    a.setAttribute('href', url);
    a.setAttribute('download', 'transactions.csv');
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
  };

  return (
    <motion.div initial={{ opacity: 0 }} animate={{ opacity: 1 }} className="space-y-6 flex flex-col h-full">
      <div className="flex flex-col sm:flex-row justify-between items-start sm:items-center gap-4">
        <div>
          <h1 className="text-2xl font-bold text-slate-900 dark:text-white">Transactions</h1>
          <p className="text-slate-500 dark:text-slate-400 mt-1">Manage and track your cash flow.</p>
        </div>
        <div className="flex gap-3">
          <Button variant="outline" onClick={exportCSV} className="hidden sm:flex gap-2">
            <Download className="h-4 w-4" /> Export
          </Button>
          {role === 'Admin' && (
            <Button onClick={() => handleOpenModal()} className="gap-2 shadow-lg shadow-primary-500/30">
              <Plus className="h-4 w-4" /> Add Record
            </Button>
          )}
        </div>
      </div>

      <Card className="flex flex-col flex-1 overflow-hidden">
        {/* Filters and Search */}
        <div className="flex flex-col md:flex-row gap-4 mb-6">
          <div className="relative flex-1">
            <Search className="absolute left-3 top-1/2 -translate-y-1/2 h-4 w-4 text-slate-400" />
            <input 
              type="text" 
              placeholder="Search transactions..."
              value={searchQuery}
              onChange={(e) => dispatch(setSearchQuery(e.target.value))}
              className="w-full pl-10 pr-4 py-2 bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg focus:outline-none focus:ring-2 focus:ring-primary-500 text-sm text-slate-900 dark:text-white transition-all"
            />
          </div>
          <div className="flex gap-2">
            <select 
              value={filterType}
              onChange={(e) => dispatch(setFilterType(e.target.value))}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
            >
              <option value="All">All Types</option>
              <option value="income">Income</option>
              <option value="expense">Expense</option>
            </select>
            <select 
              value={filterCategory}
              onChange={(e) => dispatch(setFilterCategory(e.target.value))}
              className="bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
            >
              {categories.map(c => <option key={c} value={c}>{c}</option>)}
            </select>
          </div>
        </div>

        {/* Table */}
        <div className="overflow-x-auto">
          <table className="w-full text-left text-sm whitespace-nowrap">
            <thead>
              <tr className="border-b border-slate-200 dark:border-slate-800 text-slate-500 dark:text-slate-400">
                <th className="pb-3 font-medium px-4">Date</th>
                <th className="pb-3 font-medium px-4">Description</th>
                <th className="pb-3 font-medium px-4">Category</th>
                <th className="pb-3 font-medium text-right px-4">Amount</th>
                {role === 'Admin' && <th className="pb-3 font-medium text-right px-4">Actions</th>}
              </tr>
            </thead>
            <tbody className="divide-y divide-slate-100 dark:divide-slate-800/60">
              {filteredTransactions.length === 0 ? (
                <tr>
                  <td colSpan={role === 'Admin' ? 5 : 4} className="py-12 text-center text-slate-500">
                    No transactions found matching your criteria.
                  </td>
                </tr>
              ) : (
                filteredTransactions.map((tx, idx) => (
                  <motion.tr 
                    initial={{ opacity: 0, y: 10 }}
                    animate={{ opacity: 1, y: 0 }}
                    transition={{ delay: idx * 0.05 }}
                    key={tx.id} 
                    className="hover:bg-slate-50/50 dark:hover:bg-slate-800/30 transition-colors group"
                  >
                    <td className="py-4 px-4 text-slate-600 dark:text-slate-300">{formatDate(tx.date)}</td>
                    <td className="py-4 px-4 font-medium text-slate-900 dark:text-white">{tx.description}</td>
                    <td className="py-4 px-4">
                      <span className="bg-slate-100 dark:bg-slate-800 text-slate-600 dark:text-slate-300 px-2.5 py-1 rounded-md text-xs font-medium">
                        {tx.category}
                      </span>
                    </td>
                    <td className={cn(
                      "py-4 px-4 text-right font-medium",
                      tx.type === 'income' ? "text-green-600 dark:text-green-500" : "text-slate-900 dark:text-white"
                    )}>
                      {tx.type === 'income' ? '+' : '-'}{formatCurrency(tx.amount)}
                    </td>
                    {role === 'Admin' && (
                      <td className="py-4 px-4 text-right">
                        <div className="flex justify-end gap-2 opacity-0 group-hover:opacity-100 transition-opacity">
                          <button onClick={() => handleOpenModal(tx)} className="p-1.5 text-slate-400 hover:text-blue-500 hover:bg-blue-50 dark:hover:bg-blue-900/30 rounded">
                            <Edit2 className="h-4 w-4" />
                          </button>
                          <button onClick={() => dispatch(deleteTransaction(tx.id))} className="p-1.5 text-slate-400 hover:text-red-500 hover:bg-red-50 dark:hover:bg-red-900/30 rounded">
                            <Trash2 className="h-4 w-4" />
                          </button>
                        </div>
                      </td>
                    )}
                  </motion.tr>
                ))
              )}
            </tbody>
          </table>
        </div>
      </Card>

      <Modal isOpen={isModalOpen} onClose={() => setIsModalOpen(false)} title={editingTx ? "Edit Transaction" : "New Transaction"}>
        <form onSubmit={handleSave} className="space-y-4">
          <div className="space-y-1">
            <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Description</label>
            <input 
              required
              type="text" 
              value={formData.description}
              onChange={(e) => setFormData({...formData, description: e.target.value})}
              className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white" 
            />
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Amount</label>
              <input 
                required
                type="number" 
                step="0.01"
                min="0.01"
                value={formData.amount}
                onChange={(e) => setFormData({...formData, amount: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white" 
              />
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Type</label>
              <select 
                value={formData.type}
                onChange={(e) => setFormData({...formData, type: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
              >
                <option value="expense">Expense</option>
                <option value="income">Income</option>
              </select>
            </div>
          </div>
          
          <div className="grid grid-cols-2 gap-4">
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Category</label>
              <select 
                value={formData.category}
                onChange={(e) => setFormData({...formData, category: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white"
              >
                {categories.filter(c => c !== 'All').map(c => <option key={c} value={c}>{c}</option>)}
              </select>
            </div>
            <div className="space-y-1">
              <label className="text-sm font-medium text-slate-700 dark:text-slate-300">Date</label>
              <input 
                required
                type="date" 
                value={formData.date}
                onChange={(e) => setFormData({...formData, date: e.target.value})}
                className="w-full bg-slate-50 dark:bg-slate-900 border border-slate-200 dark:border-slate-700 rounded-lg px-3 py-2 text-sm focus:outline-none focus:ring-2 focus:ring-primary-500 text-slate-900 dark:text-white" 
              />
            </div>
          </div>

          <div className="pt-4 flex gap-3 justify-end border-t border-slate-100 dark:border-slate-800">
            <Button type="button" variant="ghost" onClick={() => setIsModalOpen(false)}>Cancel</Button>
            <Button type="submit">{editingTx ? "Save Changes" : "Add Transaction"}</Button>
          </div>
        </form>
      </Modal>
    </motion.div>
  );
};
