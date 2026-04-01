import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import { colors } from '../theme/colors';

interface VendorCardProps {
  name: string;
  rating: number;
  deliveryTime: string;
  imageUrl: string;
  onPress?: () => void;
}

export default function VendorCard({ name, rating, deliveryTime, imageUrl, onPress }: VendorCardProps) {
  return (
    <TouchableOpacity style={styles.card} onPress={onPress} activeOpacity={0.85}>
      <Image source={{ uri: imageUrl }} style={styles.image} resizeMode="cover" />
      <View style={styles.info}>
        <Text style={styles.name}>{name}</Text>
        <View style={styles.meta}>
          <View style={styles.metaItem}>
            <Ionicons name="star" size={14} color={colors.amber} />
            <Text style={styles.metaText}>{rating}</Text>
          </View>
          <View style={styles.metaItem}>
            <Ionicons name="time-outline" size={14} color={colors.gray500} />
            <Text style={styles.metaSecondary}>{deliveryTime}</Text>
          </View>
        </View>
      </View>
    </TouchableOpacity>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: colors.white,
    borderRadius: 12,
    overflow: 'hidden',
    shadowColor: colors.black,
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 3,
    marginBottom: 16,
  },
  image: {
    width: '100%',
    height: 160,
  },
  info: {
    padding: 14,
  },
  name: {
    fontSize: 16,
    fontWeight: '600',
    color: colors.text,
    marginBottom: 8,
  },
  meta: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  metaItem: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  metaText: {
    fontSize: 13,
    fontWeight: '500',
    color: colors.text,
    marginLeft: 4,
  },
  metaSecondary: {
    fontSize: 13,
    color: colors.gray500,
    marginLeft: 4,
  },
});
