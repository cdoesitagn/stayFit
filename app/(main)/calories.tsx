import AsyncStorage from "@react-native-async-storage/async-storage";
import {
    Bookmark,
    BookmarkCheck,
    Coffee,
    Database,
    Plus,
    Save,
    Sparkles,
    Sun,
    Sunrise,
    Sunset,
    Trash2,
} from "lucide-react-native";
import { useEffect, useState } from "react";
import {
    ActivityIndicator,
    Alert,
    ScrollView,
    Text,
    TextInput,
    TouchableOpacity,
    View,
} from "react-native";
import { SafeAreaView } from "react-native-safe-area-context";

interface MacroNutrients {
  protein: number;
  carbs: number;
  fat: number;
  fiber?: number;
}

interface FoodEntry {
  id: string;
  name: string;
  calories: number;
  macros: MacroNutrients;
  grams?: number;
  time: string;
  meal: MealType;
}

interface SavedFood {
  id: string;
  name: string;
  calories: number;
  macros: MacroNutrients;
  grams?: number;
  createdAt: string;
}

type MealType = "breakfast" | "lunch" | "dinner" | "snack";
type InputMode = "ai" | "manual" | "storage";

export default function LogCaloriesScreen() {
  const [inputMode, setInputMode] = useState<InputMode>("ai");
  const [selectedMeal, setSelectedMeal] = useState<MealType>("breakfast");
  const [foodName, setFoodName] = useState("");
  const [grams, setGrams] = useState("");
  const [isAnalyzing, setIsAnalyzing] = useState(false);
  const [saveToStorage, setSaveToStorage] = useState(false);

  // Manual input fields
  const [manualCalories, setManualCalories] = useState("");
  const [manualProtein, setManualProtein] = useState("");
  const [manualCarbs, setManualCarbs] = useState("");
  const [manualFat, setManualFat] = useState("");
  const [manualFiber, setManualFiber] = useState("");

  const [entries, setEntries] = useState<FoodEntry[]>([]);
  const [savedFoods, setSavedFoods] = useState<SavedFood[]>([]);

  useEffect(() => {
    loadData();
  }, []);

  const loadData = async () => {
    const today = new Date().toISOString().split("T")[0];
    const storedEntries = await AsyncStorage.getItem(`foodEntries_${today}`);
    if (storedEntries) setEntries(JSON.parse(storedEntries));

    const storedFoods = await AsyncStorage.getItem("foodStorage");
    if (storedFoods) setSavedFoods(JSON.parse(storedFoods));
  };

  const meals = [
    {
      id: "breakfast" as MealType,
      icon: Sunrise,
      label: "Bữa sáng",
      color: ["#eab308", "#f97316"],
      bgColor: "#fefce8",
      borderColor: "#fef08a",
    },
    {
      id: "lunch" as MealType,
      icon: Sun,
      label: "Bữa trưa",
      color: ["#f97316", "#ef4444"],
      bgColor: "#fff7ed",
      borderColor: "#fed7aa",
    },
    {
      id: "dinner" as MealType,
      icon: Sunset,
      label: "Bữa tối",
      color: ["#a855f7", "#ec4899"],
      bgColor: "#faf5ff",
      borderColor: "#e9d5ff",
    },
    {
      id: "snack" as MealType,
      icon: Coffee,
      label: "Bữa phụ",
      color: ["#22c55e", "#14b8a6"],
      bgColor: "#f0fdf4",
      borderColor: "#bbf7d0",
    },
  ];

  // AI Nutrition Analysis Function
  const fetchMacrosFromLLM = async (
    foodName: string,
  ): Promise<{ calories: number; macros: MacroNutrients }> => {
    // Simulator mock data
    await new Promise((resolve) =>
      setTimeout(resolve, 1000 + Math.random() * 1000),
    );

    const foodKey = foodName.toLowerCase().trim();

    const foodDatabase: {
      [key: string]: { calories: number; macros: MacroNutrients };
    } = {
      "cơm trắng": {
        calories: 200,
        macros: { protein: 4, carbs: 45, fat: 0.5, fiber: 0.6 },
      },
      "phở bò": {
        calories: 400,
        macros: { protein: 20, carbs: 60, fat: 12, fiber: 2 },
      },
      "bánh mì": {
        calories: 350,
        macros: { protein: 15, carbs: 40, fat: 15, fiber: 3 },
      },
      "trứng luộc": {
        calories: 78,
        macros: { protein: 6.3, carbs: 0.6, fat: 5.3, fiber: 0 },
      },
      "cà phê sữa": {
        calories: 150,
        macros: { protein: 3, carbs: 20, fat: 6, fiber: 0 },
      },
    };

    if (foodDatabase[foodKey]) return foodDatabase[foodKey];

    for (const [key, value] of Object.entries(foodDatabase)) {
      if (foodKey.includes(key) || key.includes(foodKey)) return value;
    }

    return {
      calories: 250,
      macros: {
        protein: 15,
        carbs: 30,
        fat: 10,
        fiber: 2,
      },
    };
  };

  const saveEntries = async (updatedEntries: FoodEntry[]) => {
    const today = new Date().toISOString().split("T")[0];
    await AsyncStorage.setItem(
      `foodEntries_${today}`,
      JSON.stringify(updatedEntries),
    );

    const stored = await AsyncStorage.getItem("healthData");
    const data = stored ? JSON.parse(stored) : [];
    const todayIndex = data.findIndex((d: any) => d.date === today);

    const totalCalories = updatedEntries.reduce(
      (sum, e) => sum + e.calories,
      0,
    );
    const totalMacros = updatedEntries.reduce(
      (acc, e) => ({
        protein: acc.protein + e.macros.protein,
        carbs: acc.carbs + e.macros.carbs,
        fat: acc.fat + e.macros.fat,
        fiber: (acc.fiber || 0) + (e.macros.fiber || 0),
      }),
      { protein: 0, carbs: 0, fat: 0, fiber: 0 },
    );

    if (todayIndex >= 0) {
      data[todayIndex].calories = totalCalories;
      data[todayIndex].macros = totalMacros;
    } else {
      data.push({
        date: today,
        calories: totalCalories,
        macros: totalMacros,
        water: 0,
      });
    }

    await AsyncStorage.setItem("healthData", JSON.stringify(data));
  };

  const saveFoodToStorage = async (
    name: string,
    calories: number,
    macros: MacroNutrients,
    grams?: number,
  ) => {
    const exists = savedFoods.some(
      (f) => f.name.toLowerCase() === name.toLowerCase(),
    );
    if (exists) {
      Alert.alert("Thông báo", "Món ăn này đã có trong kho");
      return;
    }

    const newSavedFood: SavedFood = {
      id: Date.now().toString(),
      name,
      calories,
      macros,
      grams,
      createdAt: new Date().toISOString(),
    };

    const updatedStorage = [...savedFoods, newSavedFood];
    setSavedFoods(updatedStorage);
    await AsyncStorage.setItem("foodStorage", JSON.stringify(updatedStorage));
    Alert.alert("Thành công", `Đã lưu "${name}" vào kho`);
  };

  const deleteFoodFromStorage = async (id: string) => {
    const updatedStorage = savedFoods.filter((f) => f.id !== id);
    setSavedFoods(updatedStorage);
    await AsyncStorage.setItem("foodStorage", JSON.stringify(updatedStorage));
  };

  const addFoodFromStorage = async (savedFood: SavedFood) => {
    const newEntry: FoodEntry = {
      id: Date.now().toString(),
      name: savedFood.name,
      calories: savedFood.calories,
      macros: savedFood.macros,
      grams: savedFood.grams,
      time: new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      meal: selectedMeal,
    };

    const updatedEntries = [...entries, newEntry];
    setEntries(updatedEntries);
    await saveEntries(updatedEntries);
    Alert.alert(
      "Thành công",
      `Đã thêm "${savedFood.name}" vào ${meals.find((m) => m.id === selectedMeal)?.label}`,
    );
  };

  const handleAnalyzeFood = async () => {
    if (!foodName.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên món ăn");
      return;
    }

    setIsAnalyzing(true);
    try {
      const nutritionData = await fetchMacrosFromLLM(foodName);

      const newEntry: FoodEntry = {
        id: Date.now().toString(),
        name: foodName,
        calories: nutritionData.calories,
        macros: nutritionData.macros,
        grams: grams ? parseFloat(grams) : undefined,
        time: new Date().toLocaleTimeString("vi-VN", {
          hour: "2-digit",
          minute: "2-digit",
        }),
        meal: selectedMeal,
      };

      const updatedEntries = [...entries, newEntry];
      setEntries(updatedEntries);
      await saveEntries(updatedEntries);

      if (saveToStorage) {
        await saveFoodToStorage(
          foodName,
          nutritionData.calories,
          nutritionData.macros,
          grams ? parseFloat(grams) : undefined,
        );
      }

      setFoodName("");
      setGrams("");
      setSaveToStorage(false);
    } catch (error) {
      Alert.alert("Lỗi", "Không thể phân tích món ăn. Vui lòng thử lại.");
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleManualAdd = async () => {
    if (!foodName.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên món ăn");
      return;
    }

    if (!manualCalories || Number(manualCalories) <= 0) {
      Alert.alert("Lỗi", "Vui lòng nhập số calories hợp lệ");
      return;
    }

    const macros = {
      protein: Number(manualProtein) || 0,
      carbs: Number(manualCarbs) || 0,
      fat: Number(manualFat) || 0,
      fiber: Number(manualFiber) || 0,
    };

    const newEntry: FoodEntry = {
      id: Date.now().toString(),
      name: foodName,
      calories: Number(manualCalories),
      macros,
      grams: grams ? parseFloat(grams) : undefined,
      time: new Date().toLocaleTimeString("vi-VN", {
        hour: "2-digit",
        minute: "2-digit",
      }),
      meal: selectedMeal,
    };

    const updatedEntries = [...entries, newEntry];
    setEntries(updatedEntries);
    await saveEntries(updatedEntries);

    if (saveToStorage) {
      await saveFoodToStorage(
        foodName,
        Number(manualCalories),
        macros,
        grams ? parseFloat(grams) : undefined,
      );
    }

    setFoodName("");
    setGrams("");
    setManualCalories("");
    setManualProtein("");
    setManualCarbs("");
    setManualFat("");
    setManualFiber("");
    setSaveToStorage(false);
  };

  const handleDeleteEntry = async (id: string) => {
    const updatedEntries = entries.filter((e) => e.id !== id);
    setEntries(updatedEntries);
    await saveEntries(updatedEntries);
  };

  const totalCalories = entries.reduce((sum, e) => sum + e.calories, 0);
  const totalMacros = entries.reduce(
    (acc, e) => ({
      protein: acc.protein + e.macros.protein,
      carbs: acc.carbs + e.macros.carbs,
      fat: acc.fat + e.macros.fat,
      fiber: (acc.fiber || 0) + (e.macros.fiber || 0),
    }),
    { protein: 0, carbs: 0, fat: 0, fiber: 0 },
  );

  const getMealEntries = (mealType: MealType) =>
    entries.filter((e) => e.meal === mealType);
  const getMealCalories = (mealType: MealType) =>
    getMealEntries(mealType).reduce((sum, e) => sum + e.calories, 0);

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView
        keyboardDismissMode="on-drag"
        keyboardShouldPersistTaps="handled"
        contentContainerStyle={{ padding: 20 }}
      >
        {/* Header */}
        <View className="flex-row items-center justify-between mb-6">
          <View>
            <Text className="text-3xl font-bold text-gray-900">
              Log Calories
            </Text>
            <Text className="text-gray-600 mt-1">
              AI phân tích hoặc nhập thủ công
            </Text>
          </View>
          <View className="bg-orange-500 rounded-2xl px-4 py-3 shadow-lg">
            <Text className="text-sm text-white opacity-90">Tổng hôm nay</Text>
            <Text className="text-2xl font-bold text-white">
              {totalCalories} kcal
            </Text>
          </View>
        </View>

        {/* Macro Summary */}
        {entries.length > 0 && (
          <View className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 mb-6">
            <Text className="font-semibold text-gray-900 mb-4">
              Tổng Macro hôm nay
            </Text>
            <View className="flex-row gap-2">
              <View className="bg-blue-50 rounded-xl p-3 border border-blue-100 flex-1">
                <Text className="text-xs text-blue-700 mb-1">Protein</Text>
                <Text className="text-lg font-bold text-blue-900">
                  {totalMacros.protein.toFixed(1)}g
                </Text>
              </View>
              <View className="bg-yellow-50 rounded-xl p-3 border border-yellow-100 flex-1">
                <Text className="text-xs text-yellow-700 mb-1">Carbs</Text>
                <Text className="text-lg font-bold text-yellow-900">
                  {totalMacros.carbs.toFixed(1)}g
                </Text>
              </View>
              <View className="bg-purple-50 rounded-xl p-3 border border-purple-100 flex-1">
                <Text className="text-xs text-purple-700 mb-1">Fat</Text>
                <Text className="text-lg font-bold text-purple-900">
                  {totalMacros.fat.toFixed(1)}g
                </Text>
              </View>
              <View className="bg-green-50 rounded-xl p-3 border border-green-100 flex-1">
                <Text className="text-xs text-green-700 mb-1">Fiber</Text>
                <Text className="text-lg font-bold text-green-900">
                  {totalMacros.fiber.toFixed(1)}g
                </Text>
              </View>
            </View>
          </View>
        )}

        {/* Meal Selector */}
        <View className="bg-white rounded-3xl p-4 shadow-sm border border-gray-200 mb-6">
          <Text className="font-semibold text-gray-900 mb-3 px-2">
            Chọn bữa ăn
          </Text>
          <View className="flex-row gap-2">
            {meals.map((meal) => {
              const Icon = meal.icon;
              const isSelected = selectedMeal === meal.id;
              const mealCalories = getMealCalories(meal.id);

              return (
                <TouchableOpacity
                  key={meal.id}
                  onPress={() => setSelectedMeal(meal.id)}
                  className={`p-2 rounded-xl border-2 flex-1 items-center ${
                    isSelected
                      ? "border-orange-300 bg-orange-50"
                      : "bg-gray-50 border-gray-200"
                  }`}
                  style={{
                    borderColor: isSelected ? meal.borderColor : "#e5e7eb",
                    backgroundColor: isSelected ? meal.bgColor : "#f9fafb",
                  }}
                >
                  <View
                    className="w-10 h-10 rounded-lg items-center justify-center mb-2"
                    style={{ backgroundColor: meal.color[0] }}
                  >
                    <Icon color="white" size={20} />
                  </View>
                  <Text className="text-xs font-medium text-gray-900 text-center">
                    {meal.label}
                  </Text>
                  {mealCalories > 0 && (
                    <Text className="text-xs text-orange-600 font-semibold text-center mt-1">
                      {mealCalories} kcal
                    </Text>
                  )}
                </TouchableOpacity>
              );
            })}
          </View>
        </View>

        {/* Mode Toggle */}
        <View className="bg-white rounded-3xl p-2 shadow-sm border border-gray-200 flex-row gap-2 mb-6">
          <TouchableOpacity
            onPress={() => setInputMode("ai")}
            className={`flex-1 py-3 px-2 rounded-2xl flex-row items-center justify-center gap-2 ${
              inputMode === "ai" ? "bg-orange-500" : "bg-transparent"
            }`}
          >
            <Sparkles
              color={inputMode === "ai" ? "white" : "#4b5563"}
              size={16}
            />
            <Text
              className={`font-semibold text-sm ${inputMode === "ai" ? "text-white" : "text-gray-600"}`}
            >
              AI
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setInputMode("manual")}
            className={`flex-1 py-3 px-2 rounded-2xl flex-row items-center justify-center gap-2 ${
              inputMode === "manual" ? "bg-orange-500" : "bg-transparent"
            }`}
          >
            <Save
              color={inputMode === "manual" ? "white" : "#4b5563"}
              size={16}
            />
            <Text
              className={`font-semibold text-sm ${inputMode === "manual" ? "text-white" : "text-gray-600"}`}
            >
              Thủ công
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setInputMode("storage")}
            className={`flex-1 py-3 px-2 rounded-2xl flex-row items-center justify-center gap-2 ${
              inputMode === "storage" ? "bg-purple-500" : "bg-transparent"
            }`}
          >
            <Database
              color={inputMode === "storage" ? "white" : "#4b5563"}
              size={16}
            />
            <Text
              className={`font-semibold text-sm ${inputMode === "storage" ? "text-white" : "text-gray-600"}`}
            >
              Kho ({savedFoods.length})
            </Text>
          </TouchableOpacity>
        </View>

        {/* Form Containers */}
        {inputMode === "ai" && (
          <View className="bg-orange-50 rounded-3xl p-6 border border-orange-100 mb-6">
            <View className="flex-row items-center gap-2 mb-4">
              <Sparkles color="#ea580c" size={20} />
              <Text className="font-semibold text-gray-900">
                Phân tích món ăn với AI
              </Text>
            </View>
            <View className="space-y-4 gap-y-4">
              <View className="flex-row gap-3">
                <View className="flex-1">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Tên món ăn
                  </Text>
                  <TextInput
                    value={foodName}
                    onChangeText={setFoodName}
                    placeholder="Cơm gà, phở bò..."
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white"
                  />
                </View>
                <View className="w-24">
                  <Text className="text-sm font-medium text-gray-700 mb-2">
                    Kl (g)
                  </Text>
                  <TextInput
                    value={grams}
                    onChangeText={setGrams}
                    placeholder="100"
                    keyboardType="numeric"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white"
                  />
                </View>
              </View>

              <TouchableOpacity
                onPress={() => setSaveToStorage(!saveToStorage)}
                className="flex-row items-center gap-2 bg-white p-3 rounded-xl border border-purple-200"
              >
                {saveToStorage ? (
                  <BookmarkCheck color="#9333ea" size={20} />
                ) : (
                  <Bookmark color="#9ca3af" size={20} />
                )}
                <Text className="text-sm font-medium text-gray-700 flex-1">
                  Lưu món ăn này vào kho để dùng lại sau
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                onPress={handleAnalyzeFood}
                disabled={isAnalyzing || !foodName.trim()}
                className={`w-full py-3 rounded-xl flex-row items-center justify-center gap-2 ${
                  isAnalyzing || !foodName.trim()
                    ? "bg-orange-300"
                    : "bg-orange-500"
                }`}
              >
                {isAnalyzing ? (
                  <ActivityIndicator color="white" />
                ) : (
                  <>
                    <Sparkles color="white" size={20} />
                    <Text className="text-white font-semibold">
                      Phân tích và thêm
                    </Text>
                  </>
                )}
              </TouchableOpacity>
            </View>
          </View>
        )}

        {inputMode === "manual" && (
          <View className="bg-orange-50 rounded-3xl p-6 border border-orange-100 mb-6 space-y-4 gap-y-4">
            <View className="flex-row items-center gap-2 mb-4">
              <Save color="#ea580c" size={20} />
              <Text className="font-semibold text-gray-900">Nhập thủ công</Text>
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Tên món ăn
                </Text>
                <TextInput
                  value={foodName}
                  onChangeText={setFoodName}
                  placeholder="Tên món"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white"
                />
              </View>
              <View className="w-24">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Gam
                </Text>
                <TextInput
                  value={grams}
                  onChangeText={setGrams}
                  placeholder="100"
                  keyboardType="numeric"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white"
                />
              </View>
            </View>

            <View>
              <Text className="text-sm font-medium text-gray-700 mb-2">
                Calories
              </Text>
              <TextInput
                value={manualCalories}
                onChangeText={setManualCalories}
                placeholder="kcal"
                keyboardType="numeric"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white"
              />
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Protein (g)
                </Text>
                <TextInput
                  value={manualProtein}
                  onChangeText={setManualProtein}
                  placeholder="0"
                  keyboardType="numeric"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white"
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Carbs (g)
                </Text>
                <TextInput
                  value={manualCarbs}
                  onChangeText={setManualCarbs}
                  placeholder="0"
                  keyboardType="numeric"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white"
                />
              </View>
            </View>

            <View className="flex-row gap-3">
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Fat (g)
                </Text>
                <TextInput
                  value={manualFat}
                  onChangeText={setManualFat}
                  placeholder="0"
                  keyboardType="numeric"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white"
                />
              </View>
              <View className="flex-1">
                <Text className="text-sm font-medium text-gray-700 mb-2">
                  Fiber (g)
                </Text>
                <TextInput
                  value={manualFiber}
                  onChangeText={setManualFiber}
                  placeholder="0"
                  keyboardType="numeric"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white"
                />
              </View>
            </View>

            <TouchableOpacity
              onPress={() => setSaveToStorage(!saveToStorage)}
              className="flex-row items-center gap-2 bg-white p-3 rounded-xl border border-purple-200"
            >
              {saveToStorage ? (
                <BookmarkCheck color="#9333ea" size={20} />
              ) : (
                <Bookmark color="#9ca3af" size={20} />
              )}
              <Text className="text-sm font-medium text-gray-700 flex-1">
                Lưu vào kho
              </Text>
            </TouchableOpacity>

            <TouchableOpacity
              onPress={handleManualAdd}
              disabled={!foodName.trim() || !manualCalories}
              className={`w-full py-3 rounded-xl flex-row items-center justify-center gap-2 ${
                !foodName.trim() || !manualCalories
                  ? "bg-orange-300"
                  : "bg-orange-500"
              }`}
            >
              <Plus color="white" size={20} />
              <Text className="text-white font-semibold">Thêm món</Text>
            </TouchableOpacity>
          </View>
        )}

        {inputMode === "storage" && (
          <View className="bg-purple-50 rounded-3xl p-6 border border-purple-100 mb-6 gap-y-3">
            <View className="flex-row items-center gap-2 mb-2">
              <Database color="#9333ea" size={20} />
              <Text className="font-semibold text-gray-900">
                Kho món ăn đã lưu
              </Text>
            </View>

            {savedFoods.map((food) => (
              <View
                key={food.id}
                className="bg-white rounded-xl p-4 border border-purple-200"
              >
                <View className="flex-row justify-between mb-3">
                  <View>
                    <Text className="font-semibold text-gray-900">
                      {food.name}
                    </Text>
                    <View className="flex-row gap-2 mt-1">
                      <Text className="text-orange-600 font-bold">
                        {food.calories} kcal
                      </Text>
                      {food.grams && (
                        <Text className="text-gray-500 bg-gray-100 px-1 rounded">
                          {food.grams}g
                        </Text>
                      )}
                    </View>
                  </View>
                  <TouchableOpacity
                    onPress={() => deleteFoodFromStorage(food.id)}
                  >
                    <Trash2 color="#ef4444" size={20} />
                  </TouchableOpacity>
                </View>
                <TouchableOpacity
                  onPress={() => addFoodFromStorage(food)}
                  className="bg-purple-500 py-2 rounded-lg items-center"
                >
                  <Text className="text-white font-semibold flex-row">
                    <Plus color="white" size={16} /> Thêm
                  </Text>
                </TouchableOpacity>
              </View>
            ))}
            {savedFoods.length === 0 && (
              <Text className="text-center text-gray-500 py-4">Kho trống</Text>
            )}
          </View>
        )}

        {/* Entries */}
        {meals.map((meal) => {
          const mealEntries = getMealEntries(meal.id);
          if (mealEntries.length === 0) return null;
          return (
            <View
              key={meal.id}
              className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200 mb-4"
            >
              <View className="flex-row items-center gap-2 mb-4">
                <Text className="font-semibold text-gray-900 flex-1">
                  {meal.label}
                </Text>
                <Text className="text-orange-600 font-bold">
                  {getMealCalories(meal.id)} kcal
                </Text>
              </View>
              <View className="gap-y-3">
                {mealEntries.map((entry) => (
                  <View
                    key={entry.id}
                    className="bg-gray-50 rounded-xl p-4 border border-gray-200 flex-row justify-between items-center"
                  >
                    <View>
                      <Text className="font-medium text-gray-900">
                        {entry.name}{" "}
                        {entry.grams && (
                          <Text className="text-xs bg-gray-200 px-1">
                            {entry.grams}g
                          </Text>
                        )}
                      </Text>
                      <Text className="text-orange-500 font-bold text-sm mt-1">
                        {entry.calories} kcal
                      </Text>
                    </View>
                    <TouchableOpacity
                      onPress={() => handleDeleteEntry(entry.id)}
                      className="p-2"
                    >
                      <Trash2 color="#ef4444" size={20} />
                    </TouchableOpacity>
                  </View>
                ))}
              </View>
            </View>
          );
        })}
      </ScrollView>
    </SafeAreaView>
  );
}
