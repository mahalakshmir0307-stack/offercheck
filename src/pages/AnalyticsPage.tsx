import { useEffect, useState, useCallback } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area, PieChart, Pie, Cell, Legend,
} from 'recharts';
import { DollarSign, TrendingUp, Wallet, Package, Percent, Layers, Lightbulb, Award, TreePine } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { PageHeader, KpiCard, LoadingState, ErrorState } from '@/components/ui/Shared';
import {
  formatCurrency, formatDate, calculateWoodVolume,
  PRODUCT_CATALOG, CATEGORY_LABELS, buildScoredSuggestion,
} from '@/lib/constants';
import type { Product, WoodPiece } from '@/lib/types';

const PIE_COLORS = ['#b45309', '#3b82f6', '#10b981', '#f59e0b', '#8b5cf6', '#ef4444', '#06b6d4', '#6366f1'];

export function AnalyticsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [woodPieces, setWoodPieces] = useState<WoodPiece[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [{ data: prods, error: pErr }, { data: wood, error: wErr }] = await Promise.all([
      supabase.from('products').select('*').order('created_at', { ascending: true }),
      supabase.from('wood_pieces').select('*').order('created_at', { ascending: true }),
    ]);
    if (pErr || wErr) {
      setError('Unable to load analytics data. Please try again.');
      setLoading(false);
      return;
    }
    setProducts((prods || []) as Product[]);
    setWoodPieces((wood || []) as WoodPiece[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Revenue Analytics" description="Financial performance and material utilization analysis." />
        <LoadingState message="Loading analytics data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Revenue Analytics" description="Financial performance and material utilization analysis." />
        <ErrorState message={error} onRetry={fetchData} />
      </div>
    );
  }

  const totalRevenue = products.reduce((s, p) => s + p.estimated_value, 0);
  const totalProfit = products.reduce((s, p) => s + (p.estimated_profit || p.estimated_value - (p.estimated_cost || 0)), 0);
  const totalVolume = woodPieces.reduce((s, w) => s + calculateWoodVolume(w.length_cm, w.width_cm, w.thickness_cm) * w.quantity, 0);
  const reusableWood = woodPieces.filter(w => w.status === 'available' || w.status === 'reserved');
  const utilizationRate = woodPieces.length > 0 ? Math.round((reusableWood.length / woodPieces.length) * 100) : 0;

  // Revenue by wood type (from products)
  const revenueByWoodType = new Map<string, number>();
  products.forEach(p => {
    const wt = p.wood_type || 'Unknown';
    revenueByWoodType.set(wt, (revenueByWoodType.get(wt) || 0) + p.estimated_value);
  });
  const woodTypeRevenueData = Array.from(revenueByWoodType.entries()).map(([name, value]) => ({ name, value }));

  // Profit by product category
  const profitByCategory = new Map<string, number>();
  products.forEach(p => {
    const profit = p.estimated_profit || p.estimated_value - (p.estimated_cost || 0);
    profitByCategory.set(p.product_type, (profitByCategory.get(p.product_type) || 0) + profit);
  });
  const categoryProfitData = Array.from(profitByCategory.entries()).map(([name, value]) => ({ name, value }));

  // Feasibility distribution across all wood pieces
  const feasibilityBuckets = { high: 0, medium: 0, low: 0, none: 0 };
  woodPieces.forEach(w => {
    PRODUCT_CATALOG.forEach(p => {
      const scored = buildScoredSuggestion(w, p);
      if (!scored.matched) feasibilityBuckets.none++;
      else if (scored.score >= 80) feasibilityBuckets.high++;
      else if (scored.score >= 65) feasibilityBuckets.medium++;
      else feasibilityBuckets.low++;
    });
  });
  const feasibilityData = [
    { name: 'High (80-100)', value: feasibilityBuckets.high },
    { name: 'Medium (65-79)', value: feasibilityBuckets.medium },
    { name: 'Low (60-64)', value: feasibilityBuckets.low },
    { name: 'Not Feasible', value: feasibilityBuckets.none },
  ].filter(d => d.value > 0);

  // Revenue over time
  let cumulative = 0;
  const revenueOverTime = products.map(p => {
    cumulative += p.estimated_value;
    return { date: formatDate(p.created_at), revenue: cumulative, daily: p.estimated_value };
  });

  // Business insights
  const insights: { icon: typeof Lightbulb; title: string; text: string; color: string; bg: string }[] = [];

  // Most profitable wood type
  const profitByWoodType = new Map<string, number>();
  woodPieces.filter(w => w.status === 'available' || w.status === 'reserved').forEach(w => {
    PRODUCT_CATALOG.forEach(p => {
      const scored = buildScoredSuggestion(w, p);
      if (scored.matched) {
        const profit = p.estimated_value - scored.estimatedCost;
        profitByWoodType.set(w.wood_type, (profitByWoodType.get(w.wood_type) || 0) + profit);
      }
    });
  });
  const bestWoodType = Array.from(profitByWoodType.entries()).sort((a, b) => b[1] - a[1])[0];
  if (bestWoodType) {
    insights.push({
      icon: TreePine,
      title: 'Best Wood Type by Profit',
      text: `${bestWoodType[0]} leftovers currently generate the highest estimated profit opportunity at ${formatCurrency(bestWoodType[1])}.`,
      color: 'text-amber-700', bg: 'bg-amber-50',
    });
  }

  // Most recommended product
  const productFeasibleCount = new Map<string, number>();
  woodPieces.forEach(w => {
    PRODUCT_CATALOG.forEach(p => {
      const scored = buildScoredSuggestion(w, p);
      if (scored.matched) productFeasibleCount.set(p.name, (productFeasibleCount.get(p.name) || 0) + 1);
    });
  });
  const mostRecommended = Array.from(productFeasibleCount.entries()).sort((a, b) => b[1] - a[1])[0];
  if (mostRecommended) {
    insights.push({
      icon: Award,
      title: 'Most Feasible Product',
      text: `${mostRecommended[0]} is feasible for ${mostRecommended[1]} of your recorded wood pieces — the most broadly applicable product.`,
      color: 'text-blue-700', bg: 'bg-blue-50',
    });
  }

  // Most profitable product
  const productProfitMap = new Map<string, number>();
  woodPieces.filter(w => w.status === 'available' || w.status === 'reserved').forEach(w => {
    PRODUCT_CATALOG.forEach(p => {
      const scored = buildScoredSuggestion(w, p);
      if (scored.matched) {
        const profit = p.estimated_value - scored.estimatedCost;
        const existing = productProfitMap.get(p.name);
        if (!existing || profit > existing) productProfitMap.set(p.name, profit);
      }
    });
  });
  const mostProfitableProduct = Array.from(productProfitMap.entries()).sort((a, b) => b[1] - a[1])[0];
  if (mostProfitableProduct) {
    insights.push({
      icon: TrendingUp,
      title: 'Most Profitable Product',
      text: `${mostProfitableProduct[0]} offers the highest single-product estimated profit at ${formatCurrency(mostProfitableProduct[1])}.`,
      color: 'text-emerald-700', bg: 'bg-emerald-50',
    });
  }

  // Waste reduction insight
  if (woodPieces.length > 0) {
    insights.push({
      icon: Lightbulb,
      title: 'Waste Reduction Potential',
      text: `${utilizationRate}% of your recorded material has reuse potential. Converting available wood into products could reduce waste significantly.`,
      color: 'text-amber-700', bg: 'bg-amber-50',
    });
  }

  const kpis = [
    { label: 'Total Revenue', value: formatCurrency(totalRevenue), icon: DollarSign, color: 'text-emerald-700', bg: 'bg-emerald-50', description: 'Estimated value of all products' },
    { label: 'Estimated Profit', value: formatCurrency(totalProfit), icon: Wallet, color: 'text-emerald-700', bg: 'bg-emerald-50', description: 'Revenue minus production cost' },
    { label: 'Products Created', value: products.length, icon: Package, color: 'text-charcoal-700', bg: 'bg-charcoal-100', description: 'Total product count' },
    { label: 'Utilization Rate', value: `${utilizationRate}%`, icon: Percent, color: 'text-amber-700', bg: 'bg-amber-50', description: 'Material with reuse potential' },
    { label: 'Total Volume', value: `${totalVolume.toFixed(0)} cm³`, icon: Layers, color: 'text-blue-700', bg: 'bg-blue-50', description: 'Across all wood pieces' },
    { label: 'Profit Margin', value: totalRevenue > 0 ? `${Math.round((totalProfit / totalRevenue) * 100)}%` : '0%', icon: TrendingUp, color: 'text-emerald-700', bg: 'bg-emerald-50', description: 'Profit as share of revenue' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader title="Revenue Analytics" description="Financial performance and material utilization analysis." />

      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
        {kpis.map(k => <KpiCard key={k.label} {...k} />)}
      </div>

      {/* Revenue trend */}
      <Card>
        <CardHeader><CardTitle>Revenue Trend</CardTitle></CardHeader>
        <CardContent>
          {revenueOverTime.length > 0 ? (
            <ResponsiveContainer width="100%" height={280}>
              <AreaChart data={revenueOverTime} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                <defs>
                  <linearGradient id="revGradient" x1="0" y1="0" x2="0" y2="1">
                    <stop offset="5%" stopColor="#10b981" stopOpacity={0.15} />
                    <stop offset="95%" stopColor="#10b981" stopOpacity={0} />
                  </linearGradient>
                </defs>
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickFormatter={v => `$${v}`} />
                <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }} formatter={v => formatCurrency(Number(v))} />
                <Area type="monotone" dataKey="revenue" stroke="#10b981" strokeWidth={2} fill="url(#revGradient)" name="Cumulative Revenue" />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-72 flex items-center justify-center text-sm text-charcoal-400">No revenue data available yet</div>
          )}
        </CardContent>
      </Card>

      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Revenue by wood type */}
        <Card>
          <CardHeader><CardTitle>Revenue Opportunity by Wood Type</CardTitle></CardHeader>
          <CardContent>
            {woodTypeRevenueData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={woodTypeRevenueData} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickFormatter={v => `$${v}`} />
                  <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }} formatter={v => formatCurrency(Number(v))} />
                  <Bar dataKey="value" fill="#b45309" radius={[4, 4, 0, 0]} name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-60 flex items-center justify-center text-sm text-charcoal-400">No revenue data available</div>
            )}
          </CardContent>
        </Card>

        {/* Profit by product category */}
        <Card>
          <CardHeader><CardTitle>Profit by Product Category</CardTitle></CardHeader>
          <CardContent>
            {categoryProfitData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={categoryProfitData} layout="vertical" margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickFormatter={v => `$${v}`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} width={100} />
                  <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }} formatter={v => formatCurrency(Number(v))} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Profit" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-60 flex items-center justify-center text-sm text-charcoal-400">No profit data available</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Feasibility distribution + Material inventory over time */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Feasibility Distribution</CardTitle></CardHeader>
          <CardContent>
            {feasibilityData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={feasibilityData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40}
                    label={(props: { name?: string; value?: number }) => `${props.name}: ${props.value}`}
                    labelLine={false} style={{ fontSize: '11px' }}>
                    {feasibilityData.map((_, idx) => <Cell key={idx} fill={PIE_COLORS[idx % PIE_COLORS.length]} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-60 flex items-center justify-center text-sm text-charcoal-400">No feasibility data available</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Material Inventory Over Time</CardTitle></CardHeader>
          <CardContent>
            {woodPieces.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <LineChart
                  data={woodPieces.map((w, i) => ({ date: formatDate(w.created_at), cumulative: i + 1 }))}
                  margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
                  <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }} />
                  <Line type="monotone" dataKey="cumulative" stroke="#b45309" strokeWidth={2} dot={{ r: 3 }} name="Cumulative Entries" />
                </LineChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-60 flex items-center justify-center text-sm text-charcoal-400">No inventory data available</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Business Insights */}
      {insights.length > 0 && (
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Lightbulb className="w-4 h-4 text-amber-700" />
              Business Decision Insights
            </CardTitle>
          </CardHeader>
          <CardContent>
            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              {insights.map((insight, idx) => {
                const InsightIcon = insight.icon;
                return (
                  <div key={idx} className="flex items-start gap-3 p-4 rounded-md border border-charcoal-200 bg-charcoal-50">
                    <div className={`w-9 h-9 rounded-md ${insight.bg} flex items-center justify-center flex-shrink-0`}>
                      <InsightIcon className={`w-4 h-4 ${insight.color}`} />
                    </div>
                    <div>
                      <p className="text-sm font-semibold text-charcoal-900">{insight.title}</p>
                      <p className="text-xs text-charcoal-600 mt-1 leading-relaxed">{insight.text}</p>
                    </div>
                  </div>
                );
              })}
            </div>
          </CardContent>
        </Card>
      )}
    </div>
  );
}
