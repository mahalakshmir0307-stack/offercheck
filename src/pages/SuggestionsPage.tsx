import { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';
import {
  Lightbulb, TreePine, ArrowRight, Loader2, CheckCircle2,
  Flower, Armchair, Sofa, BedDouble, Sparkles, Boxes, Columns3,
  PackageOpen, Ruler,
} from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { Badge } from '@/components/ui/Badge';
import { PRODUCT_CATALOG, formatDimensions, formatCurrency } from '@/lib/constants';
import type { WoodPiece, ProductSuggestion } from '@/lib/types';

const ICON_MAP: Record<string, typeof Flower> = {
  Flower, Armchair, Sofa, BedDouble, Sparkles, Boxes, Columns3,
};

export function SuggestionsPage() {
  const [searchParams] = useSearchParams();
  const navigate = useNavigate();
  const woodIdParam = searchParams.get('wood');

  const [woodPieces, setWoodPieces] = useState<WoodPiece[]>([]);
  const [selectedWoodId, setSelectedWoodId] = useState<string>(woodIdParam || '');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    async function fetchWood() {
      const { data } = await supabase
        .from('wood_pieces')
        .select('*')
        .order('created_at', { ascending: false });
      const pieces = (data || []) as WoodPiece[];
      setWoodPieces(pieces);
      if (!selectedWoodId && pieces.length > 0) {
        setSelectedWoodId(pieces[0].id);
      }
      setLoading(false);
    }
    fetchWood();
  }, []);

  const selectedWood = woodPieces.find((w) => w.id === selectedWoodId);

  const getSuggestions = (wood: WoodPiece | undefined): (ProductSuggestion & { matched: boolean })[] => {
    if (!wood) return [];
    return PRODUCT_CATALOG.map((p) => ({
      ...p,
      matched:
        wood.length_cm >= p.min_length &&
        wood.width_cm >= p.min_width &&
        wood.thickness_cm >= p.min_thickness,
    }));
  };

  const suggestions = getSuggestions(selectedWood);
  const matchedSuggestions = suggestions.filter((s) => s.matched);

  return (
    <div className="space-y-6">
      <div>
        <h1 className="text-2xl font-bold text-stone-900">Product Suggestions</h1>
        <p className="text-sm text-stone-600 mt-1">
          See what products can be made from a specific leftover wood piece based on its dimensions.
        </p>
      </div>

      {/* Wood selector */}
      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TreePine className="w-4 h-4 text-amber-700" />
            Select a Wood Piece
          </CardTitle>
        </CardHeader>
        <CardContent>
          {loading ? (
            <div className="flex items-center gap-2 py-4">
              <Loader2 className="w-4 h-4 text-amber-700 animate-spin" />
              <p className="text-sm text-stone-500">Loading wood pieces...</p>
            </div>
          ) : woodPieces.length === 0 ? (
            <div className="py-8 text-center">
              <PackageOpen className="w-10 h-10 text-stone-300 mx-auto mb-3" />
              <p className="text-sm text-stone-500 mb-4">No wood pieces available. Add some first.</p>
              <Button onClick={() => navigate('/add-wood')} variant="outline" size="sm">
                Add Leftover Wood
              </Button>
            </div>
          ) : (
            <Select
              value={selectedWoodId}
              onChange={(e) => setSelectedWoodId(e.target.value)}
            >
              {woodPieces.map((w) => (
                <option key={w.id} value={w.id}>
                  {w.wood_type} — {formatDimensions(w.length_cm, w.width_cm, w.thickness_cm)} ({w.quantity} pcs, {w.status})
                </option>
              ))}
            </Select>
          )}
        </CardContent>
      </Card>

      {/* Selected wood details + suggestions */}
      {selectedWood && !loading && (
        <>
          {/* Wood piece info */}
          <Card className="p-5 bg-gradient-to-r from-stone-50 to-amber-50 border-amber-100">
            <div className="flex flex-col sm:flex-row sm:items-center justify-between gap-4">
              <div className="flex items-center gap-4">
                <div className="w-12 h-12 rounded-xl bg-amber-700 flex items-center justify-center flex-shrink-0">
                  <TreePine className="w-6 h-6 text-white" />
                </div>
                <div>
                  <p className="text-base font-semibold text-stone-900">{selectedWood.wood_type}</p>
                  <p className="text-sm text-stone-600 flex items-center gap-1.5 mt-0.5">
                    <Ruler className="w-3.5 h-3.5" />
                    {formatDimensions(selectedWood.length_cm, selectedWood.width_cm, selectedWood.thickness_cm)}
                    <span className="text-stone-400">·</span>
                    {selectedWood.quantity} pcs
                  </p>
                </div>
              </div>
              <div className="text-left sm:text-right">
                <p className="text-2xl font-bold text-amber-700">{matchedSuggestions.length}</p>
                <p className="text-xs text-stone-500">matching products</p>
              </div>
            </div>
          </Card>

          {/* Suggestion cards */}
          <div className="grid grid-cols-1 sm:grid-cols-2 lg:grid-cols-3 gap-4">
            {suggestions.map((s) => {
              const Icon = ICON_MAP[s.icon] || Boxes;
              return (
                <Card
                  key={s.name}
                  className={s.matched ? 'border-amber-200 shadow-sm' : 'opacity-60'}
                >
                  <CardContent className="pt-5">
                    <div className="flex items-start justify-between mb-3">
                      <div className={`w-11 h-11 rounded-xl flex items-center justify-center ${s.matched ? 'bg-amber-100' : 'bg-stone-100'}`}>
                        <Icon className={`w-5.5 h-5.5 ${s.matched ? 'text-amber-700' : 'text-stone-400'}`} style={{ width: 22, height: 22 }} />
                      </div>
                      {s.matched ? (
                        <Badge color="green">
                          <CheckCircle2 className="w-3 h-3" />
                          Feasible
                        </Badge>
                      ) : (
                        <Badge color="gray">Too small</Badge>
                      )}
                    </div>
                    <h3 className="text-base font-semibold text-stone-900 mb-1">{s.name}</h3>
                    <p className="text-xs text-stone-600 leading-relaxed mb-3">{s.description}</p>
                    <div className="flex items-center justify-between pt-3 border-t border-stone-100">
                      <div>
                        <p className="text-xs text-stone-400">Est. Value</p>
                        <p className="text-sm font-semibold text-stone-900">{formatCurrency(s.estimated_value)}</p>
                      </div>
                      <div className="text-right">
                        <p className="text-xs text-stone-400">Min. Size</p>
                        <p className="text-xs text-stone-600">{s.min_length}×{s.min_width}×{s.min_thickness} cm</p>
                      </div>
                    </div>
                  </CardContent>
                </Card>
              );
            })}
          </div>

          {/* Summary */}
          {matchedSuggestions.length > 0 && (
            <Card className="p-5 bg-gradient-to-r from-amber-50 to-stone-50 border-amber-100">
              <div className="flex items-start gap-4">
                <div className="w-10 h-10 rounded-lg bg-amber-700 flex items-center justify-center flex-shrink-0">
                  <Lightbulb className="w-5 h-5 text-white" />
                </div>
                <div>
                  <h3 className="text-sm font-semibold text-stone-900">Recommendation Summary</h3>
                  <p className="text-sm text-stone-600 mt-1">
                    Based on the dimensions of this {selectedWood.wood_type} piece,
                    {' '}{matchedSuggestions.length} product{matchedSuggestions.length === 1 ? '' : 's'} can be made
                    with a total estimated value of{' '}
                    <span className="font-semibold text-stone-900">
                      {formatCurrency(matchedSuggestions.reduce((sum, s) => sum + s.estimated_value, 0))}
                    </span>.
                  </p>
                </div>
              </div>
            </Card>
          )}
        </>
      )}
    </div>
  );
}
