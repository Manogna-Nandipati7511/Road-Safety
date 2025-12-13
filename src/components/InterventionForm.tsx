import { useState } from 'react';
import { Upload, Plus, X, FileText, AlertCircle } from 'lucide-react';

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

/* STANDARD MATERIAL RATES (CPWD / GeM – INDICATIVE) */
const RATE_RULES = [
  { keyword: 'w-beam', rate: 3500 },
  { keyword: 'w beam', rate: 3500 },
  { keyword: 'crash barrier', rate: 3500 },
  { keyword: 'barrier', rate: 3500 },
  { keyword: 'road marking', rate: 500 },
  { keyword: 'marking', rate: 500 },
  { keyword: 'sign', rate: 12000 },
  { keyword: 'speed', rate: 30000 }
];

export default function InterventionForm({ onEstimateGenerated }: Props) {
  const [reportName, setReportName] = useState('');
  const [interventions, setInterventions] = useState<InterventionInput[]>([
    { description: '', location: '', quantity: '', unit: '', ircStandard: '' }
  ]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState('');
  const [estimatedCost, setEstimatedCost] = useState<number | null>(null);
  const [usedIRCStandards, setUsedIRCStandards] = useState<string[]>([]);

  const addIntervention = () => {
    setInterventions([
      ...interventions,
      { description: '', location: '', quantity: '', unit: '', ircStandard: '' }
    ]);
  };

  const removeIntervention = (index: number) => {
    setInterventions(interventions.filter((_, i) => i !== index));
  };

  const updateIntervention = (
    index: number,
    field: keyof InterventionInput,
    value: string
  ) => {
    const updated = [...interventions];
    updated[index][field] = value;
    setInterventions(updated);
  };

  /* FRONTEND-ONLY COST ESTIMATION */
  const generateEstimate = () => {
    setLoading(true);
    setError('');
    setEstimatedCost(null);

    try {
      let total = 0;
      const ircSet = new Set<string>();

      interventions.forEach((item) => {
        if (item.ircStandard) {
          ircSet.add(item.ircStandard);
        }

        const desc = item.description.toLowerCase();
        let rate = 0;

        for (const rule of RATE_RULES) {
          if (desc.includes(rule.keyword)) {
            rate = rule.rate;
            break;
          }
        }

        const qty = parseFloat(item.quantity) || 0;
        total += qty * rate;
      });

      setEstimatedCost(total);
      setUsedIRCStandards(Array.from(ircSet));
      onEstimateGenerated();
    } catch (e) {
      setError('Failed to generate estimate. Please try again.');
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
          <p className="text-sm text-gray-600">
            Add road safety interventions for cost estimation
          </p>
        </div>
      </div>

      {error && (
        <div className="mb-4 bg-red-50 border border-red-200 rounded-lg p-4 flex items-start space-x-3">
          <AlertCircle className="w-5 h-5 text-red-500 mt-0.5" />
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
          className="w-full px-4 py-3 border border-gray-300 rounded-lg"
        />
      </div>

      <div className="space-y-4">
        {interventions.map((intervention, index) => (
          <div key={index} className="bg-gray-50 rounded-lg p-4 border">
            <div className="flex justify-between mb-3">
              <h3 className="font-semibold">Intervention #{index + 1}</h3>
              {interventions.length > 1 && (
                <button onClick={() => removeIntervention(index)}>
                  <X className="w-5 h-5 text-red-500" />
                </button>
              )}
            </div>

            <input
              type="text"
              placeholder="Description (e.g., Install W-beam crash barrier)"
              value={intervention.description}
              onChange={(e) =>
                updateIntervention(index, 'description', e.target.value)
              }
              className="w-full mb-2 px-3 py-2 border rounded"
            />

            <input
              type="text"
              placeholder="Location (e.g., KM 45+200 to 45+500)"
              value={intervention.location}
              onChange={(e) =>
                updateIntervention(index, 'location', e.target.value)
              }
              className="w-full mb-2 px-3 py-2 border rounded"
            />

            <select
              value={intervention.ircStandard}
              onChange={(e) =>
                updateIntervention(index, 'ircStandard', e.target.value)
              }
              className="w-full mb-2 px-3 py-2 border rounded"
            >
              <option value="">Select IRC Standard</option>
              <option value="IRC 35">IRC 35 – Road Markings</option>
              <option value="IRC 67">IRC 67 – Road Signs</option>
              <option value="IRC 99">IRC 99 – Traffic Calming</option>
              <option value="IRC:SP:84">IRC:SP:84 – Road Safety Audit</option>
              <option value="IRC:SP:87">IRC:SP:87 – Road Safety Furniture</option>
            </select>

            <div className="grid grid-cols-2 gap-2">
              <input
                type="number"
                placeholder="Quantity"
                value={intervention.quantity}
                onChange={(e) =>
                  updateIntervention(index, 'quantity', e.target.value)
                }
                className="px-3 py-2 border rounded"
              />

              <select
                value={intervention.unit}
                onChange={(e) =>
                  updateIntervention(index, 'unit', e.target.value)
                }
                className="px-3 py-2 border rounded"
              >
                <option value="">Unit</option>
                <option value="meter">Meter</option>
                <option value="sqm">Sq.m</option>
                <option value="number">Number</option>
              </select>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 flex space-x-3">
        <button
          onClick={addIntervention}
          className="px-4 py-2 bg-gray-100 rounded"
        >
          <Plus className="w-4 h-4 inline mr-1" />
          Add Intervention
        </button>

        <button
          onClick={generateEstimate}
          disabled={
            loading ||
            !reportName ||
            interventions.some(
              i => !i.description || !i.quantity || !i.unit || !i.ircStandard
            )
          }
          className="flex-1 px-6 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded disabled:opacity-50"
        >
          <Upload className="w-4 h-4 inline mr-1" />
          {loading ? 'Calculating...' : 'Generate Cost Estimate'}
        </button>
      </div>

      {estimatedCost !== null && (
        <div className="mt-6 bg-green-50 border border-green-200 rounded-lg p-4">
          <h3 className="font-bold text-green-700">
            Estimated Material Cost
          </h3>
          <p className="text-2xl font-bold text-green-800">
            ₹ {estimatedCost.toLocaleString()}
          </p>

          <div className="mt-3">
            <h4 className="font-semibold text-gray-700">
              IRC Standards Referred
            </h4>
            <ul className="list-disc ml-5 text-sm text-gray-700">
              {usedIRCStandards.map((irc, idx) => (
                <li key={idx}>{irc}</li>
              ))}
            </ul>
          </div>

          <p className="text-sm text-gray-600 mt-2">
            Material cost only. Rates based on CPWD / GeM (indicative).
          </p>
        </div>
      )}
    </div>
  );
}
