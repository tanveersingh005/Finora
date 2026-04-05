import { NavLink, Link } from 'react-router-dom';
import { LayoutGrid, ReceiptText, BarChart3, WalletCards, Settings, X, Shield, Eye } from 'lucide-react';
import { cn } from '../utils/formatters';
import { motion, AnimatePresence } from 'framer-motion';
import { useSelector, useDispatch } from 'react-redux';
import { setMobileMenuOpen, setRole } from '../features/ui/uiSlice';

const navItems = [
  { path: '/dashboard', label: 'Overview', icon: LayoutGrid },
  { path: '/transactions', label: 'Transactions', icon: ReceiptText },
];

export const Sidebar = () => {
  const dispatch = useDispatch();
  const isOpen = useSelector((state) => state.ui.isMobileMenuOpen);
  const role = useSelector((state) => state.ui.role);

  const closeMenu = () => dispatch(setMobileMenuOpen(false));

  const SidebarContent = () => (
    <>
      {/* Brand Logo Header */}
      <div className="h-[88px] flex items-center justify-between px-8 border-b border-transparent">
         <Link to="/" onClick={closeMenu} className="flex items-center gap-4 cursor-pointer hover:opacity-80 transition-opacity">
            <div className="relative flex items-center justify-center w-10 h-10">
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-[10px] bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 opacity-80 blur-[2px]"
              ></motion.div>
              <div className="absolute inset-[1.5px] bg-[#F8F9FB] dark:bg-slate-900 rounded-[8px] flex items-center justify-center overflow-hidden shadow-inner font-bold text-indigo-600">
                 <div className="w-3.5 h-3.5 bg-gradient-to-br from-indigo-500 to-cyan-400 rounded-[3px] transform rotate-45 shadow-[0_0_10px_rgba(99,102,241,0.5)]"></div>
              </div>
            </div>
            <div className="flex flex-col">
              <span className="font-extrabold text-[20px] leading-tight tracking-tight bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-slate-800 to-slate-700 dark:from-white dark:to-slate-300">
                Finora
              </span>
            </div>
         </Link>
         
         {/* Mobile Close Button */}
         <button onClick={closeMenu} className="md:hidden p-2 text-slate-500 hover:bg-slate-100 dark:hover:bg-slate-800 rounded-lg">
           <X className="w-5 h-5" />
         </button>
      </div>
      
      {/* Navigation */}
      <nav className="flex-1 px-4 py-6 space-y-1.5 flex flex-col">
        {navItems.map((item) => {
          const Icon = item.icon;
          return (
            <NavLink
              key={item.path}
              to={item.path}
              onClick={closeMenu}
              className={({ isActive }) => cn(
                "flex items-center gap-3.5 px-4 py-3 rounded-2xl transition-all duration-300 group text-[14px] font-semibold",
                isActive 
                  ? "bg-white dark:bg-slate-800 shadow-[0_4px_20px_-4px_rgba(0,0,0,0.05)] text-indigo-600 dark:text-indigo-400 border border-slate-100 dark:border-slate-700" 
                  : "text-slate-500 dark:text-slate-400 border border-transparent hover:bg-slate-100/50 dark:hover:bg-slate-800/50 hover:text-slate-700 dark:hover:text-slate-200"
              )}
            >
               {({ isActive }) => (
                 <>
                   <Icon className={cn("h-[20px] w-[20px] transition-colors", isActive ? "text-indigo-600" : "text-slate-400 group-hover:text-slate-500")} strokeWidth={isActive ? 2.5 : 2} />
                   {item.label}
                 </>
               )}
            </NavLink>
          );
        })}
        
        {/* Mobile RBAC Control Segment */}
        <div className="mt-auto md:hidden pt-8">
           <div className="text-[10px] font-bold tracking-[0.2em] text-slate-400 uppercase mb-3 ml-2">Access Role</div>
           <div className="flex bg-slate-200/50 dark:bg-slate-800 p-1.5 rounded-[14px] shadow-inner border border-slate-200/60 dark:border-slate-700/60 w-full">
              <button 
                className={`flex-1 relative px-4 py-2.5 text-xs font-bold rounded-[10px] transition-colors duration-300 ${role === 'Viewer' ? 'text-indigo-700 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                onClick={() => dispatch(setRole('Viewer'))}
              >
                {role === 'Viewer' && (
                  <motion.div layoutId="mobileRole" className="absolute inset-0 bg-white dark:bg-indigo-600 rounded-[10px] shadow-sm border border-slate-200/50 dark:border-indigo-500/30" />
                )}
                <span className="relative z-10 flex items-center justify-center gap-1.5">
                  <Eye className="w-4 h-4" strokeWidth={2.5} /> Viewer
                </span>
              </button>
              <button 
                className={`flex-1 relative px-4 py-2.5 text-xs font-bold rounded-[10px] transition-colors duration-300 ${role === 'Admin' ? 'text-emerald-700 dark:text-white' : 'text-slate-500 dark:text-slate-400 hover:text-slate-700 dark:hover:text-slate-300'}`}
                onClick={() => dispatch(setRole('Admin'))}
              >
                {role === 'Admin' && (
                  <motion.div layoutId="mobileRole" className="absolute inset-0 bg-white dark:bg-emerald-600 rounded-[10px] shadow-sm border border-slate-200/50 dark:border-emerald-500/30" />
                )}
                <span className="relative z-10 flex items-center justify-center gap-1.5">
                  <Shield className="w-4 h-4" strokeWidth={2.5} /> Admin
                </span>
              </button>
           </div>
        </div>
      </nav>
    </>
  );

  return (
    <>
      {/* Desktop Persistent Sidebar */}
      <aside className="w-64 fixed inset-y-0 left-0 bg-white/50 dark:bg-[#111827]/50 backdrop-blur-3xl border-r border-white/60 dark:border-slate-800/80 hidden md:flex flex-col z-[60] transition-colors duration-300 shadow-[4px_0_24px_rgba(0,0,0,0.02)]">
        <SidebarContent />
      </aside>

      {/* Mobile Canvas Drawer Overlay */}
      <AnimatePresence>
        {isOpen && (
          <>
            <motion.div 
              initial={{ opacity: 0 }} 
              animate={{ opacity: 1 }} 
              exit={{ opacity: 0 }}
              onClick={closeMenu}
              className="fixed inset-0 bg-slate-900/60 backdrop-blur-sm z-[70] md:hidden"
            />
            <motion.aside 
              initial={{ x: '-100%' }} 
              animate={{ x: 0 }} 
              exit={{ x: '-100%' }} 
              transition={{ type: 'spring', damping: 25, stiffness: 200 }}
              className="w-72 fixed inset-y-0 left-0 bg-white/90 dark:bg-[#111827]/90 backdrop-blur-xl border-r border-slate-200 dark:border-slate-800 flex flex-col z-[80] md:hidden shadow-2xl"
            >
              <SidebarContent />
            </motion.aside>
          </>
        )}
      </AnimatePresence>
    </>
  );
};
