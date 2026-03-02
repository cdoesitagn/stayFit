import { useState, useEffect } from 'react';
import { User, Calendar, Ruler, Weight, Activity, Zap, Save, X, Edit } from 'lucide-react';
import { toast } from 'sonner';

interface EditProfileProps {
  onSave: () => void;
  onCancel: () => void;
}

export function EditProfile({ onSave, onCancel }: EditProfileProps) {
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

  // Load existing profile data
  useEffect(() => {
    const profileData = localStorage.getItem('userProfile');
    if (profileData) {
      const profile = JSON.parse(profileData);
      setName(profile.name || '');
      setAge(profile.age?.toString() || '');
      setHeight(profile.height?.toString() || '');
      setWeight(profile.weight?.toString() || '');
      setBodyFat(profile.bodyFat?.toString() || '');
      setActivityLevel(profile.activityLevel || '');
      setTdee(profile.tdee?.toString() || '');
    }
  }, []);

  const calculateTDEE = () => {
    if (!weight || !height || !age || !activityLevel) {
      toast.error('Vui lòng điền đầy đủ thông tin để tính TDEE');
      return;
    }

    const weightNum = Number(weight);
    const heightNum = Number(height);
    const ageNum = Number(age);
    
    const bmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum + 5;
    
    const selectedActivity = activityLevels.find(level => level.value === activityLevel);
    const calculatedTDEE = Math.round(bmr * (selectedActivity?.multiplier || 1.2));
    
    setTdee(calculatedTDEE.toString());
    toast.success('TDEE đã được tính toán!');
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();
    
    if (!name || !age || !height || !weight || !activityLevel) {
      toast.error('Vui lòng điền đầy đủ thông tin');
      return;
    }

    if (!tdee) {
      toast.error('Vui lòng tính TDEE trước khi lưu');
      return;
    }

    const profileData = {
      name,
      age: Number(age),
      height: Number(height),
      weight: Number(weight),
      bodyFat: bodyFat ? Number(bodyFat) : undefined,
      activityLevel,
      tdee: Number(tdee),
      updatedAt: new Date().toISOString(),
    };

    localStorage.setItem('userProfile', JSON.stringify(profileData));
    toast.success('Thông tin đã được cập nhật!');
    onSave();
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 p-4 pb-20">
      <div className="max-w-2xl mx-auto">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <Edit className="w-7 h-7 text-orange-600" />
              Chỉnh sửa Profile
            </h1>
            <p className="text-sm text-gray-600 mt-1">Cập nhật thông tin cá nhân của bạn</p>
          </div>
          <button
            onClick={onCancel}
            className="p-2 hover:bg-white/50 rounded-xl transition-colors"
          >
            <X className="w-6 h-6 text-gray-600" />
          </button>
        </div>

        {/* Form */}
        <form onSubmit={handleSubmit} className="space-y-4">
          {/* Name */}
          <div className="bg-white/70 backdrop-blur rounded-3xl p-6 shadow-sm border border-orange-100">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <User className="w-5 h-5 text-orange-600" />
              Họ và tên *
            </label>
            <input
              type="text"
              value={name}
              onChange={(e) => setName(e.target.value)}
              placeholder="Nhập họ và tên của bạn"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Age */}
          <div className="bg-white/70 backdrop-blur rounded-3xl p-6 shadow-sm border border-orange-100">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <Calendar className="w-5 h-5 text-orange-600" />
              Tuổi *
            </label>
            <input
              type="number"
              value={age}
              onChange={(e) => setAge(e.target.value)}
              placeholder="Nhập tuổi của bạn"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Height & Weight */}
          <div className="grid grid-cols-2 gap-4">
            <div className="bg-white/70 backdrop-blur rounded-3xl p-6 shadow-sm border border-orange-100">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <Ruler className="w-5 h-5 text-blue-600" />
                Chiều cao (cm) *
              </label>
              <input
                type="number"
                value={height}
                onChange={(e) => setHeight(e.target.value)}
                placeholder="170"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div className="bg-white/70 backdrop-blur rounded-3xl p-6 shadow-sm border border-orange-100">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
                <Weight className="w-5 h-5 text-green-600" />
                Cân nặng (kg) *
              </label>
              <input
                type="number"
                value={weight}
                onChange={(e) => setWeight(e.target.value)}
                placeholder="70"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
              />
            </div>
          </div>

          {/* Body Fat */}
          <div className="bg-white/70 backdrop-blur rounded-3xl p-6 shadow-sm border border-orange-100">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <Activity className="w-5 h-5 text-purple-600" />
              Tỷ lệ mỡ cơ thể (%) - Tùy chọn
            </label>
            <input
              type="number"
              value={bodyFat}
              onChange={(e) => setBodyFat(e.target.value)}
              placeholder="15-25"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
            />
          </div>

          {/* Activity Level */}
          <div className="bg-white/70 backdrop-blur rounded-3xl p-6 shadow-sm border border-orange-100">
            <label className="flex items-center gap-2 text-sm font-semibold text-gray-700 mb-3">
              <Activity className="w-5 h-5 text-orange-600" />
              Tần suất tập luyện *
            </label>
            <div className="space-y-2">
              {activityLevels.map((level) => (
                <label
                  key={level.value}
                  className={`flex items-center p-3 rounded-xl border-2 cursor-pointer transition-all ${
                    activityLevel === level.value
                      ? 'bg-orange-50 border-orange-300'
                      : 'bg-white border-gray-200 hover:bg-gray-50'
                  }`}
                >
                  <input
                    type="radio"
                    name="activityLevel"
                    value={level.value}
                    checked={activityLevel === level.value}
                    onChange={(e) => setActivityLevel(e.target.value)}
                    className="w-4 h-4 text-orange-600"
                  />
                  <span className="ml-3 text-sm text-gray-900">{level.label}</span>
                </label>
              ))}
            </div>
          </div>

          {/* TDEE Calculator */}
          <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-6 shadow-sm border border-orange-200">
            <div className="flex items-center justify-between mb-4">
              <label className="flex items-center gap-2 text-sm font-semibold text-gray-700">
                <Zap className="w-5 h-5 text-orange-600" />
                TDEE (Calories/ngày)
              </label>
              <button
                type="button"
                onClick={calculateTDEE}
                className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl text-sm font-semibold hover:shadow-lg transition-all"
              >
                Tính toán
              </button>
            </div>
            <input
              type="number"
              value={tdee}
              onChange={(e) => setTdee(e.target.value)}
              placeholder="Click 'Tính toán' để tự động tính"
              className="w-full px-4 py-3 rounded-xl border border-orange-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all bg-white/70"
            />
            <p className="text-xs text-gray-600 mt-2">
              💡 TDEE = Tổng năng lượng tiêu hao mỗi ngày (bao gồm BMR + hoạt động)
            </p>
          </div>

          {/* Action Buttons */}
          <div className="flex gap-3 pt-4">
            <button
              type="button"
              onClick={onCancel}
              className="flex-1 py-4 rounded-2xl border-2 border-gray-300 text-gray-700 font-semibold hover:bg-gray-50 transition-all"
            >
              Hủy
            </button>
            <button
              type="submit"
              className="flex-1 py-4 rounded-2xl bg-gradient-to-r from-orange-500 to-red-500 text-white font-semibold hover:shadow-lg transition-all flex items-center justify-center gap-2"
            >
              <Save className="w-5 h-5" />
              Lưu thay đổi
            </button>
          </div>
        </form>
      </div>
    </div>
  );
}
