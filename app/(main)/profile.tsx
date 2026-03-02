import AsyncStorage from "@react-native-async-storage/async-storage";
import { useRouter } from "expo-router";
import {
    Activity,
    Edit,
    LogOut,
    Ruler,
    Target,
    TrendingUp,
    User,
    Weight,
    Zap,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    ScrollView,
    Text,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function ProfileScreen() {
  const [profile, setProfile] = useState<any>(null);
  const [target, setTarget] = useState<any>(null);
  const router = useRouter();

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const profileData = await AsyncStorage.getItem("userProfile");
    const targetData = await AsyncStorage.getItem("userTarget");

    if (profileData) setProfile(JSON.parse(profileData));
    if (targetData) setTarget(JSON.parse(targetData));
  };

  const handleLogout = async () => {
    await AsyncStorage.removeItem("userToken");
    await AsyncStorage.removeItem("userProfile");
    await AsyncStorage.removeItem("userTarget");
    await AsyncStorage.removeItem("healthData");
    await AsyncStorage.removeItem("workoutPlan");
    await AsyncStorage.removeItem("workoutStats");
    router.replace("/login");
  };

  if (!profile) {
    return (
      <View className="flex-1 items-center justify-center bg-gray-50">
        <ActivityIndicator size="large" color="#ea580c" />
      </View>
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
      ? (profile.weight / Math.pow(profile.height / 100, 2)).toFixed(1)
      : null;

  const getBMICategory = (bmiValue: number) => {
    if (bmiValue < 18.5)
      return { label: "Thiếu cân", color: "#2563eb", bg: "bg-blue-50" };
    if (bmiValue < 25)
      return { label: "Bình thường", color: "#16a34a", bg: "bg-green-50" };
    if (bmiValue < 30)
      return { label: "Thừa cân", color: "#ca8a04", bg: "bg-yellow-50" };
    return { label: "Béo phì", color: "#dc2626", bg: "bg-red-50" };
  };

  return (
    <SafeAreaView className="flex-1 bg-orange-50">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <View className="flex-row items-center gap-2">
              <User color="#ea580c" size={28} />
              <Text className="text-2xl font-bold text-gray-900">
                Thông tin cá nhân
              </Text>
            </View>
            <Text className="text-sm text-gray-600 mt-1">
              Quản lý profile của bạn
            </Text>
          </View>
          <TouchableOpacity
            onPress={() => router.push("/profile-setup")}
            className="flex-row items-center gap-2 bg-orange-500 px-4 py-2 rounded-xl shadow-sm"
          >
            <Edit color="white" size={16} />
            <Text className="text-white font-semibold flex-row">Chỉnh sửa</Text>
          </TouchableOpacity>
        </View>

        {/* Profile Info Card */}
        <View className="bg-white rounded-3xl p-6 shadow-sm border border-orange-100 mb-6">
          <View className="flex-row items-center gap-4 mb-6">
            <View className="w-20 h-20 rounded-full bg-orange-500 flex items-center justify-center">
              <User color="white" size={40} />
            </View>
            <View>
              <Text className="text-2xl font-bold text-gray-900">
                {profile.name}
              </Text>
              <Text className="text-sm text-gray-600">{profile.age} tuổi</Text>
            </View>
          </View>

          {/* Stats Grid */}
          <View className="flex-row flex-wrap gap-3">
            <View className="bg-blue-50 rounded-2xl p-4 flex-1 min-w-[45%]">
              <View className="flex-row items-center gap-2 mb-2">
                <Ruler color="#2563eb" size={20} />
                <Text className="text-sm font-medium text-blue-900">
                  Chiều cao
                </Text>
              </View>
              <Text className="text-2xl font-bold text-blue-900">
                {profile.height} <Text className="text-sm font-normal">cm</Text>
              </Text>
            </View>

            <View className="bg-green-50 rounded-2xl p-4 flex-1 min-w-[45%]">
              <View className="flex-row items-center gap-2 mb-2">
                <Weight color="#16a34a" size={20} />
                <Text className="text-sm font-medium text-green-900">
                  Cân nặng
                </Text>
              </View>
              <Text className="text-2xl font-bold text-green-900">
                {profile.weight} <Text className="text-sm font-normal">kg</Text>
              </Text>
            </View>

            {bmi && (
              <View
                className={`${getBMICategory(Number(bmi)).bg} rounded-2xl p-4 flex-1 min-w-[45%]`}
              >
                <View className="flex-row items-center gap-2 mb-2">
                  <TrendingUp
                    color={getBMICategory(Number(bmi)).color}
                    size={20}
                  />
                  <Text
                    className={`text-sm font-medium`}
                    style={{ color: getBMICategory(Number(bmi)).color }}
                  >
                    BMI
                  </Text>
                </View>
                <Text
                  className={`text-2xl font-bold`}
                  style={{ color: getBMICategory(Number(bmi)).color }}
                >
                  {bmi}
                </Text>
                <Text
                  className={`text-xs mt-1`}
                  style={{ color: getBMICategory(Number(bmi)).color }}
                >
                  {getBMICategory(Number(bmi)).label}
                </Text>
              </View>
            )}

            {profile.bodyFat && (
              <View className="bg-purple-50 rounded-2xl p-4 flex-1 min-w-[45%]">
                <View className="flex-row items-center gap-2 mb-2">
                  <Activity color="#9333ea" size={20} />
                  <Text className="text-sm font-medium text-purple-900">
                    Mỡ cơ thể
                  </Text>
                </View>
                <Text className="text-2xl font-bold text-purple-900">
                  {profile.bodyFat}
                  <Text className="text-sm font-normal">%</Text>
                </Text>
              </View>
            )}
          </View>
        </View>

        {/* Activity Level */}
        <View className="bg-white rounded-3xl p-6 shadow-sm border border-orange-100 mb-6">
          <View className="flex-row items-center gap-2 mb-3">
            <Activity color="#ea580c" size={20} />
            <Text className="font-semibold text-gray-900">
              Tần suất tập luyện
            </Text>
          </View>
          <Text className="text-gray-700">
            {activityLevels[profile.activityLevel]}
          </Text>
        </View>

        {/* TDEE */}
        <View className="bg-orange-100 rounded-3xl p-6 shadow-sm border border-orange-200 mb-6">
          <View className="flex-row items-center gap-2 mb-3">
            <Zap color="#ea580c" size={20} />
            <Text className="font-semibold text-gray-900">TDEE của bạn</Text>
          </View>
          <Text className="text-4xl font-bold text-orange-600 mb-2">
            {profile.tdee}
          </Text>
          <Text className="text-sm text-gray-600">
            Calories/ngày (Tổng năng lượng tiêu hao)
          </Text>
        </View>

        {/* Target Goal */}
        {target && (
          <View className="bg-white rounded-3xl p-6 shadow-sm border border-orange-100 mb-6">
            <View className="flex-row items-center gap-2 mb-4">
              <Target color="#ea580c" size={20} />
              <Text className="font-semibold text-gray-900 flex-1">
                Mục tiêu hiện tại
              </Text>
              <TouchableOpacity onPress={() => router.push("/target-setup")}>
                <Edit color="#ea580c" size={20} />
              </TouchableOpacity>
            </View>

            <View className="gap-y-3">
              <View className="flex-row items-center justify-between p-3 bg-orange-50 rounded-xl">
                <Text className="text-sm font-medium text-gray-700">
                  Mục tiêu
                </Text>
                <Text className="font-semibold text-orange-600">
                  {goalLabels[target.goal]}
                </Text>
              </View>

              <View className="flex-row items-center justify-between p-3 bg-orange-50 rounded-xl">
                <Text className="text-sm font-medium text-gray-700">
                  Calories mục tiêu
                </Text>
                <Text className="font-semibold text-orange-600">
                  {target.targetCalories} cal/ngày
                </Text>
              </View>

              {target.targetWeight && (
                <View className="flex-row items-center justify-between p-3 bg-orange-50 rounded-xl">
                  <Text className="text-sm font-medium text-gray-700">
                    Cân nặng mục tiêu
                  </Text>
                  <Text className="font-semibold text-orange-600">
                    {target.targetWeight} kg
                  </Text>
                </View>
              )}
            </View>
          </View>
        )}

        {/* Macro Goals */}
        {target && target.macroRatios && (
          <View className="bg-white rounded-3xl p-6 shadow-sm border border-orange-100 mb-6">
            <View className="flex-row items-center gap-2 mb-4">
              <Text className="font-semibold text-gray-900">
                Tỉ lệ Macro hàng ngày
              </Text>
            </View>

            <View className="gap-y-3">
              {/* Protein */}
              <View className="p-4 bg-blue-50 rounded-xl">
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center gap-2">
                    <View className="w-3 h-3 rounded-full bg-blue-500" />
                    <Text className="text-sm font-medium text-blue-900">
                      Protein
                    </Text>
                  </View>
                  <Text className="text-xs font-semibold text-blue-700">
                    {target.macroRatios.protein}%
                  </Text>
                </View>
                <View className="flex-row items-baseline gap-2">
                  <Text className="text-2xl font-bold text-blue-900">
                    {Math.round(
                      (target.targetCalories * target.macroRatios.protein) /
                        100 /
                        4,
                    )}
                    g
                  </Text>
                  <Text className="text-sm text-blue-700">
                    (
                    {Math.round(
                      (target.targetCalories * target.macroRatios.protein) /
                        100,
                    )}{" "}
                    kcal)
                  </Text>
                </View>
              </View>

              {/* Carbs */}
              <View className="p-4 bg-yellow-50 rounded-xl">
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center gap-2">
                    <View className="w-3 h-3 rounded-full bg-yellow-500" />
                    <Text className="text-sm font-medium text-yellow-900">
                      Carbs
                    </Text>
                  </View>
                  <Text className="text-xs font-semibold text-yellow-700">
                    {target.macroRatios.carbs}%
                  </Text>
                </View>
                <View className="flex-row items-baseline gap-2">
                  <Text className="text-2xl font-bold text-yellow-900">
                    {Math.round(
                      (target.targetCalories * target.macroRatios.carbs) /
                        100 /
                        4,
                    )}
                    g
                  </Text>
                  <Text className="text-sm text-yellow-700">
                    (
                    {Math.round(
                      (target.targetCalories * target.macroRatios.carbs) / 100,
                    )}{" "}
                    kcal)
                  </Text>
                </View>
              </View>

              {/* Fat */}
              <View className="p-4 bg-purple-50 rounded-xl">
                <View className="flex-row items-center justify-between mb-2">
                  <View className="flex-row items-center gap-2">
                    <View className="w-3 h-3 rounded-full bg-purple-500" />
                    <Text className="text-sm font-medium text-purple-900">
                      Fat
                    </Text>
                  </View>
                  <Text className="text-xs font-semibold text-purple-700">
                    {target.macroRatios.fat}%
                  </Text>
                </View>
                <View className="flex-row items-baseline gap-2">
                  <Text className="text-2xl font-bold text-purple-900">
                    {Math.round(
                      (target.targetCalories * target.macroRatios.fat) /
                        100 /
                        9,
                    )}
                    g
                  </Text>
                  <Text className="text-sm text-purple-700">
                    (
                    {Math.round(
                      (target.targetCalories * target.macroRatios.fat) / 100,
                    )}{" "}
                    kcal)
                  </Text>
                </View>
              </View>
            </View>

            <View className="mt-4 p-3 bg-purple-50 rounded-xl border border-purple-200">
              <Text className="text-xs text-gray-600 text-center">
                💡 Mẹo: Duy trì tỉ lệ macro này để đạt mục tiêu tốt nhất
              </Text>
            </View>
          </View>
        )}

        {/* Last Updated */}
        {profile.updatedAt && (
          <Text className="text-xs text-center text-gray-500 mb-6">
            Cập nhật lần cuối:{" "}
            {new Date(profile.updatedAt).toLocaleDateString("vi-VN", {
              year: "numeric",
              month: "long",
              day: "numeric",
              hour: "2-digit",
              minute: "2-digit",
            })}
          </Text>
        )}

        {/* Logout Button */}
        <TouchableOpacity
          onPress={handleLogout}
          className="w-full bg-red-500 py-4 rounded-2xl flex-row items-center justify-center gap-2 mb-10 shadow-sm"
        >
          <LogOut color="white" size={20} />
          <Text className="text-white font-semibold flex-row">Đăng xuất</Text>
        </TouchableOpacity>
      </ScrollView>
    </SafeAreaView>
  );
}
