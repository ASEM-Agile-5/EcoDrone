import React from 'react';
import {
  View,
  Text,
  StyleSheet,
  ScrollView,
  Dimensions,
} from 'react-native';
import { useSafeAreaInsets } from 'react-native-safe-area-context';
import { Ionicons } from '@expo/vector-icons';
import { LineChart } from 'react-native-chart-kit';
import { colors } from '../theme/colors';

const { width } = Dimensions.get('window');

const temperatureData = [65, 64, 63, 62, 62, 61, 61, 60, 60];
const timeLabels = ['0m', '1m', '2m', '3m', '4m', '5m', '6m', '7m', '8m'];

export default function DroneTemperatureScreen() {
  const insets = useSafeAreaInsets();
  const currentTemp = temperatureData[temperatureData.length - 1];
  const isSafe = currentTemp >= 55 && currentTemp <= 70;

  const avgTemp = Math.round(
    temperatureData.reduce((a, b) => a + b, 0) / temperatureData.length
  );
  const highTemp = Math.max(...temperatureData);
  const lowTemp = Math.min(...temperatureData);

  return (
    <View style={styles.flex}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <Text style={styles.headerTitle}>Climate Analytics</Text>
        <Text style={styles.headerSubtitle}>Real-time temperature tracking</Text>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Status Card */}
        <View
          style={[
            styles.statusCard,
            isSafe ? styles.statusSafe : styles.statusWarn,
          ]}
        >
          <View style={styles.statusHeader}>
            <Ionicons
              name={isSafe ? 'checkmark-circle' : 'alert-circle'}
              size={22}
              color={isSafe ? colors.success : colors.warning}
            />
            <Text style={[styles.statusTitle, isSafe ? styles.safeText : styles.warnText]}>
              {isSafe ? 'Temperature within safe range' : 'Temperature monitoring active'}
            </Text>
          </View>
          <View style={styles.tempRow}>
            <Text style={[styles.tempBig, isSafe ? styles.safeText : styles.warnText]}>
              {currentTemp}°C
            </Text>
            <Text style={[styles.tempSub, isSafe ? styles.safeSubText : styles.warnSubText]}>
              Current Temperature
            </Text>
          </View>
          <Text style={[styles.safeRange, isSafe ? styles.safeSubText : styles.warnSubText]}>
            Safe range: 55°C – 70°C
          </Text>
        </View>

        {/* Chart */}
        <View style={styles.chartCard}>
          <Text style={styles.cardTitle}>Temperature Over Time</Text>
          <LineChart
            data={{
              labels: timeLabels,
              datasets: [{ data: temperatureData }],
            }}
            width={width - 64}
            height={200}
            yAxisSuffix="°"
            yAxisInterval={1}
            fromZero={false}
            chartConfig={{
              backgroundColor: colors.white,
              backgroundGradientFrom: colors.white,
              backgroundGradientTo: colors.white,
              decimalPlaces: 0,
              color: () => colors.primary,
              labelColor: () => colors.gray500,
              propsForDots: {
                r: '4',
                strokeWidth: '2',
                stroke: colors.primary,
              },
              propsForBackgroundLines: {
                stroke: colors.gray100,
              },
            }}
            bezier
            style={styles.chart}
          />
        </View>

        {/* Stats Grid */}
        <View style={styles.statsGrid}>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Average Temp</Text>
            <Text style={styles.statValue}>{avgTemp}°C</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Flight Time</Text>
            <Text style={styles.statValue}>8 min</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Highest Temp</Text>
            <Text style={styles.statValue}>{highTemp}°C</Text>
          </View>
          <View style={styles.statCard}>
            <Text style={styles.statLabel}>Lowest Temp</Text>
            <Text style={styles.statValue}>{lowTemp}°C</Text>
          </View>
        </View>

        {/* Info Card */}
        <View style={styles.infoCard}>
          <Text style={styles.infoTitle}>About Temperature Monitoring</Text>
          <Text style={styles.infoText}>
            Our EcoDrone system continuously monitors food temperature during delivery to ensure
            your meal arrives fresh and safe to eat. The insulated compartment maintains optimal
            temperature throughout the flight.
          </Text>
        </View>
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: { flex: 1, backgroundColor: colors.surface },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTitle: { fontSize: 22, fontWeight: '700', color: colors.white },
  headerSubtitle: { fontSize: 13, color: 'rgba(255,255,255,0.8)', marginTop: 2 },
  content: { padding: 16, gap: 14 },
  statusCard: {
    borderRadius: 14,
    padding: 16,
    borderWidth: 2,
    gap: 8,
  },
  statusSafe: {
    backgroundColor: '#f0fdf4',
    borderColor: '#bbf7d0',
  },
  statusWarn: {
    backgroundColor: '#fffbeb',
    borderColor: '#fde68a',
  },
  statusHeader: { flexDirection: 'row', alignItems: 'center', gap: 8 },
  statusTitle: { fontSize: 14, fontWeight: '600', flex: 1 },
  safeText: { color: '#166534' },
  warnText: { color: '#92400e' },
  safeSubText: { color: '#15803d' },
  warnSubText: { color: '#b45309' },
  tempRow: { flexDirection: 'row', alignItems: 'baseline', gap: 8 },
  tempBig: { fontSize: 38, fontWeight: '700' },
  tempSub: { fontSize: 13 },
  safeRange: { fontSize: 12 },
  chartCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
    gap: 12,
  },
  cardTitle: { fontSize: 15, fontWeight: '600', color: colors.text },
  chart: { borderRadius: 10, marginLeft: -8 },
  statsGrid: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 12,
  },
  statCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 14,
    flex: 1,
    minWidth: '45%',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
    gap: 4,
  },
  statLabel: { fontSize: 12, color: colors.gray500 },
  statValue: { fontSize: 22, fontWeight: '700', color: colors.primary },
  infoCard: {
    backgroundColor: colors.infoLight,
    borderRadius: 14,
    padding: 16,
    borderWidth: 1,
    borderColor: '#bfdbfe',
    gap: 6,
  },
  infoTitle: { fontSize: 14, fontWeight: '600', color: '#1e3a5f' },
  infoText: { fontSize: 13, color: '#1d4ed8', lineHeight: 20 },
});
