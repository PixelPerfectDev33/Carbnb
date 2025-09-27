import { useState } from "react";
import { View, Text, TextInput, Button, Alert } from "react-native";
import { supabase } from "@/lib/supabase";
import { useRouter } from "expo-router";

export default function Login() {
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [loading, setLoading] = useState(false);
  const [message, setMessage] = useState<string | null>(null);

  const router = useRouter();

  const handleLogin = async () => {
    setLoading(true);
    setMessage(null);

    const { data, error } = await supabase.auth.signInWithPassword({
      email,
      password,
    });

    setLoading(false);

    if (error) {
      setMessage(error.message); // show error
    } else {
      setMessage("✅ Login successful!");
      router.push("/"); // redirect to homepage after login
    }
  };

  return (
    <View style={{ padding: 20 }}>
      <Text style={{ fontSize: 24, marginBottom: 16 }}>Login</Text>

      <TextInput
        placeholder="Email"
        value={email}
        onChangeText={setEmail}
        autoCapitalize="none"
        style={{
          borderWidth: 1,
          padding: 10,
          marginBottom: 12,
          borderRadius: 6,
        }}
      />

      <TextInput
        placeholder="Password"
        secureTextEntry
        value={password}
        onChangeText={setPassword}
        style={{
          borderWidth: 1,
          padding: 10,
          marginBottom: 12,
          borderRadius: 6,
        }}
      />

      <Button
        title={loading ? "Logging in..." : "Login"}
        onPress={handleLogin}
      />

      {message && (
        <Text
          style={{
            marginTop: 16,
            color: message.includes("✅") ? "green" : "red",
          }}
        >
          {message}
        </Text>
      )}
    </View>
  );
}
