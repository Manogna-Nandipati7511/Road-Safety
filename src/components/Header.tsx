import { Construction, Shield, BarChart3 } from 'lucide-react';

export default function Header() {
  return (
    <header className="bg-gradient-to-r from-orange-500 via-red-500 to-orange-600 text-white shadow-lg">
      <div className="container mx-auto px-4 py-6">
        <div className="flex items-center justify-between">
          <div className="flex items-center space-x-3">
            <div className="bg-white p-2 rounded-lg">
              <Shield className="w-8 h-8 text-orange-600" />
            </div>
            <div>
              <h1 className="text-2xl font-bold">Road Safety Cost Estimator</h1>
              <p className="text-orange-100 text-sm">AI-Powered Intervention Analysis</p>
            </div>
          </div>
          <div className="flex items-center space-x-6">
            <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
              <Construction className="w-5 h-5" />
              <span className="text-sm font-medium">INNOVIQ</span>
            </div>
            <div className="flex items-center space-x-2 bg-white/10 px-4 py-2 rounded-lg backdrop-blur-sm">
              <BarChart3 className="w-5 h-5" />
              <span className="text-sm font-medium">NRSM</span>
            </div>
          </div>
        </div>
      </div>
    </header>
  );
}
