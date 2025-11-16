import { useEffect, useState } from 'react';
import { BarChart3, TrendingUp, IndianRupee, FileText } from 'lucide-react';
import { supabase } from '../lib/supabase';

type Stats = {
  totalReports: number;
  totalInterventions: number;
  totalCost: number;
  averageCostPerIntervention: number;
  topCategories: { category: string; count: number; totalCost: number }[];
};

export default function Statistics() {
  const [stats, setStats] = useState<Stats>({
    totalReports: 0,
    totalInterventions: 0,
    totalCost: 0,
    averageCostPerIntervention: 0,
    topCategories: []
  });
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStatistics();
  }, []);

  const fetchStatistics = async () => {
    const { data: reports } = await supabase
      .from('interventions')
      .select('*')
      .eq('status', 'completed');

    const { data: items } = await supabase
      .from('intervention_items')
      .select('*');

    const { data: estimates } = await supabase
      .from('cost_estimates')
      .select('*');

    if (reports && items && estimates) {
      const totalCost = estimates.reduce((sum, e) => sum + e.total_cost, 0);
      const categoryMap = new Map<string, { count: number; totalCost: number }>();

      for (const estimate of estimates) {
        const category = estimate.material_name.split(' ')[0];
        const existing = categoryMap.get(category) || { count: 0, totalCost: 0 };
        categoryMap.set(category, {
          count: existing.count + 1,
          totalCost: existing.totalCost + estimate.total_cost
        });
      }

      const topCategories = Array.from(categoryMap.entries())
        .map(([category, data]) => ({ category, ...data }))
        .sort((a, b) => b.totalCost - a.totalCost)
        .slice(0, 5);

      setStats({
        totalReports: reports.length,
        totalInterventions: items?.length || 0,
        totalCost,
        averageCostPerIntervention: items?.length ? totalCost / items.length : 0,
        topCategories
      });
    }

    setLoading(false);
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-200">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading statistics...</p>
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-4">
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
              <FileText className="w-6 h-6" />
            </div>
            <TrendingUp className="w-6 h-6 opacity-75" />
          </div>
          <p className="text-white/80 text-sm font-medium mb-1">Total Reports</p>
          <p className="text-4xl font-bold">{stats.totalReports}</p>
        </div>

        <div className="bg-gradient-to-br from-green-500 to-emerald-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
              <BarChart3 className="w-6 h-6" />
            </div>
            <TrendingUp className="w-6 h-6 opacity-75" />
          </div>
          <p className="text-white/80 text-sm font-medium mb-1">Total Interventions</p>
          <p className="text-4xl font-bold">{stats.totalInterventions}</p>
        </div>

        <div className="bg-gradient-to-br from-orange-500 to-red-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
              <IndianRupee className="w-6 h-6" />
            </div>
            <TrendingUp className="w-6 h-6 opacity-75" />
          </div>
          <p className="text-white/80 text-sm font-medium mb-1">Total Estimated Cost</p>
          <p className="text-4xl font-bold">{formatCurrency(stats.totalCost)}</p>
        </div>

        <div className="bg-gradient-to-br from-purple-500 to-pink-500 rounded-xl shadow-lg p-6 text-white">
          <div className="flex items-center justify-between mb-4">
            <div className="bg-white/20 p-3 rounded-lg backdrop-blur-sm">
              <BarChart3 className="w-6 h-6" />
            </div>
            <TrendingUp className="w-6 h-6 opacity-75" />
          </div>
          <p className="text-white/80 text-sm font-medium mb-1">Avg Cost / Intervention</p>
          <p className="text-4xl font-bold">{formatCurrency(stats.averageCostPerIntervention)}</p>
        </div>
      </div>

      {stats.topCategories.length > 0 && (
        <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
          <div className="flex items-center space-x-3 mb-6">
            <div className="bg-gradient-to-br from-orange-500 to-red-500 p-3 rounded-lg">
              <BarChart3 className="w-6 h-6 text-white" />
            </div>
            <div>
              <h2 className="text-xl font-bold text-gray-800">Top Material Categories</h2>
              <p className="text-sm text-gray-600">By total estimated cost</p>
            </div>
          </div>

          <div className="space-y-3">
            {stats.topCategories.map((category, index) => {
              const maxCost = Math.max(...stats.topCategories.map(c => c.totalCost));
              const percentage = (category.totalCost / maxCost) * 100;

              return (
                <div key={category.category} className="space-y-2">
                  <div className="flex items-center justify-between">
                    <div className="flex items-center space-x-3">
                      <span className="bg-gradient-to-r from-orange-500 to-red-500 text-white font-bold text-sm px-3 py-1 rounded-lg">
                        #{index + 1}
                      </span>
                      <span className="font-semibold text-gray-800">{category.category}</span>
                      <span className="text-sm text-gray-500">({category.count} items)</span>
                    </div>
                    <span className="font-bold text-orange-600">{formatCurrency(category.totalCost)}</span>
                  </div>
                  <div className="w-full bg-gray-200 rounded-full h-3 overflow-hidden">
                    <div
                      className="bg-gradient-to-r from-orange-500 to-red-500 h-full rounded-full transition-all duration-500"
                      style={{ width: `${percentage}%` }}
                    ></div>
                  </div>
                </div>
              );
            })}
          </div>
        </div>
      )}
    </div>
  );
}
