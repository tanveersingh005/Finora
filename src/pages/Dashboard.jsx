import { motion } from 'framer-motion';
import { DollarSign, ArrowUpRight, TrendingDown, Eye, Box, Zap, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';
import { useSelector, useDispatch } from 'react-redux';
import { useMemo, useState } from 'react';
import { addTransaction } from '../features/transactions/transactionSlice';
import { BalanceChart } from '../charts/BalanceChart';
import { BalanceTrendChart } from '../charts/BalanceTrendChart';
import { CategoryChart } from '../charts/CategoryChart';
import { ExpenseRadarChart } from '../charts/ExpenseRadarChart';

// Reusable Modern Container to bypass the standard plain Card UI
const ModernBentoCard = ({ children, className = "", delay = 0, hoverVariant = "default" }) => {
  const hoverEffects = {
    default: { y: -5, scale: 1.01 },
    soft: { y: -2, scale: 1.005 },
    glow: { y: -4, scale: 1.02, boxShadow: "0px 20px 40px rgba(0,0,0,0.08)" }
  };
  
  return (
    <motion.div 
      initial={{ opacity: 0, y: 30 }}
      animate={{ opacity: 1, y: 0 }}
      transition={{ duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
      whileHover={hoverEffects[hoverVariant]}
      className={`relative flex flex-col overflow-hidden rounded-[2.5rem] bg-gradient-to-br from-white/95 via-white/80 to-white/50 dark:from-slate-900/90 dark:via-slate-900/60 dark:to-[#0B0F19]/80 backdrop-blur-[40px] border border-white/60 dark:border-white/5 shadow-[0_8px_30px_rgb(0,0,0,0.04)] dark:shadow-[0_8px_30px_rgb(0,0,0,0.2)] ${className}`}
    >
      {/* Universal glassy sheen overlay */}
      <div className="absolute inset-0 bg-gradient-to-tr from-transparent via-white/20 to-white/60 dark:via-white/5 dark:to-white/10 pointer-events-none rounded-[2.5rem]"></div>
      
      {/* Content wrapper */}
      <div className="relative z-10 flex-1 w-full flex flex-col">
        {children}
      </div>
    </motion.div>
  );
};

export const Dashboard = () => {
  const transactions = useSelector((state) => state.transactions.items);
  const dispatch = useDispatch();
  const [isSyncing, setIsSyncing] = useState(false);
  const [apiNotification, setApiNotification] = useState(null);

  const handleSyncBank = () => {
    setIsSyncing(true);
    setApiNotification(null);
    
    // Genuine Mock API Fetch Sequence pointing to a live structural endpoint
    fetch('https://jsonplaceholder.typicode.com/users/1')
      .then(res => res.json())
      .then(data => {
        setTimeout(() => {
          // Display the external mock data fetched
          setApiNotification(`Cloud Sync Complete: Node securely authenticated as ${data.name}`);
          setIsSyncing(false);
          
          // Auto-clear notification toast
          setTimeout(() => setApiNotification(null), 4500);
        }, 1200); // Artificial latency for UI flair
      })
      .catch(() => {
        setApiNotification("Cloud Sync Failed: Check network");
        setIsSyncing(false);
        setTimeout(() => setApiNotification(null), 4000);
      });
  };

  const { totalIncome, totalExpenses, currentBalance, depositCount, highestExpenseCategory, flowStatus } = useMemo(() => {
    let income = 0;
    let expenses = 0;
    let deposits = 0;
    const categoryTotals = {};

    transactions.forEach(t => {
      const amount = Number(t.amount) || 0;
      if (t.type === 'income') {
        income += amount;
        deposits += 1;
      } else {
        expenses += amount;
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + amount;
      }
    });

    // Find highest expense category
    let maxCategory = 'None';
    let maxExpense = 0;
    Object.entries(categoryTotals).forEach(([cat, val]) => {
      if (val > maxExpense) {
        maxExpense = val;
        maxCategory = cat;
      }
    });

    const balance = income - expenses;
    const isPositive = balance >= 0;

    return {
      totalIncome: income,
      totalExpenses: expenses,
      currentBalance: balance,
      depositCount: deposits,
      highestExpenseCategory: { name: maxCategory, value: maxExpense },
      flowStatus: isPositive ? 'Positive Flow' : 'Negative Deficit'
    };
  }, [transactions]);

  // Number formatters
  const formatMoneyPrimary = (val) => {
    const whole = Math.floor(Math.abs(val)).toLocaleString();
    const decimal = Math.abs(val).toFixed(2).split('.')[1];
    return { whole, decimal, sign: val < 0 ? '-' : '' };
  };

  const balParts = formatMoneyPrimary(currentBalance);
  const incParts = formatMoneyPrimary(totalIncome);
  const expParts = formatMoneyPrimary(totalExpenses);

  return (
    <div className="space-y-8 pb-20 pt-4">
      {/* Header Section */}
      <motion.div 
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.8, ease: "easeOut" }}
        className="flex flex-col sm:flex-row justify-between items-start sm:items-end gap-6 mb-6"
      >
        <div>
          <h1 className="text-4xl md:text-5xl font-extrabold tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-500 dark:from-white dark:to-slate-400">
            Overview.
          </h1>
          <p className="mt-2 text-slate-500 dark:text-slate-400 font-medium tracking-wide">
            Your financial pulse, <span className="text-indigo-500 font-semibold">beautifully visualized</span>
          </p>
        </div>
        
        <div className="flex flex-col items-end gap-3 z-20">
          <button 
            onClick={handleSyncBank}
            disabled={isSyncing}
            className="group relative flex items-center justify-center gap-2.5 px-6 py-3.5 bg-white dark:bg-slate-800 text-sm font-bold text-slate-700 dark:text-white rounded-xl shadow-lg shadow-indigo-500/10 dark:shadow-[0_0_20px_rgba(99,102,241,0.1)] border border-slate-200 dark:border-slate-700 hover:border-indigo-400 dark:hover:border-indigo-400 transition-all overflow-hidden shrink-0 disabled:opacity-60 disabled:cursor-wait"
          >
             <div className="absolute inset-0 bg-indigo-50/50 dark:bg-indigo-500/10 translate-y-[100%] group-hover:translate-y-0 transition-transform duration-300"></div>
             <RefreshCw className={`w-4 h-4 text-indigo-500 relative z-10 ${isSyncing ? 'animate-spin' : ''}`} />
             <span className="relative z-10">{isSyncing ? 'Authenticating API Hub...' : 'Sync Cloud Network'}</span>
          </button>
          
          {/* Subtle Temporary Result Toast */}
          {apiNotification && (
            <motion.div 
              initial={{ opacity: 0, y: -10 }}
              animate={{ opacity: 1, y: 0 }}
              className="absolute top-[100%] right-0 mt-2 text-[11px] font-bold text-emerald-600 dark:text-emerald-400 bg-emerald-50 max-w-sm text-right dark:bg-emerald-500/10 px-3 py-1.5 rounded-lg border border-emerald-500/20 shadow-sm"
            >
              {apiNotification}
            </motion.div>
          )}
        </div>
      </motion.div>

      {/* Top 3 Metric Cards */}
      <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
        
        {/* Total Balance */}
        <ModernBentoCard delay={0.1} className="p-8 group" hoverVariant="glow">
           <div className="absolute top-0 right-0 w-48 h-48 bg-indigo-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all duration-700 group-hover:bg-indigo-500/20"></div>
           <div className="flex justify-between items-start">
             <div>
               <p className="text-[11px] font-bold tracking-[0.2em] text-slate-400 uppercase mb-3 ml-1">Total Balance</p>
               <h3 className="text-[40px] font-black text-slate-900 dark:text-white tracking-tighter leading-none">{balParts.sign}${balParts.whole}<span className="text-slate-300 dark:text-slate-600">.{balParts.decimal}</span></h3>
             </div>
             <div className="w-14 h-14 rounded-full bg-indigo-50/50 dark:bg-indigo-500/10 flex items-center justify-center border border-indigo-100/50 dark:border-indigo-500/20 shadow-sm backdrop-blur-md group-hover:scale-110 transition-transform duration-500">
               <DollarSign className="w-6 h-6 text-indigo-600 dark:text-indigo-400" strokeWidth={2.5} />
             </div>
           </div>
           <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-slate-500">
             <span className="flex items-center gap-1 text-emerald-500 bg-emerald-50 dark:bg-emerald-500/10 px-2 py-1 rounded-md">
                <ArrowUpRight className="w-4 h-4" /> 14.2%
             </span>
             <span className="opacity-80">vs last month</span>
           </div>
        </ModernBentoCard>

        {/* Total Income */}
        <ModernBentoCard delay={0.2} className="p-8 group">
           <div className="absolute top-0 right-0 w-48 h-48 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all duration-700 group-hover:bg-emerald-500/20"></div>
           <div className="flex justify-between items-start">
             <div>
               <p className="text-[11px] font-bold tracking-[0.2em] text-slate-400 uppercase mb-3 ml-1">Total Income</p>
               <h3 className="text-[40px] font-black text-emerald-600 dark:text-emerald-400 tracking-tighter leading-none">${incParts.whole}<span className="text-emerald-600/40">.{incParts.decimal}</span></h3>
             </div>
             <div className="w-14 h-14 rounded-full bg-emerald-50/50 dark:bg-emerald-500/10 flex items-center justify-center border border-emerald-100/50 dark:border-emerald-500/20 shadow-sm backdrop-blur-md group-hover:scale-110 group-hover:rotate-12 transition-transform duration-500">
               <Box className="w-6 h-6 text-emerald-600 dark:text-emerald-400" strokeWidth={2.5} />
             </div>
           </div>
           <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-slate-500">
             <span className="px-3 py-1 bg-slate-100 dark:bg-slate-800 rounded-lg text-slate-600 dark:text-slate-300">{depositCount} Deposits</span>
           </div>
        </ModernBentoCard>

        {/* Total Expenses */}
        <ModernBentoCard delay={0.3} className="p-8 group">
           <div className="absolute top-0 right-0 w-48 h-48 bg-rose-500/10 rounded-full blur-3xl -mr-10 -mt-10 transition-all duration-700 group-hover:bg-rose-500/20"></div>
           <div className="flex justify-between items-start">
             <div>
               <p className="text-[11px] font-bold tracking-[0.2em] text-slate-400 uppercase mb-3 ml-1">Total Expenses</p>
               <h3 className="text-[40px] font-black text-rose-600 dark:text-rose-400 tracking-tighter leading-none">${expParts.whole}<span className="text-rose-600/40">.{expParts.decimal}</span></h3>
             </div>
             <div className="w-14 h-14 rounded-full bg-rose-50/50 dark:bg-rose-500/10 flex items-center justify-center border border-rose-100/50 dark:border-rose-500/20 shadow-sm backdrop-blur-md group-hover:scale-110 group-hover:-rotate-12 transition-transform duration-500">
               <TrendingDown className="w-6 h-6 text-rose-600 dark:text-rose-400" strokeWidth={2.5} />
             </div>
           </div>
           <div className="mt-8 flex items-center gap-2 text-sm font-semibold text-slate-500">
             <span className="flex items-center gap-1 text-rose-500 bg-rose-50 dark:bg-rose-500/10 px-2 py-1 rounded-md">
                <TrendingDown className="w-4 h-4" /> 4.1%
             </span>
             <span className="opacity-80">higher than usual</span>
           </div>
        </ModernBentoCard>

      </div>

      {/* Main Chart Area */}
      <ModernBentoCard delay={0.4} className="p-10 min-h-[480px] flex flex-col group" hoverVariant="soft">
        <div className="absolute -left-32 -bottom-24 w-96 h-96 bg-cyan-400/10 rounded-full blur-[80px] group-hover:bg-cyan-400/20 transition-colors duration-1000"></div>
        <div className="flex justify-between items-center mb-10 z-10">
          <div className="relative">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Financial Matrix</h3>
            <p className="text-slate-500 font-medium tracking-wide mt-1">Annual activity and cash flow intensity mapping</p>
          </div>
          <motion.button 
            whileHover={{ scale: 1.05 }}
            whileTap={{ scale: 0.95 }}
            className="flex items-center gap-2 px-5 py-2.5 bg-slate-900 dark:bg-white text-white dark:text-slate-900 rounded-full text-sm font-bold shadow-lg hover:shadow-xl transition-shadow"
          >
            <Eye className="w-4 h-4" /> 
            View Report
          </motion.button>
        </div>
        <div className="flex-1 w-full relative z-10">
          <div className="absolute inset-0">
             <BalanceChart />
          </div>
        </div>
      </ModernBentoCard>
      
      {/* Bottom Split Section */}
      <div className="grid grid-cols-1 lg:grid-cols-5 gap-8">
        
        {/* Spending By Category (Span 3) */}
        <ModernBentoCard delay={0.5} className="lg:col-span-3 p-10 min-h-[450px] h-full flex flex-col group" hoverVariant="soft">
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight mb-8">Asset Allocation</h3>
          <div className="flex-1 w-full relative min-h-0 z-10 flex flex-col justify-center">
             <CategoryChart />
          </div>
        </ModernBentoCard>
        
        {/* Key Insights (Span 2) */}
        <ModernBentoCard delay={0.6} className="lg:col-span-2 p-10 flex flex-col overflow-hidden group">
          <div className="absolute -right-10 -top-10 w-40 h-40 bg-amber-400/10 rounded-full blur-3xl group-hover:scale-150 transition-transform duration-700"></div>
          <div className="flex items-center gap-3 mb-6 relative z-10">
            <div className="p-3 bg-amber-100 dark:bg-amber-500/20 rounded-2xl border border-amber-200 dark:border-amber-500/30">
              <Zap className="w-6 h-6 text-amber-500 fill-amber-500/30" />
            </div>
            <div>
              <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Spending Radar</h3>
              <p className="text-xs font-bold tracking-[0.1em] uppercase text-amber-500 mt-1">Behavior Analytics</p>
            </div>
          </div>
          
          <div className="flex-1 w-full relative z-10 min-h-[250px] mb-4">
             <div className="absolute inset-0">
               <ExpenseRadarChart />
             </div>
          </div>

          <div className="relative z-10 mt-auto flex justify-end border-t border-slate-100 dark:border-white/5 pt-4">
            <Link to="/insights" className="group flex items-center gap-2 text-sm font-bold text-amber-600 dark:text-amber-400 hover:text-amber-500 transition-colors">
              Deep Insights <ArrowUpRight className="w-4 h-4 group-hover:translate-x-0.5 group-hover:-translate-y-0.5 transition-transform" />
            </Link>
          </div>
        </ModernBentoCard>
      </div>

      {/* Trajectory Forecast Full-Width Board */}
      <ModernBentoCard delay={0.7} className="mt-8 p-10 min-h-[400px] flex flex-col group" hoverVariant="soft">
        <div className="absolute -right-32 -top-24 w-96 h-96 bg-indigo-500/10 rounded-full blur-[100px] group-hover:bg-indigo-500/20 transition-colors duration-1000"></div>
        <div className="flex justify-between items-center mb-10 z-10">
          <div className="relative">
            <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">Trajectory Projection</h3>
            <p className="text-slate-500 font-medium tracking-wide mt-1">Cumulative running balance mapping over time</p>
          </div>
        </div>
        <div className="flex-1 w-full relative z-10 min-h-[250px]">
           <div className="absolute inset-0">
             <BalanceTrendChart />
           </div>
        </div>
      </ModernBentoCard>

    </div>
  );
};
