import { useEffect, useState } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PackageOpen, Search, Lightbulb, TreePine, Loader2, PlusCircle,
  Ruler, Calendar, Hash,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/Card';
import { Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import {
  WOOD_TYPES, WOOD_STATUSES, getStatusConfig,
  formatDimensions, formatDate,
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
          <h1 className="text-xl font-bold text-slate-900">Wood Inventory</h1>
          <p className="text-sm text-slate-500 mt-0.5">Material management for all recorded wood pieces.</p>
        </div>
        <Button onClick={() => navigate('/add-wood')} size="sm">
          <PlusCircle className="w-4 h-4" />
          Add Material
        </Button>
      </div>

      {/* Summary bar */}
      {!loading && woodPieces.length > 0 && (
        <div className="flex items-center gap-4 text-xs text-slate-600 bg-slate-100 rounded-md px-4 py-2.5">
          <span><strong className="text-slate-900">{woodPieces.length}</strong> total entries</span>
          <span className="text-slate-300">|</span>
          <span><strong className="text-slate-900">{filtered.length}</strong> shown</span>
          <span className="text-slate-300">|</span>
          <span><strong className="text-emerald-700">{woodPieces.filter(w => w.status === 'available').length}</strong> available</span>
        </div>
      )}

      {/* Filters */}
      <div className="flex flex-col sm:flex-row gap-3">
        <div className="flex-1 relative">
          <Search className="w-4 h-4 text-slate-400 absolute left-3 top-1/2 -translate-y-1/2" />
          <input
            type="text"
            placeholder="Search by wood type or notes..."
            value={search}
            onChange={(e) => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2.5 rounded-md border border-slate-300 bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
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
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">ID</th>
                    <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Wood Type</th>
                    <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Length (cm)</th>
                    <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Width (cm)</th>
                    <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Thickness (cm)</th>
                    <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Qty</th>
                    <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Status</th>
                    <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Date Added</th>
                    <th className="text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map((w) => {
                    const statusConfig = getStatusConfig(w.status as WoodStatus);
                    return (
                      <tr key={w.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3">
                          <span className="text-xs font-mono text-slate-400">
                            {w.id.slice(0, 8).toUpperCase()}
                          </span>
                        </td>
                        <td className="px-5 py-3">
                          <div className="flex items-center gap-2">
                            <TreePine className="w-3.5 h-3.5 text-slate-400" />
                            <span className="text-sm font-medium text-slate-900">{w.wood_type}</span>
                          </div>
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-sm text-slate-700 tabular-nums">{w.length_cm}</span>
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-sm text-slate-700 tabular-nums">{w.width_cm}</span>
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-sm text-slate-700 tabular-nums">{w.thickness_cm}</span>
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-sm font-medium text-slate-900 tabular-nums">{w.quantity}</span>
                        </td>
                        <td className="px-5 py-3">
                          <Badge color={statusConfig.color as 'green' | 'amber' | 'blue' | 'gray'}>
                            <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotColor}`} />
                            {statusConfig.label}
                          </Badge>
                        </td>
                        <td className="px-5 py-3">
                          <span className="text-xs text-slate-500">{formatDate(w.created_at)}</span>
                        </td>
                        <td className="px-5 py-3 text-right">
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
            </div>
          </Card>

          {/* Mobile cards */}
          <div className="md:hidden space-y-3">
            {filtered.map((w) => {
              const statusConfig = getStatusConfig(w.status as WoodStatus);
              return (
                <Card key={w.id}>
                  <CardContent className="pt-4">
                    <div className="flex items-start justify-between mb-3">
                      <div className="flex items-center gap-2">
                        <div className="w-8 h-8 rounded-md bg-slate-100 flex items-center justify-center">
                          <TreePine className="w-4 h-4 text-slate-600" />
                        </div>
                        <div>
                          <p className="text-sm font-semibold text-slate-900">{w.wood_type}</p>
                          <p className="text-[11px] font-mono text-slate-400">{w.id.slice(0, 8).toUpperCase()}</p>
                        </div>
                      </div>
                      <Badge color={statusConfig.color as 'green' | 'amber' | 'blue' | 'gray'}>
                        <span className={`w-1.5 h-1.5 rounded-full ${statusConfig.dotColor}`} />
                        {statusConfig.label}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      <div className="flex items-center gap-1.5">
                        <Ruler className="w-3 h-3 text-slate-400" />
                        <div>
                          <p className="text-slate-400">Dimensions</p>
                          <p className="text-slate-700">{formatDimensions(w.length_cm, w.width_cm, w.thickness_cm)}</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Hash className="w-3 h-3 text-slate-400" />
                        <div>
                          <p className="text-slate-400">Quantity</p>
                          <p className="text-slate-700">{w.quantity} pcs</p>
                        </div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <div>
                          <p className="text-slate-400">Added</p>
                          <p className="text-slate-700">{formatDate(w.created_at)}</p>
                        </div>
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
          <PackageOpen className="w-12 h-12 text-slate-300 mx-auto mb-4" />
          <p className="text-sm text-slate-500 mb-4">
            {woodPieces.length === 0 ? 'No wood pieces recorded yet.' : 'No pieces match your filters.'}
          </p>
          {woodPieces.length === 0 && (
            <Button onClick={() => navigate('/add-wood')} variant="outline" size="sm">
              <PlusCircle className="w-4 h-4" />
              Add Your First Piece
            </Button>
          )}
        </Card>
      )}
    </div>
  );
}
