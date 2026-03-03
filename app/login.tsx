import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Apple, Eye, EyeOff, Lock, Mail } from "lucide-react-native";
import { useState } from "react";
import {
  ActivityIndicator,
  ScrollView,
  Text,
  TextInput,
  TouchableOpacity,
  View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

export default function LoginScreen() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleLogin = async () => {
    if (!email || !password) {
      alert("Vui lòng nhập email và mật khẩu");
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(async () => {
      setIsLoading(false);
      await AsyncStorage.setItem("isLoggedIn", "true");

      const hasProfile = await AsyncStorage.getItem("userProfile");
      const hasTarget = await AsyncStorage.getItem("userTarget");

      if (!hasProfile) {
        router.replace("/profile-setup");
      } else if (!hasTarget) {
        router.replace("/target-setup");
      } else {
        router.replace("/(main)/dashboard");
      }
    }, 1000);
  };

  const handleSocialLogin = (provider: string) => {
    alert(`Đang đăng nhập với ${provider}...`);
    setTimeout(async () => {
      await AsyncStorage.setItem("isLoggedIn", "true");
      router.replace("/(main)/dashboard");
    }, 1000);
  };

  return (
    <SafeAreaView className="flex-1 bg-blue-600">
      <View className="flex-1 justify-center px-6">
        {/* Logo/Header */}
        <View className="items-center mb-8">
          <View className="w-20 h-20 bg-white rounded-3xl items-center justify-center mb-4 shadow-xl">
            <Text className="text-5xl">🫩</Text>
          </View>
          <Text className="text-4xl font-bold text-white mb-2">
            Fitness Tracker
          </Text>
          <Text className="text-blue-100">Ăn tập cho đàng hoàng một tí</Text>
        </View>

        {/* Login Form */}
        <ScrollView
          keyboardDismissMode="on-drag"
          keyboardShouldPersistTaps="handled"
        >
          <View className="bg-white rounded-3xl p-8 shadow-2xl">
            <Text className="text-2xl font-bold text-gray-900 mb-6">
              Đăng nhập
            </Text>

            <View className="space-y-4 gap-y-4">
              {/* Email */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Email
                </Text>
                <View className="relative justify-center">
                  <View className="absolute left-4 z-10 w-5 h-5 justify-center items-center">
                    <Mail color="#9ca3af" size={20} />
                  </View>
                  <TextInput
                    value={email}
                    onChangeText={setEmail}
                    placeholder="your.email@example.com"
                    placeholderTextColor="#9ca3af"
                    keyboardType="email-address"
                    autoCapitalize="none"
                    className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 bg-white"
                  />
                </View>
              </View>

              {/* Password */}
              <View>
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Mật khẩu
                </Text>
                <View className="relative justify-center">
                  <View className="absolute left-4 z-10 w-5 h-5 justify-center items-center">
                    <Lock color="#9ca3af" size={20} />
                  </View>
                  <TextInput
                    value={password}
                    onChangeText={setPassword}
                    placeholder="••••••••"
                    placeholderTextColor="#9ca3af"
                    secureTextEntry={!showPassword}
                    className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-300 bg-white"
                  />
                  <TouchableOpacity
                    onPress={() => setShowPassword(!showPassword)}
                    className="absolute right-4 z-10 w-5 h-5 justify-center items-center"
                  >
                    {showPassword ? (
                      <EyeOff color="#9ca3af" size={20} />
                    ) : (
                      <Eye color="#9ca3af" size={20} />
                    )}
                  </TouchableOpacity>
                </View>
              </View>
              {/* Forgot Password */}
              <View className="items-end">
                <TouchableOpacity>
                  <Text className="text-sm text-blue-600 font-medium pb-2">
                    Quên mật khẩu?
                  </Text>
                </TouchableOpacity>
              </View>

              {/* Login Button */}
              <TouchableOpacity
                onPress={handleLogin}
                disabled={isLoading}
                className="w-full bg-blue-600 py-4 rounded-xl items-center shadow-lg"
              >
                {isLoading ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <Text className="text-white font-semibold text-lg">
                    Đăng nhập
                  </Text>
                )}
              </TouchableOpacity>
            </View>

            {/* Divider */}
            <View className="flex-row items-center gap-4 my-6">
              <View className="flex-1 h-px bg-gray-300" />
              <Text className="text-sm text-gray-500">Hoặc tiếp tục với</Text>
              <View className="flex-1 h-px bg-gray-300" />
            </View>

            {/* Social Login */}
            <View className="space-y-3 gap-y-3">
              <TouchableOpacity
                onPress={() => handleSocialLogin("Google")}
                className="w-full bg-white border-2 border-gray-300 py-3 rounded-xl flex-row items-center justify-center gap-2"
              >
                <Text className="text-gray-700 font-semibold text-base">
                  Tiếp tục với Google
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={() => handleSocialLogin("Apple")}
                className="w-full bg-black py-3 rounded-xl flex-row items-center justify-center gap-2"
              >
                <Apple color="white" size={20} fill="white" />
                <Text className="text-white font-semibold text-base">
                  Tiếp tục với Apple
                </Text>
              </TouchableOpacity>
            </View>

            {/* Sign Up Link */}
            <View className="mt-6 flex-row justify-center">
              <Text className="text-gray-600">Chưa có tài khoản? </Text>
              <TouchableOpacity onPress={() => router.push("/signup")}>
                <Text className="text-blue-600 font-semibold">
                  Đăng ký ngay
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </ScrollView>
      </View>
    </SafeAreaView>
  );
}
