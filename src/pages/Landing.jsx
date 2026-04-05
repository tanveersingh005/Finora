import { useState, useEffect } from 'react';
import { motion, useAnimation, useInView } from 'framer-motion';
import { ArrowRight, ArrowLeft, BarChart3, Wallet, Lock, CheckCircle2, ArrowUpRight, ShieldCheck, Activity, Sun, Moon, Trophy, Play, RefreshCw } from 'lucide-react';
import { Link } from 'react-router-dom';

import { useRef } from 'react';

const WealthBuilderGame = () => {
  const [gameState, setGameState] = useState('start'); 
  const [score, setScore] = useState(0);
  const [items, setItems] = useState([]);
  const [timeLeft, setTimeLeft] = useState(30);

  const [highScore, setHighScore] = useState(() => {
    const saved = localStorage.getItem('finora_game_highscore');
    return saved ? parseInt(saved, 10) : 0;
  });

  const containerRef = useRef(null);
  const walletDOMRef = useRef(null);
  const walletXRef = useRef(50); // logical horizontal percentage

  const handlePointerMove = (e) => {
    if (gameState !== 'playing' || !containerRef.current) return;
    const rect = containerRef.current.getBoundingClientRect();
    const clientX = e.touches ? e.touches[0].clientX : e.clientX;
    const x = ((clientX - rect.left) / rect.width) * 100;
    const clampedX = Math.max(8, Math.min(x, 92)); // keep wallet within bounds
    walletXRef.current = clampedX;
    
    // Direct DOM manipulation for zero-latency wallet dragging
    if (walletDOMRef.current) {
        walletDOMRef.current.style.left = `${clampedX}%`;
    }
  };

  useEffect(() => {
    if (gameState !== 'playing') return;

    let localItems = [];

    const spawnInterval = setInterval(() => {
      const isExpense = Math.random() > 0.65; // 35% chance of an expense falling
      localItems.push({
        id: Math.random().toString(),
        type: isExpense ? 'expense' : 'income',
        icon: isExpense ? '💸' : '💰',
        x: Math.random() * 80 + 10,
        y: -10, // Start above the canvas
        speed: Math.random() * 1.5 + 1.2 // falling speed
      });
    }, 450);

    const physicsLoop = setInterval(() => {
      let nextItems = [];
      let scoreDelta = 0;

      localItems.forEach(item => {
        item.y += item.speed;
        
        // At the bottom boundary? (Wallet level)
        if (item.y > 75 && item.y < 95) {
           const distance = Math.abs(item.x - walletXRef.current);
           if (distance < 10) { 
             // Successfully caught by wallet!
             scoreDelta += item.type === 'income' ? 100 : -100;
             return; // destroy item
           }
        }
        
        if (item.y < 120) { // Keep if still falling
          nextItems.push(item);
        }
      });

      localItems = nextItems;
      setItems([...localItems]); // Trigger react render for items
      
      if (scoreDelta !== 0) {
        setScore(s => s + scoreDelta);
      }
    }, 25); // Smooth 40fps rendering for the falling items

    const timer = setInterval(() => {
      setTimeLeft(t => {
        if (t <= 1) {
          setGameState('over');
          return 0;
        }
        return t - 1;
      });
    }, 1000);

    return () => {
      clearInterval(spawnInterval);
      clearInterval(physicsLoop);
      clearInterval(timer);
    };
  }, [gameState]);

  useEffect(() => {
    if (gameState === 'over' && score > highScore) {
      setHighScore(score);
      localStorage.setItem('finora_game_highscore', score.toString());
    }
  }, [gameState, score, highScore]);

  const startGame = () => {
    setScore(0);
    setTimeLeft(30);
    setItems([]);
    setGameState('playing');
  };

  return (
    <div 
      className="relative w-full min-h-[500px] md:min-h-[560px] bg-[#0B0F19] rounded-2xl md:rounded-[24px] p-6 border border-white/10 shadow-[0_20px_50px_rgba(0,0,0,0.5)] overflow-hidden flex flex-col select-none group"
    >
       {/* HUD */}
       <div className="flex justify-between items-center z-10 w-full mb-4 px-2">
         <div>
            <div className="text-slate-400 text-xs font-bold uppercase tracking-widest mb-1">Portfolio Balance</div>
            <div className={`text-2xl md:text-4xl font-black transition-colors ${score < 0 ? 'text-rose-500' : 'text-emerald-400'}`}>
              ${score.toLocaleString()}
            </div>
         </div>
         <div className="flex items-center gap-6 text-right z-10 text-right">
            {highScore !== 0 && (
              <div className="hidden sm:block">
                <div className="text-amber-500/80 text-[10px] font-bold uppercase tracking-widest mb-1">High Score</div>
                <div className="text-amber-400 font-bold text-xl drop-shadow-md">
                   ${highScore.toLocaleString()}
                </div>
              </div>
            )}
            <div>
              <div className="text-slate-500 text-[10px] font-bold uppercase tracking-widest mb-1">Time</div>
              <div className="text-white text-xl font-bold bg-white/10 px-4 py-1.5 rounded-xl backdrop-blur-md border border-white/10">00:{timeLeft.toString().padStart(2, '0')}</div>
            </div>
         </div>
       </div>

       {/* Game Canvas */}
       <div 
         ref={containerRef}
         onMouseMove={handlePointerMove}
         onTouchMove={handlePointerMove}
         className="flex-1 w-full relative bg-gradient-to-t from-indigo-900/20 to-transparent border border-white/5 rounded-xl overflow-hidden cursor-none touch-none pointer-events-auto"
       >
          {gameState === 'start' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0B0F19]/60 backdrop-blur-xl z-20 transition-all cursor-default text-center px-4">
               
               <div className="relative mb-4 md:mb-6">
                 <div className="absolute inset-0 bg-indigo-500/40 blur-2xl rounded-full"></div>
                 <div className="w-16 h-16 md:w-20 md:h-20 bg-slate-900/80 border border-slate-700 rounded-full flex items-center justify-center shadow-2xl relative z-10">
                   <Trophy className="w-8 h-8 md:w-10 md:h-10 text-amber-400 drop-shadow-[0_0_10px_rgba(251,191,36,0.6)]" />
                 </div>
               </div>

               <h3 className="text-3xl md:text-5xl font-black text-transparent bg-clip-text bg-gradient-to-br from-white to-slate-400 tracking-tighter mb-4 md:mb-6">
                 Wealth Catcher
               </h3>
               
               <div className="bg-white/5 border border-white/10 rounded-2xl p-4 mb-6 md:mb-8 backdrop-blur-md max-w-sm w-full mx-auto shadow-2xl">
                 <div className="flex items-center justify-center gap-8 mb-3 border-b border-white/5 pb-3">
                   <div className="flex flex-col items-center gap-1">
                      <span className="text-2xl drop-shadow-md">💰</span> 
                      <span className="text-emerald-400 font-bold text-xs tracking-wider">+ $100</span>
                   </div>
                   <div className="w-[1px] h-8 bg-white/10"></div>
                   <div className="flex flex-col items-center gap-1">
                      <span className="text-2xl drop-shadow-md animate-pulse">💸</span> 
                      <span className="text-rose-400 font-bold text-xs tracking-wider">- $100</span>
                   </div>
                 </div>
                 <p className="text-slate-300 text-xs md:text-sm font-medium leading-relaxed">
                   Slide your mouse or thumb to catch the income.<br/>Dodge the bills to survive!
                 </p>
               </div>

               <button onClick={startGame} className="relative px-8 md:px-10 py-3.5 bg-indigo-600 hover:bg-indigo-500 text-white rounded-xl font-bold transition-all hover:scale-105 active:scale-95 shadow-[0_0_20px_rgba(79,70,229,0.3)] flex items-center justify-center gap-2">
                 <Play className="w-5 h-5 fill-current" /> 
                 Play Game
               </button>
            </div>
          )}

          {gameState === 'over' && (
            <div className="absolute inset-0 flex flex-col items-center justify-center bg-[#0B0F19]/90 backdrop-blur-xl z-20 cursor-default">
               <div className="text-xs font-black tracking-[0.3em] uppercase text-slate-400 mb-3">Time's Up!</div>
               <h3 className={`text-5xl md:text-6xl font-black mb-2 tracking-tighter drop-shadow-lg ${score < 0 ? 'text-rose-500' : 'text-emerald-400'}`}>
                 ${score.toLocaleString()}
               </h3>
               {score >= highScore && score > 0 ? (
                 <div className="text-amber-400 font-bold text-sm uppercase tracking-widest mb-8 animate-pulse">🎉 New High Score! 🎉</div>
               ) : (
                 <div className="text-slate-500 font-bold text-sm mb-8">High Score: ${highScore.toLocaleString()}</div>
               )}
               <div className="flex items-center gap-4">
                 <button onClick={() => setGameState('start')} className="flex items-center gap-2 bg-transparent border-2 border-white/10 hover:bg-white/5 text-slate-300 hover:text-white px-6 py-3 rounded-xl font-bold transition-all hover:scale-105 active:scale-95">
                   <ArrowLeft className="w-5 h-5" /> Back
                 </button>
                 <button onClick={startGame} className="flex items-center gap-2 bg-white text-slate-900 hover:bg-slate-200 px-8 py-3 rounded-xl font-bold transition-transform hover:scale-105 active:scale-95 shadow-xl">
                   <RefreshCw className="w-5 h-5" /> Play Again
                 </button>
               </div>
            </div>
          )}

          {gameState === 'playing' && (
            <>
              {/* Falling Items */}
              {items.map(item => (
                <div 
                  key={item.id} 
                  className={`absolute text-3xl md:text-4xl drop-shadow-xl pointer-events-none transition-transform duration-75 ${item.type === 'expense' ? 'animate-pulse' : ''}`}
                  style={{ left: `${item.x}%`, top: `${item.y}%`, transform: 'translate(-50%, -50%)' }}
                >
                  {item.icon}
                </div>
              ))}

              {/* The Interactive Wallet */}
              <div 
                 ref={walletDOMRef}
                 className="absolute bottom-4 w-24 h-14 md:w-32 md:h-16 bg-slate-800/80 backdrop-blur-md rounded-b-[40px] rounded-t-xl border-t-4 border-emerald-400 shadow-[0_-5px_25px_rgba(52,211,153,0.3)] flex items-end justify-center pb-2 md:pb-3 pointer-events-none will-change-left"
                 style={{ left: '50%', transform: 'translateX(-50%)' }}
              >
                 <span className="text-2xl md:text-3xl drop-shadow-md">💼</span>
              </div>
            </>
          )}
       </div>
    </div>
  );
};

import { useDispatch, useSelector } from 'react-redux';
import { toggleTheme, initTheme } from '../features/ui/uiSlice';
import { ParticleBackground } from '../components/ParticleBackground';

export const Landing = () => {
  const dispatch = useDispatch();
  const theme = useSelector((state) => state.ui.theme);

  useEffect(() => {
    dispatch(initTheme());
  }, [dispatch]);

  return (
    <div className="min-h-screen bg-[#F8F9FB] dark:bg-[#0B0F19] text-slate-900 dark:text-slate-100 font-sans selection:bg-indigo-500/30 overflow-x-hidden transition-colors duration-500 relative">
      
      {/* Navbar with slide-down animation */}
      <motion.nav 
        initial={{ y: -100 }}
        animate={{ y: 0 }}
        transition={{ duration: 0.7, ease: "easeOut" }}
        className="fixed top-0 left-0 right-0 z-50 px-6 py-4 bg-[#F8F9FB]/80 dark:bg-[#0B0F19]/80 backdrop-blur-md border-b border-black/5 dark:border-white/5 transition-colors duration-500"
      >
        <div className="max-w-7xl mx-auto flex items-center justify-between">
          <Link to="/" className="group flex items-center gap-3">
            <div className="relative flex items-center justify-center w-10 h-10">
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-xl bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 opacity-90 blur-[2px] group-hover:blur-[6px] transition-all duration-500"
              />
              <div className="absolute inset-[1.5px] bg-[#F8F9FB] rounded-[10px] flex items-center justify-center overflow-hidden shadow-inner group-hover:bg-white transition-colors duration-500">
                 <motion.div 
                   animate={{ scale: [0.85, 1.15, 0.85], rotate: [0, 90, 0] }}
                   transition={{ duration: 5, repeat: Infinity, ease: "easeInOut" }}
                   className="w-4 h-4 bg-gradient-to-br from-indigo-500 to-cyan-400 rounded-[4px] transform rotate-45 shadow-[0_0_10px_rgba(99,102,241,0.5)]"
                 />
              </div>
            </div>
            <span className="font-extrabold text-2xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-slate-900 via-indigo-900 to-slate-800 dark:from-white dark:via-blue-100 dark:to-slate-300 group-hover:from-indigo-600 group-hover:to-cyan-600 dark:group-hover:from-indigo-400 dark:group-hover:to-cyan-300 transition-all duration-300">
              Finora
            </span>
          </Link>
          
          <div className="flex items-center gap-4 z-10">
            <button 
              onClick={() => dispatch(toggleTheme())}
              className="p-2.5 rounded-full text-slate-500 dark:text-slate-400 hover:bg-slate-200 dark:hover:bg-slate-800 transition-colors"
            >
              {theme === 'dark' ? <Sun className="h-5 w-5" /> : <Moon className="h-5 w-5" />}
            </button>
            <Link to="/dashboard" className="relative group overflow-hidden bg-slate-900 dark:bg-white hover:bg-slate-800 dark:hover:bg-slate-200 text-white dark:text-slate-900 text-sm font-semibold px-6 py-2.5 rounded-xl transition-all shadow-[0_0_15px_rgba(15,23,42,0.2)] dark:hover:shadow-[0_0_25px_rgba(255,255,255,0.3)] hover:-translate-y-0.5 border border-slate-700 dark:border-white">
              <span className="absolute inset-0 w-full h-full bg-white/10 group-hover:bg-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
              <span className="relative flex items-center gap-2">
                Get Started
                <ArrowRight className="h-4 w-4 group-hover:translate-x-1 transition-transform" />
              </span>
            </Link>
          </div>
        </div>
      </motion.nav>

      {/* Hero Section */}
      <section className="relative w-full overflow-hidden">
        <ParticleBackground overlayClass="absolute inset-0" />
        
        <div className="relative z-10 pt-32 pb-20 px-6 max-w-7xl mx-auto flex flex-col items-center justify-center text-center">
          {/* Soft geometric glowing backdrop */}
          <div className="absolute top-1/4 left-1/2 -translate-x-1/2 w-[800px] h-[500px] bg-gradient-to-br from-indigo-400/10 via-purple-400/5 to-transparent blur-[120px] -z-10 rounded-full" />
        
        <motion.div 
          initial={{ opacity: 0, scale: 0.9 }} 
          animate={{ opacity: 1, scale: 1 }} 
          transition={{ duration: 0.5, ease: "easeOut" }}
          className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-indigo-50/80 backdrop-blur-sm border border-indigo-100 text-xs font-semibold text-indigo-700 tracking-wide mb-8 uppercase shadow-sm"
        >
          <span className="h-1.5 w-1.5 rounded-full bg-indigo-500" />
          Intelligent Cash Flow Hub
        </motion.div>

        <motion.h1 
          initial={{ opacity: 0, y: 30 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8, delay: 0.1, ease: [0.16, 1, 0.3, 1] }}
          className="text-6xl md:text-8xl font-bold tracking-tight text-slate-900 dark:text-white leading-[1.05] mb-6 max-w-4xl transition-colors duration-500"
        >
          Precision in Every <br />
          <span className="bg-clip-text text-transparent bg-gradient-to-r from-[#616B82] via-[#818CA2] to-[#B1BBD5] dark:from-indigo-400 dark:via-purple-400 dark:to-cyan-400 inline-block mt-2">Transaction.</span>
        </motion.h1>

        <motion.p 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8, delay: 0.2, ease: "easeOut" }}
          className="text-lg md:text-xl text-slate-600 max-w-2xl mx-auto mb-10 leading-relaxed font-light"
        >
          The next generation of asset management. Experience a weightless financial ecosystem built for precision, clarity, and institutional-grade control.
        </motion.p>

        <motion.div 
          initial={{ opacity: 0, y: 20 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 0.8, delay: 0.3 }}
          className="flex flex-col sm:flex-row items-center gap-4 mb-20 md:mb-28"
        >
          <Link to="/dashboard" className="group bg-[#616B82] dark:bg-indigo-600 hover:bg-[#4E5669] dark:hover:bg-indigo-500 text-white text-base font-medium px-8 py-4 rounded-xl transition-all shadow-xl shadow-[#616B82]/20 dark:shadow-indigo-500/20 w-full sm:w-auto flex items-center justify-center gap-2 relative overflow-hidden">
            <span className="absolute inset-0 w-full h-full bg-white/10 group-hover:bg-transparent translate-y-full group-hover:translate-y-0 transition-transform duration-300 ease-out" />
            <span className="relative">Get Started</span>
            <ArrowRight className="h-4 w-4 relative group-hover:translate-x-1 transition-transform" />
          </Link>
        </motion.div>

        {/* Dynamic Game & Educational Segment */}
        <motion.div 
          initial={{ opacity: 0, y: 60 }} 
          animate={{ opacity: 1, y: 0 }} 
          transition={{ duration: 1, delay: 0.4, type: "spring", bounce: 0.2 }}
          className="w-full max-w-6xl mx-auto flex flex-col lg:flex-row items-center gap-10 lg:gap-16 text-left"
        >
          {/* Intent / Educational Copy (Left Aligned) */}
          <div className="w-full lg:w-[40%] flex flex-col items-center lg:items-start text-center lg:text-left pb-8 lg:pb-0">
             <div className="inline-flex items-center gap-2 px-3 py-1.5 rounded-full bg-amber-500/10 border border-amber-500/20 text-xs font-bold text-amber-500 tracking-widest uppercase mb-6">
                <Play className="w-3.5 h-3.5 fill-amber-500" /> Play To Learn
             </div>
             <h3 className="text-3xl md:text-5xl font-black text-slate-900 dark:text-white tracking-tight mb-6 leading-[1.1]">
               Test Your <br className="hidden lg:block space-y-2" />
               <span className="text-transparent bg-clip-text bg-gradient-to-r from-indigo-500 to-cyan-400">Financial Reflexes.</span>
             </h3>
             <p className="text-slate-600 dark:text-slate-400 text-lg leading-relaxed mb-8 font-medium">
               Money moves fast. Before jumping into the full dashboard, try our Wealth Catcher simulation! Learn to use your money wisely by catching valuable deposits while skillfully dodging unexpected expenses.
             </p>
             <button 
               className="text-indigo-600 dark:text-indigo-400 font-bold flex items-center gap-2 hover:gap-3 transition-all text-lg"
             >
               {/* Start the simulation <ArrowRight className="w-5 h-5" /> */}
             </button>
          </div>

          {/* Game Canvas (Right Aligned) */}
          <div className="w-full lg:w-[60%] relative group shrink-0">
            <div className="absolute -inset-1 bg-gradient-to-b from-indigo-500/20 to-transparent blur-xl rounded-3xl opacity-50 group-hover:opacity-100 transition-opacity duration-700" />
            <WealthBuilderGame />
          </div>
          
        </motion.div>
        
        </div>
      </section>

      {/* Features Grid System with Scroll Reveal Animations */}
      <section id="features" className="py-32 px-6 bg-white dark:bg-[#0B0F19] transition-colors duration-500 relative">
        <div className="absolute inset-0 bg-gradient-to-b from-slate-50/50 dark:from-[#0B0F19] to-white dark:to-[#0B0F19] -z-10" />
        <div className="max-w-6xl mx-auto">
          
          <motion.div 
            initial={{ opacity: 0, y: 30 }}
            whileInView={{ opacity: 1, y: 0 }}
            viewport={{ once: true, margin: "-100px" }}
            transition={{ duration: 0.7 }}
            className="mb-16 max-w-xl"
          >
            <h2 className="text-3xl md:text-5xl font-bold text-slate-900 dark:text-white tracking-tight mb-6">Engineered for Scalability</h2>
            <p className="text-slate-500 text-lg md:text-xl leading-relaxed font-light">Our core features are designed to strip away complexity, leaving only what matters for your financial growth.</p>
          </motion.div>

          <div className="grid grid-cols-1 md:grid-cols-12 gap-6">
            
            {/* Feature Card 1 */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.1 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="md:col-span-7 bg-white dark:bg-slate-900/50 rounded-[24px] p-10 border border-slate-100 dark:border-slate-800 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)] dark:shadow-none flex flex-col justify-between hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-shadow"
            >
              <div>
                <div className="h-14 w-14 rounded-2xl bg-indigo-50/80 border border-indigo-100 flex items-center justify-center mb-8">
                  <BarChart3 className="h-7 w-7 text-indigo-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">Interactive Dashboard</h3>
                <p className="text-slate-500 leading-relaxed max-w-md mb-12 text-lg">
                  Visualize your entire financial ledger with surgical precision. Anticipate market shifts and review cash flow velocity.
                </p>
              </div>
              <Link to="/dashboard" className="inline-flex items-center gap-2 text-indigo-600 font-semibold hover:gap-3 transition-all">
                Explore Dashboard <ArrowRight className="h-4 w-4" />
              </Link>
            </motion.div>

            {/* Feature Card 2 */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.2 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="md:col-span-5 bg-white dark:bg-slate-900/50 rounded-[24px] p-10 border border-slate-100 dark:border-slate-800 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)] flex flex-col justify-between hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] dark:shadow-none transition-shadow"
            >
              <div>
                <div className="h-14 w-14 rounded-2xl bg-emerald-50/80 border border-emerald-100 flex items-center justify-center mb-8">
                  <Wallet className="h-7 w-7 text-emerald-600" />
                </div>
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">Balance Tracking</h3>
                <p className="text-slate-500 leading-relaxed mb-12 text-lg">
                  Real-time ledger syncing across all institutional accounts with zero latency.
                </p>
              </div>
              <div className="h-2 w-full bg-slate-100 dark:bg-slate-800 rounded-full mt-auto relative overflow-hidden shadow-inner">
                <motion.div 
                  initial={{ width: "0%" }} 
                  whileInView={{ width: "75%" }}
                  viewport={{ once: true }}
                  transition={{ duration: 1.5, delay: 0.5, ease: "easeOut" }}
                  className="absolute inset-y-0 left-0 bg-emerald-500 rounded-full"
                />
              </div>
            </motion.div>

            {/* Feature Card 3 */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.3 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="md:col-span-4 bg-slate-900 rounded-[24px] p-10 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.2)] flex flex-col justify-between"
            >
              <div>
                <div className="h-14 w-14 rounded-2xl bg-white/10 flex items-center justify-center mb-8 border border-white/20">
                  <Lock className="h-7 w-7 text-white" />
                </div>
                <h3 className="text-xl font-bold text-white mb-4 tracking-tight">Role Control</h3>
                <p className="text-slate-400 leading-relaxed text-base font-light">
                  Granular permissioning for multi-signature workflows and secure treasury operations out of the box.
                </p>
              </div>
            </motion.div>

            {/* Feature Card 4 */}
            <motion.div 
              initial={{ opacity: 0, y: 40 }}
              whileInView={{ opacity: 1, y: 0 }}
              viewport={{ once: true, margin: "-50px" }}
              transition={{ duration: 0.6, delay: 0.4 }}
              whileHover={{ y: -8, transition: { duration: 0.3 } }}
              className="md:col-span-8 bg-white dark:bg-slate-900/50 rounded-[24px] p-10 border border-slate-100 dark:border-slate-800 shadow-[0_8px_30px_-12px_rgba(0,0,0,0.06)] dark:shadow-none flex flex-col sm:flex-row gap-8 items-center hover:shadow-[0_20px_40px_-15px_rgba(0,0,0,0.1)] transition-shadow overflow-hidden relative"
            >
              <div className="flex-1">
                <h3 className="text-2xl font-bold text-slate-900 dark:text-white mb-4 tracking-tight">Built for Infrastructure</h3>
                <p className="text-slate-500 leading-relaxed mb-8 text-lg font-light">
                  Scale from a single entity to a global conglomerate without switching platforms or running into database bottlenecks.
                </p>
                <div className="space-y-4">
                  <div className="flex items-center gap-3 text-base text-slate-800 font-medium bg-slate-50 dark:bg-slate-800/80 dark:text-slate-300 py-2 px-4 rounded-lg inline-flex w-fit">
                    <ShieldCheck className="h-5 w-5 text-emerald-500" />
                    99.99% Core Uptime
                  </div>
                  <div className="flex items-center gap-3 text-base text-slate-800 font-medium bg-slate-50 dark:bg-slate-800/80 dark:text-slate-300 py-2 px-4 rounded-lg inline-flex w-fit ml-0 sm:ml-4">
                    <CheckCircle2 className="h-5 w-5 text-emerald-500" />
                    ISO 27001 Certified
                  </div>
                </div>
              </div>
            </motion.div>
            
          </div>
        </div>
      </section>

      {/* CTA Section */}
      <section className="py-32 px-6 max-w-6xl mx-auto">
        <motion.div 
          initial={{ opacity: 0, scale: 0.95, y: 40 }}
          whileInView={{ opacity: 1, scale: 1, y: 0 }}
          viewport={{ once: true, margin: "-100px" }}
          whileHover={{ 
            scale: 1.01,
            boxShadow: "0 25px 60px -12px rgba(106, 116, 138, 0.6), 0 0 60px rgba(165, 180, 252, 0.4)",
            transition: { duration: 0.4, ease: "easeOut" }
          }}
          transition={{ duration: 0.8, type: "spring", bounce: 0.2 }}
          className="group bg-gradient-to-br from-[#6A748A] to-[#4B5365] rounded-[3rem] p-14 md:p-24 text-center text-white relative overflow-hidden shadow-2xl shadow-[#6A748A]/30 border border-white/10"
        >
          {/* Liquid / Watery Animated Fluids directly activating on container hover */}
          <div className="absolute inset-0 opacity-0 group-hover:opacity-100 transition-opacity duration-1000 z-0 pointer-events-none">
            {/* Fluid Blob 1 */}
            <motion.div 
              animate={{ 
                borderRadius: ["40% 60% 70% 30% / 40% 50% 60% 50%", "60% 40% 30% 70% / 60% 30% 70% 40%", "40% 60% 70% 30% / 40% 50% 60% 50%"],
                rotate: [0, 360] 
              }}
              transition={{ duration: 12, repeat: Infinity, ease: "linear" }}
              className="absolute -top-[50%] -left-[10%] w-[120%] h-[150%] bg-gradient-to-tr from-indigo-500/50 to-blue-300/40 blur-[50px] mix-blend-overlay"
            />
            {/* Fluid Blob 2 */}
            <motion.div 
              animate={{ 
                borderRadius: ["60% 40% 30% 70% / 60% 30% 70% 40%", "40% 60% 70% 30% / 40% 50% 60% 50%", "60% 40% 30% 70% / 60% 30% 70% 40%"],
                rotate: [360, 0] 
              }}
              transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
              className="absolute -bottom-[50%] -right-[10%] w-[120%] h-[150%] bg-gradient-to-tl from-purple-400/40 to-cyan-300/40 blur-[60px] mix-blend-overlay"
            />
          </div>
          
          {/* Breathing ambient glassmorphism spots */}
          <motion.div 
            animate={{ scale: [1, 1.2, 1], opacity: [0.1, 0.15, 0.1] }}
            transition={{ duration: 8, repeat: Infinity, ease: "easeInOut" }}
            className="absolute top-0 right-0 w-[500px] h-[500px] bg-white/10 blur-[100px] rounded-full pointer-events-none -translate-y-1/2 translate-x-1/4 z-0" 
          />
          <motion.div 
            animate={{ scale: [1, 1.3, 1], opacity: [0.2, 0.3, 0.2] }}
            transition={{ duration: 10, repeat: Infinity, ease: "easeInOut", delay: 1 }}
            className="absolute bottom-0 left-0 w-[500px] h-[500px] bg-indigo-400/20 blur-[100px] rounded-full pointer-events-none translate-y-1/4 -translate-x-1/4 z-0" 
          />
          
          <div className="relative z-10 max-w-3xl mx-auto">
            <h2 className="text-4xl md:text-6xl font-bold tracking-tight mb-8">The future is fluid.</h2>
            <p className="text-slate-200 text-xl font-light mb-12 max-w-2xl mx-auto leading-relaxed">
              Join 400+ enterprises managing over $12B in assets through our precision-engineered platform.
            </p>
            <div className="flex flex-col items-center justify-center gap-4">
              <Link to="/dashboard" className="relative group inline-block">
                {/* Custom Button Glow Effect on Hover */}
                <div className="absolute -inset-1 bg-gradient-to-r from-white/30 via-indigo-100/50 to-white/30 rounded-2xl blur-md opacity-0 group-hover:opacity-100 transition-all duration-500"></div>
                <div className="relative bg-white text-[#4B5365] font-semibold text-lg px-12 py-5 rounded-xl shadow-xl transition-all block w-full sm:-translate-y-0 group-hover:-translate-y-1 group-hover:shadow-2xl">
                  Start Your Journey
                </div>
              </Link>
            </div>
          </div>
        </motion.div>
      </section>

      {/* Footer */}
      <footer className="py-12 px-6 border-t border-slate-200 dark:border-slate-800 shadow-sm bg-white dark:bg-[#0B0F19] transition-colors duration-500">
        <div className="max-w-7xl mx-auto flex flex-col items-center justify-center gap-6 text-center">
          <Link to="/" className="group flex items-center gap-3 opacity-80 hover:opacity-100 transition-opacity">
            <div className="relative flex items-center justify-center w-8 h-8">
              <motion.div 
                animate={{ rotate: 360 }} 
                transition={{ duration: 15, repeat: Infinity, ease: "linear" }}
                className="absolute inset-0 rounded-[10px] bg-gradient-to-tr from-indigo-500 via-purple-500 to-cyan-400 opacity-60 blur-[2px] transition-all duration-700"
              />
              <div className="absolute inset-[1px] bg-white rounded-lg flex items-center justify-center overflow-hidden">
                 <div className="w-3 h-3 bg-gradient-to-br from-indigo-500 to-cyan-400 rounded-[3px] transform rotate-45" />
              </div>
            </div>
            <span className="font-extrabold text-xl tracking-tighter bg-clip-text text-transparent bg-gradient-to-r from-slate-800 to-slate-600">
              Finora
            </span>
          </Link>
          
          <div className="flex flex-col items-center gap-2 mt-2">
            <p className="text-sm font-medium text-slate-500 tracking-wide flex items-center gap-1.5">
              Made by 
              <a 
                href="https://www.linkedin.com/in/tanveer-singh005" 
                target="_blank" 
                rel="noopener noreferrer" 
                className="font-bold text-indigo-900 bg-indigo-50 px-2 py-0.5 rounded-md border border-indigo-100 hover:bg-indigo-100 transition-colors shadow-sm"
              >
                Tanveer Singh
              </a>
            </p>
            <p className="text-xs text-slate-400 mt-1">
              © 2026 Finora. All rights reserved. Built for Precision.
            </p>
          </div>
        </div>
      </footer>
    </div>
  );
};
