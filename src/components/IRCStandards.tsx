import { useEffect, useState } from 'react';
import { BookOpen, Search, Tag, FileText } from 'lucide-react';
import { supabase, IRCStandard } from '../lib/supabase';

export default function IRCStandards() {
  const [standards, setStandards] = useState<IRCStandard[]>([]);
  const [filteredStandards, setFilteredStandards] = useState<IRCStandard[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');
  const [loading, setLoading] = useState(true);

  useEffect(() => {
    fetchStandards();
  }, []);

  useEffect(() => {
    filterStandards();
  }, [searchQuery, selectedCategory, standards]);

  const fetchStandards = async () => {
    const { data, error } = await supabase
      .from('irc_standards')
      .select('*')
      .order('standard_code', { ascending: true });

    if (!error && data) {
      setStandards(data);
      setFilteredStandards(data);
    }
    setLoading(false);
  };

  const filterStandards = () => {
    let filtered = standards;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(s => s.material_category === selectedCategory);
    }

    if (searchQuery) {
      filtered = filtered.filter(s =>
        s.standard_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.specification?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredStandards(filtered);
  };

  const categories = Array.from(new Set(standards.map(s => s.material_category)));

  if (loading) {
    return (
      <div className="bg-white rounded-xl shadow-lg p-8 text-center border border-gray-200">
        <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-orange-500 mx-auto"></div>
        <p className="mt-4 text-gray-600">Loading IRC standards...</p>
      </div>
    );
  }

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-lg">
          <BookOpen className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">IRC Standards Reference</h2>
          <p className="text-sm text-gray-600">Indian Roads Congress specifications and guidelines</p>
        </div>
      </div>

      <div className="mb-6 space-y-4">
        <div className="relative">
          <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 text-gray-400 w-5 h-5" />
          <input
            type="text"
            value={searchQuery}
            onChange={(e) => setSearchQuery(e.target.value)}
            placeholder="Search standards, titles, or specifications..."
            className="w-full pl-10 pr-4 py-3 border border-gray-300 rounded-lg focus:ring-2 focus:ring-purple-500 focus:border-purple-500"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg font-medium transition-all ${
              selectedCategory === 'all'
                ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
            }`}
          >
            All Categories
          </button>
          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg font-medium transition-all ${
                selectedCategory === category
                  ? 'bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md'
                  : 'bg-gray-100 text-gray-700 hover:bg-gray-200'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-3">
        {filteredStandards.length === 0 ? (
          <div className="text-center py-12">
            <BookOpen className="w-16 h-16 text-gray-300 mx-auto mb-4" />
            <p className="text-gray-500 text-lg">No standards found</p>
            <p className="text-gray-400 text-sm mt-2">Try adjusting your search or filters</p>
          </div>
        ) : (
          filteredStandards.map(standard => (
            <div
              key={standard.id}
              className="bg-gradient-to-r from-gray-50 to-purple-50 rounded-lg p-4 border border-gray-200 hover:shadow-md transition-all"
            >
              <div className="flex items-start justify-between mb-2">
                <div className="flex items-center space-x-3">
                  <div className="bg-purple-500 text-white px-3 py-1 rounded-lg font-bold text-sm">
                    {standard.standard_code}
                  </div>
                  <div className="bg-pink-100 text-pink-700 px-3 py-1 rounded-full text-xs font-semibold flex items-center space-x-1">
                    <Tag className="w-3 h-3" />
                    <span>{standard.material_category}</span>
                  </div>
                </div>
                <div className="text-xs text-gray-500 font-medium">
                  Clause {standard.clause_number}
                </div>
              </div>

              <h3 className="font-semibold text-gray-800 mb-2">{standard.title}</h3>

              {standard.specification && (
                <div className="bg-blue-50 border border-blue-200 rounded p-3 mb-2">
                  <p className="text-xs font-semibold text-blue-800 mb-1">Specification</p>
                  <p className="text-sm text-blue-700">{standard.specification}</p>
                </div>
              )}

              {standard.content && (
                <div className="bg-gray-50 border border-gray-200 rounded p-3">
                  <p className="text-xs font-semibold text-gray-700 mb-1 flex items-center space-x-1">
                    <FileText className="w-3 h-3" />
                    <span>Content</span>
                  </p>
                  <p className="text-sm text-gray-600">{standard.content}</p>
                </div>
              )}
            </div>
          ))
        )}
      </div>

      <div className="mt-6 bg-gradient-to-r from-blue-50 to-cyan-50 border border-blue-200 rounded-lg p-4">
        <h4 className="font-semibold text-blue-800 mb-2">IRC Standards Covered</h4>
        <div className="grid grid-cols-2 md:grid-cols-5 gap-3">
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <p className="font-bold text-blue-600">IRC 35</p>
            <p className="text-xs text-gray-600">Road Markings</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <p className="font-bold text-blue-600">IRC 67</p>
            <p className="text-xs text-gray-600">Safety Barriers</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <p className="font-bold text-blue-600">IRC 99</p>
            <p className="text-xs text-gray-600">Traffic Signs</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <p className="font-bold text-blue-600">IRC:SP:84</p>
            <p className="text-xs text-gray-600">Speed Breakers</p>
          </div>
          <div className="bg-white rounded-lg p-3 border border-blue-200">
            <p className="font-bold text-blue-600">IRC:SP:87</p>
            <p className="text-xs text-gray-600">Pedestrian Safety</p>
          </div>
        </div>
      </div>
    </div>
  );
}
