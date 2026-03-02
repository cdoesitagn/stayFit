import {
  Dumbbell,
  Flame,
  Target,
  TrendingDown,
  TrendingUp,
} from "lucide-react";
import { useState } from "react";
import { toast } from "sonner";

interface TargetSetupProps {
  onComplete: () => void;
}

type GoalType = "lose" | "gain" | "muscle" | null;

export function TargetSetup({ onComplete }: TargetSetupProps) {
  const [selectedGoal, setSelectedGoal] = useState<GoalType>(null);
  const [targetCalories, setTargetCalories] = useState("");

  // Macro ratios (percentages)
  const [proteinPercent, setProteinPercent] = useState(30);
  const [carbsPercent, setCarbsPercent] = useState(40);
  const [fatPercent, setFatPercent] = useState(30);

  const goals = [
    {
      id: "lose" as GoalType,
      icon: TrendingDown,
      title: "Giảm cân",
      description: "Giảm mỡ và cải thiện sức khỏe",
      color: "from-red-500 to-orange-500",
      bgColor: "from-red-50 to-orange-50",
      borderColor: "border-red-200",
      textColor: "text-red-700",
      recommendation: "Giảm 300-500 calories so với TDEE",
    },
    {
      id: "gain" as GoalType,
      icon: TrendingUp,
      title: "Tăng cân",
      description: "Tăng cân khỏe mạnh",
      color: "from-blue-500 to-cyan-500",
      bgColor: "from-blue-50 to-cyan-50",
      borderColor: "border-blue-200",
      textColor: "text-blue-700",
      recommendation: "Tăng 300-500 calories so với TDEE",
    },
    {
      id: "muscle" as GoalType,
      icon: Dumbbell,
      title: "Tăng cơ",
      description: "Xây dựng cơ bắp và sức mạnh",
      color: "from-purple-500 to-pink-500",
      bgColor: "from-purple-50 to-pink-50",
      borderColor: "border-purple-200",
      textColor: "text-purple-700",
      recommendation: "Tăng 200-400 calories + protein cao",
    },
  ];

  const handleGoalSelect = (goalId: GoalType) => {
    setSelectedGoal(goalId);

    // Auto-suggest target calories based on TDEE
    const profileStr = localStorage.getItem("userProfile");
    if (profileStr) {
      const profile = JSON.parse(profileStr);
      const tdee = profile.tdee;

      let suggested = tdee;
      if (goalId === "lose") {
        suggested = tdee - 400;
        // Suggest higher protein for weight loss
        setProteinPercent(35);
        setCarbsPercent(35);
        setFatPercent(30);
      } else if (goalId === "gain") {
        suggested = tdee + 400;
        // Balanced macros for weight gain
        setProteinPercent(25);
        setCarbsPercent(50);
        setFatPercent(25);
      } else if (goalId === "muscle") {
        suggested = tdee + 300;
        // High protein for muscle building
        setProteinPercent(30);
        setCarbsPercent(45);
        setFatPercent(25);
      }

      setTargetCalories(Math.round(suggested).toString());
    }
  };

  const handleSubmit = (e: React.FormEvent) => {
    e.preventDefault();

    if (!selectedGoal) {
      toast.error("Vui lòng chọn mục tiêu");
      return;
    }

    if (!targetCalories || Number(targetCalories) <= 0) {
      toast.error("Vui lòng nhập mức calories mục tiêu hợp lệ");
      return;
    }

    const totalPercent = proteinPercent + carbsPercent + fatPercent;
    if (Math.abs(totalPercent - 100) > 0.1) {
      toast.error(
        `Tổng tỉ lệ macro phải bằng 100% (hiện tại: ${totalPercent}%)`,
      );
      return;
    }

    // Save target to localStorage
    const target = {
      goal: selectedGoal,
      targetCalories: Number(targetCalories),
      macroRatios: {
        protein: proteinPercent,
        carbs: carbsPercent,
        fat: fatPercent,
      },
      createdAt: new Date().toISOString(),
    };

    localStorage.setItem("userTarget", JSON.stringify(target));
    toast.success("Đã lưu mục tiêu!");
    onComplete();
  };

  // Calculate grams from percentages
  const calculateGrams = (percent: number, caloriesPerGram: number) => {
    if (!targetCalories) return 0;
    const calories = Number(targetCalories);
    const macroCalories = calories * (percent / 100);
    return Math.round(macroCalories / caloriesPerGram);
  };

  const proteinGrams = calculateGrams(proteinPercent, 4);
  const carbsGrams = calculateGrams(carbsPercent, 4);
  const fatGrams = calculateGrams(fatPercent, 9);

  const totalPercent = proteinPercent + carbsPercent + fatPercent;
  const isValidTotal = Math.abs(totalPercent - 100) < 0.1;

  const selectedGoalData = goals.find((g) => g.id === selectedGoal);

  return (
    <div className="min-h-screen bg-gradient-to-br from-indigo-600 via-purple-600 to-pink-600 flex items-center justify-center p-6">
      <div className="w-full max-w-md">
        {/* Header */}
        <div className="text-center mb-8">
          <div className="w-20 h-20 bg-white rounded-3xl flex items-center justify-center mx-auto mb-4 shadow-xl">
            <Target className="w-10 h-10 text-indigo-600" />
          </div>
          <h1 className="text-4xl font-bold text-white mb-2">
            Mục tiêu của bạn
          </h1>
          <p className="text-indigo-100">Chọn hướng đi phù hợp với bạn</p>
        </div>

        {/* Form */}
        <div className="bg-white rounded-3xl p-8 shadow-2xl">
          <form onSubmit={handleSubmit} className="space-y-6">
            {/* Goal Selection */}
            <div>
              <label className="block text-sm font-medium text-gray-700 mb-3">
                Chọn mục tiêu của bạn
              </label>
              <div className="space-y-3">
                {goals.map((goal) => {
                  const Icon = goal.icon;
                  const isSelected = selectedGoal === goal.id;

                  return (
                    <button
                      key={goal.id}
                      type="button"
                      onClick={() => handleGoalSelect(goal.id)}
                      className={`w-full p-4 rounded-2xl border-2 transition-all text-left ${
                        isSelected
                          ? `bg-gradient-to-br ${goal.bgColor} ${goal.borderColor} shadow-md`
                          : "bg-white border-gray-200 hover:border-gray-300 hover:shadow-sm"
                      }`}
                    >
                      <div className="flex items-start gap-4">
                        <div
                          className={`w-12 h-12 rounded-xl bg-gradient-to-br ${goal.color} flex items-center justify-center flex-shrink-0 shadow-md`}
                        >
                          <Icon className="w-6 h-6 text-white" />
                        </div>
                        <div className="flex-1">
                          <h3
                            className={`font-bold text-lg mb-1 ${isSelected ? goal.textColor : "text-gray-900"}`}
                          >
                            {goal.title}
                          </h3>
                          <p className="text-sm text-gray-600 mb-2">
                            {goal.description}
                          </p>
                          <p className="text-xs text-gray-500 italic">
                            💡 {goal.recommendation}
                          </p>
                        </div>
                        {isSelected && (
                          <div className="flex-shrink-0">
                            <div
                              className={`w-6 h-6 rounded-full bg-gradient-to-br ${goal.color} flex items-center justify-center`}
                            >
                              <svg
                                className="w-4 h-4 text-white"
                                fill="none"
                                viewBox="0 0 24 24"
                                stroke="currentColor"
                              >
                                <path
                                  strokeLinecap="round"
                                  strokeLinejoin="round"
                                  strokeWidth={3}
                                  d="M5 13l4 4L19 7"
                                />
                              </svg>
                            </div>
                          </div>
                        )}
                      </div>
                    </button>
                  );
                })}
              </div>
            </div>

            {/* Target Calories */}
            {selectedGoal && (
              <div
                className={`p-6 rounded-2xl bg-gradient-to-br ${selectedGoalData?.bgColor} border ${selectedGoalData?.borderColor} animate-in fade-in slide-in-from-top-4 duration-500`}
              >
                <label className="block text-sm font-medium text-gray-700 mb-3 flex items-center gap-2">
                  <Flame className="w-4 h-4" />
                  Mức Calories mục tiêu (kcal/ngày)
                </label>
                <input
                  type="number"
                  value={targetCalories}
                  onChange={(e) => setTargetCalories(e.target.value)}
                  placeholder="2000"
                  min="1"
                  className="w-full px-4 py-4 rounded-xl border-2 border-gray-300 focus:ring-2 focus:ring-indigo-500 focus:border-transparent outline-none transition-all text-lg font-semibold text-center"
                />
                <p className="text-xs text-gray-600 mt-2 text-center">
                  Bạn có thể chỉnh sửa con số này theo ý muốn
                </p>
              </div>
            )}

            {/* Macro Ratios */}
            {selectedGoal && targetCalories && Number(targetCalories) > 0 && (
              <div className="p-6 rounded-2xl bg-gradient-to-br from-indigo-50 to-purple-50 border border-indigo-200 animate-in fade-in slide-in-from-top-4 duration-500 space-y-5">
                <div className="flex items-center justify-between mb-4">
                  <h3 className="font-semibold text-gray-900 flex items-center gap-2">
                    <svg
                      className="w-5 h-5 text-indigo-600"
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
                    Tỉ lệ Macro
                  </h3>
                  <div
                    className={`px-3 py-1 rounded-full text-xs font-semibold ${
                      isValidTotal
                        ? "bg-green-100 text-green-700"
                        : "bg-red-100 text-red-700"
                    }`}
                  >
                    {totalPercent.toFixed(0)}% / 100%
                  </div>
                </div>

                {/* Protein */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-blue-700 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-blue-500"></div>
                      Protein
                    </label>
                    <div className="text-right">
                      <span className="font-bold text-blue-900">
                        {proteinPercent}%
                      </span>
                      <span className="text-xs text-gray-600 ml-2">
                        ({proteinGrams}g)
                      </span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="60"
                    value={proteinPercent}
                    onChange={(e) => setProteinPercent(Number(e.target.value))}
                    className="w-full h-2 bg-blue-200 rounded-lg appearance-none cursor-pointer accent-blue-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>10%</span>
                    <span>60%</span>
                  </div>
                </div>

                {/* Carbs */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-yellow-700 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-yellow-500"></div>
                      Carbs
                    </label>
                    <div className="text-right">
                      <span className="font-bold text-yellow-900">
                        {carbsPercent}%
                      </span>
                      <span className="text-xs text-gray-600 ml-2">
                        ({carbsGrams}g)
                      </span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="70"
                    value={carbsPercent}
                    onChange={(e) => setCarbsPercent(Number(e.target.value))}
                    className="w-full h-2 bg-yellow-200 rounded-lg appearance-none cursor-pointer accent-yellow-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>10%</span>
                    <span>70%</span>
                  </div>
                </div>

                {/* Fat */}
                <div className="space-y-2">
                  <div className="flex items-center justify-between">
                    <label className="text-sm font-medium text-purple-700 flex items-center gap-2">
                      <div className="w-3 h-3 rounded-full bg-purple-500"></div>
                      Fat
                    </label>
                    <div className="text-right">
                      <span className="font-bold text-purple-900">
                        {fatPercent}%
                      </span>
                      <span className="text-xs text-gray-600 ml-2">
                        ({fatGrams}g)
                      </span>
                    </div>
                  </div>
                  <input
                    type="range"
                    min="10"
                    max="50"
                    value={fatPercent}
                    onChange={(e) => setFatPercent(Number(e.target.value))}
                    className="w-full h-2 bg-purple-200 rounded-lg appearance-none cursor-pointer accent-purple-600"
                  />
                  <div className="flex justify-between text-xs text-gray-500">
                    <span>10%</span>
                    <span>50%</span>
                  </div>
                </div>

                {/* Summary */}
                <div className="bg-white/80 rounded-xl p-4 mt-4 border border-indigo-200">
                  <div className="text-xs text-gray-600 mb-2 font-medium">
                    📊 Tổng quan hàng ngày
                  </div>
                  <div className="grid grid-cols-3 gap-3">
                    <div className="text-center">
                      <div className="text-lg font-bold text-blue-900">
                        {proteinGrams}g
                      </div>
                      <div className="text-xs text-blue-700">Protein</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-yellow-900">
                        {carbsGrams}g
                      </div>
                      <div className="text-xs text-yellow-700">Carbs</div>
                    </div>
                    <div className="text-center">
                      <div className="text-lg font-bold text-purple-900">
                        {fatGrams}g
                      </div>
                      <div className="text-xs text-purple-700">Fat</div>
                    </div>
                  </div>
                </div>

                {!isValidTotal && (
                  <div className="bg-red-50 border border-red-200 rounded-xl p-3 text-xs text-red-700">
                    ⚠️ Tổng tỉ lệ macro phải bằng 100%. Vui lòng điều chỉnh lại
                    các thanh trượt.
                  </div>
                )}
              </div>
            )}

            {/* Submit Button */}
            <button
              type="submit"
              disabled={!selectedGoal || !targetCalories || !isValidTotal}
              className="w-full bg-gradient-to-r from-indigo-600 to-purple-600 text-white py-4 rounded-xl font-semibold hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              Bắt đầu hành trình
            </button>
          </form>
        </div>
      </div>
    </div>
  );
}
