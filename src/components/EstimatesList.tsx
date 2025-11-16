import { useEffect, useState } from 'react';
import { FileText, Calendar, CheckCircle, Clock, Download, ExternalLink, IndianRupee } from 'lucide-react';
import { supabase, Intervention } from '../lib/supabase';

type Props = {
  refresh: number;
};

export default function EstimatesList({ refresh }: Props) {
  const [interventions, setInterventions] = useState<Intervention[]>([]);
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchInterventions();
  }, [refresh]);

  const fetchInterventions = async () => {
    setLoading(true);
    const { data, error } = await supabase
      .from('interventions')
      .select('*')
      .order('uploaded_at', { ascending: false });

    if (!error && data) {
      setInterventions(data);
    }
    setLoading(false);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-200">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading reports...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center justify-between mb-6">
        <div className="flex items-center space-x-3">
          <div className="bg-gradient-to-br from-green-500 to-emerald-500 p-3 rounded-lg">
            <FileText className="w-6 h-6 text-white" />
          </div>
          <div>
            <h2 className="text-xl font-bold text-gray-800">Generated Estimates</h2>
            <p className="text-sm text-gray-600">View and download cost reports</p>
          </div>
        </div>
        <div className="bg-gray-100 px-4 py-2 rounded-lg">
          <span className="text-2xl font-bold text-gray-800">{interventions.length}</span>
          <span className="text-sm text-gray-600 ml-2">Reports</span>
        </div>
      </div>

      {interventions.length === 0 ? (
        <div className="text-center py-12">
          <FileText className="w-16 h-16 text-gray-300 mx-auto mb-4" />
          <p className="text-gray-500 text-lg">No estimates generated yet</p>
          <p className="text-gray-400 text-sm mt-2">Create your first intervention report above</p>
        </div>
      ) : (
        <div className="space-y-4">
          {interventions.map((intervention) => (
            <InterventionCard key={intervention.id} intervention={intervention} />
          ))}
        </div>
      )}
    </div>
  );
}

function InterventionCard({ intervention }: { intervention: Intervention }) {
  const [expanded, setExpanded] = useState(false);
  const [items, setItems] = useState<any[]>([]);
  const [estimates, setEstimates] = useState<any[]>([]);
  const [totalCost, setTotalCost] = useState(0);

  useEffect(() => {
    if (expanded) {
      fetchDetails();
    }
  }, [expanded]);

  const fetchDetails = async () => {
    const { data: itemsData } = await supabase
      .from('intervention_items')
      .select('*')
      .eq('intervention_id', intervention.id);

    if (itemsData) {
      setItems(itemsData);

      const allEstimates: any[] = [];
      let total = 0;

      for (const item of itemsData) {
        const { data: estimatesData } = await supabase
          .from('cost_estimates')
          .select('*')
          .eq('intervention_item_id', item.id);

        if (estimatesData) {
          allEstimates.push(...estimatesData.map(e => ({ ...e, item })));
          total += estimatesData.reduce((sum, e) => sum + e.total_cost, 0);
        }
      }

      setEstimates(allEstimates);
      setTotalCost(total);
    }
  };

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  const formatDate = (dateString: string) => {
    return new Date(dateString).toLocaleDateString('en-IN', {
      day: 'numeric',
      month: 'short',
      year: 'numeric'
    });
  };

  const downloadReport = () => {
    const reportContent = `
ROAD SAFETY INTERVENTION COST ESTIMATE
${'='.repeat(80)}

Report Name: ${intervention.report_name}
Report Date: ${formatDate(intervention.report_date)}
Total Interventions: ${intervention.total_interventions}
Total Material Cost: ${formatCurrency(totalCost)}

${'='.repeat(80)}

ITEMIZED COST BREAKDOWN
${'-'.repeat(80)}

${estimates.map((est, idx) => `
${idx + 1}. ${est.item.description}
   Location: ${est.item.location}
   IRC Standard: ${est.item.irc_standard}

   Material: ${est.material_name}
   Specification: ${est.specification}
   Quantity: ${est.quantity} ${est.unit}
   Unit Price: ${formatCurrency(est.unit_price)}
   Total Cost: ${formatCurrency(est.total_cost)}

   Source: ${est.source} (${est.source_reference})
   IRC Clause: ${est.irc_clause_used}
   Assumptions: ${est.assumptions}

${'-'.repeat(80)}
`).join('\n')}

SUMMARY
Total Material Cost (Excluding Labour, Installation & Taxes): ${formatCurrency(totalCost)}

Note: This estimate includes material costs only. Labour, installation, service charges,
and applicable taxes are not included. Actual costs may vary by ±10% based on market
conditions and specific site requirements.

Generated by Road Safety Cost Estimator
IIT Madras Centre of Excellence for Road Safety
National Road Safety Hackathon 2025
    `.trim();

    const blob = new Blob([reportContent], { type: 'text/plain' });
    const url = URL.createObjectURL(blob);
    const a = document.createElement('a');
    a.href = url;
    a.download = `${intervention.report_name.replace(/\s+/g, '_')}_Cost_Estimate.txt`;
    document.body.appendChild(a);
    a.click();
    document.body.removeChild(a);
    URL.revokeObjectURL(url);
  };

  return (
    <div className="border border-gray-200 rounded-lg overflow-hidden hover:shadow-md transition-shadow">
      <div
        className="p-4 bg-gradient-to-r from-gray-50 to-blue-50 cursor-pointer hover:from-gray-100 hover:to-blue-100 transition-all"
        onClick={() => setExpanded(!expanded)}
      >
        <div className="flex items-center justify-between">
          <div className="flex-1">
            <div className="flex items-center space-x-3 mb-2">
              <h3 className="font-bold text-gray-800 text-lg">{intervention.report_name}</h3>
              {intervention.status === 'completed' ? (
                <span className="flex items-center space-x-1 bg-green-100 text-green-700 px-3 py-1 rounded-full text-xs font-semibold">
                  <CheckCircle className="w-3 h-3" />
                  <span>Completed</span>
                </span>
              ) : (
                <span className="flex items-center space-x-1 bg-yellow-100 text-yellow-700 px-3 py-1 rounded-full text-xs font-semibold">
                  <Clock className="w-3 h-3" />
                  <span>Processing</span>
                </span>
              )}
            </div>
            <div className="flex items-center space-x-6 text-sm text-gray-600">
              <div className="flex items-center space-x-1">
                <Calendar className="w-4 h-4" />
                <span>{formatDate(intervention.report_date)}</span>
              </div>
              <div>
                <span className="font-semibold">{intervention.total_interventions}</span> interventions
              </div>
              {expanded && (
                <div className="flex items-center space-x-1 text-green-600 font-semibold">
                  <IndianRupee className="w-4 h-4" />
                  <span>{formatCurrency(totalCost)}</span>
                </div>
              )}
            </div>
          </div>
          {intervention.status === 'completed' && (
            <button
              onClick={(e) => {
                e.stopPropagation();
                downloadReport();
              }}
              className="flex items-center space-x-2 bg-orange-500 text-white px-4 py-2 rounded-lg hover:bg-orange-600 transition-colors font-medium"
            >
              <Download className="w-4 h-4" />
              <span>Download</span>
            </button>
          )}
        </div>
      </div>

      {expanded && intervention.status === 'completed' && (
        <div className="p-4 bg-white border-t border-gray-200">
          <div className="mb-4 bg-gradient-to-r from-green-50 to-emerald-50 p-4 rounded-lg border border-green-200">
            <div className="flex items-center justify-between">
              <div>
                <p className="text-sm text-gray-600 mb-1">Total Material Cost</p>
                <p className="text-3xl font-bold text-green-600">{formatCurrency(totalCost)}</p>
                <p className="text-xs text-gray-500 mt-1">Excluding labour, installation & taxes</p>
              </div>
              <div className="text-right">
                <p className="text-sm text-gray-600 mb-1">Cost Range (±10%)</p>
                <p className="text-lg font-semibold text-gray-700">
                  {formatCurrency(totalCost * 0.9)} - {formatCurrency(totalCost * 1.1)}
                </p>
              </div>
            </div>
          </div>

          <h4 className="font-bold text-gray-800 mb-3">Itemized Cost Breakdown</h4>
          <div className="space-y-3">
            {estimates.map((estimate, idx) => (
              <div key={estimate.id} className="bg-gray-50 rounded-lg p-4 border border-gray-200">
                <div className="flex items-start justify-between mb-3">
                  <div className="flex-1">
                    <div className="flex items-center space-x-2 mb-2">
                      <span className="bg-blue-500 text-white text-xs font-bold px-2 py-1 rounded">
                        #{idx + 1}
                      </span>
                      <h5 className="font-semibold text-gray-800">{estimate.item.description}</h5>
                    </div>
                    <p className="text-sm text-gray-600 mb-1">📍 {estimate.item.location}</p>
                    <p className="text-sm text-gray-600">📋 {estimate.item.irc_standard}</p>
                  </div>
                  <div className="text-right">
                    <p className="text-2xl font-bold text-orange-600">{formatCurrency(estimate.total_cost)}</p>
                    <p className="text-xs text-gray-500">{estimate.quantity} {estimate.unit}</p>
                  </div>
                </div>

                <div className="grid grid-cols-2 gap-3 text-sm border-t border-gray-200 pt-3">
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Material</p>
                    <p className="font-medium text-gray-800">{estimate.material_name}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Unit Price</p>
                    <p className="font-medium text-gray-800">{formatCurrency(estimate.unit_price)}/{estimate.unit}</p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Source</p>
                    <p className="font-medium text-gray-800 flex items-center space-x-1">
                      <span>{estimate.source}</span>
                      <ExternalLink className="w-3 h-3" />
                    </p>
                  </div>
                  <div>
                    <p className="text-gray-500 text-xs mb-1">Reference</p>
                    <p className="font-medium text-gray-800 text-xs">{estimate.source_reference}</p>
                  </div>
                </div>

                <div className="mt-3 bg-blue-50 border border-blue-200 rounded p-3">
                  <p className="text-xs font-semibold text-blue-800 mb-1">IRC Clause Used</p>
                  <p className="text-xs text-blue-700 mb-2">{estimate.irc_clause_used}</p>
                  <p className="text-xs text-gray-600">{estimate.specification}</p>
                </div>

                <div className="mt-2 bg-yellow-50 border border-yellow-200 rounded p-2">
                  <p className="text-xs font-semibold text-yellow-800 mb-1">Assumptions</p>
                  <p className="text-xs text-yellow-700">{estimate.assumptions}</p>
                </div>
              </div>
            ))}
          </div>
        </div>
      )}
    </div>
  );
}
