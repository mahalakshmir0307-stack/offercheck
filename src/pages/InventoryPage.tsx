import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PackageOpen, Search, Lightbulb, TreePine, Loader2, PlusCircle,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/Card';
import { Input, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  WOOD_TYPES, WOOD_STATUSES, getStatusConfig,
  formatDimensions, formatDate, timeAgo,
} from '@/lib/constants';
import type { WoodPiece, WoodStatus } from '@/lib/types';

export function InventoryPage() {
  const navigate = useNavigate();
  const [woodPieces, setWoodPieces] = useState<WoodPiece[]>([]);
  const [loading, setLoading] = useState(true);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');

  useEffect(() => {
    async function fetchWood() {
      const { data } = await supabase
        .from('wood_pieces')
        .select('*')
        .order('created_at', { ascending: false });
      setWoodPieces((data || []) as WoodPiece[]);
      setLoading(false);
    }
    fetchWood();
  }, []);

  const filtered = woodPieces.filter((w) => {
    const matchesSearch = !search ||
      w.wood_type.toLowerCase().includes(search.toLowerCase()) ||
      (w.notes || '').toLowerCase().includes(search.toLowerCase());
    const matchesType = filterType === 'all' || w.wood_type === filterType;
    const matchesStatus = filterStatus === 'all' || w.status === filterStatus;
    return matchesSearch && matchesType && matchesStatus;
  });

  return (
    <div className="space-y-6">
      <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
        <div>
          <h1 className="text-2xl font-bold text-stone-900">Leftover Wood Inventory</h1>
          <p className="text-sm text-stone-600 mt-1">All recorded wood pieces in your sawmill.</p>
        </div>
        <Button onClick={() => navigate('/add-wood')}>
          <PlusCircle className="w-4 h-4" />
          Add Wood
        </Button>
      </div>

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-stone-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by wood type or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2.5 rounded-lg border border-stone-300 bg-white text-stone-900 placeholder-stone-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>
        <Select value={filterType} onChange={(e) => setFilterType(e.target.value)} className="sm:w-40">
          <option value="all">All Types</option>
          {WOOD_TYPES.map((t) => (
            <option key={t} value={t}>{t}</option>
          ))}
        </Select>
        <Select value={filterStatus} onChange={(e) => setFilterStatus(e.target.value)} className="sm:w-40">
          <option value="all">All Statuses</option>
          {WOOD_STATUSES.map((s) => (
            <option key={s.value} value={s.value}>{s.label}</option>
          ))}
        </Select>
      </div>

      {loading ? (
        <div className="flex items-center justify-center py-20">
          <Loader2 className="w-6 h-6 text-amber-700 animate-spin" />
        </div>
      ) : filtered.length > 0 ? (
        <>
          {/* Desktop table */}
          <Card className="hidden md:block overflow-hidden">
            <table className="w-full">
              <thead>
                <tr className="border-b border-stone-200 bg-stone-50">
                  <th className="text-left text-xs font-semibold text-stone-600 uppercase tracking-wider px-6 py-3">Wood ID</th>
                  <th className="text-left text-xs font-semibold text-stone-600 uppercase tracking-wider px-6 py-3">Type</th>
                  <th className="text-left text-xs font-semibold text-stone-600 uppercase tracking-wider px-6 py-3">Dimensions</th>
                  <th className="text-left text-xs font-semibold text-stone-600 uppercase tracking-wider px-6 py-3">Qty</th>
                  <th className="text-left text-xs font-semibold text-stone-600 uppercase tracking-wider px-6 py-3">Status</th>
                  <th className="text-left text-xs font-semibold text-stone-600 uppercase tracking-wider px-6 py-3">Added</th>
                  <th className="text-right text-xs font-semibold text-stone-600 uppercase tracking-wider px-6 py-3">Actions</th>
                </tr>
              </thead>
              <tbody className="divide-y divide-stone-100">
                {filtered.map((w) => {
                  const statusConfig = getStatusConfig(w.status as WoodStatus);
                  return (
                    <tr key={w.id} className="hover:bg-stone-50 transition-colors">
                      <td className="px-6 py-3.5">
                        <span className="text-xs font-mono text-stone-500">
                          {w.id.slice(0, 8).toUpperCase()}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <div className="flex items-center gap-2">
                          <TreePine className="w-4 h-4 text-stone-400" />
                          <span className="text-sm font-medium text-stone-900">{w.wood_type}</span>
                        </div>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="text-sm text-stone-700">
                          {formatDimensions(w.length_cm, w.width_cm, w.thickness_cm)}
                        </span>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="text-sm font-medium text-stone-900">{w.quantity}</span>
                      </td>
                      <td className="px-6 py-3.5">
                        <Badge color={statusConfig.color as 'green' | 'amber' | 'blue' | 'gray'}>
                          <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotColor}`} />
                          {statusConfig.label}
                        </Badge>
                      </td>
                      <td className="px-6 py-3.5">
                        <span className="text-sm text-stone-500">{timeAgo(w.created_at)}</span>
                      </td>
                      <td className="px-6 py-3.5 text-right">
                        <Button
                          variant="outline"
                          size="sm"
                          onClick={() => navigate(`/suggestions?wood=${w.id}`)}
                        >
                          <Lightbulb className="w-3.5 h-3.5" />
                          Recommendations
                        </Button>
                      </td>
                    </tr>
                  );
                })}
              </tbody>
            </table>
          </Card>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((w) => {
              const statusConfig = getStatusConfig(w.status as WoodStatus);
              return (
                <Card key={w.id}>
                  <CardContent className="pt-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-9 h-9 rounded-lg bg-stone-100 flex items-center justify-center">
                          <TreePine className="w-4 h-4 text-stone-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-stone-900">{w.wood_type}</p>
                          <p className="text-xs font-mono text-stone-400">{w.id.slice(0, 8).toUpperCase()}</p>
                        </div>
                      </div>
                      <Badge color={statusConfig.color as 'green' | 'amber' | 'blue' | 'gray'}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotColor}`} />
                        {statusConfig.label}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      <div>
                        <p className="text-stone-400">Dimensions</p>
                        <p className="text-stone-700">{formatDimensions(w.length_cm, w.width_cm, w.thickness_cm)}</p>
                      </div>
                      <div>
                        <p className="text-stone-400">Quantity</p>
                        <p className="text-stone-700">{w.quantity} pcs</p>
                      </div>
                      <div>
                        <p className="text-stone-400">Added</p>
                        <p className="text-stone-700">{formatDate(w.created_at)}</p>
                      </div>
                    </div>
                    <Button
                      variant="outline"
                      size="sm"
                      className="w-full"
                      onClick={() => navigate(`/suggestions?wood=${w.id}`)}
                    >
                      <Lightbulb className="w-3.5 h-3.5" />
                      View Recommendations
                    </Button>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      ) : (
        <Card className="p-12 text-center">
          <PackageOpen className="w-12 h-12 text-stone-300 mx-auto mb-4" />
          <p className="text-sm text-stone-500 mb-4">
            {woodPieces.length === 0 ? 'No wood pieces recorded yet.' : 'No pieces match your filters.'}
          </p>
          {woodPieces.length === 0 && (
            <Button onClick={() => navigate('/add-wood')} variant="outline">
              <PlusCircle className="w-4 h-4" />
              Add Your First Piece
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}
