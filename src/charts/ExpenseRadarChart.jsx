import { Radar, RadarChart, PolarGrid, PolarAngleAxis, PolarRadiusAxis, ResponsiveContainer, Tooltip } from 'recharts';
import { useSelector } from 'react-redux';
import { useMemo } from 'react';

export const ExpenseRadarChart = () => {
  const transactions = useSelector((state) => state.transactions.items);

  const radarData = useMemo(() => {
    // 1. Seed with generic fields present in the "Add Record" form to ensure stable polygon shape
    const categoryTotals = {
      'Housing': 0,
      'Food': 0,
      'Transport': 0,
      'Entertainment': 0,
      'Salary': 0,
      'Investment': 0,
      'Other': 0
    };
    
    // 2. Dynamically interlink with actual Live Transactions (adds custom categories instantly)
    transactions.forEach(t => {
      if (t.type === 'expense') {
        const amt = Number(t.amount) || 0;
        categoryTotals[t.category] = (categoryTotals[t.category] || 0) + amt;
      }
    });

    // 3. Map to Recharts data format
    return Object.entries(categoryTotals).map(([cat, amt]) => ({
      subject: cat,
      amount: amt,
      fullMark: 1500 
    }));
  }, [transactions]);

  return (
    <div className="h-[280px] w-full flex items-center justify-center">
      <ResponsiveContainer width="100%" height="100%">
        <RadarChart cx="50%" cy="50%" outerRadius="65%" data={radarData}>
          <PolarGrid stroke="currentColor" className="text-slate-300 dark:text-slate-700" strokeOpacity={0.4} />
          <PolarAngleAxis 
            dataKey="subject" 
            tick={{ fill: 'currentColor', fontSize: 11, fontWeight: 700, opacity: 0.7 }} 
            className="text-slate-600 dark:text-slate-300"
          />
          {/* CRITICAL: Domain prevents collapse when all values are 0 */}
          <PolarRadiusAxis 
            angle={30} 
            domain={[0, 'dataMax + 100']} 
            tick={false} 
            axisLine={false} 
          />
          <Tooltip 
            contentStyle={{ 
              backgroundColor: '#0F172A', 
              borderColor: '#334155', 
              borderRadius: '0.75rem',
              color: 'white',
              boxShadow: '0 10px 15px -3px rgba(0, 0, 0, 0.4)'
            }}
            itemStyle={{ color: '#FCD34D', fontWeight: 'bold' }} 
            formatter={(value) => `$${Number(value).toLocaleString()}`}
            labelStyle={{ opacity: 0 }}
          />
          <Radar 
            name="Total Spent" 
            dataKey="amount" 
            stroke="#f59e0b" // amber-500
            strokeWidth={3}
            fill="#fbbf24" // amber-400
            fillOpacity={0.25} 
          />
        </RadarChart>
      </ResponsiveContainer>
    </div>
  );
};
