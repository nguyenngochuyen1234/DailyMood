import React from "react";
import { View, Text, TouchableOpacity, StyleSheet, Modal } from "react-native";
import { ChevronDown, Check, Plus, Compass } from "lucide-react-native";
import { useTheme } from "../context/ThemeContext";
import { FONTS, SIZES } from "../constants/theme";
import { Journey } from "../types/models";

interface JourneyPickerProps {
  selectedJourney: Journey | null;
  journeys: Journey[];
  onPress: () => void;
  onJourneySelect: (journey: Journey | null) => void;
  showModal: boolean;
  onModalClose: () => void;
  onCreateNewJourney: () => void;
  textInVisible?: boolean;
}

export default function JourneyPicker({
  selectedJourney,
  journeys,
  onPress,
  onJourneySelect,
  showModal,
  onModalClose,
  onCreateNewJourney,
  textInVisible = true,
}: JourneyPickerProps) {
  const { colors } = useTheme();
  return (
    <>
      <View style={styles.section}>
        {textInVisible && (
          <Text style={[styles.sectionLabel, { color: colors.text.dark }]}>Chọn Hành trình</Text>
        )}
        <TouchableOpacity 
          style={[styles.journeyPickerTrigger, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]} 
          onPress={onPress}
        >
          <View style={styles.journeyTriggerLeft}>
            <View
              style={[
                styles.miniIconCircle,
                { backgroundColor: colors.background.soft },
              ]}
            >
              <Compass size={20} color={colors.text.muted} />
            </View>
            <Text
              style={[
                styles.selectedJourneyText,
                { color: selectedJourney ? colors.text.dark : colors.text.muted },
              ]}
            >
              {selectedJourney ? selectedJourney.name : "Không chọn hành trình"}
            </Text>
          </View>
          {React.createElement(ChevronDown as any, {
            size: 20,
            color: colors.text.dark,
          })}
        </TouchableOpacity>
      </View>

      {/* Journey Picker Modal */}
      <Modal
        visible={showModal}
        transparent
        animationType="fade"
        onRequestClose={onModalClose}
      >
        <TouchableOpacity
          style={styles.modalOverlay}
          activeOpacity={1}
          onPress={onModalClose}
        >
          <View style={[styles.modalContent, { backgroundColor: colors.background.white }]}>
            <Text style={[styles.modalTitle, { color: colors.text.dark }]}>Chọn Hành trình</Text>
            
            <TouchableOpacity
                style={[
                  styles.journeyOption,
                  !selectedJourney && { backgroundColor: `${colors.primary}0D`, borderColor: colors.primary, borderWidth: 1 },
                ]}
                onPress={() => {
                  onJourneySelect(null);
                  onModalClose();
                }}
              >
                <View style={[styles.miniIconCircle, { backgroundColor: colors.background.soft }]}>
                  <Compass size={20} color={colors.text.muted} />
                </View>
                <Text style={[styles.optionText, { color: colors.text.dark }]}>Không chọn hành trình</Text>
                {!selectedJourney && React.createElement(Check as any, { size: 18, color: colors.primary })}
            </TouchableOpacity>

            {journeys.map((item) => (
              <TouchableOpacity
                key={item.id}
                style={[
                  styles.journeyOption,
                  selectedJourney?.id === item.id && { backgroundColor: `${colors.primary}0D`, borderColor: colors.primary, borderWidth: 1 },
                ]}
                onPress={() => {
                  onJourneySelect(item);
                  onModalClose();
                }}
              >
                <View style={[styles.miniIconCircle, { backgroundColor: colors.background.soft }]}>
                  <Compass size={20} color={colors.text.dark} />
                </View>
                <Text style={[styles.optionText, { color: colors.text.dark }]}>{item.name}</Text>
                {selectedJourney?.id === item.id &&
                  React.createElement(Check as any, {
                    size: 18,
                    color: colors.primary,
                  })}
              </TouchableOpacity>
            ))}
            <TouchableOpacity
              style={[styles.journeyOption]}
              onPress={() => {
                onModalClose();
                onCreateNewJourney();
              }}
            >
              {React.createElement(Plus as any, {
                size: 20,
                color: colors.primary,
              })}
              <Text
                style={[
                  styles.optionText,
                  { color: colors.primary, fontFamily: FONTS.bold },
                ]}
              >
                Tạo hành trình mới
              </Text>
            </TouchableOpacity>
          </View>
        </TouchableOpacity>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  section: {
    marginBottom: SIZES.spacing.xxl,
  },
  sectionLabel: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    marginBottom: SIZES.spacing.s,
  },
  journeyPickerTrigger: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: SIZES.spacing.m,
    borderRadius: SIZES.radius.large,
    borderWidth: 1,
  },
  journeyTriggerLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 12,
  },
  miniIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: "center",
    alignItems: "center",
  },
  selectedJourneyText: {
    fontFamily: FONTS.bold,
    fontSize: 16,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0, 0, 0, 0.4)",
    justifyContent: "center",
    padding: SIZES.spacing.xl,
  },
  modalContent: {
    borderRadius: SIZES.radius.xxl,
    padding: SIZES.spacing.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    marginBottom: SIZES.spacing.l,
    textAlign: "center",
  },
  journeyOption: {
    flexDirection: "row",
    alignItems: "center",
    padding: SIZES.spacing.m,
    borderRadius: SIZES.radius.large,
    marginBottom: SIZES.spacing.s,
    gap: 12,
  },
  optionText: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: 16,
  },
});
