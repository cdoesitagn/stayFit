import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import {
    Activity,
    Calendar,
    Ruler,
    User,
    Weight,
    Zap,
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

export default function ProfileSetupScreen() {
  const [name, setName] = useState("");
  const [age, setAge] = useState("");
  const [height, setHeight] = useState("");
  const [weight, setWeight] = useState("");
  const [bodyFat, setBodyFat] = useState("");
  const [activityLevel, setActivityLevel] = useState("");
  const [tdee, setTdee] = useState("");

  const activityLevels = [
    {
      value: "sedentary",
      label: "Ít vận động (1-2 ngày/tuần)",
      multiplier: 1.2,
    },
    { value: "light", label: "Nhẹ (3-4 ngày/tuần)", multiplier: 1.375 },
    {
      value: "moderate",
      label: "Trung bình (5-6 ngày/tuần)",
      multiplier: 1.55,
    },
    { value: "active", label: "Nặng (6-7 ngày/tuần)", multiplier: 1.725 },
    { value: "very_active", label: "Rất nặng (2x mỗi ngày)", multiplier: 1.9 },
  ];

  const calculateTDEE = () => {
    if (!weight || !height || !age || !activityLevel) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin để tính TDEE");
      return;
    }

    const weightNum = Number(weight);
    const heightNum = Number(height);
    const ageNum = Number(age);

    // BMR = 10 × weight(kg) + 6.25 × height(cm) − 5 × age(y) + 5 (for men)
    const bmr = 10 * weightNum + 6.25 * heightNum - 5 * ageNum + 5;

    const selectedActivity = activityLevels.find(
      (level) => level.value === activityLevel,
    );
    const calculatedTDEE = Math.round(
      bmr * (selectedActivity?.multiplier || 1.2),
    );

    setTdee(calculatedTDEE.toString());
    Alert.alert("Thành công", "TDEE đã được tính toán!");
  };

  const handleSubmit = async () => {
    if (!name || !age || !height || !weight || !activityLevel || !tdee) {
      Alert.alert("Lỗi", "Vui lòng điền đầy đủ thông tin bắt buộc");
      return;
    }

    const profile = {
      name,
      age: Number(age),
      height: Number(height),
      weight: Number(weight),
      bodyFat: bodyFat ? Number(bodyFat) : null,
      activityLevel,
      tdee: Number(tdee),
    };

    await AsyncStorage.setItem("userProfile", JSON.stringify(profile));
    router.replace("/target-setup");
  };

  return (
    <SafeAreaView className="flex-1 bg-green-600">
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 24,
          paddingVertical: 40,
        }}
      >
        {/* Header */}
        <View className="items-center mb-8">
          <View className="w-20 h-20 bg-white rounded-3xl items-center justify-center mb-4 shadow-xl">
            <User color="#16a34a" size={40} />
          </View>
          <Text className="text-4xl font-bold text-white mb-2 text-center">
            Thiết lập hồ sơ
          </Text>
          <Text className="text-green-100 text-center">
            Giúp chúng tôi hiểu bạn hơn
          </Text>
        </View>

        {/* Form */}
        <View className="bg-white rounded-3xl p-8 shadow-2xl space-y-4 gap-y-4">
          {/* Name */}
          <View>
            <View className="flex-row items-center gap-2 mb-2">
              <User color="#374151" size={16} />
              <Text className="text-sm font-medium text-gray-700">
                Họ và tên *
              </Text>
            </View>
            <TextInput
              value={name}
              onChangeText={setName}
              placeholder="Nguyễn Văn A"
              placeholderTextColor="#9ca3af"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white"
            />
          </View>

          {/* Age */}
          <View>
            <View className="flex-row items-center gap-2 mb-2">
              <Calendar color="#374151" size={16} />
              <Text className="text-sm font-medium text-gray-700">Tuổi *</Text>
            </View>
            <TextInput
              value={age}
              onChangeText={setAge}
              placeholder="25"
              placeholderTextColor="#9ca3af"
              keyboardType="number-pad"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white"
            />
          </View>

          {/* Height & Weight */}
          <View className="flex-row gap-4">
            <View className="flex-1">
              <View className="flex-row items-center gap-2 mb-2">
                <Ruler color="#374151" size={16} />
                <Text className="text-sm font-medium text-gray-700">
                  Chiều cao (cm) *
                </Text>
              </View>
              <TextInput
                value={height}
                onChangeText={setHeight}
                placeholder="170"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white"
              />
            </View>
            <View className="flex-1">
              <View className="flex-row items-center gap-2 mb-2">
                <Weight color="#374151" size={16} />
                <Text className="text-sm font-medium text-gray-700">
                  Cân nặng (kg) *
                </Text>
              </View>
              <TextInput
                value={weight}
                onChangeText={setWeight}
                placeholder="70"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white"
              />
            </View>
          </View>

          {/* Body Fat */}
          <View>
            <Text className="text-sm font-medium text-gray-700 mb-2">
              Body Fat (%) - Tùy chọn
            </Text>
            <TextInput
              value={bodyFat}
              onChangeText={setBodyFat}
              placeholder="15"
              placeholderTextColor="#9ca3af"
              keyboardType="numeric"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white"
            />
          </View>

          {/* Activity Level - Simplified for React Native using generic buttons simulating options */}
          <View>
            <View className="flex-row items-center gap-2 mb-2">
              <Activity color="#374151" size={16} />
              <Text className="text-sm font-medium text-gray-700">
                Tần suất tập thể dục *
              </Text>
            </View>
            <View className="gap-2">
              {activityLevels.map((level) => (
                <TouchableOpacity
                  key={level.value}
                  onPress={() => setActivityLevel(level.value)}
                  className={`w-full px-4 py-3 rounded-xl border ${activityLevel === level.value ? "border-green-600 bg-green-50" : "border-gray-300 bg-white"}`}
                >
                  <Text
                    className={
                      activityLevel === level.value
                        ? "text-green-700 font-semibold"
                        : "text-gray-700"
                    }
                  >
                    {level.label}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          </View>

          {/* TDEE */}
          <View>
            <View className="flex-row items-center gap-2 mb-2">
              <Zap color="#374151" size={16} />
              <Text className="text-sm font-medium text-gray-700">
                TDEE (Năng lượng tiêu hao)
              </Text>
            </View>
            <View className="flex-row gap-2">
              <TextInput
                value={tdee}
                onChangeText={setTdee}
                placeholder="2000"
                placeholderTextColor="#9ca3af"
                keyboardType="numeric"
                className="flex-1 px-4 py-3 rounded-xl border border-gray-300 bg-white"
              />
              <TouchableOpacity
                onPress={calculateTDEE}
                className="px-6 justify-center bg-green-500 rounded-xl shadow-sm"
              >
                <Text className="text-white font-semibold">Tính TDEE</Text>
              </TouchableOpacity>
            </View>
            <Text className="text-xs text-gray-500 mt-2">
              Calories cơ thể bạn cần mỗi ngày để duy trì cân nặng
            </Text>
          </View>

          {/* Submit Button */}
          <TouchableOpacity
            onPress={handleSubmit}
            className="w-full bg-green-600 py-4 rounded-xl items-center shadow-lg mt-4"
          >
            <Text className="text-white font-semibold text-lg">Tiếp tục</Text>
          </TouchableOpacity>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
