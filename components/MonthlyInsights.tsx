import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  Image,
  TouchableOpacity,
  Dimensions,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { FONTS, SIZES } from "../constants/theme";
import { useNavigation } from "@react-navigation/native";
import { useMood } from "../context/MoodContext";

const { width } = Dimensions.get("window");

interface MonthlyInsightsProps {
  statsByDay: number[];
  statsTotal: number[];
  totalDays: number;
  totalEntries: number;
}

const MonthlyInsights: React.FC<MonthlyInsightsProps> = ({
  statsByDay,
  statsTotal,
  totalDays,
  totalEntries,
}) => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();
  const { emojis } = useMood();
  const [activeTab, setActiveTab] = useState<"days" | "counts">("counts");

  const currentStats = activeTab === "days" ? statsByDay : statsTotal;
  const currentTotal = activeTab === "days" ? totalDays : totalEntries;
  const unit = activeTab === "days" ? "ngày" : "lần";

  const normalizeColor = (color: string | undefined, fallback: string) => {
    const value = color || fallback;
    if (/^#[0-9A-Fa-f]{6}$/.test(value)) {
      return value;
    }
    return fallback;
  };

  const softColor = (color: string) => {
    if (/^#[0-9A-Fa-f]{6}$/.test(color)) {
      return `${color}20`;
    }
    return `${color}`;
  };

  return (
    <View style={styles.insightsSection}>
      <View style={styles.sectionHeader}>
        <Text style={[styles.sectionTitle, { color: colors.secondary }]}>
          Monthly Insights
        </Text>

        <View
          style={[
            styles.miniTabContainer,
            {
              backgroundColor: colors.background.soft,
              borderColor: colors.border,
            },
          ]}
        >
          <TouchableOpacity
            style={[
              styles.miniTab,
              activeTab === "days" && { backgroundColor: colors.primary },
            ]}
            onPress={() => setActiveTab("days")}
          >
            <Text
              style={[
                styles.miniTabText,
                {
                  color:
                    activeTab === "days"
                      ? colors.text.textOnDark
                      : colors.primary,
                },
              ]}
            >
              Ngày
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            style={[
              styles.miniTab,
              activeTab === "counts" && { backgroundColor: colors.primary },
            ]}
            onPress={() => setActiveTab("counts")}
          >
            <Text
              style={[
                styles.miniTabText,
                {
                  color:
                    activeTab === "counts"
                      ? colors.text.textOnDark
                      : colors.primary,
                },
              ]}
            >
              Số lần
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View style={styles.gridContainer}>
        {currentStats.map((count, index) => {
          const emoji = emojis[index];
          if (!emoji) return null;

          const moodColor = normalizeColor(
            emoji.emotion_color,
            colors.moods[index] || colors.primary,
          );
          const bgSoftColor = softColor(moodColor);
          const percent = currentTotal > 0 ? (count / currentTotal) * 100 : 0;

          return (
            <TouchableOpacity
              key={index}
              style={[
                styles.card,
                {
                  backgroundColor: colors.backgroundCard,
                  borderColor: colors.border,
                  shadowColor: colors.border,
                },
              ]}
              onPress={() =>
                navigation.navigate("MoodDetail", {
                  moodId: emoji.emotion_id,
                })
              }
              activeOpacity={0.8}
            >
              <View style={styles.cardHeader}>
                <View style={[styles.iconContainer]}>
                  <Image
                    source={{ uri: emoji.image }}
                    style={styles.cardIcon}
                  />
                </View>
                <Text style={[styles.countText, { color: colors.text.dark }]}>
                  {count} {unit}
                </Text>
              </View>

              <Text style={[styles.moodName, { color: colors.text.dark }]}>
                {emoji.emotion_name}
              </Text>

              <View
                style={[styles.progressTrack, { backgroundColor: bgSoftColor }]}
              >
                <View
                  style={[
                    styles.progressBar,
                    {
                      width: `${percent}%`,
                      backgroundColor: moodColor,
                    },
                  ]}
                />
              </View>
            </TouchableOpacity>
          );
        })}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  insightsSection: {
    marginBottom: SIZES.spacing.xxl,
  },
  sectionHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    marginBottom: SIZES.spacing.l,
  },
  sectionTitle: {
    fontFamily: FONTS.bold,
    fontSize: 24,
  },
  miniTabContainer: {
    flexDirection: "row",
    borderRadius: SIZES.radius.medium,
    padding: 2,
    borderWidth: 1,
  },
  miniTab: {
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: SIZES.radius.small,
  },
  miniTabText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
  },
  gridContainer: {
    flexDirection: "row",
    flexWrap: "wrap",
    justifyContent: "space-between",
  },
  card: {
    width: "48%",
    borderRadius: SIZES.radius.xxxl,
    padding: SIZES.spacing.l,
    marginBottom: SIZES.spacing.m,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  cardHeader: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "flex-start",
    marginBottom: SIZES.spacing.l,
  },
  iconContainer: {
    width: 44,
    height: 44,
    borderRadius: 22,
    justifyContent: "center",
    alignItems: "center",
  },
  cardIcon: {
    width: 48,
    height: 48,
    resizeMode: "contain",
  },
  countText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    marginTop: 4,
  },
  moodName: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    marginBottom: SIZES.spacing.s,
  },
  progressTrack: {
    height: 6,
    borderRadius: 3,
    width: "100%",
  },
  progressBar: {
    height: "100%",
    borderRadius: 3,
  },
});

export default MonthlyInsights;
