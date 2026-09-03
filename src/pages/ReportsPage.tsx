import { useEffect, useState } from 'react';
import {
  FileText, Loader2, Package, Recycle, Boxes, DollarSign,
  TrendingUp, TreePine, Download,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  formatCurrency, formatDate, getStatusConfig, WOOD_STATUSES,
} from '@/lib/constants';
import type { WoodPiece, Product, ActivityLog } from '@/lib/types';

export function ReportsPage() {
  const [woodPieces, setWoodPieces] = useState<WoodPiece[]>([]);
  const [products, setProducts] = useState<Product[]>([]);
  const [activity, setActivity] = useState<ActivityLog[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchData() {
      const { data: wood } = await supabase
        .from('wood_pieces')
        .select('*')
        .order('created_at', { ascending: false });
      const { data: prods } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      const { data: logs } = await supabase
        .from('activity_logs')
        .select('*')
        .order('created_at', { ascending: false })
        .limit(20);
      setWoodPieces((wood || []) as WoodPiece[]);
      setProducts((prods || []) as Product[]);
      setActivity((logs || []) as ActivityLog[]);
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

  const totalWood = woodPieces.reduce((sum, w) => sum + w.quantity, 0);
  const reusableWood = woodPieces.filter(w => w.status === 'available' || w.status === 'reserved');
  const reusableQty = reusableWood.reduce((sum, w) => sum + w.quantity, 0);
  const totalRevenue = products.reduce((sum, p) => sum + p.estimated_value, 0);
  const estimatedProfit = Math.round(totalRevenue * 0.72);
  const utilizationRate = totalWood > 0 ? Math.round((reusableQty / totalWood) * 100) : 0;

  const summaryStats = [
    { label: 'Total Wood Pieces', value: totalWood, icon: Package, color: 'text-slate-700', bg: 'bg-slate-100' },
    { label: 'Reusable Material', value: reusableQty, icon: Recycle, color: 'text-emerald-700', bg: 'bg-emerald-50' },
    { label: 'Products Created', value: products.length, icon: Boxes, color: 'text-blue-700', bg: 'bg-blue-50' },
    { label: 'Total Revenue', value: formatCurrency(totalRevenue), icon: DollarSign, color: 'text-emerald-700', bg: 'bg-emerald-50' },
    { label: 'Estimated Profit', value: formatCurrency(estimatedProfit), icon: TrendingUp, color: 'text-emerald-700', bg: 'bg-emerald-50' },
    { label: 'Utilization Rate', value: `${utilizationRate}%`, icon: TreePine, color: 'text-amber-700', bg: 'bg-amber-50' },
  ];

  const statusBreakdown = WOOD_STATUSES.map((s) => ({
    ...s,
    count: woodPieces.filter(w => w.status === s.value).length,
    quantity: woodPieces.filter(w => w.status === s.value).reduce((sum, w) => sum + w.quantity, 0),
  })).filter(s => s.count > 0);

  const handleExport = () => {
    const reportData = {
      generatedAt: new Date().toISOString(),
      summary: { totalWood, reusableQty, productsCreated: products.length, totalRevenue, estimatedProfit, utilizationRate },
      woodPieces: woodPieces.map(w => ({
        type: w.wood_type,
        dimensions: `${w.length_cm}x${w.width_cm}x${w.thickness_cm} cm`,
        quantity: w.quantity,
        status: w.status,
        dateAdded: w.created_at,
      })),
      products: products.map(p => ({
        name: p.name,
        type: p.product_type,
        quantity: p.quantity,
        value: p.estimated_value,
        dateCreated: p.created_at,
      })),
    };
    const blob = new Blob([JSON.stringify(reportData, null, 2)], { type: 'application/json' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `woodvalue-report-${new Date().toISOString().split('T')[0]}.json`;
    a.click();
    URL.revokeObjectURL(url);
  };

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Reports</h1>
          <p className="text-sm text-slate-500 mt-0.5">Comprehensive summary of operations and material utilization.</p>
        </div>
        <Button onClick={handleExport} variant="outline" size="sm">
          <Download className="w-4 h-4" />
          Export Report
        </Button>
      </div>

      {/* Summary stats */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <FileText className="w-4 h-4 text-amber-700" />
            Executive Summary
          </CardTitle>
        </CardHeader>
        <CardContent>
          <div className="grid grid-cols-2 md:grid-cols-3 lg:grid-cols-6 gap-3">
            {summaryStats.map((stat) => (
              <div key={stat.label} className="p-3 rounded-md border border-slate-200 bg-slate-50">
                <div className={`w-7 h-7 rounded-md ${stat.bg} flex items-center justify-center mb-2`}>
                  <stat.icon className={`w-3.5 h-3.5 ${stat.color}`} />
                </div>
                <p className="text-base font-bold text-slate-900 leading-tight">{stat.value}</p>
                <p className="text-[10px] text-slate-500 mt-0.5">{stat.label}</p>
              </div>
            ))}
          </div>
        </CardContent>
      </Card>

      {/* Status breakdown */}
      <Card>
        <CardHeader>
          <CardTitle>Material Status Breakdown</CardTitle>
        </CardHeader>
        <CardContent>
          {statusBreakdown.length > 0 ? (
            <div className="space-y-2">
              {statusBreakdown.map((s) => (
                <div key={s.value} className="flex items-center justify-between p-3 rounded-md border border-slate-200">
                  <div className="flex items-center gap-3">
                    <Badge color={s.color as 'green' | 'amber' | 'blue' | 'gray'}>
                      <span className={`w-1.5 h-1.5 rounded-full ${s.dotColor}`} />
                      {s.label}
                    </Badge>
                    <span className="text-sm text-slate-600">{s.count} entries</span>
                  </div>
                  <span className="text-sm font-semibold text-slate-900 tabular-nums">{s.quantity} pcs</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 text-center py-6">No material data available.</p>
          )}
        </CardContent>
      </Card>

      {/* Recent products */}
      <Card>
        <CardHeader>
          <CardTitle>Recent Products</CardTitle>
        </CardHeader>
        <CardContent>
          {products.length > 0 ? (
            <div className="space-y-2">
              {products.slice(0, 10).map((p) => (
                <div key={p.id} className="flex items-center justify-between p-3 rounded-md border border-slate-200 hover:border-slate-300 transition-colors">
                  <div>
                    <p className="text-sm font-medium text-slate-900">{p.name}</p>
                    <p className="text-xs text-slate-500">{p.product_type} · {p.quantity} pcs · {formatDate(p.created_at)}</p>
                  </div>
                  <span className="text-sm font-semibold text-emerald-700">{formatCurrency(p.estimated_value)}</span>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 text-center py-6">No products created yet.</p>
          )}
        </CardContent>
      </Card>

      {/* Activity log */}
      <Card>
        <CardHeader>
          <CardTitle>Activity Log</CardTitle>
        </CardHeader>
        <CardContent>
          {activity.length > 0 ? (
            <div className="space-y-2">
              {activity.map((log) => (
                <div key={log.id} className="flex items-start gap-3 py-2 border-b border-slate-100 last:border-0">
                  <div className="w-1.5 h-1.5 rounded-full bg-amber-600 mt-1.5 flex-shrink-0" />
                  <div className="min-w-0 flex-1">
                    <p className="text-xs text-slate-700">{log.description}</p>
                    <p className="text-[11px] text-slate-400 mt-0.5">{formatDate(log.created_at)}</p>
                  </div>
                </div>
              ))}
            </div>
          ) : (
            <p className="text-sm text-slate-500 text-center py-6">No activity recorded.</p>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
