import React, { useState } from "react";
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  StyleSheet,
  ScrollView,
} from "react-native";
import { useSafeAreaInsets } from "react-native-safe-area-context";
import { Ionicons } from "@expo/vector-icons";
import { useFocusEffect, useNavigation } from "@react-navigation/native";
import { NativeStackNavigationProp } from "@react-navigation/native-stack";
import VendorCard from "../components/VendorCard";
import { colors } from "../theme/colors";
import { Vendor } from "models/vendors";
import { getVendorsAPI } from "services/services";

type NavigationProp = NativeStackNavigationProp<any>;
const LIVE_REFRESH_INTERVAL_MS = 5000;

export default function VendorBrowseScreen() {
  const navigation = useNavigation<NavigationProp>();
  const insets = useSafeAreaInsets();
  const [search, setSearch] = useState("");
  const [vendors, setVendors] = useState<Vendor[]>([]);

  const fetchVendors = async () => {
    try {
      const data = await getVendorsAPI();
      setVendors(data.vendors || []);
    } catch (error) {
      console.error("Failed to fetch vendors:", error);
      setVendors([]);
    }
  };

  useFocusEffect(
    React.useCallback(() => {
      void fetchVendors();

      const interval = setInterval(() => {
        void fetchVendors();
      }, LIVE_REFRESH_INTERVAL_MS);

      return () => clearInterval(interval);
    }, []),
  );

  const filtered = vendors.filter((v) =>
    v.name?.toLowerCase().includes(search.toLowerCase()),
  );

  return (
    <View style={styles.flex}>
      {/* Header */}
      <View style={[styles.header, { paddingTop: insets.top + 12 }]}>
        <View style={styles.headerTop}>
          <View>
            <Text style={styles.headerTitle}>Welcome back!</Text>
            <Text style={styles.headerSubtitle}>
              What would you like to eat today?
            </Text>
          </View>
          <TouchableOpacity style={styles.bellBtn}>
            <Ionicons
              name="notifications-outline"
              size={24}
              color={colors.white}
            />
            <View style={styles.bellDot} />
          </TouchableOpacity>
        </View>

        {/* Search */}
        <View style={styles.searchWrapper}>
          <Ionicons
            name="search"
            size={20}
            color={colors.gray400}
            style={styles.searchIcon}
          />
          <TextInput
            style={styles.searchInput}
            value={search}
            onChangeText={setSearch}
            placeholder="Search for vendors or food..."
            placeholderTextColor={colors.gray400}
          />
        </View>
      </View>

      <ScrollView
        style={styles.flex}
        contentContainerStyle={styles.content}
        showsVerticalScrollIndicator={false}
      >
        {/* Vendors */}
        <Text style={styles.sectionTitle}>Available Vendors</Text>
        {filtered.map((vendor) => (
          <VendorCard
            key={vendor.id}
            name={vendor.name ?? ""}
            rating={vendor.rating ?? 0}
            deliveryTime={vendor.eta ?? "~15 min"}
            imageUrl={vendor.image_url ?? ""}
            onPress={() => navigation.navigate("MenuOrder", { vendor })}
          />
        ))}
      </ScrollView>
    </View>
  );
}

const styles = StyleSheet.create({
  flex: {
    flex: 1,
    backgroundColor: colors.surface,
  },
  header: {
    backgroundColor: colors.primary,
    paddingHorizontal: 20,
    paddingBottom: 20,
  },
  headerTop: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: 16,
  },
  headerTitle: {
    fontSize: 22,
    fontWeight: "700",
    color: colors.white,
  },
  headerSubtitle: {
    fontSize: 13,
    color: "rgba(255,255,255,0.8)",
    marginTop: 2,
  },
  bellBtn: {
    position: "relative",
    padding: 4,
  },
  bellDot: {
    position: "absolute",
    top: 4,
    right: 4,
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: colors.amber,
  },
  searchWrapper: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: colors.white,
    borderRadius: 10,
  },
  searchIcon: {
    paddingLeft: 12,
    paddingRight: 4,
  },
  searchInput: {
    flex: 1,
    paddingVertical: 13,
    paddingRight: 12,
    fontSize: 15,
    color: colors.text,
  },
  content: {
    padding: 20,
    paddingTop: 0,
  },
  statsCard: {
    backgroundColor: colors.white,
    borderRadius: 14,
    marginTop: -20,
    marginBottom: 20,
    flexDirection: "row",
    justifyContent: "space-around",
    alignItems: "center",
    paddingVertical: 16,
    paddingHorizontal: 12,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 3 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  statItem: {
    alignItems: "center",
  },
  statValue: {
    fontSize: 20,
    fontWeight: "700",
    color: colors.primary,
  },
  ratingValue: {
    color: colors.amber,
  },
  statLabel: {
    fontSize: 12,
    color: colors.gray500,
    marginTop: 2,
  },
  statDivider: {
    width: 1,
    height: 32,
    backgroundColor: colors.gray200,
  },
  sectionTitle: {
    fontSize: 18,
    fontWeight: "700",
    color: colors.text,
    marginTop: 20,
    marginBottom: 14,
  },
});
