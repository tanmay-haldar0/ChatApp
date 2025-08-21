import { Redirect } from "expo-router";
import { useAuth } from "../src/context/AuthContext";

export default function Index() {
  const { isLoading, token } = useAuth();
  if (isLoading) return null;
  return <Redirect href={token ? "/(app)/home" : "/(auth)/login"} />;
}
// comment