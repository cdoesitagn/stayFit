import { useState, useEffect } from "react";
import {
  User,
  Calendar,
  Ruler,
  Weight,
  Activity,
  Zap,
  Edit,
  Target,
  TrendingUp,
  LogOut,
} from "lucide-react";
import { toast } from "sonner";

interface ProfileViewProps {
  onEdit: () => void;
  onLogout?: () => void;
}

export function ProfileView({
  onEdit,
  onLogout,
}: ProfileViewProps) {
  const [profile, setProfile] = useState<any>(null);
  const [target, setTarget] = useState<any>(null);

  useEffect(() => {
    const profileData = localStorage.getItem("userProfile");
    const targetData = localStorage.getItem("userTarget");

    if (profileData) setProfile(JSON.parse(profileData));
    if (targetData) setTarget(JSON.parse(targetData));
  }, []);

  if (!profile) {
    return (
      <div className="flex items-center justify-center min-h-screen">
        <p className="text-gray-500">Đang tải...</p>
      </div>
    );
  }

  const activityLevels: { [key: string]: string } = {
    sedentary: "Ít vận động (1-2 ngày/tuần)",
    light: "Nhẹ (3-4 ngày/tuần)",
    moderate: "Trung bình (5-6 ngày/tuần)",
    active: "Nặng (6-7 ngày/tuần)",
    very_active: "Rất nặng (2x mỗi ngày)",
  };

  const goalLabels: { [key: string]: string } = {
    lose: "Giảm cân",
    maintain: "Duy trì",
    gain_muscle: "Tăng cơ",
  };

  const bmi =
    profile.weight && profile.height
      ? (
          profile.weight / Math.pow(profile.height / 100, 2)
        ).toFixed(1)
      : null;

  const getBMICategory = (bmi: number) => {
    if (bmi < 18.5)
      return {
        label: "Thiếu cân",
        color: "text-blue-600",
        bg: "bg-blue-50",
      };
    if (bmi < 25)
      return {
        label: "Bình thường",
        color: "text-green-600",
        bg: "bg-green-50",
      };
    if (bmi < 30)
      return {
        label: "Thừa cân",
        color: "text-yellow-600",
        bg: "bg-yellow-50",
      };
    return {
      label: "Béo phì",
      color: "text-red-600",
      bg: "bg-red-50",
    };
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-orange-50 via-red-50 to-pink-50 p-4 pb-32">
      <div className="max-w-2xl mx-auto space-y-4">
        {/* Header */}
        <div className="flex items-center justify-between mb-6">
          <div>
            <h1 className="text-2xl font-bold text-gray-900 flex items-center gap-2">
              <User className="w-7 h-7 text-orange-600" />
              Thông tin cá nhân
            </h1>
            <p className="text-sm text-gray-600 mt-1">
              Quản lý profile của bạn
            </p>
          </div>
          <button
            onClick={onEdit}
            className="px-4 py-2 bg-gradient-to-r from-orange-500 to-red-500 text-white rounded-xl font-semibold flex items-center gap-2 hover:shadow-lg transition-all"
          >
            <Edit className="w-4 h-4" />
            Chỉnh sửa
          </button>
        </div>

        {/* Profile Info Card */}
        <div className="bg-white/70 backdrop-blur rounded-3xl p-6 shadow-sm border border-orange-100">
          <div className="flex items-center gap-4 mb-6">
            <div className="w-20 h-20 rounded-full bg-gradient-to-br from-orange-500 to-red-500 flex items-center justify-center">
              <User className="w-10 h-10 text-white" />
            </div>
            <div>
              <h2 className="text-2xl font-bold text-gray-900">
                {profile.name}
              </h2>
              <p className="text-sm text-gray-600">
                {profile.age} tuổi
              </p>
            </div>
          </div>

          {/* Stats Grid */}
          <div className="grid grid-cols-2 gap-3">
            <div className="bg-gradient-to-br from-blue-50 to-blue-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Ruler className="w-5 h-5 text-blue-600" />
                <span className="text-sm font-medium text-blue-900">
                  Chiều cao
                </span>
              </div>
              <p className="text-2xl font-bold text-blue-900">
                {profile.height}{" "}
                <span className="text-sm font-normal">cm</span>
              </p>
            </div>

            <div className="bg-gradient-to-br from-green-50 to-green-100 rounded-2xl p-4">
              <div className="flex items-center gap-2 mb-2">
                <Weight className="w-5 h-5 text-green-600" />
                <span className="text-sm font-medium text-green-900">
                  Cân nặng
                </span>
              </div>
              <p className="text-2xl font-bold text-green-900">
                {profile.weight}{" "}
                <span className="text-sm font-normal">kg</span>
              </p>
            </div>

            {bmi && (
              <div
                className={`bg-gradient-to-br ${getBMICategory(Number(bmi)).bg} rounded-2xl p-4`}
              >
                <div className="flex items-center gap-2 mb-2">
                  <TrendingUp
                    className={`w-5 h-5 ${getBMICategory(Number(bmi)).color}`}
                  />
                  <span
                    className={`text-sm font-medium ${getBMICategory(Number(bmi)).color}`}
                  >
                    BMI
                  </span>
                </div>
                <p
                  className={`text-2xl font-bold ${getBMICategory(Number(bmi)).color}`}
                >
                  {bmi}
                </p>
                <p
                  className={`text-xs mt-1 ${getBMICategory(Number(bmi)).color}`}
                >
                  {getBMICategory(Number(bmi)).label}
                </p>
              </div>
            )}

            {profile.bodyFat && (
              <div className="bg-gradient-to-br from-purple-50 to-purple-100 rounded-2xl p-4">
                <div className="flex items-center gap-2 mb-2">
                  <Activity className="w-5 h-5 text-purple-600" />
                  <span className="text-sm font-medium text-purple-900">
                    Mỡ cơ thể
                  </span>
                </div>
                <p className="text-2xl font-bold text-purple-900">
                  {profile.bodyFat}
                  <span className="text-sm font-normal">%</span>
                </p>
              </div>
            )}
          </div>
        </div>

        {/* Activity Level */}
        <div className="bg-white/70 backdrop-blur rounded-3xl p-6 shadow-sm border border-orange-100">
          <div className="flex items-center gap-2 mb-3">
            <Activity className="w-5 h-5 text-orange-600" />
            <h3 className="font-semibold text-gray-900">
              Tần suất tập luyện
            </h3>
          </div>
          <p className="text-gray-700">
            {activityLevels[profile.activityLevel]}
          </p>
        </div>

        {/* TDEE */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-6 shadow-sm border border-orange-200">
          <div className="flex items-center gap-2 mb-3">
            <Zap className="w-5 h-5 text-orange-600" />
            <h3 className="font-semibold text-gray-900">
              TDEE của bạn
            </h3>
          </div>
          <p className="text-4xl font-bold text-orange-600 mb-2">
            {profile.tdee}
          </p>
          <p className="text-sm text-gray-600">
            Calories/ngày (Tổng năng lượng tiêu hao)
          </p>
        </div>

        {/* Target Goal */}
        {target && (
          <div className="bg-white/70 backdrop-blur rounded-3xl p-6 shadow-sm border border-orange-100">
            <div className="flex items-center gap-2 mb-4">
              <Target className="w-5 h-5 text-orange-600" />
              <h3 className="font-semibold text-gray-900">
                Mục tiêu hiện tại
              </h3>
            </div>

            <div className="space-y-3">
              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
                <span className="text-sm font-medium text-gray-700">
                  Mục tiêu
                </span>
                <span className="font-semibold text-orange-600">
                  {goalLabels[target.goal]}
                </span>
              </div>

              <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
                <span className="text-sm font-medium text-gray-700">
                  Calories mục tiêu
                </span>
                <span className="font-semibold text-orange-600">
                  {target.targetCalories} cal/ngày
                </span>
              </div>

              {target.targetWeight && (
                <div className="flex items-center justify-between p-3 bg-gradient-to-r from-orange-50 to-red-50 rounded-xl">
                  <span className="text-sm font-medium text-gray-700">
                    Cân nặng mục tiêu
                  </span>
                  <span className="font-semibold text-orange-600">
                    {target.targetWeight} kg
                  </span>
                </div>
              )}
            </div>
          </div>
        )}

        {/* Macro Goals */}
        {target && target.macroRatios && (
          <div className="bg-white/70 backdrop-blur rounded-3xl p-6 shadow-sm border border-orange-100">
            <div className="flex items-center gap-2 mb-4">
              <svg
                className="w-5 h-5 text-orange-600"
                fill="none"
                viewBox="0 0 24 24"
                stroke="currentColor"
              >
                <path
                  strokeLinecap="round"
                  strokeLinejoin="round"
                  strokeWidth={2}
                  d="M9 19v-6a2 2 0 00-2-2H5a2 2 0 00-2 2v6a2 2 0 002 2h2a2 2 0 002-2zm0 0V9a2 2 0 012-2h2a2 2 0 012 2v10m-6 0a2 2 0 002 2h2a2 2 0 002-2m0 0V5a2 2 0 012-2h2a2 2 0 012 2v14a2 2 0 01-2 2h-2a2 2 0 01-2-2z"
                />
              </svg>
              <h3 className="font-semibold text-gray-900">
                Tỉ lệ Macro hàng ngày
              </h3>
            </div>

            <div className="space-y-3">
              {/* Protein */}
              <div className="p-4 bg-gradient-to-r from-blue-50 to-blue-100 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                    <span className="text-sm font-medium text-blue-900">
                      Protein
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-blue-700">
                    {target.macroRatios.protein}%
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-blue-900">
                    {Math.round(
                      (target.targetCalories *
                        target.macroRatios.protein) /
                        100 /
                        4,
                    )}
                    g
                  </span>
                  <span className="text-sm text-blue-700">
                    (
                    {Math.round(
                      (target.targetCalories *
                        target.macroRatios.protein) /
                        100,
                    )}{" "}
                    kcal)
                  </span>
                </div>
              </div>

              {/* Carbs */}
              <div className="p-4 bg-gradient-to-r from-yellow-50 to-yellow-100 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                    <span className="text-sm font-medium text-yellow-900">
                      Carbs
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-yellow-700">
                    {target.macroRatios.carbs}%
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-yellow-900">
                    {Math.round(
                      (target.targetCalories *
                        target.macroRatios.carbs) /
                        100 /
                        4,
                    )}
                    g
                  </span>
                  <span className="text-sm text-yellow-700">
                    (
                    {Math.round(
                      (target.targetCalories *
                        target.macroRatios.carbs) /
                        100,
                    )}{" "}
                    kcal)
                  </span>
                </div>
              </div>

              {/* Fat */}
              <div className="p-4 bg-gradient-to-r from-purple-50 to-purple-100 rounded-xl">
                <div className="flex items-center justify-between mb-2">
                  <div className="flex items-center gap-2">
                    <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                    <span className="text-sm font-medium text-purple-900">
                      Fat
                    </span>
                  </div>
                  <span className="text-xs font-semibold text-purple-700">
                    {target.macroRatios.fat}%
                  </span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-purple-900">
                    {Math.round(
                      (target.targetCalories *
                        target.macroRatios.fat) /
                        100 /
                        9,
                    )}
                    g
                  </span>
                  <span className="text-sm text-purple-700">
                    (
                    {Math.round(
                      (target.targetCalories *
                        target.macroRatios.fat) /
                        100,
                    )}{" "}
                    kcal)
                  </span>
                </div>
              </div>
            </div>

            <div className="mt-4 p-3 bg-gradient-to-r from-indigo-50 to-purple-50 rounded-xl border border-indigo-200">
              <p className="text-xs text-gray-600 text-center">
                💡 <span className="font-medium">Mẹo:</span> Duy
                trì tỉ lệ macro này để đạt mục tiêu tốt nhất
              </p>
            </div>
          </div>
        )}

        {/* Last Updated */}
        {profile.updatedAt && (
          <p className="text-xs text-center text-gray-500">
            Cập nhật lần cuối:{" "}
            {new Date(profile.updatedAt).toLocaleDateString(
              "vi-VN",
              {
                year: "numeric",
                month: "long",
                day: "numeric",
                hour: "2-digit",
                minute: "2-digit",
              },
            )}
          </p>
        )}

        {/* Logout Button */}
        {onLogout && (
          <button
            onClick={onLogout}
            className="w-full bg-gradient-to-r from-red-500 to-pink-500 text-white py-4 rounded-2xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all"
          >
            <LogOut className="w-5 h-5" />
            Đăng xuất
          </button>
        )}
      </div>
    </div>
  );
}