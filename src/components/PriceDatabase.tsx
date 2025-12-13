import { useEffect, useState } from 'react';
import { DollarSign, Search, ExternalLink, TrendingUp, Database } from 'lucide-react';

/* STATIC PRICE DATA (CPWD SOR & GeM – INDICATIVE) */
type PriceReference = {
  id: number;
  material_name: string;
  specification: string;
  unit: string;
  price: number;
  source: string;
  document_reference: string;
  valid_from: string;
};

const PRICE_DATA: PriceReference[] = [
  {
    id: 1,
    material_name: 'W-Beam Crash Barrier',
    specification: 'Hot dip galvanized steel, 3 mm thick',
    unit: 'meter',
    price: 3500,
    source: 'CPWD SOR',
    document_reference: 'CPWD SOR 2024 – Item 11.68',
    valid_from: '2024-04-01'
  },
  {
    id: 2,
    material_name: 'Thermoplastic Road Marking',
    specification: '2.5 mm thick with glass beads',
    unit: 'sqm',
    price: 500,
    source: 'CPWD SOR',
    document_reference: 'CPWD SOR 2024 – Item 16.42',
    valid_from: '2024-04-01'
  },
  {
    id: 3,
    material_name: 'Retro-Reflective Sign Board',
    specification: 'Type XI micro-prismatic sheeting',
    unit: 'number',
    price: 12000,
    source: 'GeM',
    document_reference: 'GeM Product ID: GEM/2024/RSB',
    valid_from: '2024-06-01'
  },
  {
    id: 4,
    material_name: 'Speed Breaker',
    specification: 'Prefabricated rubber / asphalt type',
    unit: 'number',
    price: 30000,
    source: 'CPWD SOR',
    document_reference: 'CPWD SOR 2024 – Item 17.25',
    valid_from: '2024-04-01'
  }
];

export default function PriceDatabase() {
  const [prices, setPrices] = useState<PriceReference[]>([]);
  const [filteredPrices, setFilteredPrices] = useState<PriceReference[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState('all');

  useEffect(() => {
    setPrices(PRICE_DATA);
    setFilteredPrices(PRICE_DATA);
  }, []);

  useEffect(() => {
    let filtered = prices;

    if (selectedSource !== 'all') {
      filtered = filtered.filter(p => p.source === selectedSource);
    }

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.material_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.specification.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredPrices(filtered);
  }, [searchQuery, selectedSource, prices]);

  const sources = Array.from(new Set(prices.map(p => p.source)));

  const formatCurrency = (amount: number) =>
    new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-3 rounded-lg">
          <Database className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Material Price Database</h2>
          <p className="text-sm text-gray-600">
            Indicative material rates from CPWD SOR & GeM
          </p>
        </div>
      </div>

      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search materials..."
            className="w-full pl-10 pr-4 py-3 border rounded-lg"
          />
        </div>

        <div className="flex gap-2">
          <button
            onClick={() => setSelectedSource('all')}
            className={`px-4 py-2 rounded-lg ${
              selectedSource === 'all'
                ? 'bg-orange-500 text-white'
                : 'bg-gray-100'
            }`}
          >
            All Sources
          </button>

          {sources.map(source => (
            <button
              key={source}
              onClick={() => setSelectedSource(source)}
              className={`px-4 py-2 rounded-lg ${
                selectedSource === source
                  ? 'bg-orange-500 text-white'
                  : 'bg-gray-100'
              }`}
            >
              {source}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-3 gap-4 mb-6">
        <div className="bg-green-50 border rounded-lg p-4">
          <p className="text-sm text-green-700">Total Materials</p>
          <p className="text-3xl font-bold text-green-600">{prices.length}</p>
        </div>
        <div className="bg-blue-50 border rounded-lg p-4">
          <p className="text-sm text-blue-700">CPWD SOR Items</p>
          <p className="text-3xl font-bold text-blue-600">
            {prices.filter(p => p.source === 'CPWD SOR').length}
          </p>
        </div>
        <div className="bg-purple-50 border rounded-lg p-4">
          <p className="text-sm text-purple-700">GeM Items</p>
          <p className="text-3xl font-bold text-purple-600">
            {prices.filter(p => p.source === 'GeM').length}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {filteredPrices.map(price => (
          <div
            key={price.id}
            className="bg-gray-50 border rounded-lg p-4"
          >
            <div className="flex justify-between">
              <div>
                <h3 className="font-bold">{price.material_name}</h3>
                <p className="text-sm text-gray-600">{price.specification}</p>
                <p className="text-xs text-gray-500 mt-1">
                  {price.document_reference}
                </p>
              </div>
              <div className="text-right">
                <p className="text-2xl font-bold text-orange-600">
                  {formatCurrency(price.price)}
                </p>
                <p className="text-xs text-gray-500">per {price.unit}</p>
              </div>
            </div>
          </div>
        ))}
      </div>

      <div className="mt-6 bg-orange-50 border rounded-lg p-4">
        <h4 className="font-semibold mb-2">Data Sources</h4>
        <p className="text-sm">• CPWD Schedule of Rates</p>
        <p className="text-sm">• Government e-Marketplace (GeM)</p>
      </div>
    </div>
  );
}
