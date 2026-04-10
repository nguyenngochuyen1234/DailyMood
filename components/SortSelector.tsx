import React from "react";
import { View, Text, StyleSheet, TouchableOpacity } from "react-native";
import { ArrowDownAZ, ArrowUpZA, ChevronDown } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";
import { FONTS, SIZES } from "../constants/theme";

export type SortOrder = "newest" | "oldest";

interface SortSelectorProps {
  value: SortOrder;
  onValueChange: (value: SortOrder) => void;
}

const SortSelector: React.FC<SortSelectorProps> = ({ value, onValueChange }) => {
  const { colors } = useTheme();
  const isNewest = value === "newest";

  return (
    <View style={styles.container}>
      <TouchableOpacity
        style={[styles.button, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}
        onPress={() => onValueChange(isNewest ? "oldest" : "newest")}
        activeOpacity={0.7}
      >
        {isNewest ? (
          <ArrowDownAZ size={18} color={colors.primary} strokeWidth={2.5} />
        ) : (
          <ArrowUpZA size={18} color={colors.primary} strokeWidth={2.5} />
        )}
        <Text style={[styles.text, { color: colors.primary }]}>
          {isNewest ? "Từ ngày gần nhất" : "Từ ngày xa nhất"}
        </Text>
        <ChevronDown size={14} color={colors.text.muted} />
      </TouchableOpacity>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flexDirection: "row",
    justifyContent: "flex-end",
    marginBottom: SIZES.spacing.m,
  },
  button: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: 12,
    paddingVertical: 8,
    borderRadius: SIZES.radius.large,
    borderWidth: 1,
    gap: 8,
  },
  text: {
    fontFamily: FONTS.bold,
    fontSize: 13,
  },
});

export default SortSelector;
