import React, { useEffect, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  Animated,
  TouchableWithoutFeedback,
} from "react-native";
import { useNavigation } from "@react-navigation/native";

type CompanyCardProps = {
  name: string;
  color: string;
  deliveryTime: string;
  location: string;
  rating: string;
  delay?: number;
};

export default function CompanyCard({
  name,
  color,
  deliveryTime,
  location,
  rating,
  delay = 0,
}: CompanyCardProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.9)).current;
  const pressAnim = useRef(new Animated.Value(1)).current;

  const navigation = useNavigation<any>();

  useEffect(() => {
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 600,
        delay,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 6,
        tension: 100,
        delay,
        useNativeDriver: true,
      }),
    ]).start();
  }, [fadeAnim, scaleAnim, delay]);

  const handlePressIn = () => {
    Animated.spring(pressAnim, {
      toValue: 0.97,
      friction: 4,
      tension: 120,
      useNativeDriver: true,
    }).start();
  };

  const handlePressOut = () => {
    Animated.spring(pressAnim, {
      toValue: 1,
      friction: 3,
      tension: 100,
      useNativeDriver: true,
    }).start();
  };

  const handlePress = () => {
    navigation.navigate("FirmDetails", {
      firm: {
        id: name.toLowerCase().replace(/\s/g, '-'),
        name,
        color,
        rating: parseFloat(rating),
        deliveryTime,
        location
      }
    });
  };

  return (
    <TouchableWithoutFeedback
      onPressIn={handlePressIn}
      onPressOut={handlePressOut}
      onPress={handlePress}
    >
      <Animated.View
        style={[
          styles.card,
          {
            opacity: fadeAnim,
            transform: [{ scale: Animated.multiply(scaleAnim, pressAnim) }],
          },
        ]}
      >
        {/* Company Name Banner */}
        <View style={[styles.banner, { backgroundColor: color }]}>
          <Text style={styles.bannerText}>{name}</Text>
        </View>

        {/* Info Row: Time, Location, Rating */}
        <View style={styles.infoRow}>
          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>⏰</Text>
            <Text style={styles.infoText}>{deliveryTime}</Text>
          </View>

          <View style={styles.infoItem}>
            <Text style={styles.infoIcon}>📍</Text>
            <Text style={styles.infoText}>{location}</Text>
          </View>

          <View style={styles.ratingContainer}>
            <Text style={styles.starIcon}>⭐</Text>
            <Text style={styles.ratingText}>{rating}</Text>
          </View>
        </View>

        {/* Promotions Row */}
        <View style={styles.promosRow}>
          <View style={styles.promoChipGreen}>
            <Text style={styles.promoTextGreen}>-10% delivery</Text>
          </View>
          <View style={styles.promoChipBlue}>
            <Text style={styles.promoTextBlue}>-20% bottles</Text>
          </View>
        </View>

        {/* CTA Button */}
        <TouchableWithoutFeedback onPress={handlePress}>
          <View style={styles.ctaButton}>
            <Text style={styles.ctaButtonText}>Өнімлерге өтіw</Text>
          </View>
        </TouchableWithoutFeedback>
      </Animated.View>
    </TouchableWithoutFeedback>
  );
}

const styles = StyleSheet.create({
  card: {
    backgroundColor: "#FFFFFF",
    borderRadius: 24,
    padding: 0,
    marginHorizontal: 16,
    marginBottom: 20,
    shadowColor: "#000",
    shadowOpacity: 0.08,
    shadowOffset: { width: 0, height: 2 },
    shadowRadius: 12,
    elevation: 3,
    overflow: "hidden",
  },
  banner: {
    paddingVertical: 48,
    paddingHorizontal: 24,
    justifyContent: "center",
    alignItems: "center",
    borderTopLeftRadius: 24,
    borderTopRightRadius: 24,
  },
  bannerText: {
    color: "#FFFFFF",
    fontWeight: "900",
    fontSize: 56,
    letterSpacing: -1,
    textAlign: "center",
  },
  infoRow: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 16,
    paddingTop: 16,
    paddingBottom: 12,
    justifyContent: "flex-start",
  },
  infoItem: {
    flexDirection: "row",
    alignItems: "center",
    marginRight: 20,
  },
  infoIcon: {
    fontSize: 16,
    marginRight: 4,
  },
  infoText: {
    fontSize: 15,
    color: "#3D3D3D",
    fontWeight: "500",
  },
  ratingContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginLeft: "auto",
  },
  starIcon: {
    fontSize: 18,
    marginRight: 4,
  },
  ratingText: {
    fontSize: 16,
    fontWeight: "700",
    color: "#3D3D3D",
  },
  promosRow: {
    flexDirection: "row",
    paddingHorizontal: 16,
    paddingBottom: 16,
    gap: 8,
  },
  promoChipGreen: {
    backgroundColor: "#E8F5E9",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  promoTextGreen: {
    fontSize: 14,
    fontWeight: "700",
    color: "#2E7D32",
  },
  promoChipBlue: {
    backgroundColor: "#E3F2FD",
    paddingHorizontal: 12,
    paddingVertical: 6,
    borderRadius: 8,
  },
  promoTextBlue: {
    fontSize: 14,
    fontWeight: "700",
    color: "#1976D2",
  },
  ctaButton: {
    backgroundColor: "#1976D2",
    marginHorizontal: 16,
    marginBottom: 16,
    paddingVertical: 16,
    borderRadius: 16,
    alignItems: "center",
    justifyContent: "center",
  },
  ctaButtonText: {
    color: "#FFFFFF",
    fontSize: 17,
    fontWeight: "700",
    letterSpacing: 0.3,
  },
});
