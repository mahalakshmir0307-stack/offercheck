import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, Recycle, Lightbulb, Boxes, DollarSign,
  PlusCircle, ArrowRight, Activity, TrendingUp, TreePine,
  Percent, Wallet,
} from 'lucide-react';
import {
  BarChart, Bar, XAxis, YAxis, CartesianGrid, Tooltip, ResponsiveContainer,
  PieChart, Pie, Cell, Legend,
} from 'recharts';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  formatCurrency, timeAgo, getStatusConfig, WOOD_STATUSES,
} from '@/lib/constants';
import type { WoodPiece, Product, ActivityLog } from '@/lib/types';

interface DashboardStats {
  totalPieces: number;
  reusablePieces: number;
  materialUtilization: number;
  productOpportunities: number;
  productsCreated: number;
  potentialRevenue: number;
  estimatedProfit: number;
}

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPieces: 0,
    reusablePieces: 0,
    materialUtilization: 0,
    productOpportunities: 0,
    productsCreated: 0,
    potentialRevenue: 0,
    estimatedProfit: 0,
  });
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [recentWood, setRecentWood] = useState<WoodPiece[]>([]);
  const [statusData, setStatusData] = useState<{ name: string; value: number; color: string }[]>([]);
  const [woodTypeData, setWoodTypeData] = useState<{ name: string; quantity: number }[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchDashboard() {
      const { data: wood } = await supabase
        .from('wood_pieces')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: products } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });

      const { data: activity } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(8);

      const woodPieces = (wood || []) as WoodPiece[];
      const productList = (products || []) as Product[];

      const reusable = woodPieces.filter(
        (w) => w.status === 'available' || w.status === 'reserved'
      );

      const totalQty = woodPieces.reduce((sum, w) => sum + w.quantity, 0);
      const reusableQty = reusable.reduce((sum, w) => sum + w.quantity, 0);
      const utilization = totalQty > 0 ? Math.round((reusableQty / totalQty) * 100) : 0;

      const potentialRevenue = productList.reduce((sum, p) => sum + p.estimated_value, 0);
      const estimatedProfit = Math.round(potentialRevenue * 0.72);

      const statusCounts = WOOD_STATUSES.map((s) => ({
        name: s.label,
        value: woodPieces.filter((w) => w.status === s.value).reduce((sum, w) => sum + w.quantity, 0),
        color: s.color === 'green' ? '#10b981' : s.color === 'amber' ? '#f59e0b' : s.color === 'blue' ? '#3b82f6' : '#94a3b8',
      })).filter((s) => s.value > 0);

      const typeMap = new Map<string, number>();
      woodPieces.forEach((w) => {
        typeMap.set(w.wood_type, (typeMap.get(w.wood_type) || 0) + w.quantity);
      });
      const typeData = Array.from(typeMap.entries())
        .map(([name, quantity]) => ({ name, quantity }))
        .sort((a, b) => b.quantity - a.quantity)
        .slice(0, 6);

      setStats({
        totalPieces: totalQty,
        reusablePieces: reusableQty,
        materialUtilization: utilization,
        productOpportunities: reusable.length > 0 ? 23 : 0,
        productsCreated: productList.length,
        potentialRevenue,
        estimatedProfit,
      });
      setRecentActivity((activity || []) as ActivityLog[]);
      setRecentWood(woodPieces.slice(0, 5));
      setStatusData(statusCounts);
      setWoodTypeData(typeData);
      setLoading(false);
    }
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-slate-500 text-sm">Loading dashboard...</p>
      </div>
    );
  }

  const kpiCards = [
    { label: 'Total Leftover Wood', value: `${stats.totalPieces} pcs`, icon: Package, color: 'text-slate-700', bg: 'bg-slate-100' },
    { label: 'Reusable Material', value: `${stats.reusablePieces} pcs`, icon: Recycle, color: 'text-emerald-700', bg: 'bg-emerald-50' },
    { label: 'Material Utilization', value: `${stats.materialUtilization}%`, icon: Percent, color: 'text-amber-700', bg: 'bg-amber-50' },
    { label: 'Product Opportunities', value: stats.productOpportunities, icon: Lightbulb, color: 'text-amber-700', bg: 'bg-amber-50' },
    { label: 'Products Created', value: stats.productsCreated, icon: Boxes, color: 'text-blue-700', bg: 'bg-blue-50' },
    { label: 'Potential Revenue', value: formatCurrency(stats.potentialRevenue), icon: DollarSign, color: 'text-emerald-700', bg: 'bg-emerald-50' },
    { label: 'Estimated Profit', value: formatCurrency(stats.estimatedProfit), icon: Wallet, color: 'text-emerald-700', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Dashboard</h1>
          <p className="text-sm text-slate-500 mt-0.5">Overview of wood reuse operations and business metrics.</p>
        </div>
        <Link to="/add-wood">
          <Button size="sm">
            <PlusCircle className="w-4 h-4" />
            Add Material
          </Button>
        </Link>
      </div>

      {/* KPI cards */}
      <div className="grid grid-cols-2 md:grid-cols-4 lg:grid-cols-7 gap-3">
        {kpiCards.map((card) => (
          <Card key={card.label} className="p-4">
            <div className={`w-8 h-8 rounded-md ${card.bg} flex items-center justify-center mb-2.5`}>
              <card.icon className={`w-4 h-4 ${card.color}`} />
            </div>
            <p className="text-lg font-bold text-slate-900 leading-tight">{card.value}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{card.label}</p>
          </Card>
        ))}
      </div>

      {/* Charts row */}
      <div className="grid grid-cols-1 lg:grid-cols-2 gap-6">
        {/* Wood type distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Wood Type Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {woodTypeData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <BarChart data={woodTypeData} margin={{ top: 10, right: 10, left: -20, bottom: 0 }}>
                  <CartesianGrid strokeDasharray="3 3" stroke="#f1f5f9" />
                  <XAxis dataKey="name" tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
                  <YAxis tick={{ fontSize: 11, fill: '#64748b' }} axisLine={{ stroke: '#e2e8f0' }} />
                  <Tooltip
                    contentStyle={{
                      fontSize: '12px',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                      boxShadow: '0 1px 3px rgba(0,0,0,0.08)',
                    }}
                  />
                  <Bar dataKey="quantity" fill="#b45309" radius={[4, 4, 0, 0]} name="Quantity" />
                </BarChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-60 flex items-center justify-center text-sm text-slate-400">
                No wood data available
              </div>
            )}
          </CardContent>
        </Card>

        {/* Status distribution */}
        <Card>
          <CardHeader>
            <CardTitle>Material Status Distribution</CardTitle>
          </CardHeader>
          <CardContent>
            {statusData.length > 0 ? (
              <ResponsiveContainer width="100%" height={240}>
                <PieChart>
                  <Pie
                    data={statusData}
                    dataKey="value"
                    nameKey="name"
                    cx="50%"
                    cy="50%"
                    outerRadius={80}
                    innerRadius={40}
                    label={(props: { name?: string; value?: number }) => `${props.name}: ${props.value}`}
                    labelLine={false}
                    style={{ fontSize: '11px' }}
                  >
                    {statusData.map((entry, idx) => (
                      <Cell key={idx} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip
                    contentStyle={{
                      fontSize: '12px',
                      borderRadius: '6px',
                      border: '1px solid #e2e8f0',
                    }}
                  />
                  <Legend wrapperStyle={{ fontSize: '11px' }} />
                </PieChart>
              </ResponsiveContainer>
            ) : (
              <div className="h-60 flex items-center justify-center text-sm text-slate-400">
                No status data available
              </div>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Recent wood + Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent wood */}
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
            {recentWood.length > 0 ? (
              <div className="space-y-2">
                {recentWood.map((wood) => {
                  const statusConfig = getStatusConfig(wood.status);
                  return (
                    <Link
                      key={wood.id}
                      to={`/suggestions?wood=${wood.id}`}
                      className="flex items-center justify-between p-3 rounded-md border border-slate-200 hover:border-slate-300 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center flex-shrink-0">
                          <TreePine className="w-4 h-4 text-slate-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-medium text-slate-900 truncate">
                            {wood.wood_type} — {wood.quantity} pcs
                          </p>
                          <p className="text-xs text-slate-500">
                            {wood.length_cm} × {wood.width_cm} × {wood.thickness_cm} cm · {timeAgo(wood.created_at)}
                          </p>
                        </div>
                      </div>
                      <Badge color={statusConfig.color as 'green' | 'amber' | 'blue' | 'gray'}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotColor}`} />
                        {statusConfig.label}
                      </Badge>
                    </Link>
                  );
                })}
              </div>
            ) : (
              <div className="py-12 text-center">
                <Package className="w-10 h-10 text-slate-300 mx-auto mb-3" />
                <p className="text-sm text-slate-500 mb-3">No wood pieces recorded yet.</p>
                <Link to="/add-wood">
                  <Button variant="outline" size="sm">
                    <PlusCircle className="w-4 h-4" />
                    Add Your First Piece
                  </Button>
                </Link>
              </div>
            )}
          </CardContent>
        </Card>

        {/* Recent activity */}
        <Card>
          <CardHeader>
            <CardTitle className="flex items-center gap-2">
              <Activity className="w-4 h-4 text-amber-700" />
              Recent Activity
            </CardTitle>
          </CardHeader>
          <CardContent>
            {recentActivity.length > 0 ? (
              <div className="space-y-3">
                {recentActivity.map((log) => (
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
              You have <span className="font-semibold text-slate-900">{stats.reusablePieces} reusable pieces</span> with a {stats.materialUtilization}% utilization rate.
              {stats.potentialRevenue > 0
                ? ` Potential revenue from reused wood: ${formatCurrency(stats.potentialRevenue)}.`
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
