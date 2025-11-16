import { useState } from 'react';
import Header from './components/Header';
import InterventionForm from './components/InterventionForm';
import EstimatesList from './components/EstimatesList';
import IRCStandards from './components/IRCStandards';
import PriceDatabase from './components/PriceDatabase';
import Statistics from './components/Statistics';
import { FileText, BookOpen, Database, BarChart3 } from 'lucide-react';

type TabType = 'estimator' | 'standards' | 'prices' | 'statistics';

function App() {
  const [activeTab, setActiveTab] = useState<TabType>('estimator');
  const [refreshKey, setRefreshKey] = useState(0);

  const handleEstimateGenerated = () => {
    setRefreshKey(prev => prev + 1);
  };

  const tabs = [
    { id: 'estimator' as TabType, name: 'Cost Estimator', icon: FileText, color: 'from-orange-500 to-red-500' },
    { id: 'standards' as TabType, name: 'IRC Standards', icon: BookOpen, color: 'from-purple-500 to-pink-500' },
    { id: 'prices' as TabType, name: 'Price Database', icon: Database, color: 'from-yellow-500 to-orange-500' },
    { id: 'statistics' as TabType, name: 'Analytics', icon: BarChart3, color: 'from-blue-500 to-cyan-500' }
  ];

  return (
    <div className="min-h-screen bg-gradient-to-br from-gray-50 via-orange-50 to-red-50">
      <Header />

      <div className="container mx-auto px-4 py-8">
        <div className="bg-white rounded-xl shadow-lg mb-6 p-2 border border-gray-200">
          <div className="flex space-x-2 overflow-x-auto">
            {tabs.map(tab => {
              const Icon = tab.icon;
              return (
                <button
                  key={tab.id}
                  onClick={() => setActiveTab(tab.id)}
                  className={`flex items-center space-x-2 px-6 py-3 rounded-lg font-semibold transition-all whitespace-nowrap ${
                    activeTab === tab.id
                      ? `bg-gradient-to-r ${tab.color} text-white shadow-md transform scale-105`
                      : 'text-gray-600 hover:bg-gray-100'
                  }`}
                >
                  <Icon className="w-5 h-5" />
                  <span>{tab.name}</span>
                </button>
              );
            })}
          </div>
        </div>

        {activeTab === 'estimator' && (
          <div className="space-y-6">
            <InterventionForm onEstimateGenerated={handleEstimateGenerated} />
            <EstimatesList refresh={refreshKey} />
          </div>
        )}

        {activeTab === 'standards' && <IRCStandards />}
        {activeTab === 'prices' && <PriceDatabase />}
        {activeTab === 'statistics' && <Statistics />}
      </div>

      <footer className="bg-gradient-to-r from-gray-800 to-gray-900 text-white py-8 mt-12">
        <div className="container mx-auto px-4">
          <div className="grid grid-cols-1 md:grid-cols-3 gap-6">
            <div>
              <h3 className="font-bold text-lg mb-3">Road Safety Cost Estimator</h3>
              <p className="text-gray-300 text-sm">
                AI-powered tool for estimating material costs of road safety interventions based on IRC standards.
              </p>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-3">Data Sources</h3>
              <ul className="text-gray-300 text-sm space-y-1">
                <li>• CPWD Schedule of Rates</li>
                <li>• Government e-Marketplace (GeM)</li>
                <li>• IRC Standards & Guidelines</li>
              </ul>
            </div>
            <div>
              <h3 className="font-bold text-lg mb-3">Developed For</h3>
              <p className="text-gray-300 text-sm">
                National Road Safety Hackathon 2025<br />
                IIT Madras Centre of Excellence for Road Safety<br />
                RBG Labs, IIT Madras
              </p>
            </div>
          </div>
          <div className="border-t border-gray-700 mt-6 pt-6 text-center text-gray-400 text-sm">
            <p>© 2025 Road Safety Cost Estimator. Material costs only - excludes labour, installation & taxes.</p>
          </div>
        </div>
      </footer>
    </div>
  );
}

export default App;
