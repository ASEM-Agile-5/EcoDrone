import React from "react";
import { StyleSheet, Text, View } from "react-native";
import Svg, {
  Circle,
  Image as SvgImage,
  Line,
  Rect,
  Text as SvgText,
} from "react-native-svg";
import { Ionicons } from "@expo/vector-icons";
import { colors } from "../theme/colors";

type Point = {
  lat: number;
  lon: number;
  name: string;
};

type Props = {
  vendorName: string;
  locationName: string;
  locationCoords?: { latitude: number; longitude: number } | null;
  status: string;
  assignedDrone?: string | null;
};

const BASE = { lat: 5.75985, lon: -0.2201, name: "Ashesi Hub" };
const DEFAULT_VENDOR = { lat: 5.7606, lon: -0.2192 };
const DEFAULT_BUYER = { lat: 5.7588, lon: -0.2215 };

const MAP_WIDTH = 320;
const MAP_HEIGHT = 220;
const BASE_ZOOM = 17;
const TILE_SIZE = 256;
const DISPLAY_ZOOM = 0.55;

function resolvePoints(
  vendorName: string,
  locationName: string,
  locationCoords?: { latitude: number; longitude: number } | null,
): { base: Point; vendor: Point; buyer: Point } {
  return {
    base: BASE,
    vendor: {
      lat: DEFAULT_VENDOR.lat,
      lon: DEFAULT_VENDOR.lon,
      name: vendorName || "Vendor",
    },
    buyer: {
      lat: locationCoords?.latitude ?? DEFAULT_BUYER.lat,
      lon: locationCoords?.longitude ?? DEFAULT_BUYER.lon,
      name: locationName || "Delivery Point",
    },
  };
}

function latLonToWorldPx(lat: number, lon: number) {
  const sinLat = Math.sin((lat * Math.PI) / 180);
  const x = ((lon + 180) / 360) * TILE_SIZE * 2 ** BASE_ZOOM;
  const y =
    (0.5 - Math.log((1 + sinLat) / (1 - sinLat)) / (4 * Math.PI)) *
    TILE_SIZE *
    2 ** BASE_ZOOM;
  return { x, y };
}

function project(point: Point, centerPx: { x: number; y: number }) {
  const px = latLonToWorldPx(point.lat, point.lon);
  return {
    x: (px.x - centerPx.x) * DISPLAY_ZOOM + MAP_WIDTH / 2,
    y: (px.y - centerPx.y) * DISPLAY_ZOOM + MAP_HEIGHT / 2,
  };
}

function getDronePoint(
  base: Point,
  vendor: Point,
  buyer: Point,
  status: string,
  assignedDrone?: string | null,
): Point {
  const normalized = status?.toLowerCase() ?? "";
  if (["completed", "delivered"].includes(normalized)) {
    return buyer;
  }
  if (["preparing", "in progress"].includes(normalized)) {
    return vendor;
  }
  if (normalized === "in transit") {
    return {
      lat: (vendor.lat + buyer.lat) / 2,
      lon: (vendor.lon + buyer.lon) / 2,
      name: assignedDrone || "Drone",
    };
  }
  if (normalized === "pending" && assignedDrone) {
    return base;
  }
  return base;
}

function getStageLabel(status: string, assignedDrone?: string | null) {
  const normalized = status?.toLowerCase() ?? "";
  if (normalized === "pending" && !assignedDrone) {
    return "Pending acceptance";
  }
  if (normalized === "pending" && assignedDrone) {
    return "Drone assigned";
  }
  if (["preparing", "in progress"].includes(normalized)) {
    return "Preparing";
  }
  if (normalized === "in transit") {
    return "En route";
  }
  if (["completed", "delivered"].includes(normalized)) {
    return "Delivered";
  }
  return "Awaiting update";
}

export default function TrackingMapCard({
  vendorName,
  locationName,
  locationCoords,
  status,
  assignedDrone,
}: Props) {
  const { base, vendor, buyer } = resolvePoints(
    vendorName,
    locationName,
    locationCoords,
  );
  const centerPx = latLonToWorldPx(BASE.lat, BASE.lon);
  const basePos = project(base, centerPx);
  const vendorPos = project(vendor, centerPx);
  const buyerPos = project(buyer, centerPx);
  const dronePos = project(
    getDronePoint(base, vendor, buyer, status, assignedDrone),
    centerPx,
  );
  const centerTileX = Math.floor(centerPx.x / TILE_SIZE);
  const centerTileY = Math.floor(centerPx.y / TILE_SIZE);
  const tileRadius = 2;

  return (
    <View style={styles.card}>
      <View style={styles.headerRow}>
        <View>
          <Text style={styles.title}>Delivery Route</Text>
          <Text style={styles.subtitle}>{getStageLabel(status, assignedDrone)}</Text>
        </View>
        <View style={styles.legendPill}>
          <Ionicons name="airplane-outline" size={14} color={colors.primary} />
          <Text style={styles.legendText}>{assignedDrone || "Drone pending"}</Text>
        </View>
      </View>

      <View style={styles.mapShell}>
        <Svg width="100%" height={MAP_HEIGHT} viewBox={`0 0 ${MAP_WIDTH} ${MAP_HEIGHT}`}>
          <Rect x="0" y="0" width={MAP_WIDTH} height={MAP_HEIGHT} rx="18" fill="#eef2f7" />

          {Array.from({ length: tileRadius * 2 + 1 }, (_, xIndex) =>
            Array.from({ length: tileRadius * 2 + 1 }, (_, yIndex) => {
              const tileX = centerTileX + xIndex - tileRadius;
              const tileY = centerTileY + yIndex - tileRadius;
              return (
                <SvgImage
                  key={`${tileX}-${tileY}`}
                  href={`https://a.tile.openstreetmap.org/${BASE_ZOOM}/${tileX}/${tileY}.png`}
                  x={(tileX * TILE_SIZE - centerPx.x) * DISPLAY_ZOOM + MAP_WIDTH / 2}
                  y={(tileY * TILE_SIZE - centerPx.y) * DISPLAY_ZOOM + MAP_HEIGHT / 2}
                  width={TILE_SIZE * DISPLAY_ZOOM + 1}
                  height={TILE_SIZE * DISPLAY_ZOOM + 1}
                  preserveAspectRatio="none"
                  opacity={0.92}
                />
              );
            }),
          )}

          <Rect
            x="0"
            y="0"
            width={MAP_WIDTH}
            height={MAP_HEIGHT}
            rx="18"
            fill="rgba(255,255,255,0.08)"
          />

          <Line
            x1={basePos.x}
            y1={basePos.y}
            x2={vendorPos.x}
            y2={vendorPos.y}
            stroke="#8A1538"
            strokeWidth="3"
            strokeDasharray="7 5"
          />
          <Line
            x1={vendorPos.x}
            y1={vendorPos.y}
            x2={buyerPos.x}
            y2={buyerPos.y}
            stroke="#b4235d"
            strokeWidth="3"
            strokeDasharray="7 5"
          />

          {[
            { point: basePos, label: "Base" },
            { point: vendorPos, label: vendor.name },
            { point: buyerPos, label: buyer.name },
          ].map(({ point, label }, index) => (
            <React.Fragment key={`${label}-${index}`}>
              <Circle cx={point.x} cy={point.y} r="8" fill="#ffffff" stroke="#8A1538" strokeWidth="2.5" />
              <Circle cx={point.x} cy={point.y} r="3" fill="#8A1538" />
              <Rect
                x={Math.min(point.x + 10, MAP_WIDTH - 112)}
                y={point.y - 22}
                width="102"
                height="22"
                rx="6"
                fill="rgba(255,255,255,0.92)"
              />
              <SvgText
                x={Math.min(point.x + 18, MAP_WIDTH - 104)}
                y={point.y - 8}
                fontSize="10"
                fontWeight="600"
                fill="#111827"
              >
                {label.length > 16 ? `${label.slice(0, 16)}...` : label}
              </SvgText>
            </React.Fragment>
          ))}

          <Circle cx={dronePos.x} cy={dronePos.y} r="16" fill="rgba(138,21,56,0.14)" />
          <Line x1={dronePos.x} y1={dronePos.y} x2={dronePos.x + 8} y2={dronePos.y - 8} stroke="#8A1538" strokeWidth="2.2" />
          <Line x1={dronePos.x} y1={dronePos.y} x2={dronePos.x - 8} y2={dronePos.y - 8} stroke="#8A1538" strokeWidth="2.2" />
          <Line x1={dronePos.x} y1={dronePos.y} x2={dronePos.x + 8} y2={dronePos.y + 8} stroke="#8A1538" strokeWidth="2.2" />
          <Line x1={dronePos.x} y1={dronePos.y} x2={dronePos.x - 8} y2={dronePos.y + 8} stroke="#8A1538" strokeWidth="2.2" />
          <Circle cx={dronePos.x} cy={dronePos.y} r="4.5" fill="#8A1538" stroke="#ffffff" strokeWidth="1.8" />
          <Circle cx={dronePos.x + 8} cy={dronePos.y - 8} r="3.5" fill="#ffffff" stroke="#8A1538" strokeWidth="1.5" />
          <Circle cx={dronePos.x - 8} cy={dronePos.y - 8} r="3.5" fill="#ffffff" stroke="#8A1538" strokeWidth="1.5" />
          <Circle cx={dronePos.x + 8} cy={dronePos.y + 8} r="3.5" fill="#ffffff" stroke="#8A1538" strokeWidth="1.5" />
          <Circle cx={dronePos.x - 8} cy={dronePos.y + 8} r="3.5" fill="#ffffff" stroke="#8A1538" strokeWidth="1.5" />
        </Svg>
      </View>

      <View style={styles.footerRow}>
        <Text style={styles.footerLabel}>Route</Text>
        <Text style={styles.footerValue}>
          {vendorName || "Vendor"} to {locationName || "Destination"}
        </Text>
      </View>
    </View>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 14,
    padding: 16,
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.07,
    shadowRadius: 5,
    elevation: 2,
    gap: 14,
  },
  headerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    gap: 12,
  },
  title: {
    fontSize: 15,
    fontWeight: "600",
    color: colors.text,
  },
  subtitle: {
    fontSize: 12,
    color: colors.gray500,
    marginTop: 2,
  },
  legendPill: {
    flexDirection: "row",
    alignItems: "center",
    gap: 6,
    backgroundColor: colors.primaryLight,
    borderRadius: 999,
    paddingHorizontal: 10,
    paddingVertical: 6,
  },
  legendText: {
    fontSize: 11,
    fontWeight: "600",
    color: colors.primary,
  },
  mapShell: {
    borderRadius: 18,
    overflow: "hidden",
    backgroundColor: "#f6f7fb",
  },
  footerRow: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    gap: 10,
  },
  footerLabel: {
    fontSize: 12,
    color: colors.gray500,
  },
  footerValue: {
    flex: 1,
    textAlign: "right",
    fontSize: 13,
    fontWeight: "600",
    color: colors.text,
  },
});
