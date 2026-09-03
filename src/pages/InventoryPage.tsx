import { useEffect, useState, useCallback } from 'react';
import { useNavigate } from 'react-router-dom';
import {
  PackageOpen, Search, Lightbulb, TreePine, PlusCircle,
  Ruler, Calendar, Hash, Trash2, Pencil, X, Check, ArrowUpDown,
  Layers,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card, CardContent } from '@/components/ui/Card';
import { Select, Input, Textarea } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PageHeader, LoadingState, ErrorState, EmptyState } from '@/components/ui/Shared';
import {
  WOOD_TYPES, WOOD_STATUSES, getStatusConfig,
  formatDimensions, formatDate, calculateWoodVolume,
} from '@/lib/constants';
import type { WoodPiece, WoodStatus } from '@/lib/types';

type SortField = 'date' | 'quantity' | 'volume';
type SortDir = 'asc' | 'desc';

export function InventoryPage() {
  const navigate = useNavigate();
  const [woodPieces, setWoodPieces] = useState<WoodPiece[]>([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [search, setSearch] = useState('');
  const [filterType, setFilterType] = useState('all');
  const [filterStatus, setFilterStatus] = useState('all');
  const [sortField, setSortField] = useState<SortField>('date');
  const [sortDir, setSortDir] = useState<SortDir>('desc');
  const [editingId, setEditingId] = useState<string | null>(null);
  const [editForm, setEditForm] = useState<Partial<WoodPiece>>({});
  const [deletingId, setDeletingId] = useState<string | null>(null);

  const fetchWood = useCallback(async () => {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('wood_pieces')
      .select('*')
      .order('created_at', { ascending: false });
    if (err) {
      setError('Unable to load inventory data. Please try again.');
      setLoading(false);
      return;
    }
    setWoodPieces((data || []) as WoodPiece[]);
    setLoading(false);
  }, []);

  useEffect(() => { fetchWood(); }, [fetchWood]);

  const filtered = woodPieces
    .filter(w => {
      const matchesSearch = !search ||
        w.wood_type.toLowerCase().includes(search.toLowerCase()) ||
        (w.notes || '').toLowerCase().includes(search.toLowerCase());
      const matchesType = filterType === 'all' || w.wood_type === filterType;
      const matchesStatus = filterStatus === 'all' || w.status === filterStatus;
      return matchesSearch && matchesType && matchesStatus;
    })
    .sort((a, b) => {
      let cmp = 0;
      if (sortField === 'date') cmp = new Date(a.created_at).getTime() - new Date(b.created_at).getTime();
      else if (sortField === 'quantity') cmp = a.quantity - b.quantity;
      else if (sortField === 'volume') {
        const va = calculateWoodVolume(a.length_cm, a.width_cm, a.thickness_cm);
        const vb = calculateWoodVolume(b.length_cm, b.width_cm, b.thickness_cm);
        cmp = va - vb;
      }
      return sortDir === 'asc' ? cmp : -cmp;
    });

  function toggleSort(field: SortField) {
    if (sortField === field) {
      setSortDir(prev => prev === 'asc' ? 'desc' : 'asc');
    } else {
      setSortField(field);
      setSortDir('desc');
    }
  }

  function startEdit(w: WoodPiece) {
    setEditingId(w.id);
    setEditForm({
      wood_type: w.wood_type,
      length_cm: w.length_cm,
      width_cm: w.width_cm,
      thickness_cm: w.thickness_cm,
      quantity: w.quantity,
      status: w.status,
      notes: w.notes,
    });
  }

  async function saveEdit(id: string) {
    await supabase.from('wood_pieces').update({
      wood_type: editForm.wood_type,
      length_cm: parseFloat(String(editForm.length_cm)),
      width_cm: parseFloat(String(editForm.width_cm)),
      thickness_cm: parseFloat(String(editForm.thickness_cm)),
      quantity: parseInt(String(editForm.quantity)),
      status: editForm.status,
      notes: editForm.notes,
    }).eq('id', id);
    await supabase.from('activity_logs').insert({
      action: 'updated_wood',
      entity_type: 'wood_piece',
      entity_id: id,
      description: `Updated ${editForm.wood_type} piece details`,
    });
    setWoodPieces(prev => prev.map(w => w.id === id ? { ...w, ...editForm as WoodPiece } : w));
    setEditingId(null);
  }

  async function deleteWood(id: string) {
    setDeletingId(id);
    const wood = woodPieces.find(w => w.id === id);
    await supabase.from('wood_pieces').delete().eq('id', id);
    await supabase.from('activity_logs').insert({
      action: 'deleted_wood',
      entity_type: 'wood_piece',
      entity_id: id,
      description: `Deleted ${wood?.wood_type || 'wood'} piece from inventory`,
    });
    setWoodPieces(prev => prev.filter(w => w.id !== id));
    setDeletingId(null);
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Wood Inventory" description="Material management for all recorded wood pieces." />
        <LoadingState message="Loading inventory data..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Wood Inventory" description="Material management for all recorded wood pieces." />
        <ErrorState message={error} onRetry={fetchWood} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Wood Inventory"
        description="Material management for all recorded wood pieces."
        action={<Button onClick={() => navigate('/add-wood')} size="sm"><PlusCircle className="w-4 h-4" />Add Material</Button>}
      />

      {/* Summary bar */}
      {woodPieces.length > 0 && (
        <div className="flex flex-wrap items-center gap-4 text-xs text-slate-600 bg-slate-100 rounded-md px-4 py-2.5">
          <span><strong className="text-slate-900">{woodPieces.length}</strong> total entries</span>
          <span className="text-slate-300">|</span>
          <span><strong className="text-slate-900">{filtered.length}</strong> shown</span>
          <span className="text-slate-300">|</span>
          <span><strong className="text-emerald-700">{woodPieces.filter(w => w.status === 'available').length}</strong> available</span>
          <span className="text-slate-300">|</span>
          <span className="flex items-center gap-1"><Layers className="w-3 h-3" />Total volume: <strong className="text-slate-900">{woodPieces.reduce((s, w) => s + calculateWoodVolume(w.length_cm, w.width_cm, w.thickness_cm), 0).toFixed(0)} cm³</strong></span>
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
            onChange={e => setSearch(e.target.value)}
            className="w-full pl-9 pr-3.5 py-2.5 rounded-md border border-slate-300 bg-white text-slate-900 placeholder-slate-400 text-sm focus:outline-none focus:ring-2 focus:ring-amber-500 focus:border-amber-500"
          />
        </div>
        <Select value={filterType} onChange={e => setFilterType(e.target.value)} className="sm:w-40">
          <option value="all">All Types</option>
          {WOOD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
        </Select>
        <Select value={filterStatus} onChange={e => setFilterStatus(e.target.value)} className="sm:w-40">
          <option value="all">All Statuses</option>
          {WOOD_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
        </Select>
      </div>

      {filtered.length > 0 ? (
        <>
          {/* Desktop table */}
          <Card className="hidden md:block overflow-hidden">
            <div className="overflow-x-auto">
              <table className="w-full">
                <thead>
                  <tr className="border-b border-slate-200 bg-slate-50">
                    <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">ID</th>
                    <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Wood Type</th>
                    <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Dimensions (cm)</th>
                    <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
                      <button onClick={() => toggleSort('quantity')} className="flex items-center gap-1 hover:text-slate-700">
                        Qty <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
                      <button onClick={() => toggleSort('volume')} className="flex items-center gap-1 hover:text-slate-700">
                        Volume <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Status</th>
                    <th className="text-left text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">
                      <button onClick={() => toggleSort('date')} className="flex items-center gap-1 hover:text-slate-700">
                        Date <ArrowUpDown className="w-3 h-3" />
                      </button>
                    </th>
                    <th className="text-right text-[11px] font-semibold text-slate-500 uppercase tracking-wider px-5 py-3">Actions</th>
                  </tr>
                </thead>
                <tbody className="divide-y divide-slate-100">
                  {filtered.map(w => {
                    const sc = getStatusConfig(w.status as WoodStatus);
                    const vol = calculateWoodVolume(w.length_cm, w.width_cm, w.thickness_cm);
                    const isEditing = editingId === w.id;
                    return (
                      <tr key={w.id} className="hover:bg-slate-50 transition-colors">
                        <td className="px-5 py-3"><span className="text-xs font-mono text-slate-400">{w.id.slice(0, 8).toUpperCase()}</span></td>
                        <td className="px-5 py-3">
                          {isEditing ? (
                            <Select value={editForm.wood_type} onChange={e => setEditForm({ ...editForm, wood_type: e.target.value })} className="text-xs py-1">
                              {WOOD_TYPES.map(t => <option key={t} value={t}>{t}</option>)}
                            </Select>
                          ) : (
                            <div className="flex items-center gap-2">
                              <TreePine className="w-3.5 h-3.5 text-slate-400" />
                              <span className="text-sm font-medium text-slate-900">{w.wood_type}</span>
                            </div>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          {isEditing ? (
                            <div className="flex gap-1">
                              <input type="number" step="0.1" value={editForm.length_cm} onChange={e => setEditForm({ ...editForm, length_cm: parseFloat(e.target.value) })} className="w-14 px-1.5 py-1 text-xs border border-slate-300 rounded" />
                              <input type="number" step="0.1" value={editForm.width_cm} onChange={e => setEditForm({ ...editForm, width_cm: parseFloat(e.target.value) })} className="w-14 px-1.5 py-1 text-xs border border-slate-300 rounded" />
                              <input type="number" step="0.1" value={editForm.thickness_cm} onChange={e => setEditForm({ ...editForm, thickness_cm: parseFloat(e.target.value) })} className="w-14 px-1.5 py-1 text-xs border border-slate-300 rounded" />
                            </div>
                          ) : (
                            <span className="text-sm text-slate-700">{w.length_cm} × {w.width_cm} × {w.thickness_cm}</span>
                          )}
                        </td>
                        <td className="px-5 py-3">
                          {isEditing ? (
                            <input type="number" value={editForm.quantity} onChange={e => setEditForm({ ...editForm, quantity: parseInt(e.target.value) })} className="w-14 px-1.5 py-1 text-xs border border-slate-300 rounded" />
                          ) : (
                            <span className="text-sm font-medium text-slate-900 tabular-nums">{w.quantity}</span>
                          )}
                        </td>
                        <td className="px-5 py-3"><span className="text-sm text-slate-600 tabular-nums">{vol.toFixed(0)} cm³</span></td>
                        <td className="px-5 py-3">
                          {isEditing ? (
                            <Select value={editForm.status} onChange={e => setEditForm({ ...editForm, status: e.target.value as WoodStatus })} className="text-xs py-1">
                              {WOOD_STATUSES.map(s => <option key={s.value} value={s.value}>{s.label}</option>)}
                            </Select>
                          ) : (
                            <Badge color={sc.color as 'green' | 'amber' | 'blue' | 'gray'}>
                              <span className={`w-1.5 h-1.5 rounded-full ${sc.dotColor}`} />{sc.label}
                            </Badge>
                          )}
                        </td>
                        <td className="px-5 py-3"><span className="text-xs text-slate-500">{formatDate(w.created_at)}</span></td>
                        <td className="px-5 py-3">
                          <div className="flex items-center justify-end gap-1">
                            {isEditing ? (
                              <>
                                <button onClick={() => saveEdit(w.id)} className="p-1.5 rounded-md text-emerald-600 hover:bg-emerald-50"><Check className="w-4 h-4" /></button>
                                <button onClick={() => setEditingId(null)} className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100"><X className="w-4 h-4" /></button>
                              </>
                            ) : (
                              <>
                                <button onClick={() => startEdit(w)} className="p-1.5 rounded-md text-slate-500 hover:bg-slate-100"><Pencil className="w-3.5 h-3.5" /></button>
                                <button onClick={() => deleteWood(w.id)} disabled={deletingId === w.id} className="p-1.5 rounded-md text-red-500 hover:bg-red-50"><Trash2 className="w-3.5 h-3.5" /></button>
                                <Button variant="outline" size="sm" onClick={() => navigate(`/suggestions?wood=${w.id}`)} className="ml-2">
                                  <Lightbulb className="w-3.5 h-3.5" />Recommendations
                                </Button>
                              </>
                            )}
                          </div>
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
            {filtered.map(w => {
              const sc = getStatusConfig(w.status as WoodStatus);
              const vol = calculateWoodVolume(w.length_cm, w.width_cm, w.thickness_cm);
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
                      <Badge color={sc.color as 'green' | 'amber' | 'blue' | 'gray'}>
                        <span className={`w-1.5 h-1.5 rounded-full ${sc.dotColor}`} />{sc.label}
                      </Badge>
                    </div>
                    <div className="grid grid-cols-2 gap-2 text-xs mb-3">
                      <div className="flex items-center gap-1.5">
                        <Ruler className="w-3 h-3 text-slate-400" />
                        <div><p className="text-slate-400">Dimensions</p><p className="text-slate-700">{formatDimensions(w.length_cm, w.width_cm, w.thickness_cm)}</p></div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Hash className="w-3 h-3 text-slate-400" />
                        <div><p className="text-slate-400">Quantity</p><p className="text-slate-700">{w.quantity} pcs</p></div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Layers className="w-3 h-3 text-slate-400" />
                        <div><p className="text-slate-400">Volume</p><p className="text-slate-700">{vol.toFixed(0)} cm³</p></div>
                      </div>
                      <div className="flex items-center gap-1.5">
                        <Calendar className="w-3 h-3 text-slate-400" />
                        <div><p className="text-slate-400">Added</p><p className="text-slate-700">{formatDate(w.created_at)}</p></div>
                      </div>
                    </div>
                    <div className="flex gap-2">
                      <Button variant="outline" size="sm" className="flex-1" onClick={() => navigate(`/suggestions?wood=${w.id}`)}>
                        <Lightbulb className="w-3.5 h-3.5" />Recommendations
                      </Button>
                      <button onClick={() => startEdit(w)} className="p-2 rounded-md border border-slate-200 text-slate-500"><Pencil className="w-3.5 h-3.5" /></button>
                      <button onClick={() => deleteWood(w.id)} disabled={deletingId === w.id} className="p-2 rounded-md border border-red-200 text-red-500"><Trash2 className="w-3.5 h-3.5" /></button>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>
        </>
      ) : (
        <EmptyState
          icon={PackageOpen}
          title={woodPieces.length === 0 ? 'No wood pieces recorded yet' : 'No pieces match your filters'}
          description={woodPieces.length === 0 ? 'Add your first leftover wood piece to begin tracking and generating recommendations.' : 'Try adjusting your search or filter criteria.'}
          action={woodPieces.length === 0 ? <Button onClick={() => navigate('/add-wood')} variant="outline" size="sm"><PlusCircle className="w-4 h-4" />Add Your First Piece</Button> : undefined}
        />
      )}
    </div>
  );
}
