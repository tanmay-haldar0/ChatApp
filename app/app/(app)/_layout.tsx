import { Stack, Redirect } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";
import { Text, TouchableOpacity } from "react-native";

export default function AppStack() {
  const { token, isLoading, logout } = useAuth();
  if (isLoading) return null;
  if (!token) return <Redirect href="/(auth)/login" />;

  return (
    <Stack
      screenOptions={{
        headerTitleAlign: "center",
        headerRight: () => (
          <TouchableOpacity onPress={logout} accessibilityRole="button" style={{ paddingHorizontal: 12 }}>
            <Text style={{ color: "#f55", fontWeight: "600" }}>Logout</Text>
          </TouchableOpacity>
        ),
      }}
    />
  );
}

