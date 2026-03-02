import { useState, useEffect } from "react";
import {
  Dumbbell,
  Plus,
  Trash2,
  Circle,
  CheckCircle2,
  Clock,
  BookTemplate,
  Play,
  Pause,
  RotateCcw,
} from "lucide-react";
import { toast } from "sonner";

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
// Phần này template về sau tự set lại nên cứ để đó, có template hoặc mở thêm AI phân tích bài tập phù hợp cũng được
const WORKOUT_TEMPLATES: WorkoutTemplate[] = [
  {
    name: "Push (Chest, Shoulders, Triceps)",
    exercises: [
      { name: "Bench Press", sets: 4, reps: 8, restTime: 90 },
      {
        name: "Incline Dumbbell Press",
        sets: 3,
        reps: 10,
        restTime: 60,
      },
      {
        name: "Shoulder Press",
        sets: 3,
        reps: 10,
        restTime: 60,
      },
      {
        name: "Lateral Raises",
        sets: 3,
        reps: 12,
        restTime: 45,
      },
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
      {
        name: "Romanian Deadlift",
        sets: 3,
        reps: 10,
        restTime: 90,
      },
      { name: "Leg Press", sets: 3, reps: 12, restTime: 60 },
      { name: "Leg Curl", sets: 3, reps: 12, restTime: 45 },
      { name: "Calf Raises", sets: 4, reps: 15, restTime: 45 },
    ],
  },
  {
    name: "Upper Body",
    exercises: [
      { name: "Bench Press", sets: 4, reps: 8, restTime: 90 },
      { name: "Pull-ups", sets: 3, reps: 10, restTime: 60 },
      {
        name: "Shoulder Press",
        sets: 3,
        reps: 10,
        restTime: 60,
      },
      { name: "Barbell Row", sets: 3, reps: 10, restTime: 60 },
      { name: "Bicep Curls", sets: 2, reps: 12, restTime: 45 },
      {
        name: "Tricep Extensions",
        sets: 2,
        reps: 12,
        restTime: 45,
      },
    ],
  },
  {
    name: "Full Body",
    exercises: [
      { name: "Squat", sets: 3, reps: 10, restTime: 90 },
      { name: "Bench Press", sets: 3, reps: 10, restTime: 90 },
      { name: "Deadlift", sets: 3, reps: 8, restTime: 120 },
      {
        name: "Shoulder Press",
        sets: 3,
        reps: 10,
        restTime: 60,
      },
      { name: "Pull-ups", sets: 3, reps: 8, restTime: 60 },
    ],
  },
];

export function WorkoutPlan() {
  const [sessions, setSessions] = useState<WorkoutSession[]>(
    [],
  );
  const [showNewSession, setShowNewSession] = useState(false);
  const [showTemplates, setShowTemplates] = useState(false);
  const [newSessionName, setNewSessionName] = useState("");
  const [showAddExercise, setShowAddExercise] = useState<
    string | null
  >(null);
  const [newExercise, setNewExercise] = useState({
    name: "",
    sets: 3,
    reps: 10,
    restTime: 60,
  });
  const [activeTimer, setActiveTimer] = useState<{
    sessionId: string;
    exerciseId: string;
    timeLeft: number;
  } | null>(null);
  const [timerInterval, setTimerInterval] =
    useState<NodeJS.Timeout | null>(null);

  useEffect(() => {
    loadWorkoutData();
  }, []);

  useEffect(() => {
    return () => {
      if (timerInterval) {
        clearInterval(timerInterval);
      }
    };
  }, [timerInterval]);

  const loadWorkoutData = () => {
    const today = new Date().toISOString().split("T")[0];
    const stored = localStorage.getItem(`workoutPlan_${today}`);

    if (stored) {
      setSessions(JSON.parse(stored));
    }
  };

  const saveWorkoutData = (data: WorkoutSession[]) => {
    const today = new Date().toISOString().split("T")[0];
    localStorage.setItem(
      `workoutPlan_${today}`,
      JSON.stringify(data),
    );
    setSessions(data);

    // Save workout stats
    saveWorkoutStats(data);
  };

  const saveWorkoutStats = (data: WorkoutSession[]) => {
    const today = new Date().toISOString().split("T")[0];
    const stored = localStorage.getItem("workoutStats");
    const stats = stored ? JSON.parse(stored) : {};

    const totalExercises = data.reduce(
      (sum, s) => sum + s.exercises.length,
      0,
    );
    const completedExercises = data.reduce(
      (sum, s) =>
        sum + s.exercises.filter((e) => e.completed).length,
      0,
    );
    const totalVolume = data.reduce(
      (sum, s) =>
        sum +
        s.exercises.reduce(
          (exSum, ex) => exSum + ex.sets * ex.reps,
          0,
        ),
      0,
    );

    stats[today] = {
      date: today,
      sessions: data.length,
      totalExercises,
      completedExercises,
      volume: totalVolume,
      workoutCompleted:
        completedExercises === totalExercises &&
        totalExercises > 0,
    };

    localStorage.setItem("workoutStats", JSON.stringify(stats));
  };

  const createSession = () => {
    if (!newSessionName.trim()) {
      toast.error("Vui lòng nhập tên session");
      return;
    }

    const newSession: WorkoutSession = {
      id: Date.now().toString(),
      name: newSessionName,
      exercises: [],
      createdAt: new Date().toISOString(),
    };

    const updated = [...sessions, newSession];
    saveWorkoutData(updated);
    setNewSessionName("");
    setShowNewSession(false);
    toast.success("Đã tạo session tập luyện mới");
  };

  const createSessionFromTemplate = (
    template: WorkoutTemplate,
  ) => {
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

    const updated = [...sessions, newSession];
    saveWorkoutData(updated);
    setShowTemplates(false);
    toast.success(
      `Đã tạo session từ template: ${template.name}`,
    );
  };

  const deleteSession = (sessionId: string) => {
    const updated = sessions.filter((s) => s.id !== sessionId);
    saveWorkoutData(updated);
    toast.success("Đã xóa session");
  };

  const addExercise = (sessionId: string) => {
    if (!newExercise.name.trim()) {
      toast.error("Vui lòng nhập tên bài tập");
      return;
    }

    const exercise: Exercise = {
      id: Date.now().toString(),
      name: newExercise.name,
      sets: newExercise.sets,
      reps: newExercise.reps,
      restTime: newExercise.restTime,
      completed: false,
    };

    const updated = sessions.map((session) => {
      if (session.id === sessionId) {
        return {
          ...session,
          exercises: [...session.exercises, exercise],
        };
      }
      return session;
    });

    saveWorkoutData(updated);
    setNewExercise({
      name: "",
      sets: 3,
      reps: 10,
      restTime: 60,
    });
    setShowAddExercise(null);
    toast.success("Đã thêm bài tập");
  };

  const deleteExercise = (
    sessionId: string,
    exerciseId: string,
  ) => {
    const updated = sessions.map((session) => {
      if (session.id === sessionId) {
        return {
          ...session,
          exercises: session.exercises.filter(
            (e) => e.id !== exerciseId,
          ),
        };
      }
      return session;
    });

    saveWorkoutData(updated);
    toast.success("Đã xóa bài tập");
  };

  const toggleExerciseComplete = (
    sessionId: string,
    exerciseId: string,
  ) => {
    const updated = sessions.map((session) => {
      if (session.id === sessionId) {
        return {
          ...session,
          exercises: session.exercises.map((exercise) => {
            if (exercise.id === exerciseId) {
              return {
                ...exercise,
                completed: !exercise.completed,
              };
            }
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
            if (exercise.id === exerciseId) {
              return {
                ...exercise,
                [field]: Math.max(1, value),
              };
            }
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
    if (timerInterval) {
      clearInterval(timerInterval);
    }

    setActiveTimer({
      sessionId,
      exerciseId,
      timeLeft: restTime,
    });

    const interval = setInterval(() => {
      setActiveTimer((prev) => {
        if (!prev || prev.timeLeft <= 1) {
          if (timerInterval) clearInterval(timerInterval);
          if (prev && prev.timeLeft <= 1) {
            toast.success("Hết thời gian nghỉ!", {
              duration: 3000,
            });
          }
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
    if (timerInterval) {
      clearInterval(timerInterval);
    }
    setActiveTimer({
      sessionId,
      exerciseId,
      timeLeft: restTime,
    });
    setTimerInterval(null);
  };

  const getSessionProgress = (session: WorkoutSession) => {
    if (session.exercises.length === 0) return 0;
    const completed = session.exercises.filter(
      (e) => e.completed,
    ).length;
    return Math.round(
      (completed / session.exercises.length) * 100,
    );
  };

  const formatTime = (seconds: number) => {
    const mins = Math.floor(seconds / 60);
    const secs = seconds % 60;
    return `${mins}:${secs.toString().padStart(2, "0")}`;
  };

  return (
    <div className="space-y-6">
      {/* Header */}
      <div className="flex items-center justify-between">
        <div>
          <h1 className="text-3xl font-bold text-gray-900">
            Workout Plan
          </h1>
          <p className="text-gray-600 mt-1">
            Kế hoạch tập luyện hôm nay
          </p>
        </div>
        <div className="flex gap-2">
          <button
            onClick={() => setShowTemplates(true)}
            className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-4 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            <BookTemplate className="w-5 h-5" />
            <span className="font-medium">Templates</span>
          </button>
          <button
            onClick={() => setShowNewSession(true)}
            className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-4 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all flex items-center gap-2"
          >
            <Plus className="w-5 h-5" />
            <span className="font-medium">Custom</span>
          </button>
        </div>
      </div>

      {/* Templates Modal */}
      {showTemplates && (
        <div className="bg-white rounded-3xl p-6 shadow-lg border-2 border-purple-200">
          <div className="flex items-center justify-between mb-4">
            <h3 className="text-lg font-bold text-gray-900">
              Workout Templates
            </h3>
            <button
              onClick={() => setShowTemplates(false)}
              className="text-gray-500 hover:text-gray-700"
            >
              <Plus className="w-6 h-6 rotate-45" />
            </button>
          </div>
          <div className="space-y-3">
            {WORKOUT_TEMPLATES.map((template, idx) => (
              <button
                key={idx}
                onClick={() =>
                  createSessionFromTemplate(template)
                }
                className="w-full text-left p-4 rounded-2xl bg-gradient-to-br from-purple-50 to-pink-50 border-2 border-purple-200 hover:border-purple-400 transition-all"
              >
                <div className="flex items-start justify-between">
                  <div>
                    <h4 className="font-bold text-gray-900 mb-1">
                      {template.name}
                    </h4>
                    <p className="text-sm text-gray-600">
                      {template.exercises.length} bài tập
                    </p>
                  </div>
                  <Plus className="w-5 h-5 text-purple-600" />
                </div>
              </button>
            ))}
          </div>
        </div>
      )}

      {/* New Session Modal */}
      {showNewSession && (
        <div className="bg-white rounded-3xl p-6 shadow-lg border-2 border-blue-200">
          <h3 className="text-lg font-bold text-gray-900 mb-4">
            Tạo Session Mới
          </h3>
          <input
            type="text"
            value={newSessionName}
            onChange={(e) => setNewSessionName(e.target.value)}
            placeholder="Tên session (ví dụ: Push, Pull, Legs...)"
            className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-4"
            onKeyPress={(e) =>
              e.key === "Enter" && createSession()
            }
          />
          <div className="flex gap-2">
            <button
              onClick={createSession}
              className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-3 rounded-xl font-medium hover:shadow-lg transition-all"
            >
              Tạo Session
            </button>
            <button
              onClick={() => {
                setShowNewSession(false);
                setNewSessionName("");
              }}
              className="px-6 py-3 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-all"
            >
              Hủy
            </button>
          </div>
        </div>
      )}

      {/* Sessions List */}
      {sessions.length === 0 &&
        !showNewSession &&
        !showTemplates && (
          <div className="bg-gradient-to-br from-gray-50 to-gray-100 rounded-3xl p-12 text-center">
            <Dumbbell className="w-16 h-16 text-gray-400 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-gray-900 mb-2">
              Chưa có session nào
            </h3>
            <p className="text-gray-600 mb-6">
              Tạo session từ template hoặc tự thiết kế
            </p>
            <div className="flex justify-center gap-3">
              <button
                onClick={() => setShowTemplates(true)}
                className="bg-gradient-to-r from-purple-600 to-pink-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
              >
                <BookTemplate className="w-5 h-5" />
                <span className="font-medium">
                  Dùng Template
                </span>
              </button>
              <button
                onClick={() => setShowNewSession(true)}
                className="bg-gradient-to-r from-blue-600 to-cyan-600 text-white px-6 py-3 rounded-xl shadow-lg hover:shadow-xl transition-all inline-flex items-center gap-2"
              >
                <Plus className="w-5 h-5" />
                <span className="font-medium">
                  Tạo Session Mới
                </span>
              </button>
            </div>
          </div>
        )}

      <div className="space-y-4">
        {sessions.map((session) => {
          const progress = getSessionProgress(session);
          const isAddingExercise =
            showAddExercise === session.id;

          return (
            <div
              key={session.id}
              className="bg-gradient-to-br from-white to-gray-50 rounded-3xl p-6 shadow-sm border border-gray-200"
            >
              {/* Session Header */}
              <div className="flex items-start justify-between mb-4">
                <div className="flex-1">
                  <div className="flex items-center gap-3 mb-2">
                    <div className="w-12 h-12 rounded-xl bg-gradient-to-br from-blue-600 to-cyan-600 flex items-center justify-center">
                      <Dumbbell className="w-6 h-6 text-white" />
                    </div>
                    <div>
                      <h3 className="text-xl font-bold text-gray-900">
                        {session.name}
                      </h3>
                      <p className="text-sm text-gray-600">
                        {session.exercises.length} bài tập •{" "}
                        {progress}% hoàn thành
                      </p>
                    </div>
                  </div>

                  {/* Progress Bar */}
                  {session.exercises.length > 0 && (
                    <div className="h-2 bg-gray-200 rounded-full overflow-hidden">
                      <div
                        className="h-full bg-gradient-to-r from-blue-500 to-cyan-500 transition-all duration-500"
                        style={{ width: `${progress}%` }}
                      />
                    </div>
                  )}
                </div>

                <div className="flex items-center gap-2 ml-4">
                  <button
                    onClick={() =>
                      setShowAddExercise(session.id)
                    }
                    className="p-2 rounded-lg bg-blue-100 text-blue-600 hover:bg-blue-200 transition-all"
                  >
                    <Plus className="w-5 h-5" />
                  </button>
                  <button
                    onClick={() => deleteSession(session.id)}
                    className="p-2 rounded-lg bg-red-100 text-red-600 hover:bg-red-200 transition-all"
                  >
                    <Trash2 className="w-5 h-5" />
                  </button>
                </div>
              </div>

              {/* Add Exercise Form */}
              {isAddingExercise && (
                <div className="bg-blue-50 rounded-2xl p-4 mb-4 border-2 border-blue-200">
                  <h4 className="font-bold text-gray-900 mb-3">
                    Thêm bài tập mới
                  </h4>
                  <input
                    type="text"
                    value={newExercise.name}
                    onChange={(e) =>
                      setNewExercise({
                        ...newExercise,
                        name: e.target.value,
                      })
                    }
                    placeholder="Tên bài tập (ví dụ: Bench Press, Squat...)"
                    className="w-full px-4 py-3 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none mb-3"
                  />
                  <div className="grid grid-cols-3 gap-3 mb-3">
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Sets
                      </label>
                      <input
                        type="number"
                        value={newExercise.sets}
                        onChange={(e) =>
                          setNewExercise({
                            ...newExercise,
                            sets: parseInt(e.target.value) || 1,
                          })
                        }
                        className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Reps
                      </label>
                      <input
                        type="number"
                        value={newExercise.reps}
                        onChange={(e) =>
                          setNewExercise({
                            ...newExercise,
                            reps: parseInt(e.target.value) || 1,
                          })
                        }
                        className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                        min="1"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-medium text-gray-700 mb-2">
                        Rest (s)
                      </label>
                      <input
                        type="number"
                        value={newExercise.restTime}
                        onChange={(e) =>
                          setNewExercise({
                            ...newExercise,
                            restTime:
                              parseInt(e.target.value) || 30,
                          })
                        }
                        className="w-full px-4 py-2 rounded-xl border border-gray-300 focus:border-blue-500 focus:ring-2 focus:ring-blue-200 outline-none"
                        min="10"
                        step="5"
                      />
                    </div>
                  </div>
                  <div className="flex gap-2">
                    <button
                      onClick={() => addExercise(session.id)}
                      className="flex-1 bg-gradient-to-r from-blue-600 to-cyan-600 text-white py-2 rounded-xl font-medium hover:shadow-lg transition-all"
                    >
                      Thêm
                    </button>
                    <button
                      onClick={() => {
                        setShowAddExercise(null);
                        setNewExercise({
                          name: "",
                          sets: 3,
                          reps: 10,
                          restTime: 60,
                        });
                      }}
                      className="px-4 py-2 rounded-xl bg-gray-100 text-gray-700 font-medium hover:bg-gray-200 transition-all"
                    >
                      Hủy
                    </button>
                  </div>
                </div>
              )}

              {/* Exercises List */}
              {session.exercises.length > 0 ? (
                <div className="space-y-2">
                  {session.exercises.map((exercise) => {
                    const isTimerActive =
                      activeTimer?.sessionId === session.id &&
                      activeTimer?.exerciseId === exercise.id;
                    const isTimerPaused =
                      isTimerActive && !timerInterval;

                    return (
                      <div
                        key={exercise.id}
                        className={`rounded-2xl border-2 transition-all ${
                          exercise.completed
                            ? "bg-green-50 border-green-200"
                            : "bg-white border-gray-200 hover:border-blue-200"
                        }`}
                      >
                        <div className="flex items-center gap-3 p-4">
                          {/* Checkbox */}
                          <button
                            onClick={() =>
                              toggleExerciseComplete(
                                session.id,
                                exercise.id,
                              )
                            }
                            className="flex-shrink-0"
                          >
                            {exercise.completed ? (
                              <CheckCircle2 className="w-6 h-6 text-green-600" />
                            ) : (
                              <Circle className="w-6 h-6 text-gray-400" />
                            )}
                          </button>

                          {/* Exercise Details */}
                          <div className="flex-1">
                            <div
                              className={`font-bold ${exercise.completed ? "text-gray-500 line-through" : "text-gray-900"}`}
                            >
                              {exercise.name}
                            </div>
                            <div className="flex items-center gap-4 mt-1">
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-600">
                                  Sets:
                                </span>
                                <input
                                  type="number"
                                  value={exercise.sets}
                                  onChange={(e) =>
                                    updateExercise(
                                      session.id,
                                      exercise.id,
                                      "sets",
                                      parseInt(
                                        e.target.value,
                                      ) || 1,
                                    )
                                  }
                                  className="w-12 px-2 py-1 rounded-lg border border-gray-300 text-sm font-medium text-center focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none"
                                  min="1"
                                  disabled={exercise.completed}
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <span className="text-xs text-gray-600">
                                  Reps:
                                </span>
                                <input
                                  type="number"
                                  value={exercise.reps}
                                  onChange={(e) =>
                                    updateExercise(
                                      session.id,
                                      exercise.id,
                                      "reps",
                                      parseInt(
                                        e.target.value,
                                      ) || 1,
                                    )
                                  }
                                  className="w-12 px-2 py-1 rounded-lg border border-gray-300 text-sm font-medium text-center focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none"
                                  min="1"
                                  disabled={exercise.completed}
                                />
                              </div>
                              <div className="flex items-center gap-2">
                                <Clock className="w-4 h-4 text-gray-600" />
                                <input
                                  type="number"
                                  value={
                                    exercise.restTime || 60
                                  }
                                  onChange={(e) =>
                                    updateExercise(
                                      session.id,
                                      exercise.id,
                                      "restTime",
                                      parseInt(
                                        e.target.value,
                                      ) || 30,
                                    )
                                  }
                                  className="w-12 px-2 py-1 rounded-lg border border-gray-300 text-xs font-medium text-center focus:border-blue-500 focus:ring-1 focus:ring-blue-200 outline-none"
                                  min="10"
                                  step="5"
                                  disabled={exercise.completed}
                                />
                                <span className="text-xs text-gray-600">
                                  s
                                </span>
                              </div>
                            </div>
                          </div>

                          {/* Delete Button */}
                          <button
                            onClick={() =>
                              deleteExercise(
                                session.id,
                                exercise.id,
                              )
                            }
                            className="flex-shrink-0 p-2 rounded-lg text-gray-400 hover:bg-red-100 hover:text-red-600 transition-all"
                          >
                            <Trash2 className="w-4 h-4" />
                          </button>
                        </div>

                        {/* Rest Timer */}
                        {exercise.restTime && (
                          <div className="px-4 pb-4">
                            {isTimerActive ? (
                              <div className="bg-gradient-to-r from-orange-100 to-red-100 rounded-xl p-3 border-2 border-orange-200">
                                <div className="flex items-center justify-between">
                                  <div className="flex items-center gap-2">
                                    <Clock className="w-5 h-5 text-orange-600" />
                                    <span className="text-sm font-medium text-gray-700">
                                      Nghỉ ngơi
                                    </span>
                                  </div>
                                  <div className="flex items-center gap-2">
                                    <span className="text-2xl font-bold text-orange-600">
                                      {formatTime(
                                        activeTimer.timeLeft,
                                      )}
                                    </span>
                                    {timerInterval ? (
                                      <button
                                        onClick={pauseRestTimer}
                                        className="p-1.5 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-all"
                                      >
                                        <Pause className="w-4 h-4" />
                                      </button>
                                    ) : (
                                      <button
                                        onClick={() =>
                                          startRestTimer(
                                            session.id,
                                            exercise.id,
                                            activeTimer.timeLeft,
                                          )
                                        }
                                        className="p-1.5 rounded-lg bg-orange-600 text-white hover:bg-orange-700 transition-all"
                                      >
                                        <Play className="w-4 h-4" />
                                      </button>
                                    )}
                                    <button
                                      onClick={() =>
                                        resetRestTimer(
                                          session.id,
                                          exercise.id,
                                          exercise.restTime ||
                                            60,
                                        )
                                      }
                                      className="p-1.5 rounded-lg bg-gray-600 text-white hover:bg-gray-700 transition-all"
                                    >
                                      <RotateCcw className="w-4 h-4" />
                                    </button>
                                  </div>
                                </div>
                              </div>
                            ) : (
                              <button
                                onClick={() =>
                                  startRestTimer(
                                    session.id,
                                    exercise.id,
                                    exercise.restTime || 60,
                                  )
                                }
                                className="w-full bg-gradient-to-r from-blue-50 to-cyan-50 border-2 border-blue-200 rounded-xl p-2 hover:border-blue-400 transition-all flex items-center justify-center gap-2"
                              >
                                <Play className="w-4 h-4 text-blue-600" />
                                <span className="text-sm font-medium text-blue-600">
                                  Bắt đầu rest timer
                                </span>
                              </button>
                            )}
                          </div>
                        )}
                      </div>
                    );
                  })}
                </div>
              ) : (
                !isAddingExercise && (
                  <div className="text-center py-8 text-gray-500">
                    <p className="mb-3">Chưa có bài tập nào</p>
                    <button
                      onClick={() =>
                        setShowAddExercise(session.id)
                      }
                      className="text-blue-600 hover:text-blue-700 font-medium inline-flex items-center gap-2"
                    >
                      <Plus className="w-4 h-4" />
                      Thêm bài tập đầu tiên
                    </button>
                  </div>
                )
              )}
            </div>
          );
        })}
      </div>

      {/* Quick Stats */}
      {sessions.length > 0 && (
        <div className="grid grid-cols-2 gap-4">
          <div className="bg-gradient-to-br from-blue-50 to-cyan-50 rounded-2xl p-4 border border-blue-100">
            <div className="text-sm text-blue-700 mb-1">
              Tổng sessions
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {sessions.length}
            </div>
          </div>
          <div className="bg-gradient-to-br from-green-50 to-emerald-50 rounded-2xl p-4 border border-green-100">
            <div className="text-sm text-green-700 mb-1">
              Tổng bài tập
            </div>
            <div className="text-3xl font-bold text-gray-900">
              {sessions.reduce(
                (sum, s) => sum + s.exercises.length,
                0,
              )}
            </div>
          </div>
        </div>
      )}
    </div>
  );
}