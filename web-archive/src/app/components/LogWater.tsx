import { useState } from 'react';
import { Droplet, Plus, Minus, Waves } from 'lucide-react';
import { toast } from 'sonner';

export function LogWater() {
  const [todayWater, setTodayWater] = useState(() => {
    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem('healthData');
    if (stored) {
      const data = JSON.parse(stored);
      const todayData = data.find((d: any) => d.date === today);
      return todayData?.water || 0;
    }
    return 0;
  });

  const [customAmount, setCustomAmount] = useState('');
  const waterGoal = 2000; // ml

  const addWater = (amount: number) => {
    const newTotal = todayWater + amount;
    setTodayWater(newTotal);

    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem('healthData');
    const data = stored ? JSON.parse(stored) : [];
    const todayIndex = data.findIndex((d: any) => d.date === today);
    
    if (todayIndex >= 0) {
      data[todayIndex].water = newTotal;
    } else {
      data.push({
        date: today,
        calories: 0,
        water: newTotal
      });
    }
    
    localStorage.setItem('healthData', JSON.stringify(data));
    toast.success(`Đã thêm ${amount}ml nước`);
  };

  const removeWater = (amount: number) => {
    const newTotal = Math.max(0, todayWater - amount);
    setTodayWater(newTotal);

    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem('healthData');
    const data = stored ? JSON.parse(stored) : [];
    const todayIndex = data.findIndex((d: any) => d.date === today);
    
    if (todayIndex >= 0) {
      data[todayIndex].water = newTotal;
      localStorage.setItem('healthData', JSON.stringify(data));
    }
    toast.success(`Đã giảm ${amount}ml nước`);
  };

  const addCustomAmount = () => {
    const amount = Number(customAmount);
    if (!amount || amount <= 0) {
      toast.error('Vui lòng nhập số lượng hợp lệ');
      return;
    }
    addWater(amount);
    setCustomAmount('');
  };

  const waterPercent = Math.min((todayWater / waterGoal) * 100, 100);
  const glassCount = Math.floor(todayWater / 250);

  const quickAddButtons = [
    { amount: 250, label: 'Cốc nhỏ', icon: '🥛' },
    { amount: 500, label: 'Chai nước', icon: '🍶' },
    { amount: 330, label: 'Lon nước', icon: '🥤' },
    { amount: 1000, label: 'Bình 1L', icon: '💧' },
  ];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Log Nước Uống</h1>
        <p className="text-gray-600 mt-1">Theo dõi lượng nước uống hôm nay</p>
      </div>

      {/* Water Progress Circle */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-8 shadow-sm border border-blue-100">
        <div className="flex flex-col items-center">
          <div className="relative w-48 h-48 mb-6">
            {/* Background Circle */}
            <svg className="w-full h-full transform -rotate-90">
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="#dbeafe"
                strokeWidth="12"
                fill="none"
              />
              <circle
                cx="96"
                cy="96"
                r="88"
                stroke="url(#waterGradient)"
                strokeWidth="12"
                fill="none"
                strokeDasharray={`${2 * Math.PI * 88}`}
                strokeDashoffset={`${2 * Math.PI * 88 * (1 - waterPercent / 100)}`}
                strokeLinecap="round"
                className="transition-all duration-500"
              />
              <defs>
                <linearGradient id="waterGradient" x1="0%" y1="0%" x2="100%" y2="100%">
                  <stop offset="0%" stopColor="#3b82f6" />
                  <stop offset="100%" stopColor="#06b6d4" />
                </linearGradient>
              </defs>
            </svg>
            
            {/* Center Content */}
            <div className="absolute inset-0 flex flex-col items-center justify-center">
              <Waves className="w-12 h-12 text-blue-500 mb-2" />
              <div className="text-4xl font-bold text-gray-900">{todayWater}ml</div>
              <div className="text-sm text-gray-600 mt-1">của {waterGoal}ml</div>
              <div className="text-2xl font-bold text-blue-600 mt-2">{Math.round(waterPercent)}%</div>
            </div>
          </div>

          {/* Glass Counter */}
          <div className="flex items-center gap-2 bg-white rounded-2xl px-6 py-3 shadow-sm">
            <div className="text-4xl">🥛</div>
            <div>
              <div className="text-sm text-gray-600">Số cốc đã uống</div>
              <div className="text-2xl font-bold text-gray-900">{glassCount} cốc</div>
            </div>
          </div>
        </div>
      </div>

      {/* Quick Add Buttons */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
        <h2 className="font-semibold text-gray-900 mb-4">Thêm nhanh</h2>
        <div className="grid grid-cols-2 gap-3">
          {quickAddButtons.map((button, index) => (
            <button
              key={index}
              onClick={() => addWater(button.amount)}
              className="bg-gradient-to-br from-blue-50 to-cyan-50 border border-blue-200 rounded-xl p-4 text-center hover:shadow-md transition-all group"
            >
              <div className="text-3xl mb-2 group-hover:scale-110 transition-transform">{button.icon}</div>
              <div className="font-medium text-gray-900">{button.label}</div>
              <div className="text-sm text-blue-600 font-semibold mt-1">{button.amount}ml</div>
            </button>
          ))}
        </div>
      </div>

      {/* Custom Amount */}
      <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-6 shadow-sm border border-blue-100">
        <div className="flex items-center gap-2 mb-4">
          <Droplet className="w-5 h-5 text-blue-600" />
          <h2 className="font-semibold text-gray-900">Số lượng tùy chỉnh</h2>
        </div>
        
        <div className="flex gap-3">
          <input
            type="number"
            value={customAmount}
            onChange={(e) => setCustomAmount(e.target.value)}
            placeholder="Nhập số ml"
            className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
          />
          <button
            onClick={addCustomAmount}
            className="bg-gradient-to-r from-blue-500 to-cyan-500 text-white px-6 py-3 rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg transition-all"
          >
            <Plus className="w-5 h-5" />
            Thêm
          </button>
        </div>
      </div>

      {/* Quick Remove */}
      {todayWater > 0 && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
          <h2 className="font-semibold text-gray-900 mb-4">Điều chỉnh</h2>
          <div className="grid grid-cols-2 gap-3">
            <button
              onClick={() => removeWater(250)}
              className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 font-medium hover:bg-red-100 transition-all flex items-center justify-center gap-2"
            >
              <Minus className="w-5 h-5" />
              Giảm 250ml
            </button>
            <button
              onClick={() => removeWater(500)}
              className="bg-red-50 border border-red-200 text-red-700 rounded-xl p-4 font-medium hover:bg-red-100 transition-all flex items-center justify-center gap-2"
            >
              <Minus className="w-5 h-5" />
              Giảm 500ml
            </button>
          </div>
        </div>
      )}

      {/* Tips */}
      <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-3xl p-6 shadow-sm border border-green-100">
        <h2 className="font-semibold text-gray-900 mb-3">💡 Lời khuyên</h2>
        <ul className="space-y-2 text-sm text-gray-700">
          <li>• Uống nước đều đặn trong ngày, không chờ khát mới uống</li>
          <li>• Mỗi lần uống khoảng 250ml (1 cốc)</li>
          <li>• Uống nước trước bữa ăn giúp tiêu hóa tốt hơn</li>
          <li>• Tăng lượng nước khi tập thể dục hoặc thời tiết nóng</li>
        </ul>
      </div>
    </div>
  );
}
