import AsyncStorage from "@react-native-async-storage/async-storage";
import { router } from "expo-router";
import { Apple, Eye, EyeOff, Lock, Mail, User } from "lucide-react-native";
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

export default function SignupScreen() {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [confirmPassword, setConfirmPassword] = useState("");
  const [showPassword, setShowPassword] = useState(false);
  const [showConfirmPassword, setShowConfirmPassword] = useState(false);
  const [isLoading, setIsLoading] = useState(false);

  const handleSignup = async () => {
    if (!name || !email || !password || !confirmPassword) {
      alert("Vui lòng điền đầy đủ thông tin");
      return;
    }

    if (password !== confirmPassword) {
      alert("Mật khẩu xác nhận không khớp");
      return;
    }

    if (password.length < 6) {
      alert("Mật khẩu phải có ít nhất 6 ký tự");
      return;
    }

    setIsLoading(true);
    // Simulate API call
    setTimeout(async () => {
      setIsLoading(false);
      await AsyncStorage.setItem("isLoggedIn", "true");
      router.replace("/profile-setup");
    }, 1000);
  };

  const handleSocialLogin = (provider: string) => {
    alert(`Đang đăng ký với ${provider}...`);
    setTimeout(async () => {
      await AsyncStorage.setItem("isLoggedIn", "true");
      router.replace("/profile-setup");
    }, 1000);
  };

  return (
    <SafeAreaView className="flex-1 bg-purple-600">
      <ScrollView
        contentContainerStyle={{
          flexGrow: 1,
          paddingHorizontal: 24,
          justifyContent: "center",
        }}
      >
        {/* Logo/Header */}
        <View className="items-center mb-8 mt-4">
          <View className="w-20 h-20 bg-white rounded-3xl items-center justify-center mb-4 shadow-xl">
            <Text className="text-5xl">💪</Text>
          </View>
          <Text className="text-4xl font-bold text-white mb-2">
            HealthTracker
          </Text>
          <Text className="text-pink-100">Bắt đầu hành trình của bạn</Text>
        </View>

        {/* Signup Form */}
        <View className="bg-white rounded-3xl p-8 shadow-2xl mb-8">
          <Text className="text-2xl font-bold text-gray-900 mb-6">Đăng ký</Text>

          <View className="space-y-4 gap-y-4">
            {/* Name */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Họ và tên
              </Text>
              <View className="relative justify-center">
                <View className="absolute left-4 z-10 w-5 h-5 justify-center items-center">
                  <User color="#9ca3af" size={20} />
                </View>
                <TextInput
                  value={name}
                  onChangeText={setName}
                  placeholder="Nguyễn Văn A"
                  placeholderTextColor="#9ca3af"
                  className="w-full pl-12 pr-4 py-3 rounded-xl border border-gray-300 bg-white"
                />
              </View>
            </View>

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

            {/* Confirm Password */}
            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Xác nhận mật khẩu
              </Text>
              <View className="relative justify-center">
                <View className="absolute left-4 z-10 w-5 h-5 justify-center items-center">
                  <Lock color="#9ca3af" size={20} />
                </View>
                <TextInput
                  value={confirmPassword}
                  onChangeText={setConfirmPassword}
                  placeholder="••••••••"
                  placeholderTextColor="#9ca3af"
                  secureTextEntry={!showConfirmPassword}
                  className="w-full pl-12 pr-12 py-3 rounded-xl border border-gray-300 bg-white"
                />
                <TouchableOpacity
                  onPress={() => setShowConfirmPassword(!showConfirmPassword)}
                  className="absolute right-4 z-10 w-5 h-5 justify-center items-center"
                >
                  {showConfirmPassword ? (
                    <EyeOff color="#9ca3af" size={20} />
                  ) : (
                    <Eye color="#9ca3af" size={20} />
                  )}
                </TouchableOpacity>
              </View>
            </View>

            {/* Signup Button */}
            <TouchableOpacity
              onPress={handleSignup}
              disabled={isLoading}
              className="w-full bg-purple-600 mt-2 py-4 rounded-xl items-center shadow-lg"
            >
              {isLoading ? (
                <ActivityIndicator color="white" />
              ) : (
                <Text className="text-white font-semibold text-lg">
                  Đăng ký
                </Text>
              )}
            </TouchableOpacity>
          </View>

          {/* Divider */}
          <View className="flex-row items-center gap-4 my-6">
            <View className="flex-1 h-px bg-gray-300" />
            <Text className="text-sm text-gray-500">Hoặc đăng ký với</Text>
            <View className="flex-1 h-px bg-gray-300" />
          </View>

          {/* Social Signup */}
          <View className="space-y-3 gap-y-3">
            <TouchableOpacity
              onPress={() => handleSocialLogin("Google")}
              className="w-full bg-white border-2 border-gray-300 py-3 rounded-xl flex-row items-center justify-center gap-2"
            >
              <Text className="text-gray-700 font-semibold text-base">
                Đăng ký với Google
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => handleSocialLogin("Apple")}
              className="w-full bg-black py-3 rounded-xl flex-row items-center justify-center gap-2"
            >
              <Apple color="white" size={20} fill="white" />
              <Text className="text-white font-semibold text-base">
                Đăng ký với Apple
              </Text>
            </TouchableOpacity>
          </View>

          {/* Login Link */}
          <View className="mt-6 flex-row justify-center">
            <Text className="text-gray-600">Đã có tài khoản? </Text>
            <TouchableOpacity onPress={() => router.push("/login")}>
              <Text className="text-purple-600 font-semibold">
                Đăng nhập ngay
              </Text>
            </TouchableOpacity>
          </View>
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
