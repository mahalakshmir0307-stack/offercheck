import { useEffect, useState } from 'react';
import { Link } from 'react-router-dom';
import {
  Package, Recycle, Lightbulb, Boxes, DollarSign,
  PlusCircle, ArrowRight, Activity, TrendingUp, TreePine,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate, timeAgo, getStatusConfig } from '@/lib/constants';
import type { WoodPiece, Product, ActivityLog } from '@/lib/types';

interface DashboardStats {
  totalPieces: number;
  reusablePieces: number;
  suggestedProducts: number;
  productsCreated: number;
  potentialRevenue: number;
}

export function DashboardPage() {
  const [stats, setStats] = useState<DashboardStats>({
    totalPieces: 0, reusablePieces: 0, suggestedProducts: 0,
    productsCreated: 0, potentialRevenue: 0,
  });
  const [recentActivity, setRecentActivity] = useState<ActivityLog[]>([]);
  const [recentWood, setRecentWood] = useState<WoodPiece[]>([]);
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

      const potentialRevenue = productList.reduce((sum, p) => sum + p.estimated_value, 0);

      setStats({
        totalPieces: woodPieces.reduce((sum, w) => sum + w.quantity, 0),
        reusablePieces: reusable.reduce((sum, w) => sum + w.quantity, 0),
        suggestedProducts: reusable.length > 0 ? 7 : 0,
        productsCreated: productList.length,
        potentialRevenue,
      });
      setRecentActivity((activity || []) as ActivityLog[]);
      setRecentWood(woodPieces.slice(0, 5));
      setLoading(false);
    }
    fetchDashboard();
  }, []);

  if (loading) {
    return (
      <div className="flex items-center justify-center py-20">
        <p className="text-stone-500">Loading dashboard...</p>
      </div>
    );
  }

  const statCards = [
    { label: 'Total Leftover Pieces', value: stats.totalPieces, icon: Package, color: 'text-stone-700', bg: 'bg-stone-100' },
    { label: 'Reusable Pieces', value: stats.reusablePieces, icon: Recycle, color: 'text-green-700', bg: 'bg-green-50' },
    { label: 'Suggested Products', value: stats.suggestedProducts, icon: Lightbulb, color: 'text-amber-700', bg: 'bg-amber-50' },
    { label: 'Products Created', value: stats.productsCreated, icon: Boxes, color: 'text-blue-700', bg: 'bg-blue-50' },
    { label: 'Potential Revenue', value: formatCurrency(stats.potentialRevenue), icon: DollarSign, color: 'text-emerald-700', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Dashboard</h1>
          <p className="text-sm text-stone-600 mt-1">Overview of your wood reuse operations.</p>
        </div>
        <Link to="/add-wood">
          <Button>
            <PlusCircle className="w-4 h-4" />
            Add Leftover Wood
          </Button>
        </Link>
      </div>

      {/* Stat cards */}
      <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-5 gap-4">
        {statCards.map((card) => (
          <Card key={card.label} className="p-5">
            <div className={`w-10 h-10 rounded-lg ${card.bg} flex items-center justify-center mb-3`}>
              <card.icon className={`w-5 h-5 ${card.color}`} />
            </div>
            <p className="text-2xl font-bold text-stone-900">{card.value}</p>
            <p className="text-xs text-stone-500 mt-0.5">{card.label}</p>
          </Card>
        ))}
      </div>

      {/* Wood reuse overview + Recent activity */}
      <div className="grid grid-cols-1 lg:grid-cols-3 gap-6">
        {/* Recent wood */}
        <Card className="lg:col-span-2">
          <CardHeader>
            <div className="flex items-center justify-between">
              <CardTitle>Recent Wood Entries</CardTitle>
              <Link to="/inventory" className="text-sm text-amber-700 hover:text-amber-800 font-medium flex items-center gap-1">
                View All <ArrowRight className="w-3.5 h-3.5" />
              </Link>
            </div>
          </CardHeader>
          <CardContent>
            {recentWood.length > 0 ? (
              <div className="space-y-3">
                {recentWood.map((wood) => {
                  const statusConfig = getStatusConfig(wood.status);
                  return (
                    <Link
                      key={wood.id}
                      to={`/suggestions?wood=${wood.id}`}
                      className="flex items-center justify-between p-3 rounded-lg border border-stone-200 hover:border-stone-300 hover:shadow-sm transition-all"
                    >
                      <div className="flex items-center gap-3 min-w-0 flex-1">
                        <div className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center flex-shrink-0">
                          <TreePine className="w-4 h-4 text-stone-600" />
                        </div>
                        <div className="min-w-0">
                          <p className="text-sm font-semibold text-stone-900 truncate">
                            {wood.wood_type} — {wood.quantity} pcs
                          </p>
                          <p className="text-xs text-stone-500">
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
                <Package className="w-12 h-12 text-stone-300 mx-auto mb-4" />
                <p className="text-sm text-stone-500 mb-4">No wood pieces recorded yet.</p>
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
                    <div className="w-2 h-2 rounded-full bg-amber-600 mt-1.5 flex-shrink-0" />
                    <div className="min-w-0">
                      <p className="text-sm text-stone-700">{log.description}</p>
                      <p className="text-xs text-stone-400 mt-0.5">{timeAgo(log.created_at)}</p>
                    </div>
                  </div>
                ))}
              </div>
            ) : (
              <p className="text-sm text-stone-500 text-center py-8">No recent activity.</p>
            )}
          </CardContent>
        </Card>
      </div>

      {/* Wood reuse overview banner */}
      <Card className="p-6 bg-gradient-to-r from-amber-50 to-stone-50 border-amber-100">
        <div className="flex items-start gap-4">
          <div className="w-12 h-12 rounded-xl bg-amber-700 flex items-center justify-center flex-shrink-0">
            <TrendingUp className="w-6 h-6 text-white" />
          </div>
          <div>
            <h3 className="text-sm font-semibold text-stone-900">Wood Reuse Overview</h3>
            <p className="text-sm text-stone-600 mt-1">
              You have <span className="font-semibold text-stone-900">{stats.reusablePieces} reusable pieces</span> that could be converted into valuable products.
              {stats.potentialRevenue > 0
                ? ` So far, you've generated ${formatCurrency(stats.potentialRevenue)} in potential additional revenue from reused wood.`
                : ' Start creating products from your leftover wood to track potential revenue.'}
            </p>
            <Link to="/suggestions" className="mt-3 inline-flex items-center gap-1.5 text-sm font-semibold text-amber-700 hover:text-amber-800">
              View Product Suggestions <ArrowRight className="w-3.5 h-3.5" />
            </Link>
          </div>
        </div>
      </Card>
    </div>
  );
}
