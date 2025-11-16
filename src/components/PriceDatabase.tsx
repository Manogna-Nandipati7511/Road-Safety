import { useEffect, useState } from 'react';
import { DollarSign, Search, ExternalLink, TrendingUp, Database } from 'lucide-react';
import { supabase, PriceReference } from '../lib/supabase';

export default function PriceDatabase() {
  const [prices, setPrices] = useState<PriceReference[]>([]);
  const [filteredPrices, setFilteredPrices] = useState<PriceReference[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedSource, setSelectedSource] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchPrices();
  }, []);

  useEffect(() => {
    filterPrices();
  }, [searchQuery, selectedSource, prices]);

  const fetchPrices = async () => {
    const { data, error } = await supabase
      .from('price_references')
      .select('*')
      .order('material_name', { ascending: true });

    if (!error && data) {
      setPrices(data);
      setFilteredPrices(data);
    }
    setLoading(false);
  };

  const filterPrices = () => {
    let filtered = prices;

    if (selectedSource !== 'all') {
      filtered = filtered.filter(p => p.source === selectedSource);
    }

    if (searchQuery) {
      filtered = filtered.filter(p =>
        p.material_name.toLowerCase().includes(searchQuery.toLowerCase()) ||
        p.specification?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredPrices(filtered);
  };

  const sources = Array.from(new Set(prices.map(p => p.source)));

  const formatCurrency = (amount: number) => {
    return new Intl.NumberFormat('en-IN', {
      style: 'currency',
      currency: 'INR',
      maximumFractionDigits: 0
    }).format(amount);
  };

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-200">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading price database...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-gradient-to-br from-yellow-500 to-orange-500 p-3 rounded-lg">
          <Database className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">Material Price Database</h2>
          <p className="text-sm text-gray-600">Current rates from CPWD SOR and GeM portal</p>
        </div>
      </div>

      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search materials or specifications..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-yellow-500 focus:border-yellow-500"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedSource('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedSource === 'all'
                ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Sources
          </button>
          {sources.map(source => (
            <button
              key={source}
              onClick={() => setSelectedSource(source)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedSource === source
                  ? 'bg-gradient-to-r from-yellow-500 to-orange-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {source}
            </button>
          ))}
        </div>
      </div>

      <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-3 gap-4 mb-6">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 border border-green-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-green-700 font-medium">Total Materials</p>
            <TrendingUp className="w-5 h-5 text-green-600" />
          </div>
          <p className="text-3xl font-bold text-green-600">{prices.length}</p>
        </div>

        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-blue-700 font-medium">CPWD SOR Items</p>
            <DollarSign className="w-5 h-5 text-blue-600" />
          </div>
          <p className="text-3xl font-bold text-blue-600">
            {prices.filter(p => p.source === 'CPWD SOR').length}
          </p>
        </div>

        <div className="bg-gradient-to-br from-purple-50 to-pink-50 border border-purple-200 rounded-lg p-4">
          <div className="flex items-center justify-between mb-2">
            <p className="text-sm text-purple-700 font-medium">GeM Portal Items</p>
            <ExternalLink className="w-5 h-5 text-purple-600" />
          </div>
          <p className="text-3xl font-bold text-purple-600">
            {prices.filter(p => p.source === 'GeM').length}
          </p>
        </div>
      </div>

      <div className="space-y-3">
        {filteredPrices.length === 0 ? (
          <div className="text-center py-12">
            <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No materials found</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredPrices.map(price => (
            <div
              key={price.id}
              className="bg-gradient-to-r from-gray-50 to-yellow-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between">
                <div className="flex-1">
                  <div className="flex items-center space-x-2 mb-2">
                    <h3 className="font-bold text-gray-800 text-lg">{price.material_name}</h3>
                    <span className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      price.source === 'CPWD SOR'
                        ? 'bg-blue-100 text-blue-700'
                        : 'bg-purple-100 text-purple-700'
                    }`}>
                      {price.source}
                    </span>
                  </div>
                  {price.specification && (
                    <p className="text-sm text-gray-600 mb-2">{price.specification}</p>
                  )}
                  <div className="flex items-center space-x-4 text-sm text-gray-500">
                    <span className="font-medium">{price.document_reference}</span>
                    <span>•</span>
                    <span>Valid from {new Date(price.valid_from).toLocaleDateString('en-IN')}</span>
                  </div>
                </div>
                <div className="text-right ml-4">
                  <p className="text-3xl font-bold text-orange-600">
                    {formatCurrency(price.price)}
                  </p>
                  <p className="text-sm text-gray-500">per {price.unit}</p>
                </div>
              </div>
            </div>
          ))
        )}
      </div>

      <div className="mt-6 bg-gradient-to-r from-orange-50 to-red-50 border border-orange-200 rounded-lg p-4">
        <h4 className="font-semibold text-orange-800 mb-2">Data Sources</h4>
        <div className="space-y-2 text-sm">
          <div className="flex items-center space-x-2">
            <ExternalLink className="w-4 h-4 text-blue-600" />
            <span className="text-gray-700">
              <strong>CPWD SOR:</strong> Central Public Works Department Schedule of Rates
            </span>
          </div>
          <div className="flex items-center space-x-2">
            <ExternalLink className="w-4 h-4 text-purple-600" />
            <span className="text-gray-700">
              <strong>GeM Portal:</strong> Government e-Marketplace for procurement
            </span>
          </div>
        </div>
      </div>
    </div>
  );
}
