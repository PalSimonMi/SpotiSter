import { Redirect } from "expo-router";
import { useKeepAwake } from "expo-keep-awake";
import { StyleSheet, Text, View } from "react-native";
import { QRScanner } from "../../src/features/scanner/components/QRScanner";
import { useQRScanner } from "../../src/features/scanner/hooks/useQRScanner";
import { useAuth } from "../../src/features/auth/hooks/useAuth";

export default function ScannerScreen() {
  useKeepAwake();

  const { isAuthenticated, isLoading } = useAuth();
  const { message, isProcessing, handleScan } = useQRScanner();

  if (isLoading) {
    return <View style={styles.loading} />;
  }

  if (!isAuthenticated) {
    return <Redirect href="/(auth)/login" />;
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Scan Music Card</Text>

      <QRScanner
        message={message}
        isProcessing={isProcessing}
        onScan={handleScan}
      />
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#121212",
  },
  loading: {
    flex: 1,
    backgroundColor: "#121212",
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    padding: 20,
    paddingTop: 56,
  },
});