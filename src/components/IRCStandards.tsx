import { useEffect, useState } from 'react';
import { BookOpen, Search, Tag, FileText } from 'lucide-react';

/* STATIC IRC STANDARDS DATA */
type IRCStandard = {
  id: number;
  standard_code: string;
  title: string;
  material_category: string;
  clause_number: string;
  specification?: string;
  content?: string;
};

const IRC_DATA: IRCStandard[] = [
  {
    id: 1,
    standard_code: 'IRC 35',
    title: 'Code of Practice for Road Markings',
    material_category: 'Road Markings',
    clause_number: '3.2',
    specification: 'Thermoplastic road markings with glass beads',
    content: 'Provides specifications for longitudinal and transverse road markings.'
  },
  {
    id: 2,
    standard_code: 'IRC 67',
    title: 'Code of Practice for Road Signs',
    material_category: 'Road Signs',
    clause_number: '6.1',
    specification: 'Retro-reflective sign boards (Type XI sheeting)',
    content: 'Defines standards for regulatory, warning and informatory signs.'
  },
  {
    id: 3,
    standard_code: 'IRC 99',
    title: 'Guidelines for Traffic Calming Measures',
    material_category: 'Traffic Calming',
    clause_number: '5.4',
    specification: 'Speed breakers, rumble strips',
    content: 'Guidelines for speed control in urban and rural roads.'
  },
  {
    id: 4,
    standard_code: 'IRC:SP:84',
    title: 'Manual of Road Safety Audit',
    material_category: 'Road Safety Audit',
    clause_number: '4.3',
    specification: 'Audit procedure and checklist',
    content: 'Provides systematic approach for conducting road safety audits.'
  },
  {
    id: 5,
    standard_code: 'IRC:SP:87',
    title: 'Road Safety Furniture',
    material_category: 'Safety Barriers',
    clause_number: '7.2',
    specification: 'W-beam crash barriers, guard rails',
    content: 'Specifications for crash barriers, pedestrian railings and safety furniture.'
  }
];

export default function IRCStandards() {
  const [standards, setStandards] = useState<IRCStandard[]>([]);
  const [filteredStandards, setFilteredStandards] = useState<IRCStandard[]>([]);
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedCategory, setSelectedCategory] = useState('all');

  useEffect(() => {
    setStandards(IRC_DATA);
    setFilteredStandards(IRC_DATA);
  }, []);

  useEffect(() => {
    let filtered = standards;

    if (selectedCategory !== 'all') {
      filtered = filtered.filter(
        s => s.material_category === selectedCategory
      );
    }

    if (searchQuery) {
      filtered = filtered.filter(s =>
        s.standard_code.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.title.toLowerCase().includes(searchQuery.toLowerCase()) ||
        s.specification?.toLowerCase().includes(searchQuery.toLowerCase())
      );
    }

    setFilteredStandards(filtered);
  }, [searchQuery, selectedCategory, standards]);

  const categories = Array.from(
    new Set(standards.map(s => s.material_category))
  );

  return (
    <div className="bg-white rounded-xl shadow-lg p-6 border border-gray-200">
      <div className="flex items-center space-x-3 mb-6">
        <div className="bg-gradient-to-br from-purple-500 to-pink-500 p-3 rounded-lg">
          <BookOpen className="w-6 h-6 text-white" />
        </div>
        <div>
          <h2 className="text-xl font-bold text-gray-800">
            IRC Standards Reference
          </h2>
          <p className="text-sm text-gray-600">
            Indian Roads Congress specifications and guidelines
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
            placeholder="Search IRC standards..."
            className="w-full pl-10 pr-4 py-3 border rounded-lg"
          />
        </div>

        <div className="flex flex-wrap gap-2">
          <button
            onClick={() => setSelectedCategory('all')}
            className={`px-4 py-2 rounded-lg ${
              selectedCategory === 'all'
                ? 'bg-purple-500 text-white'
                : 'bg-gray-100'
            }`}
          >
            All
          </button>

          {categories.map(category => (
            <button
              key={category}
              onClick={() => setSelectedCategory(category)}
              className={`px-4 py-2 rounded-lg ${
                selectedCategory === category
                  ? 'bg-purple-500 text-white'
                  : 'bg-gray-100'
              }`}
            >
              {category}
            </button>
          ))}
        </div>
      </div>

      <div className="space-y-4">
        {filteredStandards.map(standard => (
          <div
            key={standard.id}
            className="bg-gray-50 border rounded-lg p-4"
          >
            <div className="flex justify-between mb-2">
              <span className="font-bold text-purple-600">
                {standard.standard_code}
              </span>
              <span className="text-xs text-gray-500">
                Clause {standard.clause_number}
              </span>
            </div>

            <h3 className="font-semibold mb-2">{standard.title}</h3>

            <div className="flex items-center text-xs mb-2">
              <Tag className="w-3 h-3 mr-1" />
              {standard.material_category}
            </div>

            {standard.specification && (
              <p className="text-sm text-gray-700">
                <b>Specification:</b> {standard.specification}
              </p>
            )}

            {standard.content && (
              <p className="text-sm text-gray-600 mt-1">
                <FileText className="w-3 h-3 inline mr-1" />
                {standard.content}
              </p>
            )}
          </div>
        ))}
      </div>
    </div>
  );
}
