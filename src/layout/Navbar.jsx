import { Sun, Moon, Bell, Menu, Search, HelpCircle, Shield, Eye } from 'lucide-react';
import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme, setRole, setMobileMenuOpen } from '../features/ui/uiSlice';
import { motion } from 'framer-motion';

export const Navbar = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.ui.theme);
  const role = useSelector((state) => state.ui.role);

  return (
    <header className="h-[88px] flex items-center justify-between px-8 bg-white/50 dark:bg-[#111827]/50 backdrop-blur-3xl border-b border-white/60 dark:border-slate-800/80 sticky top-0 z-40 transition-colors duration-300 shadow-[0_4px_24px_rgba(0,0,0,0.02)]">
      <div className="flex items-center flex-1">
        <button 
          onClick={() => dispatch(setMobileMenuOpen(true))}
          className="md:hidden p-2 -ml-2 mr-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg transition-colors"
        >
          <Menu className="h-6 w-6" />
        </button>
        
        {/* Search Bar matching screenshot */}
        <div className="hidden md:flex items-center bg-slate-200/30 dark:bg-slate-800/50 px-4 py-2.5 rounded-full w-[360px] border border-transparent focus-within:border-indigo-100 dark:focus-within:border-indigo-500/30 focus-within:bg-white dark:focus-within:bg-slate-800 transition-all shadow-sm">
           <Search className="w-4 h-4 text-slate-400 mr-2" />
           <input 
             type="text" 
             placeholder="Search assets, transactions..."
             className="bg-transparent border-none outline-none text-[13px] text-slate-700 dark:text-slate-200 w-full placeholder:text-slate-400 font-medium"
           />
        </div>
      </div>
      
      <div className="flex items-center gap-3">
        {/* Premium Animated Segment Control Role Switcher */}
        <div className="hidden sm:flex items-center mr-4 bg-slate-200/50 dark:bg-slate-800 p-1.5 rounded-[14px] shadow-inner border border-slate-200/60 dark:border-slate-700/60">
           <button 
             className={`relative px-4 py-1.5 text-xs font-bold rounded-[10px] transition-colors duration-300 ${role === 'Viewer' ? 'text-indigo-700 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
             onClick={() => dispatch(setRole('Viewer'))}
           >
             {role === 'Viewer' && (
               <motion.div layoutId="activeRole" className="absolute inset-0 bg-white dark:bg-indigo-600 rounded-[10px] shadow-sm border border-slate-200/50 dark:border-indigo-500/30" />
             )}
             <span className="relative z-10 flex items-center gap-1.5">
               <Eye className="w-3.5 h-3.5" strokeWidth={2.5} /> Viewer
             </span>
           </button>
           <button 
             className={`relative px-4 py-1.5 text-xs font-bold rounded-[10px] transition-colors duration-300 ${role === 'Admin' ? 'text-emerald-700 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
             onClick={() => dispatch(setRole('Admin'))}
           >
             {role === 'Admin' && (
               <motion.div layoutId="activeRole" className="absolute inset-0 bg-white dark:bg-emerald-600 rounded-[10px] shadow-sm border border-slate-200/50 dark:border-emerald-500/30" />
             )}
             <span className="relative z-10 flex items-center gap-1.5">
               <Shield className="w-3.5 h-3.5" strokeWidth={2.5} /> Admin
             </span>
           </button>
        </div>
        
        <button className="flex items-center justify-center h-10 w-10 sm:h-11 sm:w-11 rounded-full relative text-slate-500 dark:text-slate-400 bg-slate-100/50 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm ml-2">
          <Bell className="h-5 w-5 sm:h-5 sm:w-5" />
          <span className="absolute top-2 right-2 sm:top-2.5 sm:right-2.5 h-2 w-2 sm:h-2.5 sm:w-2.5 bg-indigo-500 rounded-full border-2 border-white dark:border-slate-800"></span>
        </button>

        <button 
          className="flex items-center justify-center h-10 w-10 sm:h-11 sm:w-11 rounded-full text-slate-500 dark:text-slate-400 bg-slate-100/50 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm" 
          onClick={() => dispatch(toggleTheme())}
        >
          {theme === 'dark' ? <Sun className="h-5 w-5 sm:h-5 sm:w-5" /> : <Moon className="h-5 w-5 sm:h-5 sm:w-5" />}
        </button>

        <button className="hidden sm:flex items-center justify-center h-11 w-11 rounded-full text-slate-500 dark:text-slate-400 bg-slate-100/50 dark:bg-slate-800/50 hover:bg-slate-200 dark:hover:bg-slate-700 transition-colors shadow-sm">
          <HelpCircle className="h-5 w-5" />
        </button>
        
        <div className="h-10 w-10 sm:h-11 sm:w-11 ml-2 rounded-full overflow-hidden bg-slate-200 border-2 border-white dark:border-slate-700 cursor-pointer shadow-md hover:ring-2 ring-indigo-500/30 transition-all relative">
          <img 
            src="https://images.unsplash.com/photo-1507003211169-0a1dd7228f2d?q=80&w=150&auto=format&fit=crop" 
            alt="User" 
            className="w-full h-full object-cover"
          />
        </div>
      </div>
    </header>
  );
};
