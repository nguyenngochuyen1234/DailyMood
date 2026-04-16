import React from "react";
import { Modal, Pressable, StyleSheet, Text, TouchableOpacity, View } from "react-native";
import { FONTS, SIZES } from "../constants/theme";
import { useTheme } from "../context/ThemeContext";

interface AppNoticeModalProps {
  visible: boolean;
  title: string;
  message: string;
  onClose: () => void;
  buttonText?: string;
}

export default function AppNoticeModal({
  visible,
  title,
  message,
  onClose,
  buttonText = "OK",
}: AppNoticeModalProps) {
  const { colors } = useTheme();

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable style={styles.overlay} onPress={onClose} />
      <View style={styles.centerWrap} pointerEvents="box-none">
        <View
          style={[
            styles.card,
            {
              backgroundColor: colors.backgroundCard,
              borderColor: colors.border,
              shadowColor: "#000",
            },
          ]}
        >
          <Text style={[styles.title, { color: colors.text.dark }]}>{title}</Text>
          <Text style={[styles.message, { color: colors.text.muted }]}>
            {message}
          </Text>
          <TouchableOpacity
            style={[styles.button, { backgroundColor: colors.primary }]}
            onPress={onClose}
            activeOpacity={0.85}
          >
            <Text style={[styles.buttonText, { color: colors.text.textOnDark }]}>
              {buttonText}
            </Text>
          </TouchableOpacity>
        </View>
      </View>
    </Modal>
  );
}

const styles = StyleSheet.create({
  overlay: {
    ...StyleSheet.absoluteFillObject,
    backgroundColor: "rgba(0,0,0,0.35)",
  },
  centerWrap: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
    paddingHorizontal: SIZES.spacing.xl,
  },
  card: {
    width: "100%",
    borderRadius: SIZES.radius.xxl,
    borderWidth: 1,
    padding: SIZES.spacing.xl,
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.14,
    shadowRadius: 18,
    elevation: 10,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    marginBottom: SIZES.spacing.s,
    textAlign: "center",
  },
  message: {
    fontFamily: FONTS.regular,
    fontSize: 15,
    lineHeight: 22,
    textAlign: "center",
  },
  button: {
    marginTop: SIZES.spacing.xl,
    borderRadius: SIZES.radius.large,
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
  },
  buttonText: {
    fontFamily: FONTS.bold,
    fontSize: 15,
  },
});
