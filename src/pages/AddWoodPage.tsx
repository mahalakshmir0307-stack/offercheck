import { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { ArrowLeft, AlertCircle, CheckCircle2, TreePine } from 'lucide-react';
import { supabase } from '@/lib/supabase';
import { Card, CardHeader, CardTitle, CardContent } from '@/components/ui/Card';
import { Input, Textarea, Select } from '@/components/ui/Input';
import { Button } from '@/components/ui/Button';
import { WOOD_TYPES, WOOD_STATUSES } from '@/lib/constants';
import type { WoodStatus } from '@/lib/types';

export function AddWoodPage() {
  const navigate = useNavigate();
  const [form, setForm] = useState({
    woodType: 'Oak',
    lengthCm: '',
    widthCm: '',
    thicknessCm: '',
    quantity: '1',
    status: 'available' as WoodStatus,
    notes: '',
  });
  const [errors, setErrors] = useState<Record<string, string>>({});
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [success, setSuccess] = useState(false);

  const validate = (): boolean => {
    const e: Record<string, string> = {};
    if (!form.woodType.trim()) e.woodType = 'Wood type is required';
    if (!form.lengthCm || parseFloat(form.lengthCm) <= 0) e.lengthCm = 'Enter a valid length';
    if (!form.widthCm || parseFloat(form.widthCm) <= 0) e.widthCm = 'Enter a valid width';
    if (!form.thicknessCm || parseFloat(form.thicknessCm) <= 0) e.thicknessCm = 'Enter a valid thickness';
    if (!form.quantity || parseInt(form.quantity) <= 0) e.quantity = 'Enter a valid quantity';
    setErrors(e);
    return Object.keys(e).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validate()) return;
    setLoading(true);
    setError(null);

    const { error: insertError } = await supabase
      .from('wood_pieces')
      .insert({
        wood_type: form.woodType,
        length_cm: parseFloat(form.lengthCm),
        width_cm: parseFloat(form.widthCm),
        thickness_cm: parseFloat(form.thicknessCm),
        quantity: parseInt(form.quantity),
        status: form.status,
        notes: form.notes.trim() || null,
      });

    if (insertError) {
      setError(insertError.message);
      setLoading(false);
      return;
    }

    await supabase.from('activity_logs').insert({
      action: 'added_wood',
      entity_type: 'wood_piece',
      description: `Added ${form.quantity} ${form.woodType} piece(s) (${form.lengthCm}×${form.widthCm}×${form.thicknessCm} cm)`,
    });

    setLoading(false);
    setSuccess(true);
    setTimeout(() => navigate('/inventory'), 1200);
  };

  return (
    <div className="space-y-6 max-w-2xl">
      <button
        onClick={() => navigate('/dashboard')}
        className="inline-flex items-center gap-2 text-sm text-stone-500 hover:text-stone-700"
      >
        <ArrowLeft className="w-4 h-4" />
        Back to Dashboard
      </button>

      <div>
        <h1 className="text-2xl font-bold text-stone-900">Add Leftover Wood</h1>
        <p className="text-sm text-stone-600 mt-1">Record details about a leftover wood piece from your sawmill.</p>
      </div>

      <Card>
        <CardHeader>
          <CardTitle className="flex items-center gap-2">
            <TreePine className="w-4 h-4 text-amber-700" />
            Wood Details
          </CardTitle>
        </CardHeader>
        <CardContent>
          {success ? (
            <div className="py-8 text-center">
              <CheckCircle2 className="w-12 h-12 text-green-600 mx-auto mb-3" />
              <p className="text-sm font-medium text-stone-900">Wood piece added successfully!</p>
              <p className="text-xs text-stone-500 mt-1">Redirecting to inventory...</p>
            </div>
          ) : (
            <>
              {error && (
                <div className="mb-4 p-3 rounded-lg bg-red-50 border border-red-200 flex items-start gap-2">
                  <AlertCircle className="w-4 h-4 text-red-600 mt-0.5 flex-shrink-0" />
                  <p className="text-sm text-red-700">{error}</p>
                </div>
              )}
              <form onSubmit={handleSubmit} className="space-y-4">
                <Select
                  label="Wood Type"
                  name="woodType"
                  value={form.woodType}
                  onChange={(e) => setForm({ ...form, woodType: e.target.value })}
                  error={errors.woodType}
                >
                  {WOOD_TYPES.map((t) => (
                    <option key={t} value={t}>{t}</option>
                  ))}
                </Select>
                <div className="grid grid-cols-3 gap-4">
                  <Input
                    label="Length (cm)"
                    name="lengthCm"
                    type="number"
                    step="0.1"
                    min="0"
                    value={form.lengthCm}
                    onChange={(e) => setForm({ ...form, lengthCm: e.target.value })}
                    placeholder="50"
                    error={errors.lengthCm}
                  />
                  <Input
                    label="Width (cm)"
                    name="widthCm"
                    type="number"
                    step="0.1"
                    min="0"
                    value={form.widthCm}
                    onChange={(e) => setForm({ ...form, widthCm: e.target.value })}
                    placeholder="15"
                    error={errors.widthCm}
                  />
                  <Input
                    label="Thickness (cm)"
                    name="thicknessCm"
                    type="number"
                    step="0.1"
                    min="0"
                    value={form.thicknessCm}
                    onChange={(e) => setForm({ ...form, thicknessCm: e.target.value })}
                    placeholder="3"
                    error={errors.thicknessCm}
                  />
                </div>
                <div className="grid grid-cols-2 gap-4">
                  <Input
                    label="Quantity"
                    name="quantity"
                    type="number"
                    min="1"
                    value={form.quantity}
                    onChange={(e) => setForm({ ...form, quantity: e.target.value })}
                    placeholder="1"
                    error={errors.quantity}
                  />
                  <Select
                    label="Current Status"
                    name="status"
                    value={form.status}
                    onChange={(e) => setForm({ ...form, status: e.target.value as WoodStatus })}
                  >
                    {WOOD_STATUSES.map((s) => (
                      <option key={s.value} value={s.value}>{s.label}</option>
                    ))}
                  </Select>
                </div>
                <Textarea
                  label="Notes (Optional)"
                  name="notes"
                  value={form.notes}
                  onChange={(e) => setForm({ ...form, notes: e.target.value })}
                  placeholder="Any additional notes about this wood piece..."
                  rows={3}
                />
                <Button type="submit" loading={loading} size="lg" className="w-full">
                  Add Wood Piece
                </Button>
              </form>
            </>
          )}
        </CardContent>
      </Card>
    </div>
  );
}
