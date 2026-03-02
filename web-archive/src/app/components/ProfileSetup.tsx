import { useState } from 'react';
import { User, Calendar, Ruler, Weight, Activity, Zap } from 'lucide-react';
import { toast } from 'sonner';

interface ProfileSetupProps {
  onComplete: () => void;
}

export function ProfileSetup({ onComplete }: ProfileSetupProps) {
  const [name, setName] = useState('');
  const [age, setAge] = useState('');
  const [height, setHeight] = useState('');
  const [weight, setWeight] = useState('');
  const [bodyFat, setBodyFat] = useState('');
  const [activityLevel, setActivityLevel] = useState('');
  const [tdee, setTdee] = useState('');

  const activityLevels = [
    { value: 'sedentary', label: 'Ít vận động (1-2 ngày/tuần)', multiplier: 1.2 },
    { value: 'light', label: 'Nhẹ (3-4 ngày/tuần)', multiplier: 1.375 },
    { value: 'moderate', label: 'Trung bình (5-6 ngày/tuần)', multiplier: 1.55 },
    { value: 'active', label: 'Nặng (6-7 ngày/tuần)', multiplier: 1.725 },
    { value: 'very_active', label: 'Rất nặng (2x mỗi ngày)', multiplier: 1.9 },
  ];

  // Calculate BMR using Mifflin-St Jeor Equation (for men)
  const calculateTDEE = () => {
    if (!weight || !height || !age || !activityLevel) {
      toast.error('Vui lòng điền đầy đủ thông tin để tính TDEE');
      return;
    }

    const weightNum = Number(weight);
    const heightNum = Number(height);
    const ageNum = Number(age);
    
    // BMR = 10 × weight(kg) + 6.25 × height(cm) − 5 × age(y) + 5 (for men)
    // For women, use -161 instead of +5
    const bmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum + 5;
    
    const selectedActivity = activityLevels.find(level => level.value === activityLevel);
    const calculatedTDEE = Math.round(bmr * (selectedActivity?.multiplier || 1.2));
    
    setTdee(calculatedTDEE.toString());
    toast.success('TDEE đã được tính toán!');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !age || !height || !weight || !activityLevel || !tdee) {
      toast.error('Vui lòng điền đầy đủ thông tin bắt buộc');
      return;
    }

    // Save profile to localStorage
    const profile = {
      name,
      age: Number(age),
      height: Number(height),
      weight: Number(weight),
      bodyFat: bodyFat ? Number(bodyFat) : null,
      activityLevel,
      tdee: Number(tdee),
    };
    
    localStorage.setItem('userProfile', JSON.stringify(profile));
    toast.success('Đã lưu thông tin cá nhân!');
    onComplete();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-green-600 via-teal-600 to-cyan-600 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <User className="w-10 h-10 text-green-600" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">Thiết lập hồ sơ</h1>
          <p className="text-green-100">Giúp chúng tôi hiểu bạn hơn</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-4">
            {/* Name */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <User className="w-4 h-4" />
                Họ và tên *
              </label>
              <input
                type="text"
                value={name}
                onChange={(e) => setName(e.target.value)}
                placeholder="Nguyễn Văn A"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Age */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Calendar className="w-4 h-4" />
                Tuổi *
              </label>
              <input
                type="number"
                value={age}
                onChange={(e) => setAge(e.target.value)}
                placeholder="25"
                min="1"
                max="120"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Height & Weight */}
            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Ruler className="w-4 h-4" />
                  Chiều cao (cm) *
                </label>
                <input
                  type="number"
                  value={height}
                  onChange={(e) => setHeight(e.target.value)}
                  placeholder="170"
                  min="1"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                  <Weight className="w-4 h-4" />
                  Cân nặng (kg) *
                </label>
                <input
                  type="number"
                  value={weight}
                  onChange={(e) => setWeight(e.target.value)}
                  placeholder="70"
                  min="1"
                  step="0.1"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            {/* Body Fat */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Body Fat (%) - Tùy chọn
              </label>
              <input
                type="number"
                value={bodyFat}
                onChange={(e) => setBodyFat(e.target.value)}
                placeholder="15"
                min="1"
                max="60"
                step="0.1"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            {/* Activity Level */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Activity className="w-4 h-4" />
                Tần suất tập thể dục *
              </label>
              <select
                value={activityLevel}
                onChange={(e) => setActivityLevel(e.target.value)}
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              >
                <option value="">Chọn mức độ hoạt động</option>
                {activityLevels.map((level) => (
                  <option key={level.value} value={level.value}>
                    {level.label}
                  </option>
                ))}
              </select>
            </div>

            {/* TDEE */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2 flex items-center gap-2">
                <Zap className="w-4 h-4" />
                TDEE (Tổng năng lượng tiêu hao/ngày) *
              </label>
              <div className="flex gap-2">
                <input
                  type="number"
                  value={tdee}
                  onChange={(e) => setTdee(e.target.value)}
                  placeholder="2000"
                  min="1"
                  className="flex-1 px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                />
                <button
                  type="button"
                  onClick={calculateTDEE}
                  className="px-6 py-3 bg-gradient-to-r from-green-500 to-teal-500 text-white rounded-xl font-semibold hover:shadow-lg transition-all whitespace-nowrap"
                >
                  Tính TDEE
                </button>
              </div>
              <p className="text-xs text-gray-500 mt-1">Calories cơ thể bạn cần mỗi ngày để duy trì cân nặng</p>
            </div>

            {/* Submit Button */}
            <button
              type="submit"
              className="w-full bg-gradient-to-r from-green-600 to-teal-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all mt-6"
            >
              Tiếp tục
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
