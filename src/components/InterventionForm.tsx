import { useState } from 'react';
import { Upload, Plus, X, FileText, AlertCircle } from 'lucide-react';
import { supabase } from '../lib/supabase';

type InterventionInput = {
  description: string;
  location: string;
  quantity: string;
  unit: string;
  ircStandard: string;
};

type Props = {
  onEstimateGenerated: () => void;
};

export default function InterventionForm({ onEstimateGenerated }: Props) {
  const [reportName, setReportName] = useState('');
  const [interventions, setInterventions] = useState<InterventionInput[]>([
    { description: '', location: '', quantity: '', unit: '', ircStandard: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');

  const addIntervention = () => {
    setInterventions([...interventions, { description: '', location: '', quantity: '', unit: '', ircStandard: '' }]);
  };

  const removeIntervention = (index: number) => {
    setInterventions(interventions.filter((_, i) => i !== index));
  };

  const updateIntervention = (index: number, field: keyof InterventionInput, value: string) => {
    const updated = [...interventions];
    updated[index][field] = value;
    setInterventions(updated);
  };

  const generateEstimate = async () => {
    setLoading(true);
    setError('');

    try {
      const { data: interventionData, error: interventionError } = await supabase
        .from('interventions')
        .insert({
          report_name: reportName || 'Untitled Report',
          status: 'processing',
          total_interventions: interventions.length
        })
        .select()
        .single();

      if (interventionError) throw interventionError;

      for (let i = 0; i < interventions.length; i++) {
        const item = interventions[i];

        const { data: itemData, error: itemError } = await supabase
          .from('intervention_items')
          .insert({
            intervention_id: interventionData.id,
            item_number: i + 1,
            description: item.description,
            location: item.location,
            quantity: parseFloat(item.quantity) || 0,
            unit: item.unit,
            irc_standard: item.ircStandard.split(' ')[0] + ' ' + item.ircStandard.split(' ')[1]
          })
          .select()
          .single();

        if (itemError) throw itemError;

        const { data: standards } = await supabase
          .from('irc_standards')
          .select('*')
          .ilike('standard_code', `%${item.ircStandard.split(' ')[0]} ${item.ircStandard.split(' ')[1]}%`)
          .limit(1);

        const standard = standards?.[0];

        if (standard) {
          const { data: priceData } = await supabase
            .from('price_references')
            .select('*')
            .ilike('material_name', `%${standard.material_category}%`)
            .limit(1);

          const price = priceData?.[0];

          if (price) {
            await supabase
              .from('cost_estimates')
              .insert({
                intervention_item_id: itemData.id,
                material_name: price.material_name,
                specification: price.specification || standard.specification,
                quantity: parseFloat(item.quantity) || 0,
                unit: item.unit,
                unit_price: price.price,
                total_cost: (parseFloat(item.quantity) || 0) * price.price,
                source: price.source,
                source_reference: price.document_reference,
                irc_clause_used: `${standard.standard_code} Clause ${standard.clause_number}`,
                assumptions: `Based on ${standard.title}. Material-only cost, excluding labour and taxes.`
              });
          }
        }
      }

      await supabase
        .from('interventions')
        .update({ status: 'completed' })
        .eq('id', interventionData.id);

      setReportName('');
      setInterventions([{ description: '', location: '', quantity: '', unit: '', ircStandard: '' }]);
      onEstimateGenerated();
    } catch (err) {
      setError('Failed to generate estimate. Please try again.');
      console.error(err);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-gradient-to-br from-blue-500 to-cyan-500 p-3 rounded-lg">
          <FileText className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">New Intervention Report</h2>
          <p className="text-sm text-gray-600">Add road safety interventions for cost estimation</p>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500 flex-shrink-0 mt-0.5" />
          <p className="text-sm text-red-700">{error}</p>
        </div>
      )}

      <div className="mb-6">
        <label className="block text-sm font-semibold text-gray-700 mb-2">
          Report Name
        </label>
        <input
          type="text"
          value={reportName}
          onChange={(e) => setReportName(e.target.value)}
          placeholder="e.g., NH-48 Safety Audit Report 2025"
          className="w-full px-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500 transition-all"
        />
      </div>

      <div className="space-y-4">
        {interventions.map((intervention, index) => (
          <div key={index} className="bg-gradient-to-br from-gray-50 to-blue-50 rounded-lg p-4 border border-gray-200">
            <div className="flex items-center justify-between mb-4">
              <h3 className="font-semibold text-gray-800">Intervention #{index + 1}</h3>
              {interventions.length > 1 && (
                <button
                  onClick={() => removeIntervention(index)}
                  className="text-red-500 hover:text-red-700 transition-colors"
                >
                  <X className="w-5 h-5" />
                </button>
              )}
            </div>

            <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
              <div className="md:col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Description
                </label>
                <input
                  type="text"
                  value={intervention.description}
                  onChange={(e) => updateIntervention(index, 'description', e.target.value)}
                  placeholder="e.g., Install W-beam guard rail"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Location
                </label>
                <input
                  type="text"
                  value={intervention.location}
                  onChange={(e) => updateIntervention(index, 'location', e.target.value)}
                  placeholder="e.g., KM 45+200 to 45+500"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  IRC Standard
                </label>
                <select
                  value={intervention.ircStandard}
                  onChange={(e) => updateIntervention(index, 'ircStandard', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select IRC Standard</option>
                  <option value="IRC 35">IRC 35 - Road Markings</option>
                  <option value="IRC 67">IRC 67 - Safety Barriers</option>
                  <option value="IRC 99">IRC 99 - Traffic Signs</option>
                  <option value="IRC:SP:84">IRC:SP:84 - Speed Breakers</option>
                  <option value="IRC:SP:87">IRC:SP:87 - Pedestrian Safety</option>
                </select>
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Quantity
                </label>
                <input
                  type="number"
                  value={intervention.quantity}
                  onChange={(e) => updateIntervention(index, 'quantity', e.target.value)}
                  placeholder="e.g., 300"
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                />
              </div>

              <div>
                <label className="block text-sm font-medium text-gray-700 mb-1">
                  Unit
                </label>
                <select
                  value={intervention.unit}
                  onChange={(e) => updateIntervention(index, 'unit', e.target.value)}
                  className="w-full px-3 py-2 border border-gray-300 rounded-lg focus:ring-2 focus:ring-blue-500 focus:border-blue-500"
                >
                  <option value="">Select Unit</option>
                  <option value="meter">Meter</option>
                  <option value="sqm">Square Meter</option>
                  <option value="kg">Kilogram</option>
                  <option value="piece">Piece</option>
                  <option value="number">Number</option>
                </select>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex space-x-3">
        <button
          onClick={addIntervention}
          className="flex items-center space-x-2 px-4 py-2 bg-gray-100 text-gray-700 rounded-lg hover:bg-gray-200 transition-colors font-medium"
        >
          <Plus className="w-5 h-5" />
          <span>Add Intervention</span>
        </button>

        <button
          onClick={generateEstimate}
          disabled={loading || !reportName || interventions.some(i => !i.description || !i.quantity || !i.unit || !i.ircStandard)}
          className="flex-1 flex items-center justify-center space-x-2 px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-lg hover:from-orange-600 hover:to-red-600 transition-all font-semibold disabled:opacity-50 disabled:cursor-not-allowed shadow-lg"
        >
          <Upload className="w-5 h-5" />
          <span>{loading ? 'Generating Estimate...' : 'Generate Cost Estimate'}</span>
        </button>
      </div>
    </div>
  );
}
