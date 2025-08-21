import React, { useState } from "react";
import { 
  View, 
  Text, 
  TextInput, 
  TouchableOpacity, 
  StyleSheet, 
  Alert, 
  ActivityIndicator 
} from "react-native";
import { Link, Redirect } from "expo-router";
import { loginApi } from "../../src/lib/api";
import { useAuth } from "../../src/context/AuthContext";

export default function LoginScreen() {
  const { token, login } = useAuth();
  const [usernameOrEmail, setUsernameOrEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);

  if (token) return <Redirect href="/(app)/home" />;

  const onSubmit = async () => {
    if (!usernameOrEmail || !password) {
      Alert.alert("Missing fields", "Please fill in all fields.");
      return;
    }
    setLoading(true);
    try {
      const payload = usernameOrEmail.includes("@")
        ? { email: usernameOrEmail, password }
        : { username: usernameOrEmail, password } as any;
      const res = await loginApi(payload);
      await login(res.token, res.user);
    } catch (e: any) {
      Alert.alert("Login failed", e?.response?.data?.error || e.message);
    } finally {
      setLoading(false);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Welcome Back 👋</Text>
      <Text style={styles.subtitle}>Sign in to continue</Text>

      <TextInput
        style={styles.input}
        placeholder="Username or Email"
        placeholderTextColor="#999"
        autoCapitalize="none"
        value={usernameOrEmail}
        onChangeText={setUsernameOrEmail}
      />
      <TextInput
        style={styles.input}
        placeholder="Password"
        placeholderTextColor="#999"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
      />

      <TouchableOpacity 
        style={[styles.button, loading && { opacity: 0.7 }]} 
        onPress={onSubmit} 
        disabled={loading}
      >
        {loading ? (
          <ActivityIndicator color="#fff" />
        ) : (
          <Text style={styles.buttonText}>Sign In</Text>
        )}
      </TouchableOpacity>

      <View style={styles.footer}>
        <Text style={{ color: "#666" }}>Don’t have an account? </Text>
        <Link href="/(auth)/register" style={styles.link}>Sign Up</Link>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: { 
    flex: 1, 
    justifyContent: "center", 
    padding: 24, 
    backgroundColor: "#f9f9f9" 
  },
  title: { 
    fontSize: 28, 
    fontWeight: "700", 
    marginBottom: 6, 
    color: "#222" 
  },
  subtitle: { 
    fontSize: 16, 
    color: "#666", 
    marginBottom: 24 
  },
  input: {
    borderWidth: 1,
    borderColor: "#ddd",
    padding: 14,
    borderRadius: 10,
    marginBottom: 14,
    backgroundColor: "#fff",
    fontSize: 16
  },
  button: {
    backgroundColor: "#007AFF",
    paddingVertical: 14,
    borderRadius: 10,
    alignItems: "center",
    marginTop: 4,
    shadowColor: "#000",
    shadowOpacity: 0.1,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 4,
    elevation: 2
  },
  buttonText: {
    color: "#fff",
    fontSize: 17,
    fontWeight: "600"
  },
  footer: { 
    flexDirection: "row", 
    justifyContent: "center", 
    marginTop: 20 
  },
  link: { 
    color: "#007AFF", 
    fontWeight: "600" 
  }
});
