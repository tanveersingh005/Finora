import { motion } from 'framer-motion';
import { Card } from '../components/ui/Card';
import { Brain, TrendingUp, AlertTriangle, Lightbulb } from 'lucide-react';
import { useSelector } from 'react-redux';
import { useMemo } from 'react';
import { PieChart, Pie, Cell, BarChart, Bar, XAxis, YAxis, Tooltip as RechartsTooltip, ResponsiveContainer } from 'recharts';

const InsightItem = ({ title, desc, icon: Icon, type }) => {
  const types = {
    positive: "bg-green-100 text-green-600 dark:bg-green-900/30 dark:text-green-500",
    warning: "bg-yellow-100 text-yellow-600 dark:bg-yellow-900/30 dark:text-yellow-500",
    info: "bg-indigo-100 text-indigo-600 dark:bg-indigo-900/30 dark:text-indigo-500"
  };

  return (
    <div className="flex gap-4 p-4 rounded-xl bg-slate-50 dark:bg-slate-800/50 border border-slate-100 dark:border-slate-800 transition-all hover:scale-[1.01]">
      <div className={`h-12 w-12 rounded-full flex items-center justify-center shrink-0 ${types[type]}`}>
        <Icon className="h-6 w-6" />
      </div>
      <div>
        <h4 className="font-semibold text-slate-900 dark:text-white mb-1">{title}</h4>
        <p className="text-sm text-slate-600 dark:text-slate-400 leading-relaxed">{desc}</p>
      </div>
    </div>
  );
};

export const Insights = () => {
  const transactions = useSelector(state => state.transactions.items);

  const { monthlyAnalysis, recommendations, actualRate, cashFlowVsIncome } = useMemo(() => {
     let totalIncome = 0;
     let totalExpense = 0;
     let categoryTotals = {};
     let subscriptionCount = 0;
     let subExpense = 0;

     transactions.forEach(t => {
        const amt = Number(t.amount) || 0;
        if (t.type === 'income') totalIncome += amt;
        if (t.type === 'expense') {
            totalExpense += amt;
            categoryTotals[t.category] = (categoryTotals[t.category] || 0) + amt;
            
            // Heuristic for subscriptions
            const desc = t.description.toLowerCase();
            if (desc.includes('sub') || desc.includes('netflix') || desc.includes('spotify') || desc.includes('prime') || desc.includes('gym')) {
               subscriptionCount++;
               subExpense += amt;
            }
        }
     });

     let maxCat = 'None';
     let maxCatAmt = 0;
     Object.entries(categoryTotals).forEach(([cat, val]) => {
         if (val > maxCatAmt) { maxCatAmt = val; maxCat = cat; }
     });

     const savingsRate = totalIncome > 0 ? ((totalIncome - totalExpense) / totalIncome) * 100 : 0;
     const actualRate = Math.max(0, savingsRate);

     const cashFlowVsIncome = [
        { name: 'Inflow', amount: totalIncome, fill: '#10b981' }, 
        { name: 'Outflow', amount: totalExpense, fill: '#ef4444' }
     ];

     const dynamicMonthly = [];
     const dynamicRecs = [];

     // --- Monthly Analysis Generation ---
     if (savingsRate >= 20) {
        dynamicMonthly.push({ type: 'positive', icon: TrendingUp, title: 'Excellent Savings Rate', desc: `You are retaining ${savingsRate.toFixed(1)}% of your inbound capital. Your asset management is incredibly efficient.` });
     } else if (totalIncome > 0 && savingsRate > 0) {
        dynamicMonthly.push({ type: 'positive', icon: TrendingUp, title: 'Positive Cash Flow', desc: `You are currently saving ${savingsRate.toFixed(1)}% of your income. Consider allocating more to investments.` });
     } else if (totalExpense > totalIncome && totalIncome > 0) {
        dynamicMonthly.push({ type: 'warning', icon: AlertTriangle, title: 'Deficit Alert', desc: `Your expenses exceed your income by $${(totalExpense - totalIncome).toLocaleString()}. Review your largest expense categories.` });
     } else if (totalIncome === 0 && totalExpense > 0) {
        dynamicMonthly.push({ type: 'warning', icon: AlertTriangle, title: 'Pure Expenditure', desc: `You have logged $${totalExpense.toLocaleString()} in expenses but no income recently. Make sure to log deposits.` });
     } else {
        dynamicMonthly.push({ type: 'info', icon: Lightbulb, title: 'Awaiting Data', desc: 'Add more income and expense records to unlock deeper cash flow analytics.' });
     }

     if (maxCatAmt > 0) {
        if (maxCatAmt > totalIncome * 0.4 && totalIncome > 0) {
           dynamicMonthly.push({ type: 'warning', icon: AlertTriangle, title: `High ${maxCat} Costs`, desc: `Your ${maxCat} expenses ($${maxCatAmt.toLocaleString()}) are consuming over 40% of your income.` });
        } else {
           dynamicMonthly.push({ type: 'info', icon: Brain, title: `Top Expenditure: ${maxCat}`, desc: `You have spent $${maxCatAmt.toLocaleString()} on ${maxCat}. Keep monitoring this metric to ensure it aligns with your budget.` });
        }
     }

     // --- Recommendations Generation ---
     if (totalIncome - totalExpense > 1000) {
         dynamicRecs.push({ type: 'positive', icon: Lightbulb, title: 'Investment Opportunity', desc: `With a structural surplus of $${(totalIncome - totalExpense).toLocaleString()}, you could safely allocate heavily into ETFs or Index Funds this period.` });
     }

     if (subscriptionCount > 0) {
         dynamicRecs.push({ type: 'info', icon: AlertTriangle, title: 'Subscription Review', desc: `We detected ${subscriptionCount} recurring/subscription charges totaling $${subExpense.toLocaleString()}. Ensure you actively use these services.` });
     } else if (maxCat === 'Entertainment') {
         dynamicRecs.push({ type: 'info', icon: Brain, title: 'Entertainment Optimization', desc: `Entertainment is your primary expense. Trimming this category yields the highest leverage for your savings rate.` });
     }

     if (dynamicRecs.length === 0) {
         dynamicRecs.push({ type: 'info', icon: Brain, title: 'Keep Tracking', desc: 'As you build your continuous financial record, our algorithmic engine will generate personalized strategic recommendations.' });
     }

     return { monthlyAnalysis: dynamicMonthly, recommendations: dynamicRecs, actualRate, cashFlowVsIncome };
  }, [transactions]);

  return (
    <motion.div 
      initial={{ opacity: 0, y: 10 }} 
      animate={{ opacity: 1, y: 0 }} 
      className="space-y-6 pb-12"
    >
      <div>
        <h1 className="text-3xl font-extrabold text-slate-900 dark:text-white flex items-center gap-3 tracking-tight">
          <Brain className="text-indigo-500 w-8 h-8" /> Smart Insights
        </h1>
        <p className="text-slate-500 dark:text-slate-400 mt-2 font-medium">Algorithmic analysis dynamically generated from your active ledger.</p>
      </div>

      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6 mb-6">
         <Card className="p-6 flex flex-col items-center justify-center group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-32 h-32 bg-emerald-500/10 rounded-full blur-3xl -mr-10 -mt-10 group-hover:bg-emerald-500/20 transition-all duration-700 pointer-events-none"></div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white w-full text-left mb-2 z-10 tracking-tight">Savings Rate</h3>
            <div className="h-[180px] w-full relative flex items-center justify-center z-10">
               <ResponsiveContainer width="100%" height="100%">
                 <PieChart>
                   <Pie
                     data={[{name: 'Saved', value: actualRate}, {name: 'Spent', value: Number(100 - actualRate)}]}
                     cx="50%" cy="50%"
                     innerRadius={55}
                     outerRadius={75}
                     startAngle={180}
                     endAngle={0}
                     dataKey="value"
                     stroke="none"
                   >
                     <Cell fill="#10b981" />
                     <Cell fill="rgba(148, 163, 184, 0.15)" />
                   </Pie>
                 </PieChart>
               </ResponsiveContainer>
               <div className="absolute inset-0 flex flex-col items-center justify-center -mb-8 pointer-events-none">
                 <span className="text-4xl font-black text-emerald-500 tracking-tighter">{actualRate.toFixed(1)}%</span>
                 <span className="text-[10px] font-bold text-slate-400 tracking-[0.2em]">RETENTION</span>
               </div>
            </div>
         </Card>

         <Card className="p-6 lg:col-span-2 group overflow-hidden relative">
            <div className="absolute top-0 right-0 w-64 h-64 bg-indigo-500/5 rounded-full blur-3xl -mr-20 -mt-20 group-hover:bg-indigo-500/10 transition-all duration-700 pointer-events-none"></div>
            <h3 className="font-bold text-lg text-slate-900 dark:text-white mb-6 z-10 relative tracking-tight">Cash Velocity Map</h3>
            <div className="h-[180px] w-full z-10 relative">
               <ResponsiveContainer width="100%" height="100%">
                 <BarChart data={cashFlowVsIncome} layout="vertical" margin={{ top: 0, right: 30, left: 10, bottom: 0 }}>
                   <XAxis type="number" hide />
                   <YAxis dataKey="name" type="category" axisLine={false} tickLine={false} tick={{fill: 'currentColor', fontSize: 13, fontWeight: 700, opacity: 0.6}} width={80} className="text-slate-700 dark:text-slate-300" />
                   <RechartsTooltip 
                     cursor={{fill: 'rgba(255,255,255,0.03)'}} 
                     contentStyle={{ borderRadius: '16px', borderColor: 'rgba(255,255,255,0.1)', backgroundColor: 'rgba(15, 23, 42, 0.95)', color: '#fff', boxShadow: '0 10px 25px -5px rgba(0,0,0,0.3)'}}
                     itemStyle={{fontWeight: 'bold'}}
                     formatter={(val) => `$${Number(val).toLocaleString()}`}
                   />
                   <Bar dataKey="amount" radius={[0, 12, 12, 0]} barSize={40}>
                      {cashFlowVsIncome.map((entry, index) => (
                        <Cell key={`cell-${index}`} fill={entry.fill} />
                      ))}
                   </Bar>
                 </BarChart>
               </ResponsiveContainer>
            </div>
         </Card>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 gap-8">
        <Card className="p-6">
          <h3 className="font-bold text-xl text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-4 mb-6 tracking-tight">Behavioral Analysis</h3>
          <div className="space-y-4">
            {monthlyAnalysis.map((insight, i) => (
              <InsightItem key={`monthly-${i}`} {...insight} />
            ))}
          </div>
        </Card>

        <Card className="p-6">
          <h3 className="font-bold text-xl text-slate-900 dark:text-white border-b border-slate-100 dark:border-slate-800 pb-4 mb-6 tracking-tight">Strategic Recommendations</h3>
          <div className="space-y-4">
            {recommendations.map((rec, i) => (
              <InsightItem key={`rec-${i}`} {...rec} />
            ))}
          </div>
        </Card>
      </div>
    </motion.div>
  );
};
