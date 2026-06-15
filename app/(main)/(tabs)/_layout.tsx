import Ionicons from "@expo/vector-icons/Ionicons";
import { Tabs } from "expo-router";
import { CameraTabButton } from "@/components/navigation/CameraTabButton";
import { theme } from "@/constants/theme";

export default function TabsLayout() {
  return (
    <Tabs
      initialRouteName="index"
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: theme.colors.primary,
        tabBarInactiveTintColor: theme.colors.textSecondary,
        tabBarLabelStyle: {
          fontSize: 11,
          fontWeight: "500",
          marginTop: 2,
        },
        tabBarStyle: {
          backgroundColor: theme.colors.background,
          borderTopColor: theme.colors.border,
          height: 72,
          paddingBottom: 10,
          paddingTop: 8,
        },
      }}
    >
      <Tabs.Screen
        name="index"
        options={{
          title: "Início",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="home-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="history"
        options={{
          title: "Histórico",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="time-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="camera"
        options={{
          title: "",
          tabBarButton: (props) => <CameraTabButton {...props} />,
          tabBarStyle: { display: "none" },
        }}
      />
      <Tabs.Screen
        name="search"
        options={{
          title: "Pesquisar",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="search-outline" size={size} color={color} />
          ),
        }}
      />
      <Tabs.Screen
        name="profile"
        options={{
          title: "Perfil",
          tabBarIcon: ({ color, size }) => (
            <Ionicons name="person-outline" size={size} color={color} />
          ),
        }}
      />
    </Tabs>
  );
}
