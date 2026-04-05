import { Cell, Pie, PieChart, Tooltip } from 'recharts';
import { useSelector } from 'react-redux';
import { useMemo } from 'react';

// Premium Vibrant Solid Colors that perfectly simulate high-end glowing segments
const COLORS = [
  '#3b82f6', // Bright Blue
  '#10b981', // Vivid Emerald
  '#f59e0b', // Rich Amber
  '#ef4444', // Punchy Red
  '#8b5cf6'  // Saturated Purple
];

export const CategoryChart = () => {
  const transactions = useSelector((state) => state.transactions.items);

  const { dynamicCategoryData, totalTracked } = useMemo(() => {
    let totals = {};
    let totalExps = 0;

    transactions.forEach(t => {
      if (t.type === 'expense') {
        const amt = Number(t.amount) || 0;
        totals[t.category] = (totals[t.category] || 0) + amt;
        totalExps += amt;
      }
    });

    const parsedData = Object.entries(totals)
      .map(([name, value]) => ({
        name,
        value,
        percentage: totalExps > 0 ? Math.round((value / totalExps) * 100) : 0
      }))
      .sort((a, b) => b.value - a.value)
      .slice(0, 5); // Take top 5 categories

    return { 
      dynamicCategoryData: parsedData.length > 0 ? parsedData : [{ name: 'No Data', value: 1, percentage: 0 }], 
      totalTracked: totalExps 
    };
  }, [transactions]);

  // Format the total tracked safely 
  const formattedTotal = totalTracked > 1000 
    ? `$${(totalTracked / 1000).toFixed(1)}K` 
    : `$${totalTracked.toLocaleString()}`;

  return (
    <div className="w-full h-full flex flex-col items-center justify-between pb-2">
      {/* Chart Section */}
      <div className="w-full flex-1 relative min-h-[240px]">
        
        {/* Center Overlay Text inside Donut - BEHIND tooltip context */}
        <div className="absolute inset-0 flex flex-col items-center justify-center pointer-events-none z-0">
           <div className="p-3 bg-white/50 dark:bg-slate-900/50 backdrop-blur-md rounded-full shadow-inner flex flex-col items-center justify-center w-[100px] h-[100px] border border-white/40 dark:border-slate-800/80">
             <span className="text-xl font-black text-slate-900 dark:text-white">{formattedTotal}</span>
             <span className="text-[9px] font-bold text-slate-500 uppercase tracking-widest mt-1">Tracked</span>
           </div>
        </div>

        {/* The Pie Chart - Statically Sized to NEVER Collapse */}
        <div className="w-full h-full flex items-center justify-center relative z-10">
          <PieChart width={300} height={240}>
            <Pie
              data={dynamicCategoryData}
              cx="50%"
              cy="50%"
              innerRadius={65}
              outerRadius={85}
              cornerRadius={12}
              paddingAngle={6}
              dataKey="value"
              stroke="none"
              isAnimationActive={false}
            >
              {dynamicCategoryData.map((entry, index) => (
                <Cell 
                  key={`cell-${index}`} 
                  fill={COLORS[index % COLORS.length]} 
                  className="hover:opacity-80 transition-opacity duration-300 outline-none drop-shadow-md"
                />
              ))}
            </Pie>
            <Tooltip 
              cursor={{fill: 'transparent'}}
              wrapperStyle={{ zIndex: 100 }}
              contentStyle={{ 
                backgroundColor: 'rgba(15, 23, 42, 0.9)',
                backdropFilter: 'blur(10px)',
                borderColor: 'rgba(255,255,255,0.1)',
                borderRadius: '1rem',
                color: '#fff',
                borderWidth: '1px',
                fontWeight: 'bold',
                boxShadow: '0 10px 25px -5px rgba(0, 0, 0, 0.3)'
              }}
              itemStyle={{ color: '#fff' }}
              formatter={(value) => [`${value}%`, 'Allocation']}
            />
          </PieChart>
        </div>
      </div>

      {/* Modern Custom HTML Legend */}
      <div className="w-full grid grid-cols-2 lg:grid-cols-3 gap-3 mt-4 z-10 px-2 pointer-events-auto">
        {dynamicCategoryData.map((category, index) => (
          <div key={category.name} className="group flex items-center justify-between p-3 rounded-2xl bg-white/40 dark:bg-slate-800/40 border border-white/60 dark:border-slate-700/50 hover:bg-white/80 dark:hover:bg-slate-700/80 shadow-sm hover:shadow-md transition-all duration-300 cursor-pointer backdrop-blur-md">
            <div className="flex items-center gap-2.5 w-full">
              <div 
                className="w-3.5 h-3.5 rounded-full shadow-sm group-hover:scale-125 transition-transform duration-300 shrink-0" 
                style={{ backgroundColor: COLORS[index % COLORS.length] }} 
              />
              <span className="text-xs font-bold text-slate-700 dark:text-slate-300 truncate">{category.name}</span>
            </div>
            <span className="text-sm font-black text-slate-900 dark:text-white ml-2">{category.percentage}%</span>
          </div>
        ))}
      </div>
    </div>
  );
};
