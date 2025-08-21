import { Stack, Redirect } from "expo-router";
import { useAuth } from "../../src/context/AuthContext";

export default function AuthStack() {
  const { token, isLoading } = useAuth();
  if (isLoading) return null;
  if (token) return <Redirect href="/(app)/home" />;
  return <Stack screenOptions={{ headerTitleAlign: "center" }} />;
}

