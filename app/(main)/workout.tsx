import AsyncStorage from "@react-native-async-storage/async-storage";
import {
  BookTemplate,
  CheckCircle2,
  Circle,
  Clock,
  Dumbbell,
  Pause,
  Play,
  Plus,
  RotateCcw,
  Trash2,
} from "lucide-react-native";
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

interface Exercise {
  id: string;
  name: string;
  sets: number;
  reps: number;
  completed: boolean;
  restTime?: number; // in seconds
}

interface WorkoutSession {
  id: string;
  name: string;
  exercises: Exercise[];
  createdAt: string;
}

interface WorkoutTemplate {
  name: string;
  exercises: Omit<Exercise, "id" | "completed">[];
}

const WORKOUT_TEMPLATES: WorkoutTemplate[] = [
  {
    name: "Push (Chest, Shoulders, Triceps)",
    exercises: [
      { name: "Bench Press", sets: 4, reps: 8, restTime: 90 },
      { name: "Incline Dumbbell Press", sets: 3, reps: 10, restTime: 60 },
      { name: "Shoulder Press", sets: 3, reps: 10, restTime: 60 },
      { name: "Lateral Raises", sets: 3, reps: 12, restTime: 45 },
      { name: "Tricep Dips", sets: 3, reps: 12, restTime: 45 },
    ],
  },
  {
    name: "Pull (Back, Biceps)",
    exercises: [
      { name: "Deadlift", sets: 4, reps: 6, restTime: 120 },
      { name: "Pull-ups", sets: 4, reps: 8, restTime: 90 },
      { name: "Barbell Row", sets: 3, reps: 10, restTime: 60 },
      { name: "Face Pulls", sets: 3, reps: 15, restTime: 45 },
      { name: "Bicep Curls", sets: 3, reps: 12, restTime: 45 },
    ],
  },
  {
    name: "Legs (Quads, Hamstrings, Glutes)",
    exercises: [
      { name: "Squat", sets: 4, reps: 8, restTime: 120 },
      { name: "Romanian Deadlift", sets: 3, reps: 10, restTime: 90 },
      { name: "Leg Press", sets: 3, reps: 12, restTime: 60 },
      { name: "Leg Curl", sets: 3, reps: 12, restTime: 45 },
      { name: "Calf Raises", sets: 4, reps: 15, restTime: 45 },
    ],
  },
];

export default function WorkoutPlanScreen() {
  const [sessions, setSessions] = useState<WorkoutSession[]>([]);
  const [showNewSession, setShowNewSession] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [newSessionName, setNewSessionName] = useState("");
  const [showAddExercise, setShowAddExercise] = useState<string | null>(null);
  const [newExercise, setNewExercise] = useState({
    name: "",
    sets: "3",
    reps: "10",
    restTime: "60",
  });

  const [activeTimer, setActiveTimer] = useState<{
    sessionId: string;
    exerciseId: string;
    timeLeft: number;
  } | null>(null);
  const [timerInterval, setTimerInterval] = useState<NodeJS.Timeout | null>(
    null,
  );

  useEffect(() => {
    loadWorkoutData();
    return () => {
      if (timerInterval) clearInterval(timerInterval);
    };
  }, []);

  const loadWorkoutData = async () => {
    const today = new Date().toISOString().split("T")[0];
    const stored = await AsyncStorage.getItem(`workoutPlan_${today}`);
    if (stored) setSessions(JSON.parse(stored));
  };

  const saveWorkoutData = async (data: WorkoutSession[]) => {
    const today = new Date().toISOString().split("T")[0];
    await AsyncStorage.setItem(`workoutPlan_${today}`, JSON.stringify(data));
    setSessions(data);
    await saveWorkoutStats(data);
  };

  const saveWorkoutStats = async (data: WorkoutSession[]) => {
    const today = new Date().toISOString().split("T")[0];
    const stored = await AsyncStorage.getItem("workoutStats");
    const stats = stored ? JSON.parse(stored) : {};

    const totalExercises = data.reduce((sum, s) => sum + s.exercises.length, 0);
    const completedExercises = data.reduce(
      (sum, s) => sum + s.exercises.filter((e) => e.completed).length,
      0,
    );
    const totalVolume = data.reduce(
      (sum, s) =>
        sum + s.exercises.reduce((exSum, ex) => exSum + ex.sets * ex.reps, 0),
      0,
    );

    stats[today] = {
      date: today,
      sessions: data.length,
      totalExercises,
      completedExercises,
      volume: totalVolume,
      workoutCompleted:
        completedExercises === totalExercises && totalExercises > 0,
    };

    await AsyncStorage.setItem("workoutStats", JSON.stringify(stats));
  };

  const createSession = () => {
    if (!newSessionName.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên session");
      return;
    }

    const newSession: WorkoutSession = {
      id: Date.now().toString(),
      name: newSessionName,
      exercises: [],
      createdAt: new Date().toISOString(),
    };

    saveWorkoutData([...sessions, newSession]);
    setNewSessionName("");
    setShowNewSession(false);
  };

  const createSessionFromTemplate = (template: WorkoutTemplate) => {
    const newSession: WorkoutSession = {
      id: Date.now().toString(),
      name: template.name,
      exercises: template.exercises.map((ex, idx) => ({
        ...ex,
        id: `${Date.now()}_${idx}`,
        completed: false,
      })),
      createdAt: new Date().toISOString(),
    };

    saveWorkoutData([...sessions, newSession]);
    setShowTemplates(false);
  };

  const deleteSession = (sessionId: string) => {
    saveWorkoutData(sessions.filter((s) => s.id !== sessionId));
  };

  const addExercise = (sessionId: string) => {
    if (!newExercise.name.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên bài tập");
      return;
    }

    const exercise: Exercise = {
      id: Date.now().toString(),
      name: newExercise.name,
      sets: parseInt(newExercise.sets) || 1,
      reps: parseInt(newExercise.reps) || 1,
      restTime: parseInt(newExercise.restTime) || 30,
      completed: false,
    };

    const updated = sessions.map((session) => {
      if (session.id === sessionId) {
        return { ...session, exercises: [...session.exercises, exercise] };
      }
      return session;
    });

    saveWorkoutData(updated);
    setNewExercise({ name: "", sets: "3", reps: "10", restTime: "60" });
    setShowAddExercise(null);
  };

  const deleteExercise = (sessionId: string, exerciseId: string) => {
    const updated = sessions.map((session) => {
      if (session.id === sessionId) {
        return {
          ...session,
          exercises: session.exercises.filter((e) => e.id !== exerciseId),
        };
      }
      return session;
    });
    saveWorkoutData(updated);
  };

  const toggleExerciseComplete = (sessionId: string, exerciseId: string) => {
    const updated = sessions.map((session) => {
      if (session.id === sessionId) {
        return {
          ...session,
          exercises: session.exercises.map((exercise) => {
            if (exercise.id === exerciseId)
              return { ...exercise, completed: !exercise.completed };
            return exercise;
          }),
        };
      }
      return session;
    });
    saveWorkoutData(updated);
  };

  const updateExercise = (
    sessionId: string,
    exerciseId: string,
    field: "sets" | "reps" | "restTime",
    value: number,
  ) => {
    const updated = sessions.map((session) => {
      if (session.id === sessionId) {
        return {
          ...session,
          exercises: session.exercises.map((exercise) => {
            if (exercise.id === exerciseId)
              return { ...exercise, [field]: Math.max(1, value) };
            return exercise;
          }),
        };
      }
      return session;
    });
    saveWorkoutData(updated);
  };

  const startRestTimer = (
    sessionId: string,
    exerciseId: string,
    restTime: number,
  ) => {
    if (timerInterval) clearInterval(timerInterval);

    setActiveTimer({ sessionId, exerciseId, timeLeft: restTime });

    const interval = setInterval(() => {
      setActiveTimer((prev) => {
        if (!prev || prev.timeLeft <= 1) {
          if (timerInterval) clearInterval(timerInterval);
          if (prev && prev.timeLeft <= 1) Alert.alert("Hết thời gian nghỉ!");
          return null;
        }
        return { ...prev, timeLeft: prev.timeLeft - 1 };
      });
    }, 1000);

    setTimerInterval(interval);
  };

  const pauseRestTimer = () => {
    if (timerInterval) {
      clearInterval(timerInterval);
      setTimerInterval(null);
    }
  };

  const resetRestTimer = (
    sessionId: string,
    exerciseId: string,
    restTime: number,
  ) => {
    if (timerInterval) clearInterval(timerInterval);
    setActiveTimer({ sessionId, exerciseId, timeLeft: restTime });
    setTimerInterval(null);
  };

  const getSessionProgress = (session: WorkoutSession) => {
    if (session.exercises.length === 0) return 0;
    const completed = session.exercises.filter((e) => e.completed).length;
    return Math.round((completed / session.exercises.length) * 100);
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <SafeAreaView className="flex-1 bg-gray-50">
      <ScrollView contentContainerStyle={{ padding: 20 }}>
        {/* Header */}
        <View className="mb-6">
          <Text className="text-3xl font-bold text-gray-900">Workout Plan</Text>
          <Text className="text-gray-600 mt-1">Kế hoạch tập luyện hôm nay</Text>
        </View>
        <View className="flex-row gap-2 mb-6">
          <TouchableOpacity
            onPress={() => setShowTemplates(true)}
            className="bg-purple-600 px-4 py-3 rounded-xl flex-row items-center justify-center flex-1 gap-2 shadow-sm"
          >
            <BookTemplate color="white" size={20} />
            <Text className="text-white font-medium">Templates</Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setShowNewSession(true)}
            className="bg-blue-600 px-4 py-3 rounded-xl flex-row items-center justify-center flex-1 gap-2 shadow-sm"
          >
            <Plus color="white" size={20} />
            <Text className="text-white font-medium">Custom</Text>
          </TouchableOpacity>
        </View>

        {/* Templates Modal */}
        {showTemplates && (
          <View className="bg-purple-50 rounded-3xl p-6 shadow-sm border border-purple-200 mb-6 gap-y-3">
            <View className="flex-row items-center justify-between mb-2">
              <Text className="text-lg font-bold text-gray-900">
                Workout Templates
              </Text>
              <TouchableOpacity onPress={() => setShowTemplates(false)}>
                <Text className="text-gray-500 text-lg font-bold">✕</Text>
              </TouchableOpacity>
            </View>
            {WORKOUT_TEMPLATES.map((template, idx) => (
              <TouchableOpacity
                key={idx}
                onPress={() => createSessionFromTemplate(template)}
                className="bg-white p-4 rounded-2xl border border-purple-200 flex-row items-center justify-between shadow-sm"
              >
                <View>
                  <Text className="font-bold text-gray-900 mb-1">
                    {template.name}
                  </Text>
                  <Text className="text-sm text-gray-600">
                    {template.exercises.length} bài tập
                  </Text>
                </View>
                <Plus color="#9333ea" size={20} />
              </TouchableOpacity>
            ))}
          </View>
        )}

        {/* New Session Modal */}
        {showNewSession && (
          <View className="bg-blue-50 rounded-3xl p-6 shadow-sm border border-blue-200 mb-6">
            <Text className="text-lg font-bold text-gray-900 mb-4">
              Tạo Session Mới
            </Text>
            <TextInput
              value={newSessionName}
              onChangeText={setNewSessionName}
              placeholder="Tên session (ví dụ: Push, Pull...)"
              className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white mb-4"
            />
            <View className="flex-row gap-2">
              <TouchableOpacity
                onPress={createSession}
                className="flex-1 bg-blue-600 py-3 rounded-xl items-center shadow-sm"
              >
                <Text className="text-white font-medium">Tạo Session</Text>
              </TouchableOpacity>
              <TouchableOpacity
                onPress={() => {
                  setShowNewSession(false);
                  setNewSessionName("");
                }}
                className="px-6 py-3 rounded-xl bg-gray-200"
              >
                <Text className="text-gray-700 font-medium">Hủy</Text>
              </TouchableOpacity>
            </View>
          </View>
        )}

        {/* Empty State */}
        {sessions.length === 0 && !showNewSession && !showTemplates && (
          <View className="bg-gray-100 rounded-3xl p-10 items-center justify-center my-6">
            <Dumbbell color="#9ca3af" size={48} className="mb-4" />
            <Text className="text-xl font-bold text-gray-900 mb-2">
              Chưa có session nào
            </Text>
            <Text className="text-gray-600 text-center">
              Tạo session từ template hoặc tự thiết kế
            </Text>
          </View>
        )}

        {/* Sessions List */}
        <View className="gap-y-4">
          {sessions.map((session) => {
            const progress = getSessionProgress(session);
            const isAddingExercise = showAddExercise === session.id;

            return (
              <View
                key={session.id}
                className="bg-white rounded-3xl p-5 shadow-sm border border-gray-200"
              >
                {/* Session Header */}
                <View className="flex-row items-start justify-between mb-4">
                  <View className="flex-1">
                    <View className="flex-row items-center gap-3 mb-2">
                      <View className="w-12 h-12 rounded-xl bg-blue-600 items-center justify-center">
                        <Dumbbell color="white" size={24} />
                      </View>
                      <View>
                        <Text className="text-xl font-bold text-gray-900">
                          {session.name}
                        </Text>
                        <Text className="text-sm text-gray-600">
                          {session.exercises.length} bài tập • {progress}% hoàn
                          thành
                        </Text>
                      </View>
                    </View>
                    {session.exercises.length > 0 && (
                      <View className="h-2 bg-gray-200 rounded-full overflow-hidden mt-1">
                        <View
                          className="h-full bg-blue-500"
                          style={{ width: `${progress}%` }}
                        />
                      </View>
                    )}
                  </View>
                  <View className="flex-row items-center gap-2 ml-4 mt-2">
                    <TouchableOpacity
                      onPress={() => setShowAddExercise(session.id)}
                      className="p-2 bg-blue-100 rounded-lg"
                    >
                      <Plus color="#2563eb" size={20} />
                    </TouchableOpacity>
                    <TouchableOpacity
                      onPress={() => deleteSession(session.id)}
                      className="p-2 bg-red-100 rounded-lg"
                    >
                      <Trash2 color="#dc2626" size={20} />
                    </TouchableOpacity>
                  </View>
                </View>

                {/* Add Exercise Form */}
                {isAddingExercise && (
                  <View className="bg-blue-50 rounded-2xl p-4 mb-4 border border-blue-200">
                    <Text className="font-bold text-gray-900 mb-3">
                      Thêm bài tập mới
                    </Text>
                    <TextInput
                      value={newExercise.name}
                      onChangeText={(text) =>
                        setNewExercise({ ...newExercise, name: text })
                      }
                      placeholder="Tên bài tập (ví dụ: Bench Press...)"
                      className="w-full px-4 py-3 rounded-xl border border-gray-300 bg-white mb-3"
                    />
                    <View className="flex-row gap-2 mb-3">
                      <View className="flex-1">
                        <Text className="text-sm font-medium text-gray-700 mb-1">
                          Sets
                        </Text>
                        <TextInput
                          keyboardType="numeric"
                          value={newExercise.sets}
                          onChangeText={(text) =>
                            setNewExercise({ ...newExercise, sets: text })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white"
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-medium text-gray-700 mb-1">
                          Reps
                        </Text>
                        <TextInput
                          keyboardType="numeric"
                          value={newExercise.reps}
                          onChangeText={(text) =>
                            setNewExercise({ ...newExercise, reps: text })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white"
                        />
                      </View>
                      <View className="flex-1">
                        <Text className="text-sm font-medium text-gray-700 mb-1">
                          Rest (s)
                        </Text>
                        <TextInput
                          keyboardType="numeric"
                          value={newExercise.restTime}
                          onChangeText={(text) =>
                            setNewExercise({ ...newExercise, restTime: text })
                          }
                          className="w-full px-3 py-2 rounded-xl border border-gray-300 bg-white"
                        />
                      </View>
                    </View>
                    <View className="flex-row gap-2">
                      <TouchableOpacity
                        onPress={() => addExercise(session.id)}
                        className="flex-1 bg-blue-600 py-2 rounded-xl items-center"
                      >
                        <Text className="text-white font-medium">Thêm</Text>
                      </TouchableOpacity>
                      <TouchableOpacity
                        onPress={() => {
                          setShowAddExercise(null);
                          setNewExercise({
                            name: "",
                            sets: "3",
                            reps: "10",
                            restTime: "60",
                          });
                        }}
                        className="px-4 py-2 rounded-xl bg-gray-200 items-center"
                      >
                        <Text className="text-gray-700 font-medium">Hủy</Text>
                      </TouchableOpacity>
                    </View>
                  </View>
                )}

                {/* Exercises List */}
                <View className="gap-y-3 mt-2">
                  {session.exercises.length > 0
                    ? session.exercises.map((exercise) => {
                        const isTimerActive =
                          activeTimer?.sessionId === session.id &&
                          activeTimer?.exerciseId === exercise.id;

                        return (
                          <View
                            key={exercise.id}
                            className={`rounded-xl border ${exercise.completed ? "bg-green-50 border-green-200" : "bg-gray-50 border-gray-200"}`}
                          >
                            <View className="flex-row items-center p-3">
                              <TouchableOpacity
                                onPress={() =>
                                  toggleExerciseComplete(
                                    session.id,
                                    exercise.id,
                                  )
                                }
                                className="mr-3"
                              >
                                {exercise.completed ? (
                                  <CheckCircle2 color="#16a34a" size={24} />
                                ) : (
                                  <Circle color="#9ca3af" size={24} />
                                )}
                              </TouchableOpacity>
                              <View className="flex-1">
                                <Text
                                  className={`font-bold ${exercise.completed ? "text-gray-500 line-through" : "text-gray-900"}`}
                                >
                                  {exercise.name}
                                </Text>
                                <View className="flex-row items-center gap-3 mt-1">
                                  <View className="flex-row items-center gap-1">
                                    <Text className="text-xs text-gray-600">
                                      Sets:
                                    </Text>
                                    <Text className="text-sm font-medium">
                                      {exercise.sets}
                                    </Text>
                                  </View>
                                  <View className="flex-row items-center gap-1">
                                    <Text className="text-xs text-gray-600">
                                      Reps:
                                    </Text>
                                    <Text className="text-sm font-medium">
                                      {exercise.reps}
                                    </Text>
                                  </View>
                                  <View className="flex-row items-center gap-1">
                                    <Clock color="#4b5563" size={14} />
                                    <Text className="text-sm font-medium">
                                      {exercise.restTime}s
                                    </Text>
                                  </View>
                                </View>
                              </View>
                              <TouchableOpacity
                                onPress={() =>
                                  deleteExercise(session.id, exercise.id)
                                }
                                className="p-2"
                              >
                                <Trash2 color="#9ca3af" size={20} />
                              </TouchableOpacity>
                            </View>

                            {/* Timer section */}
                            {exercise.restTime && !exercise.completed && (
                              <View className="px-3 pb-3">
                                {isTimerActive ? (
                                  <View className="bg-orange-100 rounded-lg p-2 flex-row items-center justify-between border border-orange-200">
                                    <View className="flex-row items-center gap-2">
                                      <Clock color="#ea580c" size={16} />
                                      <Text className="text-sm font-medium text-gray-700">
                                        Nghỉ ngơi
                                      </Text>
                                    </View>
                                    <View className="flex-row items-center gap-2">
                                      <Text className="text-lg font-bold text-orange-600">
                                        {activeTimer
                                          ? formatTime(activeTimer.timeLeft)
                                          : ""}
                                      </Text>
                                      <TouchableOpacity
                                        onPress={
                                          timerInterval
                                            ? pauseRestTimer
                                            : () =>
                                                startRestTimer(
                                                  session.id,
                                                  exercise.id,
                                                  activeTimer?.timeLeft || 0,
                                                )
                                        }
                                        className="bg-orange-600 p-1.5 rounded-lg"
                                      >
                                        {timerInterval ? (
                                          <Pause color="white" size={16} />
                                        ) : (
                                          <Play color="white" size={16} />
                                        )}
                                      </TouchableOpacity>
                                      <TouchableOpacity
                                        onPress={() =>
                                          resetRestTimer(
                                            session.id,
                                            exercise.id,
                                            exercise.restTime || 60,
                                          )
                                        }
                                        className="bg-gray-600 p-1.5 rounded-lg"
                                      >
                                        <RotateCcw color="white" size={16} />
                                      </TouchableOpacity>
                                    </View>
                                  </View>
                                ) : (
                                  <TouchableOpacity
                                    onPress={() =>
                                      startRestTimer(
                                        session.id,
                                        exercise.id,
                                        exercise.restTime || 60,
                                      )
                                    }
                                    className="bg-blue-100 py-1.5 rounded-lg flex-row items-center justify-center gap-1"
                                  >
                                    <Play color="#2563eb" size={14} />
                                    <Text className="text-xs font-medium text-blue-600">
                                      Bắt đầu nghỉ {exercise.restTime}s
                                    </Text>
                                  </TouchableOpacity>
                                )}
                              </View>
                            )}
                          </View>
                        );
                      })
                    : !isAddingExercise && (
                        <TouchableOpacity
                          onPress={() => setShowAddExercise(session.id)}
                          className="items-center py-4"
                        >
                          <Text className="text-blue-600 font-medium">
                            Thêm bài tập đầu tiên
                          </Text>
                        </TouchableOpacity>
                      )}
                </View>
              </View>
            );
          })}
        </View>
      </ScrollView>
    </SafeAreaView>
  );
}
