import AsyncStorage from "@react-native-async-storage/async-storage";
import { Droplet, Minus, Plus, Waves } from "lucide-react-native";
import { useEffect, useState } from "react";
import {
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import Svg, { Circle, Defs, LinearGradient, Stop } from "react-native-svg";

export default function LogWaterScreen() {
  const [todayWater, setTodayWater] = useState(0);
  const [customAmount, setCustomAmount] = useState("");
  const waterGoal = 2000; // ml

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const today = new Date().toISOString().split("T")[0];
    const stored = await AsyncStorage.getItem("healthData");
    if (stored) {
      const data = JSON.parse(stored);
      const todayData = data.find((d: any) => d.date === today);
      if (todayData?.water) {
        setTodayWater(todayData.water);
      }
    }
  };

  const saveWaterData = async (newTotal: number) => {
    const today = new Date().toISOString().split("T")[0];
    const stored = await AsyncStorage.getItem("healthData");
    const data = stored ? JSON.parse(stored) : [];
    const todayIndex = data.findIndex((d: any) => d.date === today);

    if (todayIndex >= 0) {
      data[todayIndex].water = newTotal;
    } else {
      data.push({
        date: today,
        calories: 0,
        water: newTotal,
      });
    }

    await AsyncStorage.setItem("healthData", JSON.stringify(data));
  };

  const addWater = async (amount: number) => {
    const newTotal = todayWater + amount;
    setTodayWater(newTotal);
    await saveWaterData(newTotal);
  };

  const removeWater = async (amount: number) => {
    const newTotal = Math.max(0, todayWater - amount);
    setTodayWater(newTotal);
    await saveWaterData(newTotal);
  };

  const addCustomAmount = () => {
    const amount = Number(customAmount);
    if (!amount || amount <= 0) {
      Alert.alert("Lỗi", "Vui lòng nhập số lượng hợp lệ");
      return;
    }
    addWater(amount);
    setCustomAmount("");
  };

  const waterPercent = Math.min((todayWater / waterGoal) * 100, 100);
  const glassCount = Math.floor(todayWater / 250);

  const quickAddButtons = [
    { amount: 250, label: "Cốc nhỏ", icon: "🥛" },
    { amount: 500, label: "Chai nước", icon: "🍶" },
    { amount: 330, label: "Lon nước", icon: "🥤" },
    { amount: 1000, label: "Bình 1L", icon: "💧" },
  ];

  const CIRCLE_RADIUS = 88;
  const CIRCLE_CIRCUMFERENCE = 2 * Math.PI * CIRCLE_RADIUS;
  const strokeDashoffset = CIRCLE_CIRCUMFERENCE * (1 - waterPercent / 100);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 20 }}
      >
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-gray-900">
            Log Nước Uống
          </Text>
          <Text className="text-gray-600 mt-1">
            Theo dõi lượng nước uống hôm nay
          </Text>
        </View>

        {/* Water Progress Circle */}
        <View className="bg-blue-50 rounded-3xl p-8 shadow-sm border border-blue-100 mb-6 items-center">
          <View className="relative w-48 h-48 mb-6 items-center justify-center">
            {/* SVG Circle */}
            <View
              className="absolute inset-0"
              style={{ transform: [{ rotate: "-90deg" }] }}
            >
              <Svg width="192" height="192" viewBox="0 0 192 192">
                <Defs>
                  <LinearGradient
                    id="waterGradient"
                    x1="0%"
                    y1="0%"
                    x2="100%"
                    y2="100%"
                  >
                    <Stop offset="0%" stopColor="#3b82f6" />
                    <Stop offset="100%" stopColor="#06b6d4" />
                  </LinearGradient>
                </Defs>
                <Circle
                  cx="96"
                  cy="96"
                  r={CIRCLE_RADIUS}
                  stroke="#dbeafe"
                  strokeWidth="12"
                  fill="none"
                />
                <Circle
                  cx="96"
                  cy="96"
                  r={CIRCLE_RADIUS}
                  stroke="url(#waterGradient)"
                  strokeWidth="12"
                  fill="none"
                  strokeDasharray={CIRCLE_CIRCUMFERENCE}
                  strokeDashoffset={strokeDashoffset}
                  strokeLinecap="round"
                />
              </Svg>
            </View>

            {/* Center Content */}
            <View className="items-center justify-center">
              <Waves color="#3b82f6" size={32} className="mb-2" />
              <Text className="text-4xl font-bold text-gray-900">
                {todayWater}ml
              </Text>
              <Text className="text-sm text-gray-600 mt-1">
                của {waterGoal}ml
              </Text>
              <Text className="text-2xl font-bold text-blue-600 mt-2">
                {Math.round(waterPercent)}%
              </Text>
            </View>
          </View>

          {/* Glass Counter */}
          <View className="flex-row items-center gap-4 bg-white rounded-2xl px-6 py-4 shadow-sm w-full">
            <Text className="text-4xl">🥛</Text>
            <View>
              <Text className="text-sm text-gray-600">Số cốc đã uống</Text>
              <Text className="text-2xl font-bold text-gray-900">
                {glassCount} cốc
              </Text>
            </View>
          </View>
        </View>

        {/* Quick Add Buttons */}
        <View className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 mb-6">
          <Text className="font-semibold text-gray-900 mb-4">Thêm nhanh</Text>
          <View className="flex-row flex-wrap gap-3">
            {quickAddButtons.map((button, index) => (
              <TouchableOpacity
                key={index}
                onPress={() => addWater(button.amount)}
                className="bg-blue-50 border border-blue-200 rounded-xl p-4 items-center justify-center w-[48%]"
              >
                <Text className="text-3xl mb-2">{button.icon}</Text>
                <Text className="font-medium text-gray-900">
                  {button.label}
                </Text>
                <Text className="text-sm text-blue-600 font-semibold mt-1">
                  {button.amount}ml
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>

        {/* Custom Amount */}
        <View className="bg-cyan-50 rounded-3xl p-6 shadow-sm border border-cyan-100 mb-6">
          <View className="flex-row items-center gap-2 mb-4">
            <Droplet color="#0284c7" size={20} />
            <Text className="font-semibold text-gray-900">
              Số lượng tùy chỉnh
            </Text>
          </View>

          <View className="flex-row gap-3">
            <TextInput
              keyboardType="numeric"
              value={customAmount}
              onChangeText={setCustomAmount}
              placeholder="Nhập số ml"
              className="flex-1 px-4 py-3 rounded-xl border border-cyan-200 bg-white"
            />
            <TouchableOpacity
              onPress={addCustomAmount}
              className="bg-cyan-500 px-6 py-3 rounded-xl flex-row items-center justify-center gap-2"
            >
              <Plus color="white" size={20} />
              <Text className="text-white font-semibold">Thêm</Text>
            </TouchableOpacity>
          </View>
        </View>

        {/* Quick Remove */}
        {todayWater > 0 && (
          <View className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 mb-6">
            <Text className="font-semibold text-gray-900 mb-4">Điều chỉnh</Text>
            <View className="flex-row gap-3">
              <TouchableOpacity
                onPress={() => removeWater(250)}
                className="bg-red-50 border border-red-200 rounded-xl p-4 flex-1 flex-row items-center justify-center gap-2"
              >
                <Minus color="#b91c1c" size={20} />
                <Text className="text-red-700 font-medium">Giảm 250ml</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => removeWater(500)}
                className="bg-red-50 border border-red-200 rounded-xl p-4 flex-1 flex-row items-center justify-center gap-2"
              >
                <Minus color="#b91c1c" size={20} />
                <Text className="text-red-700 font-medium">Giảm 500ml</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Tips */}
        <View className="bg-emerald-50 rounded-3xl p-6 shadow-sm border border-emerald-100 mb-6 gap-y-2">
          <Text className="font-semibold text-gray-900 mb-1">
            💡 Lời khuyên
          </Text>
          <Text className="text-sm text-gray-700">
            • Uống nước đều đặn trong ngày, không chờ khát mới uống
          </Text>
          <Text className="text-sm text-gray-700">
            • Mỗi lần uống khoảng 250ml (1 cốc)
          </Text>
          <Text className="text-sm text-gray-700">
            • Uống nước trước bữa ăn giúp tiêu hóa tốt hơn
          </Text>
          <Text className="text-sm text-gray-700">
            • Tăng lượng nước khi tập thể dục hoặc thời tiết nóng
          </Text>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
