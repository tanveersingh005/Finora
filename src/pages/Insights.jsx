import { motion } from 'framer-motion';
import { useSelector } from 'react-redux';
import { useMemo } from 'react';
import { 
  AreaChart, Area, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  ScatterChart, Scatter, ZAxis,
  ComposedChart, Legend, Bar, Line
} from 'recharts';
import { Activity, Target, Layers } from 'lucide-react';

const InsightCard = ({ children, title, icon: Icon, delay = 0, colorClass = "indigo" }) => (
  <motion.div 
    initial={{ opacity: 0, y: 30 }}
    animate={{ opacity: 1, y: 0 }}
    transition={{ duration: 0.7, delay, ease: [0.21, 0.47, 0.32, 0.98] }}
    className="relative flex flex-col overflow-hidden rounded-[2rem] bg-white/60 dark:bg-[#111827]/60 backdrop-blur-3xl border border-white/40 dark:border-white/5 shadow-xl p-8"
  >
    <div className={`absolute top-0 right-0 w-64 h-64 bg-${colorClass}-500/10 rounded-full blur-3xl -mr-20 -mt-20 pointer-events-none`}></div>
    <div className="flex items-center gap-4 mb-8 z-10">
      <div className={`p-4 rounded-2xl bg-${colorClass}-50 dark:bg-${colorClass}-500/10 border border-${colorClass}-100 dark:border-${colorClass}-500/20`}>
        <Icon className={`w-6 h-6 text-${colorClass}-500`} />
      </div>
      <div>
        <h3 className="text-2xl font-black tracking-tight text-slate-900 dark:text-white">{title}</h3>
        <p className="text-sm font-medium text-slate-500 mt-1 dark:text-slate-400">Advanced Matrix Extrapolation</p>
      </div>
    </div>
    <div className="flex-1 w-full min-h-[300px] z-10">
      {children}
    </div>
  </motion.div>
);

const CustomTooltip = ({ active, payload, label }) => {
  if (active && payload && payload.length) {
    return (
      <div className="bg-white/95 dark:bg-[#0F172A]/95 backdrop-blur-xl p-4 rounded-2xl shadow-2xl border border-slate-100 dark:border-slate-800">
        <p className="font-bold text-slate-900 dark:text-white mb-2">{label}</p>
        {payload.map((entry, index) => (
          <div key={index} className="flex items-center gap-3 mt-1 text-sm">
            <div className="w-2.5 h-2.5 rounded-full" style={{ backgroundColor: entry.color }} />
            <span className="text-slate-500 font-medium">{entry.name}:</span>
            <span className="font-black text-slate-900 dark:text-white">${Math.abs(entry.value).toLocaleString(undefined, { minimumFractionDigits: 2 })}</span>
          </div>
        ))}
      </div>
    );
  }
  return null;
};

export const Insights = () => {
  const transactions = useSelector((state) => state.transactions.items);

  const { areaData, scatterData, composedData } = useMemo(() => {
    // 1. Area Chart (Velocity of Flow over months)
    const monthlyDocs = {};
    const scatterDocs = [];

    // Reverse to process chronologically if sorted
    [...transactions].reverse().forEach(t => {
      const d = new Date(t.date);
      const m = d.toLocaleString('default', { month: 'short' });
      if (!monthlyDocs[m]) monthlyDocs[m] = { name: m, income: 0, expense: 0, target: 1000 + Math.random()*2000 };
      
      const val = Number(t.amount);
      if (t.type === 'income') {
        monthlyDocs[m].income += val;
      } else {
        monthlyDocs[m].expense += val;
      }

      // Scatter: Index vs Amount (Size = logarithmic absolute amount)
      scatterDocs.push({
        x: scatterDocs.length + 1,
        y: val,
        z: val > 500 ? 80 : (val > 100 ? 50 : 20),
        type: t.type,
        category: t.category
      });
    });

    const finalMonths = Object.values(monthlyDocs);

    return { 
      areaData: finalMonths, 
      scatterData: scatterDocs,
      composedData: finalMonths 
    };
  }, [transactions]);

  // Generate Dummy empty data if ledger is fully empty to prevent crashing
  const safeArea = areaData.length > 0 ? areaData : [{name: 'Empty', income: 0, expense: 0}];
  const safeScatter = scatterData.length > 0 ? scatterData : [{x: 0, y: 0, z: 0}];

  return (
    <div className="space-y-8 pb-20 pt-4 px-2 max-w-7xl mx-auto w-full">
      <motion.div 
        initial={{ opacity: 0, y: 10 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.8 }}
        className="mb-8"
      >
        <h1 className="text-4xl md:text-5xl font-black tracking-tight text-slate-900 dark:text-white">
          Deep Insights.
        </h1>
        <p className="mt-3 text-slate-500 font-medium tracking-wide">
          Algorithmic data mapping & predictive telemetry
        </p>
      </motion.div>

      <div className="grid grid-cols-1 xl:grid-cols-2 gap-8">
        
        {/* Fill Area Chart */}
        <InsightCard title="Cash Velocity Ribbon" icon={Activity} colorClass="emerald" delay={0.1}>
          <ResponsiveContainer width="100%" height="100%">
            <AreaChart data={safeArea} margin={{ top: 10, right: 0, left: 0, bottom: 0 }}>
              <defs>
                <linearGradient id="colorIncome" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#10B981" stopOpacity={0.8}/>
                  <stop offset="95%" stopColor="#10B981" stopOpacity={0}/>
                </linearGradient>
                <linearGradient id="colorExpense" x1="0" y1="0" x2="0" y2="1">
                  <stop offset="5%" stopColor="#F43F5E" stopOpacity={0.5}/>
                  <stop offset="95%" stopColor="#F43F5E" stopOpacity={0}/>
                </linearGradient>
              </defs>
              <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
              <YAxis hide={true} />
              <Tooltip content={<CustomTooltip />} />
              <Area type="monotone" dataKey="income" stroke="#10B981" strokeWidth={3} fillOpacity={1} fill="url(#colorIncome)" />
              <Area type="monotone" dataKey="expense" stroke="#F43F5E" strokeWidth={3} fillOpacity={1} fill="url(#colorExpense)" />
            </AreaChart>
          </ResponsiveContainer>
        </InsightCard>

        {/* Scatter Collision Chart */}
        <InsightCard title="Transaction Density Mapping" icon={Target} colorClass="indigo" delay={0.2}>
          <ResponsiveContainer width="100%" height="100%">
            <ScatterChart margin={{ top: 20, right: 20, bottom: 0, left: 0 }}>
              <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#CBD5E1" opacity={0.2} />
              <XAxis type="number" dataKey="x" name="Chronology" hide />
              <YAxis type="number" dataKey="y" name="Amount" tick={{fill: '#94a3b8', fontSize: 12}} axisLine={false} tickLine={false} />
              <ZAxis type="number" dataKey="z" range={[50, 400]} />
              <Tooltip cursor={{strokeDasharray: '3 3'}} content={({ active, payload }) => {
                if(active && payload && payload.length) {
                  const d = payload[0].payload;
                  return (
                    <div className="bg-slate-900 text-white p-3 rounded-xl shadow-xl text-xs font-bold font-mono">
                      {d.category.toUpperCase()}: ${Math.abs(d.y).toFixed(2)}
                    </div>
                  );
                }
                return null;
              }}/>
              <Scatter name="Income" data={safeScatter.filter(d => d.type === 'income')} fill="#3B82F6" opacity={0.6} />
              <Scatter name="Expense" data={safeScatter.filter(d => d.type !== 'income')} fill="#F43F5E" opacity={0.6} />
            </ScatterChart>
          </ResponsiveContainer>
        </InsightCard>

        {/* Composed Chart */}
        <div className="xl:col-span-2">
          <InsightCard title="Hybrid Growth Predictor" icon={Layers} colorClass="amber" delay={0.3}>
            <ResponsiveContainer width="100%" height={400}>
              <ComposedChart data={safeArea} margin={{ top: 20, right: 20, bottom: 0, left: 0 }}>
                <CartesianGrid strokeDasharray="3 3" vertical={false} stroke="#CBD5E1" opacity={0.1} />
                <XAxis dataKey="name" axisLine={false} tickLine={false} tick={{fill: '#94a3b8', fontSize: 12}} dy={10} />
                <YAxis hide />
                <Tooltip content={<CustomTooltip />} />
                <Legend iconType="circle" wrapperStyle={{ paddingTop: '20px', fontSize: '12px', fontWeight: 'bold' }} />
                <Bar dataKey="income" barSize={34} fill="#818CF8" radius={[6, 6, 0, 0]} />
                <Line type="monotone" dataKey="target" stroke="#F59E0B" strokeWidth={4} strokeDasharray="5 5" />
                <Line type="monotone" dataKey="expense" stroke="#EC4899" strokeWidth={3} dot={{ r: 6, fill: '#EC4899', strokeWidth: 2, stroke: '#fff' }} />
              </ComposedChart>
            </ResponsiveContainer>
          </InsightCard>
        </div>

      </div>
    </div>
  );
};
