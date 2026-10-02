import {
  CameraView,
  useCameraPermissions,
  type BarcodeScanningResult,
} from "expo-camera";
import { ActivityIndicator, Pressable, StyleSheet, Text, View } from "react-native";

interface QRScannerProps {
  message: string;
  isProcessing: boolean;
  onScan: (data: string) => void;
}

export function QRScanner({
  message,
  isProcessing,
  onScan,
}: QRScannerProps) {
  const [permission, requestPermission] = useCameraPermissions();

  if (!permission) {
    return (
      <View style={styles.center}>
        <ActivityIndicator color="#1DB954" />
      </View>
    );
  }

  if (!permission.granted) {
    return (
      <View style={styles.center}>
        <Text style={styles.title}>Camera access is required</Text>
        <Text style={styles.message}>
          SpotiSter uses the camera only to read music card QR codes.
        </Text>

        <Pressable style={styles.button} onPress={requestPermission}>
          <Text style={styles.buttonText}>Allow Camera</Text>
        </Pressable>
      </View>
    );
  }

  function handleBarcodeScanned(result: BarcodeScanningResult) {
    if (result.type === "qr") {
      onScan(result.data);
    }
  }

  return (
    <View style={styles.container}>
      <CameraView
        style={StyleSheet.absoluteFill}
        facing="back"
        barcodeScannerSettings={{ barcodeTypes: ["qr"] }}
        onBarcodeScanned={isProcessing ? undefined : handleBarcodeScanned}
      />

      <View style={styles.overlay}>
        <View style={styles.scanFrame} />
        <Text style={styles.message}>{message}</Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: "#000",
  },
  center: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    backgroundColor: "#121212",
    padding: 24,
  },
  overlay: {
    flex: 1,
    alignItems: "center",
    justifyContent: "center",
    padding: 24,
  },
  scanFrame: {
    width: 260,
    height: 260,
    borderWidth: 3,
    borderColor: "#1DB954",
    borderRadius: 16,
  },
  title: {
    color: "#fff",
    fontSize: 22,
    fontWeight: "700",
    textAlign: "center",
    marginBottom: 12,
  },
  message: {
    color: "#fff",
    fontSize: 16,
    textAlign: "center",
    marginTop: 28,
    backgroundColor: "rgba(0, 0, 0, 0.65)",
    padding: 12,
  },
  button: {
    marginTop: 24,
    backgroundColor: "#1DB954",
    borderRadius: 24,
    paddingHorizontal: 24,
    paddingVertical: 14,
  },
  buttonText: {
    color: "#000",
    fontWeight: "700",
  },
});