import { Outlet } from 'react-router-dom';
import { Sidebar } from './Sidebar';
import { Navbar } from './Navbar';
import { useEffect } from 'react';
import { useDispatch } from 'react-redux';
import { initTheme } from '../features/ui/uiSlice';
import { motion } from 'framer-motion';
import { ParticleBackground } from '../components/ParticleBackground';

export const Layout = () => {
  const dispatch = useDispatch();
  
  useEffect(() => {
    dispatch(initTheme());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-[#F8F9FB] dark:bg-[#0B0F19] flex flex-col md:flex-row relative overflow-hidden font-sans text-slate-900 dark:text-slate-100 selection:bg-indigo-500/30">
      
      {/* Vibrant Modern Mesh Gradients */}
      <div className="fixed inset-0 overflow-hidden pointer-events-none z-0 bg-[#f4f7fb] dark:bg-[#0B0F19]">
        <motion.div 
          animate={{ scale: [1, 1.1, 1], rotate: [0, 90, 0] }}
          transition={{ duration: 20, repeat: Infinity, ease: "linear" }}
          className="absolute top-[-15%] left-[-10%] w-[50%] h-[50%] rounded-full bg-indigo-400/20 dark:bg-indigo-600/20 blur-[100px] mix-blend-multiply dark:mix-blend-screen"
        />
        <motion.div 
          animate={{ scale: [1, 1.2, 1], rotate: [0, -90, 0] }}
          transition={{ duration: 25, repeat: Infinity, ease: "linear" }}
          className="absolute bottom-[-10%] right-[-5%] w-[45%] h-[45%] rounded-full bg-cyan-300/20 dark:bg-emerald-500/10 blur-[100px] mix-blend-multiply dark:mix-blend-screen"
        />
        <motion.div 
          animate={{ scale: [1, 1.1, 1], x: [0, 50, 0] }}
          transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
          className="absolute top-[20%] right-[15%] w-[35%] h-[35%] rounded-full bg-purple-300/20 dark:bg-purple-600/10 blur-[100px] mix-blend-multiply dark:mix-blend-screen"
        />
      </div>

      {/* Physics Swarm Sprinkles Element */}
      <ParticleBackground />

      <Sidebar />
      {/* Removed z-10 from here so Sidebar (z-20) sits firmly on top and captures clicks */}
      <div className="flex-1 flex flex-col md:pl-64 min-w-0 transition-all duration-300 w-full relative z-0">
        <Navbar />
        <main className="flex-1 p-6 md:p-10 overflow-y-auto w-full max-w-[1400px] mx-auto z-0">
          <Outlet />
        </main>
      </div>
    </div>
  );
};
