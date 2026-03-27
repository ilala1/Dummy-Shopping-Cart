import { StatusBar } from 'expo-status-bar';
import { StyleSheet, Text, View } from 'react-native';

/** Placeholder until navigation and session wiring land in a later commit. */
export default function App() {
  return (
    <View style={styles.box}>
      <Text style={styles.title}>Retail cart</Text>
      <StatusBar style="dark" />
    </View>
  );
}

const styles = StyleSheet.create({
  box: { flex: 1, alignItems: 'center', justifyContent: 'center' },
  title: { fontSize: 18, fontWeight: '600' },
});
