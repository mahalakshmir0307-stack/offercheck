import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { Boxes, Loader2, PlusCircle, Package, DollarSign, TrendingUp } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { formatCurrency, formatDate } from '@/lib/constants';
import type { Product } from '@/lib/types';

export function ProductsPage() {
  const navigate = useNavigate();
  const [products, setProducts] = useState<Product[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchProducts() {
      const { data } = await supabase
        .from('products')
        .select('*')
        .order('created_at', { ascending: false });
      setProducts((data || []) as Product[]);
      setLoading(false);
    }
    fetchProducts();
  }, []);

  const totalValue = products.reduce((sum, p) => sum + p.estimated_value, 0);
  const totalQuantity = products.reduce((sum, p) => sum + p.quantity, 0);
  const avgValue = products.length > 0 ? Math.round(totalValue / products.length) : 0;

  const stats = [
    { label: 'Products Created', value: products.length, icon: Package, color: 'text-slate-700', bg: 'bg-slate-100' },
    { label: 'Total Units', value: totalQuantity, icon: Boxes, color: 'text-blue-700', bg: 'bg-blue-50' },
    { label: 'Total Value', value: formatCurrency(totalValue), icon: DollarSign, color: 'text-emerald-700', bg: 'bg-emerald-50' },
    { label: 'Avg. Product Value', value: formatCurrency(avgValue), icon: TrendingUp, color: 'text-amber-700', bg: 'bg-amber-50' },
  ];

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-xl font-bold text-slate-900">Created Products</h1>
          <p className="text-sm text-slate-500 mt-0.5">Products manufactured from reused leftover wood.</p>
        </div>
        <Button onClick={() => navigate('/suggestions')} size="sm">
          <PlusCircle className="w-4 h-4" />
          New Product
        </Button>
      </div>

      {/* Stats */}
      <div className="grid grid-cols-2 md:grid-cols-4 gap-3">
        {stats.map((card) => (
          <Card key={card.label} className="p-4">
            <div className={`w-8 h-8 rounded-md ${card.bg} flex items-center justify-center mb-2.5`}>
              <card.icon className={`w-4 h-4 ${card.color}`} />
            </div>
            <p className="text-lg font-bold text-slate-900 leading-tight">{card.value}</p>
            <p className="text-[11px] text-slate-500 mt-0.5">{card.label}</p>
          </Card>
        ))}
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-amber-700 animate-spin" />
        </div>
      ) : products.length > 0 ? (
        <>
          {/* Desktop table */}
          <Card className="hidden md:block overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Product Name</th>
                    <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Type</th>
                    <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Qty</th>
                    <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Est. Value</th>
                    <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Created</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {products.map((p) => (
                    <tr key={p.id} className="hover:bg-slate-50 transition-colors">
                      <td className="px-5 py-3">
                        <span className="text-sm font-medium text-slate-900">{p.name}</span>
                      </td>
                      <td className="px-5 py-3">
                        <Badge color="stone">{p.product_type}</Badge>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-sm text-slate-700 tabular-nums">{p.quantity}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-sm font-semibold text-emerald-700">{formatCurrency(p.estimated_value)}</span>
                      </td>
                      <td className="px-5 py-3">
                        <span className="text-xs text-slate-500">{formatDate(p.created_at)}</span>
                      </td>
                    </tr>
                  ))}
                </tbody>
              </table>
            </div>
          </Card>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {products.map((p) => (
              <Card key={p.id}>
                <CardContent className="pt-4">
                  <div className="flex items-start justify-between mb-3">
                    <div>
                      <p className="text-sm font-semibold text-slate-900">{p.name}</p>
                      <Badge color="stone" className="mt-1">{p.product_type}</Badge>
                    </div>
                    <span className="text-sm font-semibold text-emerald-700">{formatCurrency(p.estimated_value)}</span>
                  </div>
                  <div className="grid grid-cols-2 gap-2 text-xs">
                    <div>
                      <p className="text-slate-400">Quantity</p>
                      <p className="text-slate-700">{p.quantity} pcs</p>
                    </div>
                    <div>
                      <p className="text-slate-400">Created</p>
                      <p className="text-slate-700">{formatDate(p.created_at)}</p>
                    </div>
                  </div>
                </CardContent>
              </Card>
            ))}
          </div>
        </>
      ) : (
        <Card className="p-12 text-center">
          <Boxes className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-sm text-slate-500 mb-4">No products created yet.</p>
          <Button onClick={() => navigate('/suggestions')} variant="outline" size="sm">
            <PlusCircle className="w-4 h-4" />
            Create from Recommendations
          </Button>
        </Card>
      )}
    </div>
  );
}
