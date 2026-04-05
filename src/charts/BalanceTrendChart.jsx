import { useSelector } from 'react-redux';
import { useMemo } from 'react';
import { AreaChart, Area, XAxis, YAxis, Tooltip, ResponsiveContainer } from 'recharts';
import { formatCurrency } from '../utils/formatters';

export const BalanceTrendChart = () => {
  const transactions = useSelector((state) => state.transactions.items);

  const data = useMemo(() => {
    // Sort transactions chronologically
    const sorted = [...transactions].sort((a, b) => new Date(a.date) - new Date(b.date));
    let runningBalance = 0;
    
    // Group sequentially to construct a fluid timeline
    const timelineMap = new Map();
    
    sorted.forEach(t => {
      const dObj = new Date(t.date);
      const dStr = dObj.toLocaleDateString('default', { month: 'short', day: 'numeric' });
      const amt = Number(t.amount) || 0;
      
      if (t.type === 'income') runningBalance += amt;
      else if (t.type === 'expense') runningBalance -= amt;
      
      timelineMap.set(dStr, {
        date: dStr,
        balance: runningBalance,
      });
    });
    
    let result = Array.from(timelineMap.values());
    
    // Smooth fallback if entirely empty
    if (result.length === 0) {
      return [
        { date: 'Sun', balance: 0 },
        { date: 'Mon', balance: 0 },
        { date: 'Tue', balance: 0 },
        { date: 'Wed', balance: 0 },
        { date: 'Thu', balance: 0 },
        { date: 'Fri', balance: 0 },
        { date: 'Sat', balance: 0 }
      ];
    }

    // CRITICAL: Recharts AreaChart requires at least 2 coordinate points to draw a visible shape.
    // If a user only has 1 transaction, the chart is completely invisible!
    // We prepend a $0 Start node so it always traces a beautiful trajectory from $0 upward.
    result.unshift({ date: 'Origin', balance: 0 });
    
    return result;
  }, [transactions]);

  const CustomTooltip = ({ active, payload, label }) => {
    if (active && payload && payload.length) {
      const isNegative = payload[0].value < 0;
      return (
        <div className="bg-slate-900 border border-slate-700 p-4 rounded-xl shadow-2xl backdrop-blur-2xl">
          <p className="text-slate-400 text-xs font-bold mb-2 tracking-widest uppercase">{label}</p>
          <p className={`text-2xl font-black tracking-tighter ${isNegative ? 'text-rose-500' : 'text-indigo-400'}`}>
             {formatCurrency(payload[0].value)}
          </p>
        </div>
      );
    }
    return null;
  };

  return (
    <ResponsiveContainer width="100%" height="100%">
      <AreaChart data={data} margin={{ top: 20, right: 0, left: 0, bottom: 0 }}>
        <defs>
          <linearGradient id="colorBalance" x1="0" y1="0" x2="0" y2="1">
            <stop offset="5%" stopColor="#6366f1" stopOpacity={0.4} />
            <stop offset="95%" stopColor="#6366f1" stopOpacity={0} />
          </linearGradient>
        </defs>
        <XAxis 
           dataKey="date" 
           hide={false} 
           axisLine={false} 
           tickLine={false} 
           tick={{ fill: '#64748b', fontSize: 12, fontWeight: 'bold' }} 
           dy={10}
           minTickGap={30}
        />
        <YAxis hide={true} domain={['dataMin - 100', 'dataMax + 100']} />
        <Tooltip 
          content={<CustomTooltip />} 
          cursor={{ stroke: '#475569', strokeWidth: 1, strokeDasharray: '4 4' }} 
        />
        <Area 
          type="monotone" 
          dataKey="balance" 
          stroke="#6366f1" 
          strokeWidth={4} 
          fillOpacity={1} 
          fill="url(#colorBalance)" 
          animationDuration={2000}
          animationEasing="ease-in-out"
        />
      </AreaChart>
    </ResponsiveContainer>
  );
};
