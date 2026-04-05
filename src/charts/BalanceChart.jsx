import { useSelector } from 'react-redux';
import { useMemo, useState, useRef, useEffect } from 'react';
import { formatCurrency } from '../utils/formatters';

export const BalanceChart = () => {
  const transactions = useSelector((state) => state.transactions.items);

  const { gridGroups, maxPositive, maxNegative } = useMemo(() => {
    const today = new Date();
    today.setHours(0,0,0,0);
    const daysToSubtract = (52 * 7) - 1; 
    const startDate = new Date(today);
    startDate.setDate(today.getDate() - daysToSubtract);

    // Flawless local-time date string generator (avoids UTC drift issues)
    const getLocalYYYYMMDD = (d) => {
        const dateObj = new Date(d);
        const year = dateObj.getFullYear();
        const month = String(dateObj.getMonth() + 1).padStart(2, '0');
        const day = String(dateObj.getDate()).padStart(2, '0');
        return `${year}-${month}-${day}`;
    };

    const dateMap = new Map();
    let iterDate = new Date(startDate);

    for (let i = 0; i < 364; i++) {
       const dateStr = getLocalYYYYMMDD(iterDate);
       dateMap.set(dateStr, {
          date: dateStr,
          income: 0,
          expense: 0,
          net: 0,
          volume: 0
       });
       iterDate.setDate(iterDate.getDate() + 1);
    }

    transactions.forEach(t => {
       // Safely intercept and convert strictly under local bounds
       const formattedDateStr = getLocalYYYYMMDD(t.date); 
       if (dateMap.has(formattedDateStr)) {
          const dayData = dateMap.get(formattedDateStr);
          const amt = Number(t.amount) || 0;
          if (t.type === 'income') dayData.income += amt;
          else if (t.type === 'expense') dayData.expense += amt;
          dayData.net = dayData.income - dayData.expense;
          dayData.volume = dayData.income + dayData.expense;
       }
    });

    let maxPos = 0;
    let maxNeg = 0;
    const daysArray = Array.from(dateMap.values());
    daysArray.forEach(d => {
       if (d.net > maxPos) maxPos = d.net;
       if (d.net < 0 && Math.abs(d.net) > maxNeg) maxNeg = Math.abs(d.net);
    });

    const columns = [];
    for(let i=0; i<52; i++) {
       columns.push(daysArray.slice(i*7, i*7+7));
    }

    // Now group columns into "Month" clusters based on the month of the first day in that column.
    const monthGroups = [];
    let currentMonthIndex = -1;
    let currentGroup = null;

    columns.forEach((col) => {
      const colMonth = new Date(col[0].date).getMonth();
      if (colMonth !== currentMonthIndex) {
         if (currentGroup) monthGroups.push(currentGroup);
         currentGroup = { 
            monthLabel: new Date(col[0].date).toLocaleString('default', { month: 'short' }), 
            columns: [] 
         };
         currentMonthIndex = colMonth;
      }
      currentGroup.columns.push(col);
    });
    if (currentGroup) monthGroups.push(currentGroup);

    return { gridGroups: monthGroups, maxPositive: maxPos || 1, maxNegative: maxNeg || 1 };
  }, [transactions]);

  const [hoveredCell, setHoveredCell] = useState(null);

  const getCellColor = (day) => {
     // Brighter base empty block color so it doesn't vanish into the dark mode background!
     if (day.volume === 0) return 'bg-slate-300/80 dark:bg-slate-700/80';
     
     if (day.volume > 0 && Math.abs(day.net) / day.volume < 0.05) {
        return 'bg-amber-400 dark:bg-amber-500 shadow-sm shadow-amber-400/50';
     }

     if (day.net > 0) {
        const ratio = day.net / maxPositive;
        if (ratio > 0.75) return 'bg-emerald-500 dark:bg-emerald-400 shadow-sm shadow-emerald-400/40 z-10';
        if (ratio > 0.50) return 'bg-emerald-400 dark:bg-emerald-500 z-10';
        if (ratio > 0.25) return 'bg-emerald-300 dark:bg-emerald-600';
        return 'bg-emerald-200 dark:bg-emerald-800/80';
     }

     if (day.net < 0) {
        const MathAbsNet = Math.abs(day.net);
        const ratio = MathAbsNet / maxNegative;
        if (ratio > 0.75) return 'bg-rose-600 dark:bg-rose-500 shadow-sm shadow-rose-500/40 z-10';
        if (ratio > 0.50) return 'bg-rose-500 dark:bg-rose-600 z-10';
        if (ratio > 0.25) return 'bg-rose-400 dark:bg-rose-800';
        return 'bg-rose-300 dark:bg-rose-950';
     }
     return 'bg-slate-300/80 dark:bg-slate-700/80';
  };

  const scrollContainerRef = useRef(null);

  // Automatically scroll to the right edge (current month) immediately on load
  useEffect(() => {
     const timer = setTimeout(() => {
        if (scrollContainerRef.current) {
           scrollContainerRef.current.scrollLeft = scrollContainerRef.current.scrollWidth;
        }
     }, 100);
     return () => clearTimeout(timer);
  }, [gridGroups]);

  return (
    <div 
      ref={scrollContainerRef}
      className="w-full h-full overflow-x-auto overflow-y-hidden custom-scrollbar flex items-center justify-start pointer-events-auto pt-4 pb-2 relative scroll-smooth"
    >
      <div className="min-w-max flex flex-col justify-center px-4 md:px-8 shrink-0 relative">
        
        {/* Hover Tooltip */}
        {hoveredCell && (
          <div className="fixed top-24 right-10 bg-slate-900 border border-slate-700 shadow-2xl text-white text-xs p-4 rounded-xl pointer-events-none z-[100] transform -translate-y-4 transition-all w-56 backdrop-blur-2xl">
             <div className="font-bold text-slate-300 border-b border-slate-700/80 pb-3 mb-3 flex items-center justify-between">
                <span className="text-sm tracking-wide">{new Date(hoveredCell.date).toLocaleDateString(undefined, { weekday: 'short', month: 'short', day: 'numeric', year: 'numeric'})}</span>
             </div>
             {hoveredCell.volume === 0 ? (
               <div className="text-slate-500 italic py-2">No monetary flow recorded.</div>
             ) : (
               <div className="flex flex-col gap-2">
                  {hoveredCell.income > 0 && <div className="flex justify-between text-emerald-400 font-bold text-sm tracking-wide"><span>Received</span><span>+{formatCurrency(hoveredCell.income)}</span></div>}
                  {hoveredCell.expense > 0 && <div className="flex justify-between text-rose-400 font-bold text-sm tracking-wide"><span>Withdrawn</span><span>-{formatCurrency(hoveredCell.expense)}</span></div>}
                  <div className="w-full h-px bg-slate-700/60 my-1"></div>
                  <div className="flex justify-between font-bold text-sm tracking-wide">
                     <span className="text-slate-200">Net Flow</span>
                     <span className={hoveredCell.net > 0 ? "text-emerald-500" : hoveredCell.net < 0 ? "text-rose-500" : "text-amber-400"}>
                        {hoveredCell.net > 0 ? '+' : ''}{formatCurrency(hoveredCell.net)}
                     </span>
                  </div>
               </div>
             )}
          </div>
        )}

        <div className="flex pb-4 relative h-full">
           
           {/* Y-Axis Weekday Labels */}
           <div className="flex flex-col justify-between text-[11px] text-slate-400/80 font-bold shrink-0 pt-8 pb-3 pr-4 h-[164px]">
              <span>Mon</span>
              <span>Wed</span>
              <span>Fri</span>
           </div>

           {/* Grid & X-Axis Month Container */}
           <div className="flex gap-4 shrink-0 relative h-[184px]">
              {gridGroups.map((group, groupIdx) => (
                 <div key={groupIdx} className="flex flex-col shrink-0">
                    <span className="text-[11px] text-slate-500 font-bold mb-3 h-5 block">
                       {group.monthLabel}
                    </span>
                    <div className="flex gap-1.5 shrink-0">
                       {group.columns.map((col, cIdx) => (
                          <div key={cIdx} className="flex flex-col gap-1.5 shrink-0">
                             {col.map((day) => (
                                <div 
                                  key={day.date} 
                                  className={`w-[16px] h-[16px] rounded-[4px] shrink-0 transition-opacity duration-200 cursor-crosshair hover:opacity-75 ${getCellColor(day)}`}
                                  onMouseEnter={() => setHoveredCell(day)}
                                  onMouseLeave={() => setHoveredCell(null)}
                                />
                             ))}
                          </div>
                       ))}
                    </div>
                 </div>
              ))}
           </div>
        </div>

        {/* Legend */}
        <div className="flex items-center gap-8 mt-6 ml-[46px] text-[11px] text-slate-400 font-bold tracking-widest uppercase pb-4">
           <div className="flex items-center gap-3">
              <span>Withdrawal</span>
              <div className="flex gap-1.5 shrink-0">
                 <div className="w-4 h-4 rounded-[4px] bg-rose-300 dark:bg-rose-950"></div>
                 <div className="w-4 h-4 rounded-[4px] bg-rose-400 dark:bg-rose-800"></div>
                 <div className="w-4 h-4 rounded-[4px] bg-rose-500 dark:bg-rose-600"></div>
                 <div className="w-4 h-4 rounded-[4px] bg-rose-600 dark:bg-rose-500"></div>
              </div>
           </div>
           <div className="flex items-center gap-3">
              <span>Neutral</span>
              <div className="w-4 h-4 rounded-[4px] bg-amber-400 dark:bg-amber-500 shadow-sm shadow-amber-400/50"></div>
           </div>
           <div className="flex items-center gap-3">
              <span>Deposit</span>
              <div className="flex gap-1.5 shrink-0">
                 <div className="w-4 h-4 rounded-[4px] bg-emerald-200 dark:bg-emerald-800/80"></div>
                 <div className="w-4 h-4 rounded-[4px] bg-emerald-300 dark:bg-emerald-600"></div>
                 <div className="w-4 h-4 rounded-[4px] bg-emerald-400 dark:bg-emerald-500"></div>
                 <div className="w-4 h-4 rounded-[4px] bg-emerald-500 dark:bg-emerald-400 shadow-sm shadow-emerald-400/40"></div>
              </div>
           </div>
        </div>

      </div>
    </div>
  );
};
