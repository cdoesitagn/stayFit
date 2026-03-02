import AsyncStorage from "@react-native-async-storage/async-storage";
import Slider from "@react-native-community/slider";
import { router } from "expo-router";
import {
    Dumbbell,
    Flame,
    Target,
    TrendingDown,
    TrendingUp,
} from "lucide-react-native";
import { useState } from "react";
import {
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

type GoalType = "lose" | "gain" | "muscle" | null;

export default function TargetSetupScreen() {
  const [selectedGoal, setSelectedGoal] = useState<GoalType>(null);
  const [targetCalories, setTargetCalories] = useState("");

  const [proteinPercent, setProteinPercent] = useState(30);
  const [carbsPercent, setCarbsPercent] = useState(40);
  const [fatPercent, setFatPercent] = useState(30);

  const goals = [
    {
      id: "lose" as GoalType,
      icon: TrendingDown,
      title: "Giảm cân",
      description: "Giảm mỡ và cải thiện sức khỏe",
      color: ["#ef4444", "#f97316"],
      bgColor: "#fff5f5",
      borderColor: "#fecaca",
      textColor: "#b91c1c",
      recommendation: "Giảm 300-500 calories so với TDEE",
    },
    {
      id: "gain" as GoalType,
      icon: TrendingUp,
      title: "Tăng cân",
      description: "Tăng cân khỏe mạnh",
      color: ["#3b82f6", "#06b6d4"],
      bgColor: "#eff6ff",
      borderColor: "#bfdbfe",
      textColor: "#1d4ed8",
      recommendation: "Tăng 300-500 calories so với TDEE",
    },
    {
      id: "muscle" as GoalType,
      icon: Dumbbell,
      title: "Tăng cơ",
      description: "Xây dựng cơ bắp và sức mạnh",
      color: ["#a855f7", "#ec4899"],
      bgColor: "#faf5ff",
      borderColor: "#e9d5ff",
      textColor: "#7e22ce",
      recommendation: "Tăng 200-400 calories + protein cao",
    },
  ];

  const handleGoalSelect = async (goalId: GoalType) => {
    setSelectedGoal(goalId);

    const profileStr = await AsyncStorage.getItem("userProfile");
    if (profileStr) {
      const profile = JSON.parse(profileStr);
      const tdee = profile.tdee;

      let suggested = tdee;
      if (goalId === "lose") {
        suggested = tdee - 400;
        setProteinPercent(35);
        setCarbsPercent(35);
        setFatPercent(30);
      } else if (goalId === "gain") {
        suggested = tdee + 400;
        setProteinPercent(25);
        setCarbsPercent(50);
        setFatPercent(25);
      } else if (goalId === "muscle") {
        suggested = tdee + 300;
        setProteinPercent(30);
        setCarbsPercent(45);
        setFatPercent(25);
      }

      setTargetCalories(Math.round(suggested).toString());
    }
  };

  const handleSubmit = async () => {
    if (!selectedGoal) {
      Alert.alert("Lỗi", "Vui lòng chọn mục tiêu");
      return;
    }

    if (!targetCalories || Number(targetCalories) <= 0) {
      Alert.alert("Lỗi", "Vui lòng nhập mức calories mục tiêu hợp lệ");
      return;
    }

    const totalPercent = proteinPercent + carbsPercent + fatPercent;
    if (Math.abs(totalPercent - 100) > 0.1) {
      Alert.alert(
        "Lỗi",
        `Tổng tỉ lệ macro phải bằng 100% (hiện tại: ${totalPercent}%)`,
      );
      return;
    }

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

    await AsyncStorage.setItem("userTarget", JSON.stringify(target));
    router.replace("/(main)/dashboard");
  };

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
    <SafeAreaView className="flex-1 bg-indigo-600">
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 24,
          paddingVertical: 40,
        }}
      >
        {/* Header */}
        <View className="items-center mb-8 mt-10">
          <View className="w-20 h-20 bg-white rounded-3xl items-center justify-center mb-4 shadow-xl">
            <Target color="#4f46e5" size={40} />
          </View>
          <Text className="text-4xl font-bold text-white mb-2 text-center">
            Mục tiêu của bạn
          </Text>
          <Text className="text-indigo-100 text-center">
            Chọn hướng đi phù hợp với bạn
          </Text>
        </View>

        {/* Form */}
        <View className="bg-white rounded-3xl p-6 shadow-2xl space-y-6">
          {/* Goal Selection */}
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-3 mt-4">
              Chọn mục tiêu của bạn
            </Text>
            <View className="gap-y-3">
              {goals.map((goal) => {
                const Icon = goal.icon;
                const isSelected = selectedGoal === goal.id;

                return (
                  <TouchableOpacity
                    key={goal.id}
                    onPress={() => handleGoalSelect(goal.id)}
                    className={`w-full p-4 rounded-2xl border ${
                      isSelected
                        ? "shadow-sm border-indigo-400"
                        : "border-gray-200"
                    }`}
                    style={{
                      backgroundColor: isSelected ? goal.bgColor : "#ffffff",
                    }}
                  >
                    <View className="flex-row items-center gap-4">
                      <View
                        className="w-12 h-12 rounded-xl items-center justify-center shadow-sm"
                        style={{ backgroundColor: goal.color[0] }}
                      >
                        <Icon color="white" size={24} />
                      </View>
                      <View className="flex-1">
                        <Text
                          style={{
                            color: isSelected ? goal.textColor : "#111827",
                          }}
                          className="font-bold text-lg mb-1"
                        >
                          {goal.title}
                        </Text>
                        <Text className="text-sm text-gray-600 mb-1">
                          {goal.description}
                        </Text>
                        <Text className="text-xs text-gray-500 italic">
                          💡 {goal.recommendation}
                        </Text>
                      </View>
                    </View>
                  </TouchableOpacity>
                );
              })}
            </View>
          </View>

          {/* Target Calories */}
          {selectedGoal && selectedGoalData && (
            <View
              className="p-6 rounded-2xl border mt-6"
              style={{
                backgroundColor: selectedGoalData.bgColor,
                borderColor: selectedGoalData.borderColor,
              }}
            >
              <View className="flex-row items-center gap-2 mb-3">
                <Flame color="#4b5563" size={16} />
                <Text className="text-sm font-medium text-gray-700">
                  Mức Calories mục tiêu (kcal/ngày)
                </Text>
              </View>
              <TextInput
                value={targetCalories}
                onChangeText={setTargetCalories}
                placeholder="2000"
                keyboardType="numeric"
                className="w-full px-4 py-4 rounded-xl border border-gray-300 bg-white text-lg font-semibold text-center mt-2"
              />
              <Text className="text-xs text-gray-600 mt-2 text-center">
                Bạn có thể chỉnh sửa con số này theo ý muốn
              </Text>
            </View>
          )}

          {/* Macro Ratios */}
          {selectedGoal &&
            targetCalories !== "" &&
            Number(targetCalories) > 0 && (
              <View className="p-6 rounded-2xl bg-indigo-50 border border-indigo-200 mt-6 gap-y-4">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="font-semibold text-gray-900">
                    Tỉ lệ Macro
                  </Text>
                  <View
                    className={`px-3 py-1 rounded-full ${isValidTotal ? "bg-green-100" : "bg-red-100"}`}
                  >
                    <Text
                      className={`text-xs font-semibold ${isValidTotal ? "text-green-700" : "text-red-700"}`}
                    >
                      {totalPercent.toFixed(0)}% / 100%
                    </Text>
                  </View>
                </View>

                {/* Protein Slider */}
                <View className="mb-2">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-sm font-medium text-blue-700">
                      Protein
                    </Text>
                    <Text className="font-bold text-blue-900">
                      {Math.round(proteinPercent)}%{" "}
                      <Text className="text-xs text-gray-600">
                        ({proteinGrams}g)
                      </Text>
                    </Text>
                  </View>
                  <Slider
                    minimumValue={10}
                    maximumValue={60}
                    value={proteinPercent}
                    onValueChange={setProteinPercent}
                    minimumTrackTintColor="#3b82f6"
                    maximumTrackTintColor="#bfdbfe"
                    thumbTintColor="#2563eb"
                  />
                </View>

                {/* Carbs Slider */}
                <View className="mb-2">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-sm font-medium text-yellow-700">
                      Carbs
                    </Text>
                    <Text className="font-bold text-yellow-900">
                      {Math.round(carbsPercent)}%{" "}
                      <Text className="text-xs text-gray-600">
                        ({carbsGrams}g)
                      </Text>
                    </Text>
                  </View>
                  <Slider
                    minimumValue={10}
                    maximumValue={70}
                    value={carbsPercent}
                    onValueChange={setCarbsPercent}
                    minimumTrackTintColor="#eab308"
                    maximumTrackTintColor="#fef08a"
                    thumbTintColor="#ca8a04"
                  />
                </View>

                {/* Fat Slider */}
                <View className="mb-2">
                  <View className="flex-row items-center justify-between mb-2">
                    <Text className="text-sm font-medium text-purple-700">
                      Fat
                    </Text>
                    <Text className="font-bold text-purple-900">
                      {Math.round(fatPercent)}%{" "}
                      <Text className="text-xs text-gray-600">
                        ({fatGrams}g)
                      </Text>
                    </Text>
                  </View>
                  <Slider
                    minimumValue={10}
                    maximumValue={50}
                    value={fatPercent}
                    onValueChange={setFatPercent}
                    minimumTrackTintColor="#a855f7"
                    maximumTrackTintColor="#e9d5ff"
                    thumbTintColor="#9333ea"
                  />
                </View>

                {/* Summary */}
                <View className="bg-white rounded-xl p-4 mt-2 border border-indigo-200">
                  <Text className="text-xs text-gray-600 mb-4 font-medium text-center">
                    📊 Tổng quan hàng ngày
                  </Text>
                  <View className="flex-row justify-around">
                    <View className="items-center">
                      <Text className="text-lg font-bold text-blue-900">
                        {proteinGrams}g
                      </Text>
                      <Text className="text-xs text-blue-700 mt-1">
                        Protein
                      </Text>
                    </View>
                    <View className="items-center">
                      <Text className="text-lg font-bold text-yellow-900">
                        {carbsGrams}g
                      </Text>
                      <Text className="text-xs text-yellow-700 mt-1">
                        Carbs
                      </Text>
                    </View>
                    <View className="items-center">
                      <Text className="text-lg font-bold text-purple-900">
                        {fatGrams}g
                      </Text>
                      <Text className="text-xs text-purple-700 mt-1">Fat</Text>
                    </View>
                  </View>
                </View>

                {!isValidTotal && (
                  <View className="bg-red-50 border border-red-200 rounded-xl p-3 mt-4">
                    <Text className="text-xs text-red-700 text-center">
                      ⚠️ Tổng tỉ lệ macro phải bằng 100%. Vui lòng điều chỉnh
                      lại các thanh trượt.
                    </Text>
                  </View>
                )}
              </View>
            )}

          {/* Submit Button */}
          <View className="mt-8 mb-4">
            <TouchableOpacity
              onPress={handleSubmit}
              disabled={!selectedGoal || !targetCalories || !isValidTotal}
              className={`w-full py-4 rounded-xl items-center shadow-sm ${
                !selectedGoal || !targetCalories || !isValidTotal
                  ? "bg-gray-400"
                  : "bg-indigo-600"
              }`}
            >
              <Text className="text-white font-semibold text-lg">
                Bắt đầu hành trình
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
