import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Lightbulb, TreePine, CheckCircle2, XCircle,
  PackageOpen, Ruler, TrendingUp, Award, Boxes,
  Table, Armchair, Sofa, BedDouble, Sparkles, Columns3,
  Flower, Utensils, Image, Box, BookOpen, Flame,
  RectangleHorizontal, Anchor, MoveVertical, Circle,
  Loader2, PlusCircle, DollarSign, Percent, Wrench,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { ProductImage } from '@/components/ProductImage';
import { PageHeader, LoadingState, ErrorState, EmptyState, ProgressBar } from '@/components/ui/Shared';
import {
  PRODUCT_CATALOG, formatDimensions, formatCurrency,
  calculateWoodVolume, CATEGORY_LABELS, buildScoredSuggestion,
} from '@/lib/constants';
import type { WoodPiece, ScoredSuggestion } from '@/lib/types';

const ICON_MAP: Record<string, typeof Flower> = {
  Flower, Armchair, Sofa, BedDouble, Sparkles, Boxes, Columns3,
  Table, Utensils, Image, Box, BookOpen, Flame,
  RectangleHorizontal, Anchor, MoveVertical, Circle,
};

export function SuggestionsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const woodIdParam = searchParams.get('wood');

  const [woodPieces, setWoodPieces] = useState<WoodPiece[]>([]);
  const [selectedWoodId, setSelectedWoodId] = useState<string>(woodIdParam || '');
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState<string | null>(null);
  const [creatingProduct, setCreatingProduct] = useState<string | null>(null);

  useEffect(() => {
    fetchWood();
  }, []);

  async function fetchWood() {
    setLoading(true);
    setError(null);
    const { data, error: err } = await supabase
      .from('wood_pieces')
      .select('*')
      .order('created_at', { ascending: false });
    if (err) {
      setError('Unable to load wood inventory data. Please try again.');
      setLoading(false);
      return;
    }
    const pieces = (data || []) as WoodPiece[];
    setWoodPieces(pieces);
    if (!selectedWoodId && pieces.length > 0) {
      setSelectedWoodId(pieces[0].id);
    }
    setLoading(false);
  }

  const selectedWood = woodPieces.find((w) => w.id === selectedWoodId);

  const suggestions: ScoredSuggestion[] = selectedWood
    ? PRODUCT_CATALOG.map((p) => buildScoredSuggestion(selectedWood, p)).sort((a, b) => {
        if (a.matched !== b.matched) return a.matched ? -1 : 1;
        return b.finalScore - a.finalScore;
      })
    : [];

  const matchedSuggestions = suggestions.filter((s) => s.matched);
  const bestMatch = matchedSuggestions[0];

  async function handleUseOpportunity(s: ScoredSuggestion) {
    if (!selectedWood) return;
    setCreatingProduct(s.name);
    const estimatedCost = s.estimatedCost;
    const estimatedProfit = s.estimated_value - estimatedCost;
    const woodVolume = calculateWoodVolume(selectedWood.length_cm, selectedWood.width_cm, selectedWood.thickness_cm);

    const { error: insertError } = await supabase.from('products').insert({
      name: `${selectedWood.wood_type} ${s.name}`,
      product_type: CATEGORY_LABELS[s.category],
      quantity: 1,
      estimated_value: s.estimated_value,
      estimated_cost: estimatedCost,
      estimated_profit: estimatedProfit,
      wood_type: selectedWood.wood_type,
      material_volume_cm3: woodVolume,
      wood_piece_id: selectedWood.id,
      status: 'planned',
    });

    if (insertError) {
      setCreatingProduct(null);
      return;
    }

    await supabase.from('activity_logs').insert({
      action: 'created_product',
      entity_type: 'product',
      description: `Created product plan: ${selectedWood.wood_type} ${s.name} (${formatCurrency(s.estimated_value)})`,
    });

    await supabase.from('wood_pieces')
      .update({ status: 'reserved' })
      .eq('id', selectedWood.id);

    setCreatingProduct(null);
    navigate('/products');
  }

  if (loading) {
    return (
      <div className="space-y-6">
        <PageHeader title="Product Recommendations" description="Feasibility analysis of products that can be manufactured from leftover wood." />
        <LoadingState message="Loading wood inventory and generating recommendations..." />
      </div>
    );
  }

  if (error) {
    return (
      <div className="space-y-6">
        <PageHeader title="Product Recommendations" description="Feasibility analysis of products that can be manufactured from leftover wood." />
        <ErrorState message={error} onRetry={fetchWood} />
      </div>
    );
  }

  return (
    <div className="space-y-6">
      <PageHeader
        title="Product Recommendations"
        description="Feasibility analysis and decision support for products manufacturable from leftover wood."
      />

      {/* Wood selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TreePine className="w-4 h-4 text-amber-700" />
            Select Material Source
          </CardTitle>
        </CardHeader>
        <CardContent>
          {woodPieces.length === 0 ? (
            <EmptyState
              icon={PackageOpen}
              title="No wood pieces available"
              description="Add leftover wood to your inventory to generate product recommendations."
              action={<Button onClick={() => navigate('/add-wood')} variant="outline" size="sm"><PlusCircle className="w-4 h-4" />Add Material</Button>}
            />
          ) : (
            <Select value={selectedWoodId} onChange={(e) => setSelectedWoodId(e.target.value)}>
              {woodPieces.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.wood_type} — {formatDimensions(w.length_cm, w.width_cm, w.thickness_cm)} ({w.quantity} pcs, {w.status})
                </option>
              ))}
            </Select>
          )}
        </CardContent>
      </Card>

      {selectedWood && (
        <>
          {/* Wood piece info bar */}
          <Card className="p-4 bg-charcoal-50 border-charcoal-200">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-3">
                <div className="w-10 h-10 rounded-md bg-amber-700 flex items-center justify-center flex-shrink-0">
                  <TreePine className="w-5 h-5 text-white" />
                </div>
                <div>
                  <p className="text-sm font-semibold text-charcoal-900">{selectedWood.wood_type}</p>
                  <p className="text-xs text-charcoal-500 flex items-center gap-1.5 mt-0.5">
                    <Ruler className="w-3 h-3" />
                    {formatDimensions(selectedWood.length_cm, selectedWood.width_cm, selectedWood.thickness_cm)}
                    <span className="text-charcoal-300">·</span>
                    {selectedWood.quantity} pcs
                    <span className="text-charcoal-300">·</span>
                    {calculateWoodVolume(selectedWood.length_cm, selectedWood.width_cm, selectedWood.thickness_cm).toFixed(0)} cm³ volume
                  </p>
                </div>
              </div>
              <div className="flex items-center gap-6">
                <div className="text-center">
                  <p className="text-2xl font-bold text-amber-700 tabular-nums">{matchedSuggestions.length}</p>
                  <p className="text-[11px] text-charcoal-500">feasible products</p>
                </div>
                <div className="text-center">
                  <p className="text-2xl font-bold text-emerald-700 tabular-nums">
                    {formatCurrency(matchedSuggestions.reduce((sum, s) => sum + s.estimated_value, 0))}
                  </p>
                  <p className="text-[11px] text-charcoal-500">total est. value</p>
                </div>
              </div>
            </div>
          </Card>

          {/* Best match highlight */}
          {bestMatch && (
            <Card className="border-amber-300 shadow-md">
              <div className="flex flex-col md:flex-row">
                <div className="md:w-64 flex-shrink-0">
                  <ProductImage images={bestMatch.images} alt={`${selectedWood.wood_type} ${bestMatch.name}`} className="h-48 md:h-full" />
                </div>
                <div className="flex-1 p-5">
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex items-center gap-2">
                      <Badge color="amber"><Award className="w-3 h-3" />#1 Best Opportunity</Badge>
                      <Badge color="green"><CheckCircle2 className="w-3 h-3" />{bestMatch.score}% Feasible</Badge>
                    </div>
                    <span className="text-xs text-charcoal-400">{CATEGORY_LABELS[bestMatch.category]}</span>
                  </div>
                  <h3 className="text-lg font-bold text-charcoal-900 mb-1">{bestMatch.name}</h3>
                  <p className="text-sm text-charcoal-600 mb-3">{bestMatch.explanation}</p>
                  <div className="grid grid-cols-2 sm:grid-cols-4 gap-3 pt-3 border-t border-charcoal-100">
                    <div>
                      <p className="text-[11px] text-charcoal-400">Est. Market Value</p>
                      <p className="text-sm font-semibold text-charcoal-900">{formatCurrency(bestMatch.estimated_value)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-charcoal-400">Est. Production Cost</p>
                      <p className="text-sm font-semibold text-charcoal-600">{formatCurrency(bestMatch.estimatedCost)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-charcoal-400">Est. Profit</p>
                      <p className="text-sm font-semibold text-emerald-700">{formatCurrency(bestMatch.estimated_profit)}</p>
                    </div>
                    <div>
                      <p className="text-[11px] text-charcoal-400">Profit Margin</p>
                      <p className="text-sm font-semibold text-charcoal-900">{bestMatch.profitMargin}%</p>
                    </div>
                  </div>
                  <div className="mt-4 flex items-center gap-3">
                    <Button
                      size="sm"
                      onClick={() => handleUseOpportunity(bestMatch)}
                      loading={creatingProduct === bestMatch.name}
                      disabled={creatingProduct !== null}
                    >
                      <PlusCircle className="w-4 h-4" />
                      Use This Opportunity
                    </Button>
                    <span className="text-xs text-charcoal-400">{bestMatch.remainingMaterial}</span>
                  </div>
                </div>
              </div>
            </Card>
          )}

          {/* All suggestion cards */}
          <div>
            <div className="flex items-center gap-2 mb-3">
              <Lightbulb className="w-4 h-4 text-amber-700" />
              <h2 className="text-sm font-semibold text-charcoal-900">All Feasibility Results</h2>
              <span className="text-xs text-charcoal-400">({suggestions.length} products analyzed)</span>
            </div>
            <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
              {suggestions.map((s, idx) => {
                const Icon = ICON_MAP[s.icon] || Boxes;
                const rank = s.matched ? matchedSuggestions.indexOf(s) + 1 : null;
                return (
                  <Card key={s.name} className={s.matched ? 'border-charcoal-200' : 'opacity-60'}>
                    <ProductImage images={s.images} alt={`${selectedWood?.wood_type || ''} ${s.name}`} className="h-36" />
                    <CardContent className="pt-4">
                      <div className="flex items-start justify-between mb-2">
                        <div className="flex items-center gap-2">
                          <div className={`w-8 h-8 rounded-md flex items-center justify-center ${s.matched ? 'bg-amber-50' : 'bg-charcoal-100'}`}>
                            <Icon className={`w-4 h-4 ${s.matched ? 'text-amber-700' : 'text-charcoal-400'}`} />
                          </div>
                          {rank && rank <= 3 && (
                            <span className={`text-xs font-bold tabular-nums ${rank === 1 ? 'text-amber-700' : rank === 2 ? 'text-charcoal-500' : 'text-charcoal-400'}`}>
                              #{rank}
                            </span>
                          )}
                        </div>
                        {s.matched ? (
                          <Badge color="green"><CheckCircle2 className="w-3 h-3" />{s.score}% Feasible</Badge>
                        ) : (
                          <Badge color="gray"><XCircle className="w-3 h-3" />Not Feasible</Badge>
                        )}
                      </div>
                      <h3 className="text-sm font-semibold text-charcoal-900 mb-0.5">{s.name}</h3>
                      <p className="text-[11px] text-charcoal-500 mb-1">{CATEGORY_LABELS[s.category]}</p>
                      <p className="text-xs text-charcoal-600 leading-relaxed mb-3">{s.explanation}</p>

                      {/* Feasibility score bar */}
                      <div className="mb-3">
                        <div className="flex items-center justify-between mb-1">
                          <span className="text-[10px] text-charcoal-400">Feasibility Score</span>
                          <span className="text-[10px] font-medium text-charcoal-600">{s.score}%</span>
                        </div>
                        <ProgressBar
                          value={s.score}
                          color={s.matched ? 'bg-emerald-500' : 'bg-charcoal-300'}
                        />
                      </div>

                      {/* Material utilization bar */}
                      {s.matched && (
                        <div className="mb-3">
                          <div className="flex items-center justify-between mb-1">
                            <span className="text-[10px] text-charcoal-400">Material Utilization</span>
                            <span className="text-[10px] font-medium text-charcoal-600">{s.materialUtilization}%</span>
                          </div>
                          <ProgressBar value={s.materialUtilization} color="bg-amber-500" />
                        </div>
                      )}

                      <div className="grid grid-cols-2 gap-2 pt-3 border-t border-charcoal-100">
                        <div>
                          <p className="text-[10px] text-charcoal-400">Est. Value</p>
                          <p className="text-xs font-semibold text-charcoal-900">{formatCurrency(s.estimated_value)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-charcoal-400">Est. Cost</p>
                          <p className="text-xs font-semibold text-charcoal-600">{formatCurrency(s.estimatedCost)}</p>
                        </div>
                        <div>
                          <p className="text-[10px] text-charcoal-400">Est. Profit</p>
                          <p className="text-xs font-semibold text-emerald-700">{formatCurrency(s.estimated_profit)}</p>
                        </div>
                        <div className="text-right">
                          <p className="text-[10px] text-charcoal-400">Margin</p>
                          <p className="text-xs font-semibold text-charcoal-900">{s.profitMargin}%</p>
                        </div>
                        <div className="col-span-2">
                          <p className="text-[10px] text-charcoal-400">Material Required</p>
                          <p className="text-[11px] text-charcoal-600">{s.materialRequired}</p>
                        </div>
                      </div>

                      {s.matched && (
                        <Button
                          variant="outline"
                          size="sm"
                          className="w-full mt-3"
                          onClick={() => handleUseOpportunity(s)}
                          loading={creatingProduct === s.name}
                          disabled={creatingProduct !== null}
                        >
                          <PlusCircle className="w-3.5 h-3.5" />
                          Use This Opportunity
                        </Button>
                      )}
                    </CardContent>
                  </Card>
                );
              })}
            </div>
          </div>

          {/* Summary */}
          {matchedSuggestions.length > 0 && (
            <Card className="p-5 bg-charcoal-50 border-charcoal-200">
              <div className="flex items-start gap-4">
                <div className="w-9 h-9 rounded-md bg-amber-700 flex items-center justify-center flex-shrink-0">
                  <TrendingUp className="w-4 h-4 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-charcoal-900">Recommendation Summary</h3>
                  <p className="text-sm text-charcoal-600 mt-1">
                    Based on the dimensions of this {selectedWood.wood_type} piece,
                    {' '}{matchedSuggestions.length} product{matchedSuggestions.length === 1 ? '' : 's'} can be manufactured
                    with a total estimated value of{' '}
                    <span className="font-semibold text-charcoal-900">
                      {formatCurrency(matchedSuggestions.reduce((sum, s) => sum + s.estimated_value, 0))}
                    </span>
                    {' '}and estimated profit of{' '}
                    <span className="font-semibold text-emerald-700">
                      {formatCurrency(matchedSuggestions.reduce((sum, s) => sum + s.estimated_profit, 0))}
                    </span>.
                  </p>
                </div>
              </div>
            </Card>
          )}

          {matchedSuggestions.length === 0 && !loading && (
            <Card className="p-8 text-center bg-charcoal-50 border-charcoal-200">
              <Wrench className="w-10 h-10 text-charcoal-300 mx-auto mb-3" />
              <p className="text-sm font-medium text-charcoal-900 mb-1">No feasible products for this material</p>
              <p className="text-sm text-charcoal-500">The dimensions of this wood piece do not meet the minimum requirements for any catalog product. Try selecting a different piece.</p>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
