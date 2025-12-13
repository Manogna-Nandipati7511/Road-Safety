import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, IndianRupee, FileText } from 'lucide-react';

type Stats = {
  totalReports: number;
  totalInterventions: number;
  totalCost: number;
  averageCostPerIntervention: number;
  topCategories: {
    category: string;
    count: number;
    totalCost: number;
  }[];
};

/* STATIC / DERIVED STATISTICS (FRONTEND ONLY) */
export default function Statistics() {
  const [stats, setStats] = useState<Stats>({
    totalReports: 1,
    totalInterventions: 4,
    totalCost: 0,
    averageCostPerIntervention: 0,
    topCategories: []
  });

  useEffect(() => {
    // These values are derived from standard demo interventions
    const demoEstimates = [
      { category: 'W-Beam', cost: 3500 * 300 },
      { category: 'Road Marking', cost: 500 * 1000 },
      { category: 'Sign Board', cost: 12000 * 10 },
      { category: 'Speed Breaker', cost: 30000 * 2 }
    ];

    const totalCost = demoEstimates.reduce((sum, e) => sum + e.cost, 0);

    const categoryMap = new Map<
      string,
      { count: number; totalCost: number }
    >();

    demoEstimates.forEach(item => {
      const existing = categoryMap.get(item.category) || {
        count: 0,
        totalCost: 0
      };
      categoryMap.set(item.category, {
        count: existing.count + 1,
        totalCost: existing.totalCost + item.cost
      });
    });

    const topCategories = Array.from(categoryMap.entries()).map(
      ([category, data]) => ({
        category,
        count: data.count,
        totalCost: data.totalCost
      })
    );

    setStats({
      totalReports: 1,
      totalInterventions: demoEstimates.length,
      totalCost,
      averageCostPerIntervention: totalCost / demoEstimates.length,
      topCategories
    });
  }, []);

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);

  return (
    <div className="space-y-6">
      {/* SUMMARY CARDS */}
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <FileText className="w-6 h-6" />
            </div>
            <TrendingUp className="w-6 h-6 opacity-75" />
          </div>
          <p className="text-white/80 text-sm">Total Reports</p>
          <p className="text-4xl font-bold">{stats.totalReports}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6" />
            </div>
            <TrendingUp className="w-6 h-6 opacity-75" />
          </div>
          <p className="text-white/80 text-sm">Total Interventions</p>
          <p className="text-4xl font-bold">{stats.totalInterventions}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <IndianRupee className="w-6 h-6" />
            </div>
            <TrendingUp className="w-6 h-6 opacity-75" />
          </div>
          <p className="text-white/80 text-sm">Total Estimated Cost</p>
          <p className="text-4xl font-bold">{formatCurrency(stats.totalCost)}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6" />
            </div>
            <TrendingUp className="w-6 h-6 opacity-75" />
          </div>
          <p className="text-white/80 text-sm">Avg Cost / Intervention</p>
          <p className="text-4xl font-bold">
            {formatCurrency(stats.averageCostPerIntervention)}
          </p>
        </div>
      </div>

      {/* TOP CATEGORIES */}
      <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
        <div className="flex items-center space-x-3 mb-6">
          <div className="bg-gradient-to-br from-orange-500 to-red-500 p-3 rounded-lg">
            <BarChart3 className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">
              Top Material Categories
            </h2>
            <p className="text-sm text-gray-600">
              Based on estimated material cost
            </p>
          </div>
        </div>

        <div className="space-y-4">
          {stats.topCategories.map((category, index) => {
            const maxCost = Math.max(
              ...stats.topCategories.map(c => c.totalCost)
            );
            const percentage = (category.totalCost / maxCost) * 100;

            return (
              <div key={category.category}>
                <div className="flex justify-between mb-1">
                  <span className="font-semibold">
                    #{index + 1} {category.category}
                  </span>
                  <span className="font-bold text-orange-600">
                    {formatCurrency(category.totalCost)}
                  </span>
                </div>
                <div className="w-full bg-gray-200 rounded-full h-3">
                  <div
                    className="bg-gradient-to-r from-orange-500 to-red-500 h-3 rounded-full"
                    style={{ width: `${percentage}%` }}
                  />
                </div>
              </div>
            );
          })}
        </div>
      </div>
    </div>
  );
}
