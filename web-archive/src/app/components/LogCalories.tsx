import { useState } from "react";
import {
  Plus,
  Flame,
  Save,
  Trash2,
  Sparkles,
  Loader2,
  Sunrise,
  Sun,
  Sunset,
  Coffee,
  Database,
  Bookmark,
  BookmarkCheck,
} from "lucide-react";
import { toast } from "sonner";

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

export function LogCalories() {
  const [inputMode, setInputMode] = useState<InputMode>("ai");
  const [selectedMeal, setSelectedMeal] =
    useState<MealType>("breakfast");
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

  const [entries, setEntries] = useState<FoodEntry[]>(() => {
    const today = new Date().toISOString().split("T")[0];
    const stored = localStorage.getItem(`foodEntries_${today}`);
    return stored ? JSON.parse(stored) : [];
  });

  const [savedFoods, setSavedFoods] = useState<SavedFood[]>(() => {
    const stored = localStorage.getItem("foodStorage");
    return stored ? JSON.parse(stored) : [];
  });

  const meals = [
    {
      id: "breakfast" as MealType,
      icon: Sunrise,
      label: "Bữa sáng",
      color: "from-yellow-500 to-orange-500",
      bgColor: "bg-yellow-50",
      borderColor: "border-yellow-200",
    },
    {
      id: "lunch" as MealType,
      icon: Sun,
      label: "Bữa trưa",
      color: "from-orange-500 to-red-500",
      bgColor: "bg-orange-50",
      borderColor: "border-orange-200",
    },
    {
      id: "dinner" as MealType,
      icon: Sunset,
      label: "Bữa tối",
      color: "from-purple-500 to-pink-500",
      bgColor: "bg-purple-50",
      borderColor: "border-purple-200",
    },
    {
      id: "snack" as MealType,
      icon: Coffee,
      label: "Bữa phụ",
      color: "from-green-500 to-teal-500",
      bgColor: "bg-green-50",
      borderColor: "border-green-200",
    },
  ];

  // AI Nutrition Analysis Function
  const fetchMacrosFromLLM = async (
    foodName: string,
  ): Promise<{ calories: number; macros: MacroNutrients }> => {
    // ============================================
    // CONFIGURATION
    // ============================================
    
    // Set to true for demo mode with intelligent mock data
    // Set to false to use real API (requires backend proxy)
    const USE_DEMO_MODE = true;
    
    // For production: Use backend API endpoint
    const BACKEND_API_URL = '/api/analyze-nutrition';
    
    // ============================================
    // DEMO MODE - Intelligent Mock Data
    // ============================================
    if (USE_DEMO_MODE) {
      // Simulate API delay
      await new Promise(resolve => setTimeout(resolve, 1000 + Math.random() * 1000));
      
      const foodKey = foodName.toLowerCase().trim();
      
      // Comprehensive Vietnamese food database
      const foodDatabase: { [key: string]: { calories: number; macros: MacroNutrients } } = {
        // Cơm (Rice dishes)
        'cơm trắng': { calories: 200, macros: { protein: 4, carbs: 45, fat: 0.5, fiber: 0.6 } },
        'cơm gà': { calories: 450, macros: { protein: 35, carbs: 52, fat: 8, fiber: 2 } },
        'cơm sườn': { calories: 550, macros: { protein: 28, carbs: 55, fat: 22, fiber: 2 } },
        'cơm chiên': { calories: 380, macros: { protein: 12, carbs: 58, fat: 12, fiber: 1.5 } },
        'cơm tấm': { calories: 520, macros: { protein: 30, carbs: 60, fat: 18, fiber: 2.5 } },
        
        // Phở & Noodles
        'phở bò': { calories: 400, macros: { protein: 20, carbs: 60, fat: 12, fiber: 2 } },
        'phở gà': { calories: 350, macros: { protein: 18, carbs: 55, fat: 8, fiber: 2 } },
        'bún bò huế': { calories: 450, macros: { protein: 22, carbs: 58, fat: 15, fiber: 3 } },
        'bún chả': { calories: 480, macros: { protein: 25, carbs: 52, fat: 18, fiber: 3 } },
        'mì xào': { calories: 420, macros: { protein: 15, carbs: 62, fat: 14, fiber: 3 } },
        'hủ tiếu': { calories: 380, macros: { protein: 18, carbs: 58, fat: 10, fiber: 2.5 } },
        
        // Bánh mì & Sandwiches
        'bánh mì': { calories: 350, macros: { protein: 15, carbs: 40, fat: 15, fiber: 3 } },
        'bánh mì thịt': { calories: 420, macros: { protein: 20, carbs: 42, fat: 18, fiber: 3 } },
        'bánh mì pate': { calories: 380, macros: { protein: 12, carbs: 45, fat: 16, fiber: 2.5 } },
        
        // Breakfast items
        'xôi': { calories: 280, macros: { protein: 6, carbs: 52, fat: 6, fiber: 2 } },
        'xôi gà': { calories: 380, macros: { protein: 18, carbs: 55, fat: 10, fiber: 2.5 } },
        'bánh cuốn': { calories: 200, macros: { protein: 8, carbs: 35, fat: 4, fiber: 1.5 } },
        'trứng chiên': { calories: 90, macros: { protein: 6, carbs: 1, fat: 7, fiber: 0 } },
        'trứng luộc': { calories: 78, macros: { protein: 6.3, carbs: 0.6, fat: 5.3, fiber: 0 } },
        'trứng ốp la': { calories: 100, macros: { protein: 7, carbs: 1, fat: 8, fiber: 0 } },
        
        // Drinks
        'cà phê sữa': { calories: 150, macros: { protein: 3, carbs: 20, fat: 6, fiber: 0 } },
        'cà phê đen': { calories: 5, macros: { protein: 0.3, carbs: 1, fat: 0, fiber: 0 } },
        'trà sữa': { calories: 350, macros: { protein: 4, carbs: 58, fat: 12, fiber: 0 } },
        'sinh tố': { calories: 200, macros: { protein: 5, carbs: 40, fat: 3, fiber: 4 } },
        'nước ép': { calories: 120, macros: { protein: 1, carbs: 30, fat: 0.3, fiber: 2 } },
        
        // Fruits
        'chuối': { calories: 105, macros: { protein: 1.3, carbs: 27, fat: 0.3, fiber: 3 } },
        'táo': { calories: 95, macros: { protein: 0.5, carbs: 25, fat: 0.3, fiber: 4.4 } },
        'cam': { calories: 62, macros: { protein: 1.2, carbs: 15, fat: 0.2, fiber: 3.1 } },
        'dưa hấu': { calories: 46, macros: { protein: 0.9, carbs: 11, fat: 0.2, fiber: 0.6 } },
        'xoài': { calories: 99, macros: { protein: 1.4, carbs: 25, fat: 0.6, fiber: 2.6 } },
        
        // Meat dishes
        'gà rán': { calories: 320, macros: { protein: 25, carbs: 15, fat: 18, fiber: 1 } },
        'gà luộc': { calories: 165, macros: { protein: 31, carbs: 0, fat: 3.6, fiber: 0 } },
        'thịt kho': { calories: 280, macros: { protein: 22, carbs: 8, fat: 18, fiber: 0.5 } },
        'cá kho': { calories: 220, macros: { protein: 28, carbs: 6, fat: 10, fiber: 0.3 } },
        
        // Vegetables
        'salad': { calories: 150, macros: { protein: 8, carbs: 12, fat: 8, fiber: 4 } },
        'rau xào': { calories: 120, macros: { protein: 4, carbs: 15, fat: 6, fiber: 5 } },
        'canh chua': { calories: 100, macros: { protein: 8, carbs: 10, fat: 4, fiber: 2 } },
        
        // Fast food
        'pizza': { calories: 285, macros: { protein: 12, carbs: 36, fat: 10, fiber: 2.5 } },
        'burger': { calories: 540, macros: { protein: 25, carbs: 45, fat: 28, fiber: 3 } },
        'sandwich': { calories: 320, macros: { protein: 18, carbs: 38, fat: 12, fiber: 3 } },
        
        // Snacks
        'khoai tây chiên': { calories: 312, macros: { protein: 3.4, carbs: 41, fat: 15, fiber: 3.8 } },
        'snack': { calories: 150, macros: { protein: 2, carbs: 18, fat: 8, fiber: 1 } },
        'bánh ngọt': { calories: 250, macros: { protein: 4, carbs: 35, fat: 11, fiber: 1.5 } },
        'yogurt': { calories: 100, macros: { protein: 5, carbs: 15, fat: 2.5, fiber: 0 } },
      };
      
      // Try to find exact match first
      if (foodDatabase[foodKey]) {
        return foodDatabase[foodKey];
      }
      
      // Try partial match
      for (const [key, value] of Object.entries(foodDatabase)) {
        if (foodKey.includes(key) || key.includes(foodKey)) {
          return value;
        }
      }
      
      // If no match, use intelligent estimation based on food type
      let estimatedCalories = 250;
      let proteinRatio = 0.15;
      let carbsRatio = 0.50;
      let fatRatio = 0.35;
      let fiberAmount = 2;
      
      // Adjust based on keywords
      if (foodKey.includes('cơm') || foodKey.includes('rice')) {
        estimatedCalories = 300;
        carbsRatio = 0.60;
        proteinRatio = 0.15;
        fatRatio = 0.25;
      } else if (foodKey.includes('phở') || foodKey.includes('bún') || foodKey.includes('noodle')) {
        estimatedCalories = 400;
        carbsRatio = 0.55;
        proteinRatio = 0.20;
      } else if (foodKey.includes('gà') || foodKey.includes('chicken')) {
        estimatedCalories = 300;
        proteinRatio = 0.35;
        carbsRatio = 0.20;
        fatRatio = 0.25;
      } else if (foodKey.includes('thịt') || foodKey.includes('meat') || foodKey.includes('beef') || foodKey.includes('pork')) {
        estimatedCalories = 350;
        proteinRatio = 0.30;
        carbsRatio = 0.15;
        fatRatio = 0.35;
      } else if (foodKey.includes('rau') || foodKey.includes('vegetable') || foodKey.includes('salad')) {
        estimatedCalories = 100;
        carbsRatio = 0.50;
        proteinRatio = 0.20;
        fatRatio = 0.15;
        fiberAmount = 5;
      }
      
      return {
        calories: estimatedCalories,
        macros: {
          protein: Math.round((estimatedCalories * proteinRatio / 4) * 10) / 10,
          carbs: Math.round((estimatedCalories * carbsRatio / 4) * 10) / 10,
          fat: Math.round((estimatedCalories * fatRatio / 9) * 10) / 10,
          fiber: fiberAmount
        }
      };
    }
    
    // ============================================
    // PRODUCTION MODE - Backend API Call
    // ============================================
    try {
      const response = await fetch(BACKEND_API_URL, {
        method: 'POST',
        headers: {
          'Content-Type': 'application/json',
        },
        body: JSON.stringify({ foodName }),
      });

      if (!response.ok) {
        const errorData = await response.json().catch(() => ({}));
        throw new Error(errorData.message || `API Error: ${response.statusText}`);
      }

      const data = await response.json();
      
      return {
        calories: Math.round(data.calories),
        macros: {
          protein: Math.round(data.protein * 10) / 10,
          carbs: Math.round(data.carbs * 10) / 10,
          fat: Math.round(data.fat * 10) / 10,
          fiber: Math.round((data.fiber || 0) * 10) / 10,
        }
      };
    } catch (error) {
      console.error('API Error:', error);
      
      throw new Error(
        'Không thể kết nối với AI. Vui lòng kiểm tra kết nối hoặc nhập thủ công.'
      );
    }
  };

  const saveEntries = (updatedEntries: FoodEntry[]) => {
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem(
      `foodEntries_${today}`,
      JSON.stringify(updatedEntries),
    );

    const stored = localStorage.getItem("healthData");
    const data = stored ? JSON.parse(stored) : [];
    const todayIndex = data.findIndex(
      (d: any) => d.date === today,
    );

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

    localStorage.setItem("healthData", JSON.stringify(data));
  };

  const saveFoodToStorage = (name: string, calories: number, macros: MacroNutrients, grams?: number) => {
    // Check if already exists
    const exists = savedFoods.some(f => f.name.toLowerCase() === name.toLowerCase());
    if (exists) {
      toast.info("Món ăn này đã có trong kho");
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
    localStorage.setItem("foodStorage", JSON.stringify(updatedStorage));
    toast.success(`Đã lưu "${name}" vào kho`);
  };

  const deleteFoodFromStorage = (id: string) => {
    const updatedStorage = savedFoods.filter(f => f.id !== id);
    setSavedFoods(updatedStorage);
    localStorage.setItem("foodStorage", JSON.stringify(updatedStorage));
    toast.success("Đã xóa khỏi kho");
  };

  const addFoodFromStorage = (savedFood: SavedFood) => {
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
    saveEntries(updatedEntries);

    toast.success(`Đã thêm "${savedFood.name}" vào ${meals.find(m => m.id === selectedMeal)?.label}`);
  };

  const handleAnalyzeFood = async () => {
    if (!foodName.trim()) {
      toast.error("Vui lòng nhập tên món ăn");
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
      saveEntries(updatedEntries);

      // Save to storage if checked
      if (saveToStorage) {
        saveFoodToStorage(foodName, nutritionData.calories, nutritionData.macros, grams ? parseFloat(grams) : undefined);
      }

      toast.success("Đã phân tích và thêm " + foodName);
      setFoodName("");
      setGrams("");
      setSaveToStorage(false);
    } catch (error) {
      toast.error(
        "Không thể phân tích món ăn. Vui lòng thử lại.",
      );
      console.error("Error analyzing food:", error);
    } finally {
      setIsAnalyzing(false);
    }
  };

  const handleManualAdd = () => {
    if (!foodName.trim()) {
      toast.error("Vui lòng nhập tên món ăn");
      return;
    }

    if (!manualCalories || Number(manualCalories) <= 0) {
      toast.error("Vui lòng nhập số calories hợp lệ");
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
    saveEntries(updatedEntries);

    // Save to storage if checked
    if (saveToStorage) {
      saveFoodToStorage(foodName, Number(manualCalories), macros, grams ? parseFloat(grams) : undefined);
    }

    toast.success("Đã thêm " + foodName);
    
    // Reset form
    setFoodName("");
    setGrams("");
    setManualCalories("");
    setManualProtein("");
    setManualCarbs("");
    setManualFat("");
    setManualFiber("");
    setSaveToStorage(false);
  };

  const handleDeleteEntry = (id: string) => {
    const updatedEntries = entries.filter((e) => e.id !== id);
    setEntries(updatedEntries);
    saveEntries(updatedEntries);
    toast.success("Đã xóa món ăn");
  };

  const totalCalories = entries.reduce(
    (sum, e) => sum + e.calories,
    0,
  );
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
    getMealEntries(mealType).reduce(
      (sum, e) => sum + e.calories,
      0,
    );

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Log Calories
          </h1>
          <p className="text-gray-600 mt-1">
            AI phân tích hoặc nhập thủ công
          </p>
        </div>
        <div className="bg-gradient-to-br from-orange-500 to-red-500 text-white rounded-2xl px-6 py-3 shadow-lg">
          <div className="text-sm opacity-90">Tổng hôm nay</div>
          <div className="text-2xl font-bold">
            {totalCalories} kcal
          </div>
        </div>
      </div>

      {/* Macro Summary */}
      {entries.length > 0 && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
          <h2 className="font-semibold text-gray-900 mb-4">
            Tổng Macro hôm nay
          </h2>
          <div className="grid grid-cols-4 gap-3">
            <div className="bg-blue-50 rounded-xl p-3 border border-blue-100">
              <div className="text-xs text-blue-700 mb-1">
                Protein
              </div>
              <div className="text-lg font-bold text-blue-900">
                {totalMacros.protein.toFixed(1)}g
              </div>
            </div>
            <div className="bg-yellow-50 rounded-xl p-3 border border-yellow-100">
              <div className="text-xs text-yellow-700 mb-1">
                Carbs
              </div>
              <div className="text-lg font-bold text-yellow-900">
                {totalMacros.carbs.toFixed(1)}g
              </div>
            </div>
            <div className="bg-purple-50 rounded-xl p-3 border border-purple-100">
              <div className="text-xs text-purple-700 mb-1">
                Fat
              </div>
              <div className="text-lg font-bold text-purple-900">
                {totalMacros.fat.toFixed(1)}g
              </div>
            </div>
            <div className="bg-green-50 rounded-xl p-3 border border-green-100">
              <div className="text-xs text-green-700 mb-1">
                Fiber
              </div>
              <div className="text-lg font-bold text-green-900">
                {totalMacros.fiber.toFixed(1)}g
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Meal Selector */}
      <div className="bg-white rounded-3xl p-4 shadow-sm border border-gray-200">
        <h2 className="font-semibold text-gray-900 mb-3 px-2">
          Chọn bữa ăn
        </h2>
        <div className="grid grid-cols-4 gap-2">
          {meals.map((meal) => {
            const Icon = meal.icon;
            const isSelected = selectedMeal === meal.id;
            const mealCalories = getMealCalories(meal.id);

            return (
              <button
                key={meal.id}
                onClick={() => setSelectedMeal(meal.id)}
                className={`p-3 rounded-xl border-2 transition-all ${
                  isSelected
                    ? `${meal.bgColor} ${meal.borderColor}`
                    : "bg-gray-50 border-gray-200 hover:bg-gray-100"
                }`}
              >
                <div
                  className={`w-10 h-10 rounded-lg bg-gradient-to-br ${meal.color} flex items-center justify-center mx-auto mb-2`}
                >
                  <Icon className="w-5 h-5 text-white" />
                </div>
                <div className="text-xs font-medium text-gray-900 text-center">
                  {meal.label}
                </div>
                {mealCalories > 0 && (
                  <div className="text-xs text-orange-600 font-semibold text-center mt-1">
                    {mealCalories} kcal
                  </div>
                )}
              </button>
            );
          })}
        </div>
      </div>

      {/* Mode Toggle */}
      <div className="bg-white rounded-3xl p-2 shadow-sm border border-gray-200 flex gap-2">
        <button
          onClick={() => setInputMode("ai")}
          className={`flex-1 py-3 px-4 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 ${
            inputMode === "ai"
              ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Sparkles className="w-5 h-5" />
          AI
        </button>
        <button
          onClick={() => setInputMode("manual")}
          className={`flex-1 py-3 px-4 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 ${
            inputMode === "manual"
              ? "bg-gradient-to-r from-orange-500 to-red-500 text-white shadow-md"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Save className="w-5 h-5" />
          Thủ công
        </button>
        <button
          onClick={() => setInputMode("storage")}
          className={`flex-1 py-3 px-4 rounded-2xl font-semibold transition-all flex items-center justify-center gap-2 ${
            inputMode === "storage"
              ? "bg-gradient-to-r from-purple-500 to-pink-500 text-white shadow-md"
              : "text-gray-600 hover:bg-gray-50"
          }`}
        >
          <Database className="w-5 h-5" />
          Kho ({savedFoods.length})
        </button>
      </div>

      {/* AI Analyze Form */}
      {inputMode === "ai" && (
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-6 shadow-sm border border-orange-100">
          <div className="flex items-center gap-2 mb-4">
            <Sparkles className="w-5 h-5 text-orange-600" />
            <h2 className="font-semibold text-gray-900">
              Phân tích món ăn với AI
            </h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên món ăn
                </label>
                <input
                  type="text"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  onKeyPress={(e) =>
                    e.key === "Enter" &&
                    !isAnalyzing &&
                    handleAnalyzeFood()
                  }
                  placeholder="Ví dụ: Cơm gà, Phở bò, Bánh mì..."
                  disabled={isAnalyzing}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Khối lượng (g)
                </label>
                <input
                  type="number"
                  value={grams}
                  onChange={(e) => setGrams(e.target.value)}
                  placeholder="100"
                  disabled={isAnalyzing}
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all disabled:bg-gray-100 disabled:cursor-not-allowed"
                  min="1"
                />
              </div>
            </div>

            {/* Save to Storage checkbox */}
            <label className="flex items-center gap-3 cursor-pointer bg-white/80 p-3 rounded-xl border border-purple-200 hover:bg-white transition-all">
              <input
                type="checkbox"
                checked={saveToStorage}
                onChange={(e) => setSaveToStorage(e.target.checked)}
                className="w-5 h-5 rounded text-purple-600 focus:ring-2 focus:ring-purple-500"
              />
              <div className="flex items-center gap-2 flex-1">
                {saveToStorage ? (
                  <BookmarkCheck className="w-5 h-5 text-purple-600" />
                ) : (
                  <Bookmark className="w-5 h-5 text-gray-400" />
                )}
                <span className="text-sm font-medium text-gray-700">
                  Lưu món ăn này vào kho để dùng lại sau
                </span>
              </div>
            </label>

            <button
              onClick={handleAnalyzeFood}
              disabled={isAnalyzing || !foodName.trim()}
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              {isAnalyzing ? (
                <>
                  <Loader2 className="w-5 h-5 animate-spin" />
                  Đang phân tích...
                </>
              ) : (
                <>
                  <Sparkles className="w-5 h-5" />
                  Phân tích và thêm vào{" "}
                  {
                    meals.find((m) => m.id === selectedMeal)
                      ?.label
                  }
                </>
              )}
            </button>

            <div className="bg-white/60 rounded-xl p-3 text-xs text-gray-600">
              <div className="flex items-center gap-2 mb-2">
                <div className="px-2 py-1 bg-green-100 text-green-700 rounded-lg font-semibold text-[10px]">
                  🎯 DEMO MODE
                </div>
                <span className="text-[10px]">Sử dụng dữ liệu thông minh</span>
              </div>
              <p>
                💡 <strong>AI sẽ tự động trích xuất:</strong>{" "}
                Calories, Protein, Carbs, Fat và Fiber từ tên
                món ăn
              </p>
              <p className="mt-2">
                🚀 <strong>Production:</strong> Xem file{" "}
                <code className="bg-orange-200 px-1 rounded">
                  BACKEND_API_SETUP.md
                </code>{" "}
                để setup API thật
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Manual Input Form */}
      {inputMode === "manual" && (
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-6 shadow-sm border border-orange-100">
          <div className="flex items-center gap-2 mb-4">
            <Save className="w-5 h-5 text-orange-600" />
            <h2 className="font-semibold text-gray-900">
              Nhập thông tin thủ công
            </h2>
          </div>

          <div className="space-y-4">
            <div className="grid grid-cols-3 gap-3">
              <div className="col-span-2">
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Tên món ăn *
                </label>
                <input
                  type="text"
                  value={foodName}
                  onChange={(e) => setFoodName(e.target.value)}
                  placeholder="Ví dụ: Cơm gà, Phở bò, Bánh mì..."
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Khối lượng (g)
                </label>
                <input
                  type="number"
                  value={grams}
                  onChange={(e) => setGrams(e.target.value)}
                  placeholder="100"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
                  min="1"
                />
              </div>
            </div>

            <div>
              <label className="block text-sm font-medium text-gray-700 mb-2">
                Calories (kcal) *
              </label>
              <input
                type="number"
                value={manualCalories}
                onChange={(e) =>
                  setManualCalories(e.target.value)
                }
                placeholder="Nhập số calories"
                className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-orange-500 focus:border-transparent outline-none transition-all"
              />
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Protein (g)
                </label>
                <input
                  type="number"
                  value={manualProtein}
                  onChange={(e) =>
                    setManualProtein(e.target.value)
                  }
                  placeholder="0"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-blue-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Carbs (g)
                </label>
                <input
                  type="number"
                  value={manualCarbs}
                  onChange={(e) =>
                    setManualCarbs(e.target.value)
                  }
                  placeholder="0"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-yellow-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            <div className="grid grid-cols-2 gap-3">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fat (g)
                </label>
                <input
                  type="number"
                  value={manualFat}
                  onChange={(e) => setManualFat(e.target.value)}
                  placeholder="0"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-purple-500 focus:border-transparent outline-none transition-all"
                />
              </div>
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Fiber (g)
                </label>
                <input
                  type="number"
                  value={manualFiber}
                  onChange={(e) =>
                    setManualFiber(e.target.value)
                  }
                  placeholder="0"
                  className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:ring-2 focus:ring-green-500 focus:border-transparent outline-none transition-all"
                />
              </div>
            </div>

            {/* Save to Storage checkbox */}
            <label className="flex items-center gap-3 cursor-pointer bg-white/80 p-3 rounded-xl border border-purple-200 hover:bg-white transition-all">
              <input
                type="checkbox"
                checked={saveToStorage}
                onChange={(e) => setSaveToStorage(e.target.checked)}
                className="w-5 h-5 rounded text-purple-600 focus:ring-2 focus:ring-purple-500"
              />
              <div className="flex items-center gap-2 flex-1">
                {saveToStorage ? (
                  <BookmarkCheck className="w-5 h-5 text-purple-600" />
                ) : (
                  <Bookmark className="w-5 h-5 text-gray-400" />
                )}
                <span className="text-sm font-medium text-gray-700">
                  Lưu món ăn này vào kho để dùng lại sau
                </span>
              </div>
            </label>

            <button
              onClick={handleManualAdd}
              disabled={
                !foodName.trim() ||
                !manualCalories ||
                Number(manualCalories) <= 0
              }
              className="w-full bg-gradient-to-r from-orange-500 to-red-500 text-white py-3 rounded-xl font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all disabled:opacity-50 disabled:cursor-not-allowed"
            >
              <Plus className="w-5 h-5" />
              Thêm vào{" "}
              {meals.find((m) => m.id === selectedMeal)?.label}
            </button>

            <div className="bg-white/60 rounded-xl p-3 text-xs text-gray-600">
              <p>
                💡 <strong>Lưu ý:</strong> Tên món ăn và
                Calories là bắt buộc. Các macro khác có thể bỏ
                trống.
              </p>
            </div>
          </div>
        </div>
      )}

      {/* Food Storage */}
      {inputMode === "storage" && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-6 shadow-sm border border-purple-100">
          <div className="flex items-center gap-2 mb-4">
            <Database className="w-5 h-5 text-purple-600" />
            <h2 className="font-semibold text-gray-900">
              Kho món ăn đã lưu
            </h2>
          </div>

          {savedFoods.length === 0 ? (
            <div className="text-center py-12">
              <Database className="w-16 h-16 text-gray-300 mx-auto mb-4" />
              <p className="text-gray-600 mb-2">Kho của bạn đang trống</p>
              <p className="text-sm text-gray-500">
                Khi thêm món ăn, chọn "Lưu vào kho" để sử dụng lại sau
              </p>
            </div>
          ) : (
            <div className="space-y-3">
              <p className="text-sm text-gray-600 mb-4">
                Chọn món ăn để thêm vào <strong>{meals.find(m => m.id === selectedMeal)?.label}</strong>
              </p>
              {savedFoods.map((food) => (
                <div
                  key={food.id}
                  className="bg-white rounded-xl p-4 border border-purple-200 hover:border-purple-400 transition-all group"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <h3 className="font-semibold text-gray-900 mb-1">
                        {food.name}
                      </h3>
                      <div className="flex items-center gap-2 text-sm text-gray-600">
                        {food.grams && (
                          <span className="text-xs bg-gray-100 px-2 py-1 rounded-lg font-medium">
                            {food.grams}g
                          </span>
                        )}
                        <Flame className="w-4 h-4 text-orange-500" />
                        <span className="font-semibold text-orange-600">
                          {food.calories} kcal
                        </span>
                      </div>
                    </div>
                    <button
                      onClick={() => deleteFoodFromStorage(food.id)}
                      className="p-2 text-gray-400 hover:text-red-500 hover:bg-red-50 rounded-lg transition-all"
                      title="Xóa khỏi kho"
                    >
                      <Trash2 className="w-4 h-4" />
                    </button>
                  </div>

                  {/* Macros */}
                  <div className="grid grid-cols-4 gap-2 mb-3">
                    <div className="bg-blue-50 rounded-lg p-2 border border-blue-100">
                      <div className="text-[10px] text-blue-700">Protein</div>
                      <div className="text-sm font-bold text-blue-900">
                        {food.macros.protein.toFixed(1)}g
                      </div>
                    </div>
                    <div className="bg-yellow-50 rounded-lg p-2 border border-yellow-100">
                      <div className="text-[10px] text-yellow-700">Carbs</div>
                      <div className="text-sm font-bold text-yellow-900">
                        {food.macros.carbs.toFixed(1)}g
                      </div>
                    </div>
                    <div className="bg-purple-50 rounded-lg p-2 border border-purple-100">
                      <div className="text-[10px] text-purple-700">Fat</div>
                      <div className="text-sm font-bold text-purple-900">
                        {food.macros.fat.toFixed(1)}g
                      </div>
                    </div>
                    <div className="bg-green-50 rounded-lg p-2 border border-green-100">
                      <div className="text-[10px] text-green-700">Fiber</div>
                      <div className="text-sm font-bold text-green-900">
                        {(food.macros.fiber || 0).toFixed(1)}g
                      </div>
                    </div>
                  </div>

                  {/* Add button */}
                  <button
                    onClick={() => addFoodFromStorage(food)}
                    className="w-full bg-gradient-to-r from-purple-500 to-pink-500 text-white py-2.5 rounded-lg font-semibold flex items-center justify-center gap-2 hover:shadow-lg transition-all group-hover:scale-[1.02]"
                  >
                    <Plus className="w-4 h-4" />
                    Thêm vào {meals.find(m => m.id === selectedMeal)?.label}
                  </button>
                </div>
              ))}
            </div>
          )}

          <div className="bg-white/60 rounded-xl p-3 text-xs text-gray-600 mt-4">
            <p>
              💡 <strong>Mẹo:</strong> Các món ăn được lưu trong kho sẽ giữ nguyên thông tin macro. 
              Bạn có thể sử dụng lại nhiều lần mà không cần phân tích hoặc nhập lại.
            </p>
          </div>
        </div>
      )}

      {/* Meals List */}
      {meals.map((meal) => {
        const mealEntries = getMealEntries(meal.id);
        const Icon = meal.icon;

        if (mealEntries.length === 0) return null;

        return (
          <div
            key={meal.id}
            className={`bg-white rounded-3xl p-6 shadow-sm border-2 ${meal.borderColor}`}
          >
            <div className="flex items-center gap-2 mb-4">
              <div
                className={`w-10 h-10 rounded-lg bg-gradient-to-br ${meal.color} flex items-center justify-center`}
              >
                <Icon className="w-5 h-5 text-white" />
              </div>
              <div className="flex-1">
                <h2 className="font-semibold text-gray-900">
                  {meal.label}
                </h2>
                <p className="text-sm text-gray-600">
                  {getMealCalories(meal.id)} kcal
                </p>
              </div>
            </div>

            <div className="space-y-3">
              {mealEntries.map((entry) => (
                <div
                  key={entry.id}
                  className="bg-gray-50 rounded-xl p-4 border border-gray-200"
                >
                  <div className="flex items-start justify-between mb-3">
                    <div className="flex-1">
                      <div className="font-medium text-gray-900 flex items-center gap-2">
                        <span>{entry.name}</span>
                        {entry.grams && (
                          <span className="text-xs bg-blue-100 text-blue-700 px-2 py-0.5 rounded-lg font-semibold">
                            {entry.grams}g
                          </span>
                        )}
                      </div>
                      <div className="text-sm text-gray-600">
                        {entry.time}
                      </div>
                    </div>
                    <div className="flex items-center gap-3">
                      <div className="text-right">
                        <div className="font-bold text-orange-600">
                          {entry.calories} kcal
                        </div>
                      </div>
                      <button
                        onClick={() =>
                          handleDeleteEntry(entry.id)
                        }
                        className="text-red-500 hover:bg-red-50 p-2 rounded-lg transition-colors"
                      >
                        <Trash2 className="w-4 h-4" />
                      </button>
                    </div>
                  </div>

                  <div className="grid grid-cols-4 gap-2">
                    <div className="bg-blue-100 rounded-lg p-2 text-center">
                      <div className="text-xs text-blue-700">
                        Protein
                      </div>
                      <div className="text-sm font-bold text-blue-900">
                        {entry.macros.protein}g
                      </div>
                    </div>
                    <div className="bg-yellow-100 rounded-lg p-2 text-center">
                      <div className="text-xs text-yellow-700">
                        Carbs
                      </div>
                      <div className="text-sm font-bold text-yellow-900">
                        {entry.macros.carbs}g
                      </div>
                    </div>
                    <div className="bg-purple-100 rounded-lg p-2 text-center">
                      <div className="text-xs text-purple-700">
                        Fat
                      </div>
                      <div className="text-sm font-bold text-purple-900">
                        {entry.macros.fat}g
                      </div>
                    </div>
                    <div className="bg-green-100 rounded-lg p-2 text-center">
                      <div className="text-xs text-green-700">
                        Fiber
                      </div>
                      <div className="text-sm font-bold text-green-900">
                        {entry.macros.fiber || 0}g
                      </div>
                    </div>
                  </div>
                </div>
              ))}
            </div>
          </div>
        );
      })}
    </div>
  );
}