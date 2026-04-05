import { CreditCard, Receipt, TrendingDown, WalletCards } from 'lucide-react';
import { useMemo } from 'react';
import { useSelector } from 'react-redux';

const formatCompactCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    notation: 'compact',
    maximumFractionDigits: 1,
  }).format(value);

const formatCurrency = (value) =>
  new Intl.NumberFormat('en-US', {
    style: 'currency',
    currency: 'USD',
    maximumFractionDigits: 0,
  }).format(value);

export const LiquidityPulseCard = () => {
  const transactions = useSelector((state) => state.transactions.items);

  const metrics = useMemo(() => {
    const expenses = transactions
      .filter((transaction) => transaction.type === 'expense')
      .sort((left, right) => new Date(right.date) - new Date(left.date));

    const totalExpenses = expenses.reduce(
      (sum, transaction) => sum + (Number(transaction.amount) || 0),
      0
    );
    const averageExpense = expenses.length ? totalExpenses / expenses.length : 0;
    const expenseByCategory = {};

    expenses.forEach((transaction) => {
      const amount = Number(transaction.amount) || 0;
      expenseByCategory[transaction.category] =
        (expenseByCategory[transaction.category] || 0) + amount;
    });

    const rankedCategories = Object.entries(expenseByCategory)
      .sort(([, left], [, right]) => right - left)
      .slice(0, 3)
      .map(([name, value]) => ({
        name,
        value,
        share: totalExpenses > 0 ? (value / totalExpenses) * 100 : 0,
      }));

    const leadCategory = rankedCategories[0] || {
      name: 'No category',
      share: 0,
    };

    const recentExpenses = expenses.slice(0, 3).map((transaction) => ({
      id: transaction.id,
      description: transaction.description,
      category: transaction.category,
      amount: Number(transaction.amount) || 0,
      date: transaction.date,
    }));

    return {
      totalExpenses,
      averageExpense,
      transactionCount: expenses.length,
      leadCategory,
      rankedCategories,
      recentExpenses,
    };
  }, [transactions]);

  return (
    <div className="relative z-10 flex h-full flex-col">
      <div className="flex items-center gap-3 mb-6">
        <div className="p-3 bg-amber-100 dark:bg-amber-500/20 rounded-2xl border border-amber-200 dark:border-amber-500/30 shadow-[0_10px_30px_rgba(245,158,11,0.12)]">
          <Receipt className="w-6 h-6 text-amber-500" strokeWidth={2.3} />
        </div>
        <div>
          <h3 className="text-2xl font-black text-slate-900 dark:text-white tracking-tight">
            Expense Pulse
          </h3>
          <p className="text-xs font-bold tracking-[0.1em] uppercase text-amber-500 mt-1">
            Spend Tracking
          </p>
        </div>
      </div>

      <div className="rounded-[2rem] border border-white/50 dark:border-white/10 bg-gradient-to-br from-white/70 via-white/35 to-white/10 dark:from-white/8 dark:via-white/5 dark:to-transparent p-6 backdrop-blur-2xl shadow-[inset_0_1px_0_rgba(255,255,255,0.35)]">
        <div className="flex items-start justify-between gap-5">
          <div>
            <p className="text-[11px] font-bold tracking-[0.2em] uppercase text-slate-400 mb-3">
              Total Spent
            </p>
            <div className="flex items-end gap-3">
              <h4 className="text-5xl font-black tracking-tighter text-slate-900 dark:text-white leading-none">
                {formatCompactCurrency(metrics.totalExpenses)}
              </h4>
              <span className="mb-1 rounded-full border border-rose-400/20 bg-rose-500/10 px-3 py-1 text-xs font-semibold text-rose-400">
                {metrics.transactionCount} records
              </span>
            </div>
            <p className="mt-4 max-w-[15rem] text-sm leading-6 text-slate-600 dark:text-slate-300">
              {metrics.leadCategory.name === 'No category'
                ? 'Start adding expenses to unlock category intelligence.'
                : `${metrics.leadCategory.name} is your largest tracked expense bucket at ${metrics.leadCategory.share.toFixed(0)}% of total spend.`}
            </p>
          </div>

          <div className="relative h-24 w-24 rounded-full border border-white/15 bg-gradient-to-br from-rose-500/25 via-amber-400/20 to-transparent p-[10px] shadow-[0_20px_60px_rgba(15,23,42,0.18)]">
            <div className="flex h-full w-full items-center justify-center rounded-full bg-slate-950/90 text-white shadow-[inset_0_1px_12px_rgba(255,255,255,0.08)]">
              <CreditCard className="h-7 w-7 text-amber-400" strokeWidth={2.1} />
            </div>
          </div>
        </div>
      </div>

      <div className="mt-5 grid grid-cols-3 gap-3">
        <div className="rounded-[1.5rem] border border-white/40 dark:border-white/8 bg-white/50 dark:bg-white/5 px-4 py-4 backdrop-blur-xl">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 font-bold">
            Avg Expense
          </p>
          <p className="mt-3 text-lg font-black tracking-tight text-slate-900 dark:text-white">
            {formatCurrency(metrics.averageExpense)}
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-white/40 dark:border-white/8 bg-white/50 dark:bg-white/5 px-4 py-4 backdrop-blur-xl">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 font-bold">
            Top Category
          </p>
          <p className="mt-3 text-lg font-black tracking-tight text-slate-900 dark:text-white">
            {metrics.leadCategory.name}
          </p>
        </div>
        <div className="rounded-[1.5rem] border border-white/40 dark:border-white/8 bg-white/50 dark:bg-white/5 px-4 py-4 backdrop-blur-xl">
          <p className="text-[11px] uppercase tracking-[0.18em] text-slate-400 font-bold">
            Category Share
          </p>
          <p className="mt-3 text-lg font-black tracking-tight text-slate-900 dark:text-white">
            {metrics.leadCategory.share.toFixed(0)}%
          </p>
        </div>
      </div>

      <div className="mt-6 flex-1 rounded-[2rem] border border-white/40 dark:border-white/8 bg-slate-950/[0.045] dark:bg-white/[0.035] p-5">
        <div className="mb-4 flex items-center justify-between">
          <div className="flex items-center gap-2 text-slate-900 dark:text-white">
            <WalletCards className="h-4 w-4 text-amber-500" />
            <span className="text-sm font-semibold tracking-wide">Recent Expense Activity</span>
          </div>
          <div className="flex items-center gap-1 text-xs font-semibold text-rose-400">
            <TrendingDown className="h-4 w-4" />
            Live tracked
          </div>
        </div>

        {metrics.recentExpenses.length > 0 ? (
          <div className="space-y-4">
            {metrics.recentExpenses.map((expense) => (
              <div
                key={expense.id}
                className="rounded-[1.35rem] border border-white/10 bg-white/40 dark:bg-white/[0.04] px-4 py-3 backdrop-blur-xl"
              >
                <div className="flex items-start justify-between gap-4">
                  <div>
                    <p className="text-sm font-semibold text-slate-900 dark:text-white">
                      {expense.description}
                    </p>
                    <p className="mt-1 text-xs uppercase tracking-[0.14em] text-slate-400">
                      {expense.category} • {expense.date}
                    </p>
                  </div>
                  <p className="text-sm font-black text-rose-400">
                    -{formatCurrency(expense.amount)}
                  </p>
                </div>
              </div>
            ))}

            <div className="pt-2">
              <p className="mb-3 text-xs font-bold uppercase tracking-[0.18em] text-slate-400">
                Category Split
              </p>
              <div className="space-y-3">
                {metrics.rankedCategories.map((category) => (
                  <div key={category.name}>
                    <div className="mb-2 flex items-center justify-between gap-4">
                      <p className="text-sm font-medium text-slate-600 dark:text-slate-300">
                        {category.name}
                      </p>
                      <p className="text-sm font-bold text-slate-900 dark:text-white">
                        {category.share.toFixed(0)}%
                      </p>
                    </div>
                    <div className="h-2 overflow-hidden rounded-full bg-slate-200/70 dark:bg-slate-800">
                      <div
                        className="h-full rounded-full bg-gradient-to-r from-amber-500 via-amber-400 to-yellow-300 shadow-[0_0_18px_rgba(245,158,11,0.35)]"
                        style={{ width: `${Math.max(category.share, 8)}%` }}
                      />
                    </div>
                  </div>
                ))}
              </div>
            </div>
          </div>
        ) : (
          <div className="rounded-[1.35rem] border border-dashed border-white/10 bg-white/30 dark:bg-white/[0.03] px-4 py-5 text-sm text-slate-500 dark:text-slate-400">
            No expense activity available yet.
          </div>
        )}
      </div>
    </div>
  );
};
