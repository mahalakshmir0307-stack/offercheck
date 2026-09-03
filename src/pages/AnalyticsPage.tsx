import { useEffect, useState } from 'react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  LineChart, Line, AreaChart, Area,
} from 'recharts';
import { DollarSign, TrendingUp, Wallet, Package, Loader2 } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { formatCurrency, formatDate } from '@/lib/constants';
import type { Product, WoodPiece } from '@/lib/types';

export function AnalyticsPage() {
  const [products, setProducts] = useState<Product[]>([]);
  const [woodPieces, setWoodPieces] = useState<WoodPiece[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data: prods } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: true });
      const { data: wood } = await supabase
        .from('wood_pieces')
        .select('*')
        .order('created_at', { ascending: true });
      setProducts((prods || []) as Product[]);
      setWoodPieces((wood || []) as WoodPiece[]);
      setLoading(false);
    }
    fetchData();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <Loader2 className="w-6 h-6 text-amber-700 animate-spin" />
      </div>
    );
  }

  const totalRevenue = products.reduce((sum, p) => sum + p.estimated_value, 0);
  const estimatedProfit = Math.round(totalRevenue * 0.72);
  const totalProducts = products.length;
  const totalUnits = products.reduce((sum, p) => sum + p.quantity, 0);
  const reusableWood = woodPieces.filter(w => w.status === 'available' || w.status === 'reserved');
  const utilizationRate = woodPieces.length > 0
    ? Math.round((reusableWood.length / woodPieces.length) * 100)
    : 0;

  const kpis = [
    { label: 'Total Revenue', value: formatCurrency(totalRevenue), icon: DollarSign, color: 'text-emerald-700', bg: 'bg-emerald-50' },
    { label: 'Estimated Profit', value: formatCurrency(estimatedProfit), icon: Wallet, color: 'text-emerald-700', bg: 'bg-emerald-50' },
    { label: 'Products Created', value: totalProducts, icon: Package, color: 'text-slate-700', bg: 'bg-slate-100' },
    { label: 'Utilization Rate', value: `${utilizationRate}%`, icon: TrendingUp, color: 'text-amber-700', bg: 'bg-amber-50' },
  ];

  // Revenue over time (cumulative)
  let cumulative = 0;
  const revenueOverTime = products.map((p) => {
    cumulative += p.estimated_value;
    return {
      date: formatDate(p.created_at),
      revenue: cumulative,
      daily: p.estimated_value,
    };
  });

  // Product type distribution
  const typeMap = new Map<string, { count: number; value: number }>();
  products.forEach((p) => {
    const existing = typeMap.get(p.product_type) || { count: 0, value: 0 };
    typeMap.set(p.product_type, {
      count: existing.count + p.quantity,
      value: existing.value + p.estimated_value,
    });
  });
  const typeData = Array.from(typeMap.entries()).map(([name, data]) => ({
    name,
    value: data.value,
    count: data.count,
  }));

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-xl font-bold text-slate-900">Revenue Analytics</h1>
        <p className="text-sm text-slate-500 mt-0.5">Financial performance and material utilization analysis.</p>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map((card) => (
          <Card key={card.label} className="p-4">
            <div className={`w-8 h-8 rounded-md ${card.bg} flex items-center justify-center mb-2.5`}>
              <card.icon className={`w-4 h-4 ${card.color}`} />
            </div>
            <p className="text-lg font-bold text-slate-900 leading-tight">{card.value}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{card.label}</p>
          </Card>
        ))}
      </div>

      {/* Revenue trend */}
      <Card>
        <CardHeader>
          <CardTitle>Revenue Trend</CardTitle>
        </CardHeader>
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
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickFormatter={(v) => `$${v}`} />
                <Tooltip
                  contentStyle={{ fontSize: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                  formatter={(value) => formatCurrency(Number(value))}
                />
                <Area
                  type="monotone"
                  dataKey="revenue"
                  stroke="#10b981"
                  strokeWidth={2}
                  fill="url(#revGradient)"
                  name="Cumulative Revenue"
                />
              </AreaChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-72 flex items-center justify-center text-sm text-slate-400">
              No revenue data available yet
            </div>
          )}
        </CardContent>
      </Card>

      {/* Two-column charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Daily revenue */}
        <Card>
          <CardHeader>
            <CardTitle>Revenue by Product Creation</CardTitle>
          </CardHeader>
          <CardContent>
            {revenueOverTime.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={revenueOverTime} margin={{ top: 10, right: 10, left: -10, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickFormatter={(v) => `$${v}`} />
                  <Tooltip
                    contentStyle={{ fontSize: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                  <Bar dataKey="daily" fill="#b45309" radius={[4, 4, 0, 0]} name="Revenue" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-60 flex items-center justify-center text-sm text-slate-400">
                No data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Product type value */}
        <Card>
          <CardHeader>
            <CardTitle>Value by Product Type</CardTitle>
          </CardHeader>
          <CardContent>
            {typeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={typeData} layout="vertical" margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickFormatter={(v) => `$${v}`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} width={80} />
                  <Tooltip
                    contentStyle={{ fontSize: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }}
                    formatter={(value) => formatCurrency(Number(value))}
                  />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Value" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-60 flex items-center justify-center text-sm text-slate-400">
                No product type data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Wood utilization trend */}
      <Card>
        <CardHeader>
          <CardTitle>Material Inventory Over Time</CardTitle>
        </CardHeader>
        <CardContent>
          {woodPieces.length > 0 ? (
            <ResponsiveContainer width="100%" height={240}>
              <LineChart
                data={woodPieces.map((w, i) => ({
                  date: formatDate(w.created_at),
                  cumulative: i + 1,
                }))}
                margin={{ top: 10, right: 10, left: -10, bottom: 0 }}
              >
                <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                <XAxis dataKey="date" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
                <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
                <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }} />
                <Line type="monotone" dataKey="cumulative" stroke="#b45309" strokeWidth={2} dot={{ r: 3 }} name="Cumulative Entries" />
              </LineChart>
            </ResponsiveContainer>
          ) : (
            <div className="h-60 flex items-center justify-center text-sm text-slate-400">
              No inventory data available
            </div>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
