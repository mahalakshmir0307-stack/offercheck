import { useEffect, useState, useCallback } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, Recycle, Lightbulb, Boxes, DollarSign,
  PlusCircle, ArrowRight, Activity, TrendingUp, TreePine,
  Percent, Wallet, Layers,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PageHeader, KpiCard, LoadingState, ErrorState, ProgressBar } from '@/components/ui/Shared';
import {
  formatCurrency, timeAgo, getStatusConfig, WOOD_STATUSES,
  calculateWoodVolume, PRODUCT_CATALOG, buildScoredSuggestion,
} from '@/lib/constants';
import type { WoodPiece, Product, ActivityLog } from '@/lib/types';

const STATUS_COLORS: Record<string, string> = {
  green: '#10b981', amber: '#f59e0b', blue: '#3b82f6', gray: '#94a3b8',
};

export function DashboardPage() {
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [woodPieces, setWoodPieces] = useState<WoodPiece[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);

  const fetchData = useCallback(async () => {
    setLoading(true);
    setError(null);
    const [{ data: wood, error: wErr }, { data: prods, error: pErr }, { data: act, error: aErr }] = await Promise.all([
      supabase.from('wood_pieces').select('*').order('created_at', { ascending: false }),
      supabase.from('products').select('*').order('created_at', { ascending: false }),
      supabase.from('activity_logs').select('*').order('created_at', { ascending: false }).limit(8),
    ]);
    if (wErr || pErr || aErr) {
      setError('Unable to load dashboard data. Please try again.');
      setLoading(false);
      return;
    }
    setWoodPieces((wood || []) as WoodPiece[]);
    setProducts((prods || []) as Product[]);
    setActivity((act || []) as ActivityLog[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchData(); }, [fetchData]);

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" description="Overview of wood reuse operations and business metrics." />
        <LoadingState message="Loading dashboard data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Dashboard" description="Overview of wood reuse operations and business metrics." />
        <ErrorState message={error} onRetry={fetchData} />
      </div>
    );
  }

  const totalQty = woodPieces.reduce((s, w) => s + w.quantity, 0);
  const reusable = woodPieces.filter(w => w.status === 'available' || w.status === 'reserved');
  const reusableQty = reusable.reduce((s, w) => s + w.quantity, 0);
  const utilization = totalQty > 0 ? Math.round((reusableQty / totalQty) * 100) : 0;
  const totalVolume = woodPieces.reduce((s, w) => s + calculateWoodVolume(w.length_cm, w.width_cm, w.thickness_cm) * w.quantity, 0);

  let opportunityRevenue = 0;
  let opportunityProfit = 0;
  let feasibleCount = 0;
  woodPieces.filter(w => w.status === 'available' || w.status === 'reserved').forEach(w => {
    PRODUCT_CATALOG.forEach(p => {
      const scored = buildScoredSuggestion(w, p);
      if (scored.matched) {
        feasibleCount++;
        opportunityRevenue += p.estimated_value;
        opportunityProfit += p.estimated_value - scored.estimatedCost;
      }
    });
  });

  const productRevenue = products.reduce((s, p) => s + p.estimated_value, 0);
  const productProfit = products.reduce((s, p) => s + (p.estimated_profit || p.estimated_value - (p.estimated_cost || 0)), 0);
  const wasteReduction = totalQty > 0 ? Math.round((reusableQty / totalQty) * 100) : 0;

  const kpis = [
    { label: 'Total Leftover Wood', value: `${totalQty} pcs`, icon: Package, color: 'text-slate-700', bg: 'bg-slate-100' },
    { label: 'Reusable Pieces', value: `${reusableQty} pcs`, icon: Recycle, color: 'text-emerald-700', bg: 'bg-emerald-50' },
    { label: 'Reusable Material %', value: `${utilization}%`, icon: Percent, color: 'text-amber-700', bg: 'bg-amber-50' },
    { label: 'Total Material Volume', value: `${totalVolume.toFixed(0)} cm³`, icon: Layers, color: 'text-blue-700', bg: 'bg-blue-50' },
    { label: 'Est. Revenue Opportunity', value: formatCurrency(opportunityRevenue), icon: DollarSign, color: 'text-emerald-700', bg: 'bg-emerald-50' },
    { label: 'Est. Profit Opportunity', value: formatCurrency(opportunityProfit), icon: Wallet, color: 'text-emerald-700', bg: 'bg-emerald-50' },
    { label: 'Waste Reduction Potential', value: `${wasteReduction}%`, icon: TreePine, color: 'text-amber-700', bg: 'bg-amber-50' },
    { label: 'Products Created', value: products.length, icon: Boxes, color: 'text-blue-700', bg: 'bg-blue-50' },
  ];

  const statusData = WOOD_STATUSES.map(s => ({
    name: s.label,
    value: woodPieces.filter(w => w.status === s.value).reduce((sum, w) => sum + w.quantity, 0),
    color: STATUS_COLORS[s.color] || '#94a3b8',
  })).filter(s => s.value > 0);

  const typeMap = new Map<string, number>();
  woodPieces.forEach(w => typeMap.set(w.wood_type, (typeMap.get(w.wood_type) || 0) + w.quantity));
  const woodTypeData = Array.from(typeMap.entries()).map(([name, quantity]) => ({ name, quantity })).sort((a, b) => b.quantity - a.quantity).slice(0, 6);

  // Top product opportunities by revenue and profit
  const productOpportunities = new Map<string, { revenue: number; profit: number }>();
  woodPieces.filter(w => w.status === 'available' || w.status === 'reserved').forEach(w => {
    PRODUCT_CATALOG.forEach(p => {
      const scored = buildScoredSuggestion(w, p);
      if (scored.matched) {
        const existing = productOpportunities.get(p.name);
        const profit = p.estimated_value - scored.estimatedCost;
        if (!existing || profit > existing.profit) {
          productOpportunities.set(p.name, { revenue: p.estimated_value, profit });
        }
      }
    });
  });
  const topProductsByRevenue = Array.from(productOpportunities.entries())
    .map(([name, v]) => ({ name, value: v.revenue }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);
  const topProductsByProfit = Array.from(productOpportunities.entries())
    .map(([name, v]) => ({ name, value: v.profit }))
    .sort((a, b) => b.value - a.value)
    .slice(0, 6);

  return (
    <div className="space-y-6">
      <PageHeader
        title="Dashboard"
        description="Overview of wood reuse operations and business metrics."
        action={
          <Link to="/add-wood"><Button size="sm"><PlusCircle className="w-4 h-4" />Add Material</Button></Link>
        }
      />

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map(k => <KpiCard key={k.label} {...k} />)}
      </div>

      {/* Material utilization progress */}
      <Card className="p-5">
        <div className="flex items-center justify-between mb-3">
          <div className="flex items-center gap-2">
            <Percent className="w-4 h-4 text-amber-700" />
            <h3 className="text-sm font-semibold text-slate-900">Material Utilization Rate</h3>
          </div>
          <span className="text-2xl font-bold text-amber-700 tabular-nums">{utilization}%</span>
        </div>
        <ProgressBar value={utilization} color="bg-amber-500" />
        <p className="text-xs text-slate-500 mt-2">
          {utilization > 0
            ? `${utilization}% of recorded leftover material has potential for productive reuse.`
            : 'No material recorded yet. Add leftover wood to begin tracking utilization.'}
        </p>
      </Card>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Wood Type Distribution</CardTitle></CardHeader>
          <CardContent>
            {woodTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={woodTypeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
                  <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }} />
                  <Bar dataKey="quantity" fill="#b45309" radius={[4, 4, 0, 0]} name="Quantity" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-60 flex items-center justify-center text-sm text-slate-400">No wood data available</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Material Status Distribution</CardTitle></CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie data={statusData} dataKey="value" nameKey="name" cx="50%" cy="50%" outerRadius={80} innerRadius={40}
                    label={(props: { name?: string; value?: number }) => `${props.name}: ${props.value}`}
                    labelLine={false} style={{ fontSize: '11px' }}>
                    {statusData.map((entry, idx) => <Cell key={idx} fill={entry.color} />)}
                  </Pie>
                  <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }} />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-60 flex items-center justify-center text-sm text-slate-400">No status data available</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Product opportunity charts */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        <Card>
          <CardHeader><CardTitle>Potential Revenue by Product</CardTitle></CardHeader>
          <CardContent>
            {topProductsByRevenue.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={topProductsByRevenue} layout="vertical" margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickFormatter={v => `${v}`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} width={100} />
                  <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }} formatter={v => formatCurrency(Number(v))} />
                  <Bar dataKey="value" fill="#10b981" radius={[0, 4, 4, 0]} name="Est. Revenue" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-60 flex items-center justify-center text-sm text-slate-400">No product opportunities yet</div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader><CardTitle>Estimated Profit by Product</CardTitle></CardHeader>
          <CardContent>
            {topProductsByProfit.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={topProductsByProfit} layout="vertical" margin={{ top: 10, right: 10, left: 20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis type="number" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} tickFormatter={v => `${v}`} />
                  <YAxis type="category" dataKey="name" tick={{ fontSize: 10, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} width={100} />
                  <Tooltip contentStyle={{ fontSize: '12px', borderRadius: '6px', border: '1px solid #e2e8f0' }} formatter={v => formatCurrency(Number(v))} />
                  <Bar dataKey="value" fill="#3b82f6" radius={[0, 4, 4, 0]} name="Est. Profit" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-60 flex items-center justify-center text-sm text-slate-400">No profit data yet</div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent wood + Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Wood Entries</CardTitle>
              <Link to="/inventory" className="text-xs text-amber-700 hover:text-amber-800 font-medium flex items-center gap-1">
                View All <ArrowRight className="w-3 h-3" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {woodPieces.length > 0 ? (
              <div className="space-y-2">
                {woodPieces.slice(0, 5).map(wood => {
                  const sc = getStatusConfig(wood.status);
                  return (
                    <Link key={wood.id} to={`/suggestions?wood=${wood.id}`}
                      className="flex items-center justify-between p-3 rounded-md border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all">
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <TreePine className="w-4 h-4 text-slate-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">{wood.wood_type} — {wood.quantity} pcs</p>
                          <p className="text-xs text-slate-500">{wood.length_cm} × {wood.width_cm} × {wood.thickness_cm} cm · {timeAgo(wood.created_at)}</p>
                        </div>
                      </div>
                      <Badge color={sc.color as 'green' | 'amber' | 'blue' | 'gray'}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dotColor}`} />{sc.label}
                      </Badge>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center">
                <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500 mb-3">No wood pieces recorded yet.</p>
                <Link to="/add-wood"><Button variant="outline" size="sm"><PlusCircle className="w-4 h-4" />Add Your First Piece</Button></Link>
              </div>
            )}
          </CardContent>
        </Card>

        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2"><Activity className="w-4 h-4 text-amber-700" />Recent Activity</CardTitle>
          </CardHeader>
          <CardContent>
            {activity.length > 0 ? (
              <div className="space-y-3">
                {activity.map(log => (
                  <div key={log.id} className="flex items-start gap-3">
                    <div className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-xs text-slate-700">{log.description}</p>
                      <p className="text-[11px] text-slate-400 mt-0.5">{timeAgo(log.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-slate-500 text-center py-8">No recent activity.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Overview banner */}
      <Card className="p-5 bg-slate-50 border-slate-200">
        <div className="flex items-start gap-4">
          <div className="w-10 h-10 rounded-md bg-amber-700 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-5 h-5 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-slate-900">Material Reuse Overview</h3>
            <p className="text-sm text-slate-600 mt-1">
              You have <span className="font-semibold text-slate-900">{reusableQty} reusable pieces</span> with a {utilization}% utilization rate.
              {productRevenue > 0
                ? ` Products created from reused wood: ${formatCurrency(productRevenue)} in estimated revenue and ${formatCurrency(productProfit)} in estimated profit.`
                : ' Start creating products from your leftover wood to track revenue.'}
            </p>
            <Link to="/suggestions" className="mt-2 inline-flex items-center gap-1.5 text-sm font-medium text-amber-700 hover:text-amber-800">
              View Product Recommendations <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
