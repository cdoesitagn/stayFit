import AsyncStorage from "@react-native-async-storage/async-storage";
import { useFocusEffect } from "expo-router";
import {
    Calendar,
    CheckCircle,
    Droplet,
    Dumbbell,
    Flame,
} from "lucide-react-native";
import { useCallback, useState } from "react";
import { Dimensions, ScrollView, Text, View } from "react-native";
import { BarChart, PieChart } from "react-native-gifted-charts";
import { SafeAreaView } from "react-native-safe-area-context";

interface MacroNutrients {
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

interface DayData {
  date: string;
  calories: number;
  water: number;
  macros?: MacroNutrients;
}

interface WorkoutStats {
  date: string;
  sessions: number;
  totalExercises: number;
  completedExercises: number;
  volume: number;
  workoutCompleted: boolean;
}

export default function DashboardScreen() {
  const [todayData, setTodayData] = useState<DayData>({
    date: "",
    calories: 0,
    water: 0,
    macros: { protein: 0, carbs: 0, fat: 0, fiber: 0 },
  });
  const [weekData, setWeekData] = useState<DayData[]>([]);
  const [workoutStats, setWorkoutStats] = useState<WorkoutStats | null>(null);
  const [weekWorkoutStats, setWeekWorkoutStats] = useState<WorkoutStats[]>([]);
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [waterGoal] = useState(2000); // ml
  const [macroGoals, setMacroGoals] = useState({
    protein: 0,
    carbs: 0,
    fat: 0,
  });

  useFocusEffect(
    useCallback(() => {
      loadData();
      loadWorkoutStats();
      loadTargetData();
    }, []),
  );

  const loadTargetData = async () => {
    const targetStr = await AsyncStorage.getItem("userTarget");
    if (targetStr) {
      const target = JSON.parse(targetStr);
      setCalorieGoal(target.targetCalories || 2000);

      if (target.macroRatios) {
        const { protein, carbs, fat } = target.macroRatios;
        const calories = target.targetCalories;
        setMacroGoals({
          protein: Math.round((calories * protein) / 100 / 4),
          carbs: Math.round((calories * carbs) / 100 / 4),
          fat: Math.round((calories * fat) / 100 / 9),
        });
      }
    }
  };

  const loadData = async () => {
    const today = new Date().toISOString().split("T")[0];
    const stored = await AsyncStorage.getItem("healthData");

    if (stored) {
      const data = JSON.parse(stored);
      const todayEntry = data.find((d: DayData) => d.date === today) || {
        date: today,
        calories: 0,
        water: 0,
        macros: { protein: 0, carbs: 0, fat: 0, fiber: 0 },
      };
      setTodayData(todayEntry);

      // Get last 7 days
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        const entry = data.find((d: DayData) => d.date === dateStr) || {
          date: dateStr,
          calories: 0,
          water: 0,
          macros: { protein: 0, carbs: 0, fat: 0, fiber: 0 },
        };
        last7Days.push(entry);
      }
      setWeekData(last7Days);
    } else {
      setTodayData({
        date: today,
        calories: 0,
        water: 0,
        macros: { protein: 0, carbs: 0, fat: 0, fiber: 0 },
      });
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        last7Days.push({
          date: dateStr,
          calories: 0,
          water: 0,
          macros: { protein: 0, carbs: 0, fat: 0, fiber: 0 },
        });
      }
      setWeekData(last7Days);
    }
  };

  const loadWorkoutStats = async () => {
    const today = new Date().toISOString().split("T")[0];
    const stored = await AsyncStorage.getItem("workoutStats");

    if (stored) {
      const stats = JSON.parse(stored);
      setWorkoutStats(stats[today] || null);

      // Get last 7 days workout stats
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split("T")[0];
        const entry = stats[dateStr] || {
          date: dateStr,
          sessions: 0,
          totalExercises: 0,
          completedExercises: 0,
          volume: 0,
          workoutCompleted: false,
        };
        last7Days.push(entry);
      }
      setWeekWorkoutStats(last7Days);
    }
  };

  const caloriePercent = Math.min(
    (todayData.calories / calorieGoal) * 100,
    100,
  );
  const waterPercent = Math.min((todayData.water / waterGoal) * 100, 100);

  // Prepare macro pie chart data
  const pieData = todayData.macros
    ? [
        {
          value: todayData.macros.protein * 4,
          color: "#3b82f6",
          text: "Protein",
        },
        { value: todayData.macros.carbs * 4, color: "#eab308", text: "Carbs" },
        { value: todayData.macros.fat * 9, color: "#a855f7", text: "Fat" },
      ].filter((item) => item.value > 0)
    : [];

  const screenWidth = Dimensions.get("window").width;

  const barData = weekWorkoutStats.map((stat) => ({
    value: stat.volume,
    label: new Date(stat.date).toLocaleDateString("vi-VN", {
      day: "2-digit",
      month: "2-digit",
    }),
    frontColor: "#a855f7",
  }));

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-gray-900">Dashboard</Text>
          <View className="flex-row items-center gap-2 mt-1 px-1">
            <Calendar color="#4b5563" size={16} />
            <Text className="text-gray-600">
              {new Date().toLocaleDateString("vi-VN", {
                weekday: "long",
                year: "numeric",
                month: "long",
                day: "numeric",
              })}
            </Text>
          </View>
        </View>

        {/* Today's Progress Cards */}
        <View className="gap-4 mb-6 md:flex-row">
          {/* Calories Card */}
          <View className="bg-orange-50 rounded-3xl p-6 shadow-sm border border-orange-100 flex-1">
            <View className="flex-row items-start justify-between mb-4">
              <View>
                <View className="flex-row items-center gap-2 mb-1">
                  <Flame color="#c2410c" size={20} />
                  <Text className="text-sm font-medium text-orange-700">
                    Calories
                  </Text>
                </View>
                <View className="flex-row items-baseline gap-2">
                  <Text className="text-4xl font-bold text-gray-900">
                    {todayData.calories}
                  </Text>
                  <Text className="text-gray-600">/ {calorieGoal} kcal</Text>
                </View>
              </View>
              <View className="w-14 h-14 rounded-full bg-white items-center justify-center">
                <Text className="text-xl font-bold text-orange-600">
                  {Math.round(caloriePercent)}%
                </Text>
              </View>
            </View>
            <View className="h-2 bg-orange-200 rounded-full overflow-hidden">
              <View
                className="h-full bg-orange-500 rounded-full"
                style={{ width: `${caloriePercent}%` }}
              />
            </View>
          </View>

          {/* Water Card */}
          <View className="bg-blue-50 rounded-3xl p-6 shadow-sm border border-blue-100 flex-1 mt-4 md:mt-0">
            <View className="flex-row items-start justify-between mb-4">
              <View>
                <View className="flex-row items-center gap-2 mb-1">
                  <Droplet color="#1d4ed8" size={20} />
                  <Text className="text-sm font-medium text-blue-700">
                    Nước uống
                  </Text>
                </View>
                <View className="flex-row items-baseline gap-2">
                  <Text className="text-4xl font-bold text-gray-900">
                    {todayData.water}
                  </Text>
                  <Text className="text-gray-600">/ {waterGoal} ml</Text>
                </View>
              </View>
              <View className="w-14 h-14 rounded-full bg-white items-center justify-center">
                <Text className="text-xl font-bold text-blue-600">
                  {Math.round(waterPercent)}%
                </Text>
              </View>
            </View>
            <View className="h-2 bg-blue-200 rounded-full overflow-hidden">
              <View
                className="h-full bg-blue-500 rounded-full"
                style={{ width: `${waterPercent}%` }}
              />
            </View>
          </View>
        </View>

        {/* Macro Distribution */}
        {pieData.length > 0 && (
          <View className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 mb-6">
            <Text className="text-xl font-bold text-gray-900 mb-4">
              Phân bổ Macro hôm nay
            </Text>

            {/* Pie Chart */}
            <View className="items-center justify-center my-4">
              <PieChart
                data={pieData}
                donut
                showText
                textColor="black"
                radius={80}
                innerRadius={50}
                textSize={12}
                focusOnPress
              />
            </View>

            {/* Macro Details */}
            <View className="space-y-3 gap-y-3">
              <View className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-sm font-medium text-blue-700">
                    Protein
                  </Text>
                  <Text className="text-xs text-blue-600">
                    {todayData.macros &&
                      Math.round(
                        ((todayData.macros.protein * 4) / todayData.calories) *
                          100,
                      )}
                    %
                  </Text>
                </View>
                <View className="flex-row items-baseline gap-2">
                  <Text className="text-2xl font-bold text-blue-900">
                    {todayData.macros?.protein.toFixed(1)}g
                  </Text>
                  {macroGoals.protein > 0 && (
                    <Text className="text-sm text-blue-700">
                      / {macroGoals.protein}g
                    </Text>
                  )}
                </View>
                <Text className="text-xs text-blue-600 mt-1">
                  {todayData.macros && Math.round(todayData.macros.protein * 4)}{" "}
                  kcal
                </Text>
              </View>

              <View className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-sm font-medium text-yellow-700">
                    Carbs
                  </Text>
                  <Text className="text-xs text-yellow-600">
                    {todayData.macros &&
                      Math.round(
                        ((todayData.macros.carbs * 4) / todayData.calories) *
                          100,
                      )}
                    %
                  </Text>
                </View>
                <View className="flex-row items-baseline gap-2">
                  <Text className="text-2xl font-bold text-yellow-900">
                    {todayData.macros?.carbs.toFixed(1)}g
                  </Text>
                  {macroGoals.carbs > 0 && (
                    <Text className="text-sm text-yellow-700">
                      / {macroGoals.carbs}g
                    </Text>
                  )}
                </View>
                <Text className="text-xs text-yellow-600 mt-1">
                  {todayData.macros && Math.round(todayData.macros.carbs * 4)}{" "}
                  kcal
                </Text>
              </View>

              <View className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                <View className="flex-row items-center justify-between mb-2">
                  <Text className="text-sm font-medium text-purple-700">
                    Fat
                  </Text>
                  <Text className="text-xs text-purple-600">
                    {todayData.macros &&
                      Math.round(
                        ((todayData.macros.fat * 9) / todayData.calories) * 100,
                      )}
                    %
                  </Text>
                </View>
                <View className="flex-row items-baseline gap-2">
                  <Text className="text-2xl font-bold text-purple-900">
                    {todayData.macros?.fat.toFixed(1)}g
                  </Text>
                  {macroGoals.fat > 0 && (
                    <Text className="text-sm text-purple-700">
                      / {macroGoals.fat}g
                    </Text>
                  )}
                </View>
                <Text className="text-xs text-purple-600 mt-1">
                  {todayData.macros && Math.round(todayData.macros.fat * 9)}{" "}
                  kcal
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Workout Stats Today */}
        {workoutStats && workoutStats.totalExercises > 0 && (
          <View className="bg-purple-50 rounded-3xl p-6 shadow-sm border border-purple-100 mb-6">
            <View className="flex-row items-center justify-between mb-4">
              <View className="flex-row items-center gap-2">
                <Dumbbell color="#7e22ce" size={20} />
                <Text className="text-xl font-bold text-gray-900">
                  Workout hôm nay
                </Text>
              </View>
              {workoutStats.workoutCompleted && (
                <View className="flex-row items-center gap-1 bg-green-100 px-3 py-1 rounded-full">
                  <CheckCircle color="#15803d" size={16} />
                  <Text className="text-sm font-medium text-green-700">
                    Hoàn thành
                  </Text>
                </View>
              )}
            </View>
            <View className="flex-row flex-wrap gap-4">
              <View className="bg-white rounded-xl p-4 border border-purple-200 flex-1">
                <Text className="text-sm text-purple-700 mb-1">Sessions</Text>
                <Text className="text-3xl font-bold text-gray-900">
                  {workoutStats.sessions}
                </Text>
              </View>
              <View className="bg-white rounded-xl p-4 border border-purple-200 flex-1">
                <Text className="text-sm text-purple-700 mb-1">Bài tập</Text>
                <Text className="text-3xl font-bold text-gray-900">
                  {workoutStats.completedExercises}/
                  {workoutStats.totalExercises}
                </Text>
              </View>
              <View className="bg-white rounded-xl p-4 border border-purple-200 flex-1">
                <Text className="text-sm text-purple-700 mb-1">Volume</Text>
                <Text className="text-2xl font-bold text-gray-900">
                  {workoutStats.volume}
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Workout Progress 7 Days */}
        {weekWorkoutStats.some((s) => s.workoutCompleted) && (
          <View className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 mb-6">
            <View className="flex-row items-center gap-2 mb-6">
              <Dumbbell color="#9333ea" size={20} />
              <Text className="text-xl font-bold text-gray-900">
                Lịch sử Workout 7 ngày
              </Text>
            </View>

            {/* Workout Days Chart */}
            <View className="mb-6 items-center">
              <BarChart
                data={barData}
                barWidth={22}
                noOfSections={3}
                barBorderRadius={4}
                frontColor="#a855f7"
                yAxisThickness={0}
                xAxisThickness={0}
              />
            </View>

            {/* Workout Days Indicator */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-3">
                Ngày tập trong tuần
              </Text>
              <View className="flex-row gap-2">
                {weekWorkoutStats.map((stat, idx) => {
                  const date = new Date(stat.date);
                  const dayName = date.toLocaleDateString("vi-VN", {
                    weekday: "short",
                  });
                  return (
                    <View key={idx} className="flex-1 items-center">
                      <View
                        className={`w-10 h-10 rounded-xl items-center justify-center mb-1 ${
                          stat.workoutCompleted
                            ? "bg-purple-500"
                            : "bg-gray-100"
                        }`}
                      >
                        {stat.workoutCompleted ? (
                          <CheckCircle color="white" size={20} />
                        ) : (
                          <Text className="text-lg font-bold text-gray-400">
                            {date.getDate()}
                          </Text>
                        )}
                      </View>
                      <Text className="text-xs text-gray-600">{dayName}</Text>
                    </View>
                  );
                })}
              </View>
            </View>
          </View>
        )}

        {/* Quick Stats */}
        <View className="flex-row gap-4 mb-6">
          <View className="bg-green-50 rounded-2xl p-4 border border-green-100 flex-1">
            <Text className="text-sm text-green-700 mb-1">Trung bình/ngày</Text>
            <Text className="text-2xl font-bold text-gray-900">
              {Math.round(weekData.reduce((sum, d) => sum + d.calories, 0) / 7)}{" "}
              kcal
            </Text>
          </View>
          <View className="bg-purple-50 rounded-2xl p-4 border border-purple-100 flex-1">
            <Text className="text-sm text-purple-700 mb-1">
              Trung bình nước
            </Text>
            <Text className="text-2xl font-bold text-gray-900">
              {Math.round(weekData.reduce((sum, d) => sum + d.water, 0) / 7)} ml
            </Text>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
