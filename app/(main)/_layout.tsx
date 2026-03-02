import { Tabs } from "expo-router";
import { Droplet, Dumbbell, Flame, Home, User } from "lucide-react-native";

export default function MainLayout() {
  return (
    <Tabs screenOptions={{ headerShown: false }}>
      <Tabs.Screen
        name="dashboard"
        options={{
          title: "Home",
          tabBarIcon: ({ color }) => <Home color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="calories"
        options={{
          title: "Calories",
          tabBarIcon: ({ color }) => <Flame color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="workout"
        options={{
          title: "Workout",
          tabBarIcon: ({ color }) => <Dumbbell color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="water"
        options={{
          title: "Water",
          tabBarIcon: ({ color }) => <Droplet color={color} size={24} />,
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Profile",
          tabBarIcon: ({ color }) => <User color={color} size={24} />,
        }}
      />
    </Tabs>
  );
}
