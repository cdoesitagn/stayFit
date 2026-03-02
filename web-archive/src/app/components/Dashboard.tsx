import { useEffect, useState } from 'react';
import { Droplet, Flame, TrendingUp, Calendar, Dumbbell, CheckCircle } from 'lucide-react';
import { ProgressChart } from './ProgressChart';
import { PieChart, Pie, Cell, ResponsiveContainer, Legend, Tooltip, BarChart, Bar, XAxis, YAxis, CartesianGrid } from 'recharts';

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

export function Dashboard() {
  const [todayData, setTodayData] = useState<DayData>({ date: '', calories: 0, water: 0, macros: { protein: 0, carbs: 0, fat: 0, fiber: 0 } });
  const [weekData, setWeekData] = useState<DayData[]>([]);
  const [workoutStats, setWorkoutStats] = useState<WorkoutStats | null>(null);
  const [weekWorkoutStats, setWeekWorkoutStats] = useState<WorkoutStats[]>([]);
  const [calorieGoal, setCalorieGoal] = useState(2000);
  const [waterGoal] = useState(2000); // ml
  const [macroGoals, setMacroGoals] = useState({ protein: 0, carbs: 0, fat: 0 });

  useEffect(() => {
    loadData();
    loadWorkoutStats();
    loadTargetData();
  }, []);

  const loadTargetData = () => {
    const targetStr = localStorage.getItem('userTarget');
    if (targetStr) {
      const target = JSON.parse(targetStr);
      setCalorieGoal(target.targetCalories || 2000);
      
      if (target.macroRatios) {
        const { protein, carbs, fat } = target.macroRatios;
        const calories = target.targetCalories;
        setMacroGoals({
          protein: Math.round((calories * protein / 100) / 4),
          carbs: Math.round((calories * carbs / 100) / 4),
          fat: Math.round((calories * fat / 100) / 9),
        });
      }
    }
  };

  const loadData = () => {
    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem('healthData');
    
    if (stored) {
      const data = JSON.parse(stored);
      const todayEntry = data.find((d: DayData) => d.date === today) || { date: today, calories: 0, water: 0, macros: { protein: 0, carbs: 0, fat: 0, fiber: 0 } };
      setTodayData(todayEntry);
      
      // Get last 7 days
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const entry = data.find((d: DayData) => d.date === dateStr) || { date: dateStr, calories: 0, water: 0, macros: { protein: 0, carbs: 0, fat: 0, fiber: 0 } };
        last7Days.push(entry);
      }
      setWeekData(last7Days);
    } else {
      setTodayData({ date: today, calories: 0, water: 0, macros: { protein: 0, carbs: 0, fat: 0, fiber: 0 } });
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        last7Days.push({ date: dateStr, calories: 0, water: 0, macros: { protein: 0, carbs: 0, fat: 0, fiber: 0 } });
      }
      setWeekData(last7Days);
    }
  };

  const loadWorkoutStats = () => {
    const today = new Date().toISOString().split('T')[0];
    const stored = localStorage.getItem('workoutStats');
    
    if (stored) {
      const stats = JSON.parse(stored);
      setWorkoutStats(stats[today] || null);
      
      // Get last 7 days workout stats
      const last7Days = [];
      for (let i = 6; i >= 0; i--) {
        const date = new Date();
        date.setDate(date.getDate() - i);
        const dateStr = date.toISOString().split('T')[0];
        const entry = stats[dateStr] || { 
          date: dateStr, 
          sessions: 0, 
          totalExercises: 0, 
          completedExercises: 0, 
          volume: 0, 
          workoutCompleted: false 
        };
        last7Days.push(entry);
      }
      setWeekWorkoutStats(last7Days);
    }
  };

  const caloriePercent = Math.min((todayData.calories / calorieGoal) * 100, 100);
  const waterPercent = Math.min((todayData.water / waterGoal) * 100, 100);

  // Prepare macro pie chart data
  const macroChartData = todayData.macros ? [
    { name: 'Protein', value: todayData.macros.protein * 4, color: '#3b82f6' },
    { name: 'Carbs', value: todayData.macros.carbs * 4, color: '#eab308' },
    { name: 'Fat', value: todayData.macros.fat * 9, color: '#a855f7' },
  ].filter(item => item.value > 0) : [];

  return (
    <div className="space-y-6">
      {/* Header */}
      <div>
        <h1 className="text-3xl font-bold text-gray-900">Dashboard</h1>
        <p className="text-gray-600 mt-1 flex items-center gap-2">
          <Calendar className="w-4 h-4" />
          {new Date().toLocaleDateString('vi-VN', { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' })}
        </p>
      </div>

      {/* Today's Progress Cards */}
      <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
        {/* Calories Card */}
        <div className="bg-gradient-to-br from-orange-50 to-red-50 rounded-3xl p-6 shadow-sm border border-orange-100">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 text-orange-700 mb-1">
                <Flame className="w-5 h-5" />
                <span className="text-sm font-medium">Calories</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-900">{todayData.calories}</span>
                <span className="text-gray-600">/ {calorieGoal} kcal</span>
              </div>
            </div>
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
              <div className="text-2xl font-bold text-orange-600">{Math.round(caloriePercent)}%</div>
            </div>
          </div>
          <div className="h-2 bg-orange-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-orange-500 to-red-500 transition-all duration-500"
              style={{ width: `${caloriePercent}%` }}
            />
          </div>
        </div>

        {/* Water Card */}
        <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-3xl p-6 shadow-sm border border-blue-100">
          <div className="flex items-start justify-between mb-4">
            <div>
              <div className="flex items-center gap-2 text-blue-700 mb-1">
                <Droplet className="w-5 h-5" />
                <span className="text-sm font-medium">Nước uống</span>
              </div>
              <div className="flex items-baseline gap-2">
                <span className="text-4xl font-bold text-gray-900">{todayData.water}</span>
                <span className="text-gray-600">/ {waterGoal} ml</span>
              </div>
            </div>
            <div className="w-16 h-16 rounded-full bg-white flex items-center justify-center">
              <div className="text-2xl font-bold text-blue-600">{Math.round(waterPercent)}%</div>
            </div>
          </div>
          <div className="h-2 bg-blue-200 rounded-full overflow-hidden">
            <div 
              className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
              style={{ width: `${waterPercent}%` }}
            />
          </div>
        </div>
      </div>

      {/* Macro Distribution */}
      {macroChartData.length > 0 && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
          <h2 className="text-xl font-bold text-gray-900 mb-4">Phân bổ Macro hôm nay</h2>
          <div className="grid grid-cols-1 md:grid-cols-2 gap-6">
            {/* Pie Chart */}
            <div className="flex items-center justify-center">
              <ResponsiveContainer width="100%" height={200}>
                <PieChart>
                  <Pie
                    data={macroChartData}
                    cx="50%"
                    cy="50%"
                    innerRadius={50}
                    outerRadius={80}
                    paddingAngle={5}
                    dataKey="value"
                  >
                    {macroChartData.map((entry, index) => (
                      <Cell key={`cell-${index}`} fill={entry.color} />
                    ))}
                  </Pie>
                  <Tooltip formatter={(value: number) => `${Math.round(value)} kcal`} />
                </PieChart>
              </ResponsiveContainer>
            </div>

            {/* Macro Details */}
            <div className="space-y-3">
              <div className="bg-blue-50 rounded-xl p-4 border border-blue-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-blue-700">Protein</span>
                  <span className="text-xs text-blue-600">{todayData.macros && Math.round((todayData.macros.protein * 4 / todayData.calories) * 100)}%</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-blue-900">{todayData.macros?.protein.toFixed(1)}g</span>
                  {macroGoals.protein > 0 && (
                    <span className="text-sm text-blue-700">/ {macroGoals.protein}g</span>
                  )}
                </div>
                <div className="text-xs text-blue-600 mt-1">{todayData.macros && Math.round(todayData.macros.protein * 4)} kcal</div>
              </div>

              <div className="bg-yellow-50 rounded-xl p-4 border border-yellow-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-yellow-700">Carbs</span>
                  <span className="text-xs text-yellow-600">{todayData.macros && Math.round((todayData.macros.carbs * 4 / todayData.calories) * 100)}%</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-yellow-900">{todayData.macros?.carbs.toFixed(1)}g</span>
                  {macroGoals.carbs > 0 && (
                    <span className="text-sm text-yellow-700">/ {macroGoals.carbs}g</span>
                  )}
                </div>
                <div className="text-xs text-yellow-600 mt-1">{todayData.macros && Math.round(todayData.macros.carbs * 4)} kcal</div>
              </div>

              <div className="bg-purple-50 rounded-xl p-4 border border-purple-100">
                <div className="flex items-center justify-between mb-2">
                  <span className="text-sm font-medium text-purple-700">Fat</span>
                  <span className="text-xs text-purple-600">{todayData.macros && Math.round((todayData.macros.fat * 9 / todayData.calories) * 100)}%</span>
                </div>
                <div className="flex items-baseline gap-2">
                  <span className="text-2xl font-bold text-purple-900">{todayData.macros?.fat.toFixed(1)}g</span>
                  {macroGoals.fat > 0 && (
                    <span className="text-sm text-purple-700">/ {macroGoals.fat}g</span>
                  )}
                </div>
                <div className="text-xs text-purple-600 mt-1">{todayData.macros && Math.round(todayData.macros.fat * 9)} kcal</div>
              </div>
            </div>
          </div>
        </div>
      )}

      {/* Workout Stats Today */}
      {workoutStats && workoutStats.totalExercises > 0 && (
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-3xl p-6 shadow-sm border border-purple-100">
          <div className="flex items-center justify-between mb-4">
            <div className="flex items-center gap-2">
              <Dumbbell className="w-5 h-5 text-purple-700" />
              <h2 className="text-xl font-bold text-gray-900">Workout hôm nay</h2>
            </div>
            {workoutStats.workoutCompleted && (
              <div className="flex items-center gap-1 bg-green-100 text-green-700 px-3 py-1 rounded-full">
                <CheckCircle className="w-4 h-4" />
                <span className="text-sm font-medium">Hoàn thành</span>
              </div>
            )}
          </div>
          <div className="grid grid-cols-3 gap-4">
            <div className="bg-white rounded-xl p-4 border border-purple-200">
              <div className="text-sm text-purple-700 mb-1">Sessions</div>
              <div className="text-3xl font-bold text-gray-900">{workoutStats.sessions}</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-purple-200">
              <div className="text-sm text-purple-700 mb-1">Bài tập</div>
              <div className="text-3xl font-bold text-gray-900">{workoutStats.completedExercises}/{workoutStats.totalExercises}</div>
            </div>
            <div className="bg-white rounded-xl p-4 border border-purple-200">
              <div className="text-sm text-purple-700 mb-1">Volume</div>
              <div className="text-3xl font-bold text-gray-900">{workoutStats.volume}</div>
            </div>
          </div>
        </div>
      )}

      {/* Workout Progress 7 Days */}
      {weekWorkoutStats.some(s => s.workoutCompleted) && (
        <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
          <div className="flex items-center gap-2 mb-6">
            <Dumbbell className="w-5 h-5 text-purple-600" />
            <h2 className="text-xl font-bold text-gray-900">Lịch sử Workout 7 ngày</h2>
          </div>
          
          {/* Workout Days Chart */}
          <div className="mb-6">
            <ResponsiveContainer width="100%" height={200}>
              <BarChart data={weekWorkoutStats}>
                <CartesianGrid strokeDasharray="3 3" stroke="#e5e7eb" />
                <XAxis 
                  dataKey="date" 
                  tickFormatter={(date) => new Date(date).toLocaleDateString('vi-VN', { day: '2-digit', month: '2-digit' })}
                  tick={{ fontSize: 12 }}
                />
                <YAxis tick={{ fontSize: 12 }} />
                <Tooltip 
                  labelFormatter={(date) => new Date(date).toLocaleDateString('vi-VN', { weekday: 'long', day: '2-digit', month: 'long' })}
                  formatter={(value: number) => [value, 'Volume']}
                />
                <Bar dataKey="volume" fill="#a855f7" radius={[8, 8, 0, 0]} />
              </BarChart>
            </ResponsiveContainer>
          </div>

          {/* Workout Days Indicator */}
          <div>
            <div className="text-sm font-medium text-gray-700 mb-3">Ngày tập trong tuần</div>
            <div className="flex gap-2">
              {weekWorkoutStats.map((stat, idx) => {
                const date = new Date(stat.date);
                const dayName = date.toLocaleDateString('vi-VN', { weekday: 'short' });
                return (
                  <div key={idx} className="flex-1 text-center">
                    <div className={`w-full aspect-square rounded-xl flex items-center justify-center mb-1 ${
                      stat.workoutCompleted 
                        ? 'bg-gradient-to-br from-purple-500 to-pink-500 text-white' 
                        : 'bg-gray-100 text-gray-400'
                    }`}>
                      {stat.workoutCompleted ? (
                        <CheckCircle className="w-5 h-5" />
                      ) : (
                        <span className="text-lg font-bold">{date.getDate()}</span>
                      )}
                    </div>
                    <span className="text-xs text-gray-600">{dayName}</span>
                  </div>
                );
              })}
            </div>
          </div>
        </div>
      )}

      {/* Weekly Progress */}
      <div className="bg-white rounded-3xl p-6 shadow-sm border border-gray-200">
        <div className="flex items-center gap-2 mb-6">
          <TrendingUp className="w-5 h-5 text-green-600" />
          <h2 className="text-xl font-bold text-gray-900">Tiến độ Dinh dưỡng 7 ngày</h2>
        </div>
        <ProgressChart data={weekData} />
      </div>

      {/* Quick Stats */}
      <div className="grid grid-cols-2 gap-4">
        <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100">
          <div className="text-sm text-green-700 mb-1">Trung bình/ngày</div>
          <div className="text-2xl font-bold text-gray-900">
            {Math.round(weekData.reduce((sum, d) => sum + d.calories, 0) / 7)} kcal
          </div>
        </div>
        <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100">
          <div className="text-sm text-purple-700 mb-1">Trung bình nước</div>
          <div className="text-2xl font-bold text-gray-900">
            {Math.round(weekData.reduce((sum, d) => sum + d.water, 0) / 7)} ml
          </div>
        </div>
      </div>

      {/* Workout Stats Summary */}
      {weekWorkoutStats.some(s => s.workoutCompleted) && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-purple-50 to-pink-50 rounded-2xl p-4 border border-purple-100">
            <div className="text-sm text-purple-700 mb-1">Ngày tập/tuần</div>
            <div className="text-2xl font-bold text-gray-900">
              {weekWorkoutStats.filter(s => s.workoutCompleted).length}/7
            </div>
          </div>
          <div className="bg-gradient-to-br from-indigo-50 to-blue-50 rounded-2xl p-4 border border-indigo-100">
            <div className="text-sm text-indigo-700 mb-1">Volume TB/tuần</div>
            <div className="text-2xl font-bold text-gray-900">
              {Math.round(weekWorkoutStats.reduce((sum, s) => sum + s.volume, 0) / weekWorkoutStats.filter(s => s.workoutCompleted).length || 0)}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}
