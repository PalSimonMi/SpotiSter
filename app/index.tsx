import { Redirect } from "expo-router";
import { useAuth } from "../src/features/auth/hooks/useAuth";
import { View, ActivityIndicator } from "react-native";

export default function Index() {
  const { isAuthenticated, isLoading } = useAuth();

  if (isLoading) {
    return (
      <View style={{ flex: 1, justifyContent: "center", alignItems: "center", backgroundColor: "#000" }}>
        <ActivityIndicator size="large" color="#1DB954" />
      </View>
    );
  }

  if (isAuthenticated) {
    return <Redirect href="/(main)/scanner" />;
  }

  return <Redirect href="/(auth)/login" />;
}