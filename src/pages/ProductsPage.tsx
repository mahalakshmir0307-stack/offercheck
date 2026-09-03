import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  Boxes, PlusCircle, Package, DollarSign, TrendingUp,
  Loader2, CheckCircle2, Wrench, Truck, PackageCheck,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { Select } from '@/components/ui/Input';
import { PageHeader, KpiCard, LoadingState, ErrorState, EmptyState } from '@/components/ui/Shared';
import {
  formatCurrency, formatDate, getProductStatusConfig, PRODUCT_STATUSES,
} from '@/lib/constants';
import type { Product, ProductStatus } from '@/lib/types';

export function ProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [updatingId, setUpdatingId] = useState<string | null>(null);

  const fetchProducts = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('products')
      .select('*')
      .order('created_at', { ascending: false });
    if (err) {
      setError('Unable to load products. Please try again.');
      setLoading(false);
      return;
    }
    setProducts((data || []) as Product[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchProducts(); }, [fetchProducts]);

  async function handleStatusChange(productId: string, newStatus: ProductStatus) {
    setUpdatingId(productId);
    const updates: Record<string, unknown> = { status: newStatus };
    if (newStatus === 'sold') {
      const product = products.find(p => p.id === productId);
      if (product) updates.actual_revenue = product.estimated_value;
    }
    await supabase.from('products').update(updates).eq('id', productId);
    await supabase.from('activity_logs').insert({
      action: 'updated_product_status',
      entity_type: 'product',
      entity_id: productId,
      description: `Product status changed to ${getProductStatusConfig(newStatus).label}`,
    });
    setProducts(prev => prev.map(p => p.id === productId ? { ...p, status: newStatus, actual_revenue: updates.actual_revenue as number | null ?? p.actual_revenue } : p));
    setUpdatingId(null);
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Created Products" description="Products manufactured from reused leftover wood." />
        <LoadingState message="Loading products..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Created Products" description="Products manufactured from reused leftover wood." />
        <ErrorState message={error} onRetry={fetchProducts} />
      </div>
    );
  }

  const totalValue = products.reduce((s, p) => s + p.estimated_value, 0);
  const totalProfit = products.reduce((s, p) => s + (p.estimated_profit || p.estimated_value - (p.estimated_cost || 0)), 0);
  const planned = products.filter(p => p.status === 'planned').length;
  const inProduction = products.filter(p => p.status === 'in_production').length;
  const completed = products.filter(p => p.status === 'completed').length;
  const sold = products.filter(p => p.status === 'sold').length;
  const actualRevenue = products.filter(p => p.actual_revenue).reduce((s, p) => s + (p.actual_revenue || 0), 0);

  const kpis = [
    { label: 'Total Products', value: products.length, icon: Package, color: 'text-slate-700', bg: 'bg-slate-100' },
    { label: 'Planned', value: planned, icon: Wrench, color: 'text-slate-600', bg: 'bg-slate-100' },
    { label: 'In Production', value: inProduction, icon: Loader2, color: 'text-amber-700', bg: 'bg-amber-50' },
    { label: 'Completed', value: completed, icon: CheckCircle2, color: 'text-blue-700', bg: 'bg-blue-50' },
    { label: 'Sold', value: sold, icon: Truck, color: 'text-emerald-700', bg: 'bg-emerald-50' },
    { label: 'Est. Revenue', value: formatCurrency(totalValue), icon: DollarSign, color: 'text-emerald-700', bg: 'bg-emerald-50' },
    { label: 'Est. Profit', value: formatCurrency(totalProfit), icon: TrendingUp, color: 'text-emerald-700', bg: 'bg-emerald-50' },
    { label: 'Actual Revenue', value: formatCurrency(actualRevenue), icon: PackageCheck, color: 'text-emerald-700', bg: 'bg-emerald-50' },
  ];

  return (
    <div className="space-y-6">
      <PageHeader
        title="Created Products"
        description="Products manufactured from reused leftover wood with performance tracking."
        action={<Button onClick={() => navigate('/suggestions')} size="sm"><PlusCircle className="w-4 h-4" />New Product</Button>}
      />

      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {kpis.map(k => <KpiCard key={k.label} {...k} />)}
      </div>

      {products.length > 0 ? (
        <>
          {/* Desktop table */}
          <Card className="hidden md:block overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Product Name</th>
                    <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Wood Type</th>
                    <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Qty</th>
                    <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Est. Value</th>
                    <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Est. Cost</th>
                    <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Est. Profit</th>
                    <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Status</th>
                    <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map(p => {
                    const sc = getProductStatusConfig(p.status);
                    const profit = p.estimated_profit || p.estimated_value - (p.estimated_cost || 0);
                    return (
                      <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3"><span className="text-sm font-medium text-slate-900">{p.name}</span></td>
                        <td className="px-5 py-3"><span className="text-sm text-slate-600">{p.wood_type || '—'}</span></td>
                        <td className="px-5 py-3"><span className="text-sm text-slate-700 tabular-nums">{p.quantity}</span></td>
                        <td className="px-5 py-3"><span className="text-sm font-semibold text-slate-900">{formatCurrency(p.estimated_value)}</span></td>
                        <td className="px-5 py-3"><span className="text-sm text-slate-600">{formatCurrency(p.estimated_cost || 0)}</span></td>
                        <td className="px-5 py-3"><span className="text-sm font-semibold text-emerald-700">{formatCurrency(profit)}</span></td>
                        <td className="px-5 py-3">
                          <Badge color={sc.color as 'green' | 'amber' | 'blue' | 'gray'}>
                            <span className={`w-1.5 h-1.5 rounded-full ${sc.dotColor}`} />{sc.label}
                          </Badge>
                        </td>
                        <td className="px-5 py-3"><span className="text-xs text-slate-500">{formatDate(p.created_at)}</span></td>
                      </tr>
                    );
                  })}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Mobile cards + status update */}
          <div className="md:hidden space-y-3">
            {products.map(p => {
              const sc = getProductStatusConfig(p.status);
              const profit = p.estimated_profit || p.estimated_value - (p.estimated_cost || 0);
              return (
                <Card key={p.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <div>
                        <p className="text-sm font-semibold text-slate-900">{p.name}</p>
                        <p className="text-xs text-slate-500">{p.wood_type || '—'} · {p.quantity} pcs</p>
                      </div>
                      <Badge color={sc.color as 'green' | 'amber' | 'blue' | 'gray'}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dotColor}`} />{sc.label}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-3 gap-2 text-xs mb-3">
                      <div><p className="text-slate-400">Value</p><p className="font-semibold text-slate-900">{formatCurrency(p.estimated_value)}</p></div>
                      <div><p className="text-slate-400">Cost</p><p className="text-slate-600">{formatCurrency(p.estimated_cost || 0)}</p></div>
                      <div><p className="text-slate-400">Profit</p><p className="font-semibold text-emerald-700">{formatCurrency(profit)}</p></div>
                    </div>
                    <Select
                      value={p.status}
                      onChange={(e) => handleStatusChange(p.id, e.target.value as ProductStatus)}
                      disabled={updatingId === p.id}
                      className="text-xs"
                    >
                      {PRODUCT_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                    </Select>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Desktop status update section */}
          <Card className="hidden md:block">
            <CardHeader><CardTitle>Update Product Status</CardTitle></CardHeader>
            <CardContent>
              <div className="space-y-2">
                {products.map(p => {
                  const sc = getProductStatusConfig(p.status);
                  return (
                    <div key={p.id} className="flex items-center justify-between p-3 rounded-md border border-slate-200">
                      <div className="flex items-center gap-3">
                        <Badge color={sc.color as 'green' | 'amber' | 'blue' | 'gray'}>
                          <span className={`w-1.5 h-1.5 rounded-full ${sc.dotColor}`} />{sc.label}
                        </Badge>
                        <span className="text-sm font-medium text-slate-900">{p.name}</span>
                      </div>
                      <Select
                        value={p.status}
                        onChange={(e) => handleStatusChange(p.id, e.target.value as ProductStatus)}
                        disabled={updatingId === p.id}
                        className="w-40 text-xs"
                      >
                        {PRODUCT_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                      </Select>
                    </div>
                  );
                })}
              </div>
            </CardContent>
          </Card>

          {/* Estimated vs Actual comparison */}
          {actualRevenue > 0 && (
            <Card className="p-5 bg-slate-50 border-slate-200">
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-md bg-emerald-700 flex items-center justify-center flex-shrink-0">
                  <PackageCheck className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-slate-900">Estimated vs Actual Revenue</h3>
                  <p className="text-sm text-slate-600 mt-1">
                    Estimated value: <span className="font-semibold text-slate-900">{formatCurrency(totalValue)}</span>
                    {' '}· Actual revenue from sold products: <span className="font-semibold text-emerald-700">{formatCurrency(actualRevenue)}</span>
                  </p>
                </div>
              </div>
            </Card>
          )}
        </>
      ) : (
        <EmptyState
          icon={Boxes}
          title="No products created yet"
          description="Generate product recommendations from your leftover wood and create products to track performance."
          action={<Button onClick={() => navigate('/suggestions')} variant="outline" size="sm"><PlusCircle className="w-4 h-4" />Create from Recommendations</Button>}
        />
      )}
    </div>
  );
}
