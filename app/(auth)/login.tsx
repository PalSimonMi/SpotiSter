import { View, Text, Pressable, StyleSheet, ActivityIndicator } from "react-native";
import { useAuth } from "../../src/features/auth/hooks/useAuth";
import { Redirect } from "expo-router";

export default function LoginScreen() {
  const { isAuthenticated, isLoading, login } = useAuth();

  if (isAuthenticated) {
    return <Redirect href="/(main)/scanner" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>SpotiSter</Text>
      <Text style={styles.subtitle}>Scan QR → Play Spotify</Text>

      <Pressable style={styles.button} onPress={login} disabled={isLoading}>
        {isLoading ? (
          <ActivityIndicator color="#000" />
        ) : (
          <Text style={styles.buttonText}>Login with Spotify</Text>
        )}
      </Pressable>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
    justifyContent: "center",
    alignItems: "center",
    padding: 24,
  },
  title: {
    fontSize: 32,
    fontWeight: "bold",
    color: "#fff",
    marginBottom: 8,
  },
  subtitle: {
    fontSize: 16,
    color: "#b3b3b3",
    marginBottom: 48,
  },
  button: {
    backgroundColor: "#1DB954",
    paddingHorizontal: 32,
    paddingVertical: 16,
    borderRadius: 50,
    minWidth: 220,
    alignItems: "center",
  },
  buttonText: {
    color: "#000",
    fontSize: 16,
    fontWeight: "bold",
  },
});