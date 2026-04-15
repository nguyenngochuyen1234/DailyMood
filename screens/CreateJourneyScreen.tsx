import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  KeyboardAvoidingView,
  Platform,
  ScrollView,
  ImageBackground,
  Alert,
} from "react-native";
import { useTheme } from "../context/ThemeContext";
import { FONTS, SIZES } from "../constants/theme";
import { SafeAreaView } from "react-native-safe-area-context";
import { saveJourney, updateJourney } from "../lib/storage";

export default function CreateJourneyScreen({
  navigation,
  route,
  onClose,
}: {
  navigation?: any;
  route?: any;
  onClose?: () => void;
}) {
  const { journey } = route?.params || {};
  const isEditing = !!journey;

  const { colors, backgrounds } = useTheme();
  const [title, setTitle] = useState(journey?.name || "");
  const [description, setDescription] = useState(journey?.description || "");

  const handleCreate = async () => {
    if (!title.trim()) {
      Alert.alert("Lỗi", "Vui lòng nhập tên hành trình!");
      return;
    }

    try {
      if (isEditing) {
        await updateJourney({
          id: journey.id,
          name: title.trim(),
          description: description.trim(),
        });
        if (onClose) onClose();
        else if (navigation) navigation.goBack();
      } else {
        await saveJourney({
          id: Date.now().toString(),
          name: title.trim(),
          description: description.trim(),
        });
        if (onClose) onClose();
        else if (navigation) navigation.goBack();
      }
    } catch (e) {
      Alert.alert(
        "Lỗi",
        `Không thể ${isEditing ? "cập nhật" : "tạo"} hành trình`,
      );
    }
  };

  return (
    <ImageBackground
      source={backgrounds.detail}
      style={[styles.container, { backgroundColor: colors.background.main }]}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView
          behavior={Platform.OS === "ios" ? "padding" : "height"}
          style={styles.flex}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
              <Text style={[styles.title, { color: colors.text.dark }]}>
                {isEditing ? "Chỉnh sửa Hành trình" : "Bắt đầu Hành trình mới"}
              </Text>
              <Text style={[styles.subtitle, { color: colors.text.dark }]}>
                {isEditing
                  ? "Điều chỉnh mục tiêu và thông tin cho hành trình này."
                  : "Thiết lập mục tiêu và bắt đầu ghi lại những khoảnh khắc đáng nhớ."}
              </Text>
            </View>

            <View style={styles.inputSection}>
              <Text style={[styles.label, { color: colors.text.dark }]}>
                Tên hành trình
              </Text>
              <TextInput
                style={[
                  styles.input,
                  {
                    backgroundColor: colors.backgroundCard,
                    color: colors.text.dark,
                    borderColor: colors.border,
                  },
                ]}
                placeholder="Ví dụ: Hành trình học Vẽ, Yoga mỗi ngày..."
                placeholderTextColor={colors.text.muted}
                value={title}
                onChangeText={setTitle}
              />

              <Text style={[styles.label, { color: colors.text.dark }]}>
                Mô tả hành trình (Không bắt buộc)
              </Text>
              <View
                style={[
                  styles.textAreaContainer,
                  {
                    backgroundColor: colors.backgroundCard,
                    borderColor: colors.border,
                  },
                ]}
              >
                <TextInput
                  style={[styles.textArea, { color: colors.text.dark }]}
                  placeholder="Ghi chú ngắn gọn về mục tiêu của bạn..."
                  placeholderTextColor={colors.text.muted}
                  multiline
                  textAlignVertical="top"
                  value={description}
                  onChangeText={setDescription}
                />
              </View>
            </View>

            <View style={styles.footer}>
              <TouchableOpacity
                style={[
                  styles.createButton,
                  {
                    backgroundColor: colors.primary,
                    shadowColor: colors.primary,
                  },
                ]}
                onPress={handleCreate}
              >
                <Text
                  style={[
                    styles.createButtonText,
                    { color: colors.text.textOnDark },
                  ]}
                >
                  {isEditing ? "Cập nhật" : "Bắt đầu ngay"}
                </Text>
              </TouchableOpacity>

              <TouchableOpacity
                style={styles.cancelButton}
                onPress={() => {
                  if (onClose) onClose();
                  else if (navigation) navigation.goBack();
                }}
              >
                <Text
                  style={[
                    styles.cancelButtonText,
                    { color: colors.text.muted },
                  ]}
                >
                  Hủy
                </Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  flex: { flex: 1 },
  scrollContent: {
    paddingHorizontal: SIZES.spacing.xl,
    paddingTop: SIZES.spacing.xxl,
  },
  header: {
    marginBottom: 40,
    alignItems: "center",
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 28,
    textAlign: "center",
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    opacity: 0.6,
    textAlign: "center",
    lineHeight: 22,
  },
  inputSection: { marginBottom: 40 },
  label: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    marginBottom: SIZES.spacing.s,
    marginLeft: 4,
  },
  input: {
    borderRadius: SIZES.radius.large,
    padding: SIZES.spacing.m,
    fontFamily: FONTS.regular,
    fontSize: 16,
    borderWidth: 1,
    marginBottom: SIZES.spacing.xl,
  },
  textAreaContainer: {
    borderRadius: SIZES.radius.large,
    padding: SIZES.spacing.m,
    borderWidth: 1,
    minHeight: 120,
    flex: 1,
  },
  textArea: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    height: "100%",
  },
  footer: { gap: 16 },
  createButton: {
    paddingVertical: 16,
    borderRadius: SIZES.radius.xxl,
    alignItems: "center",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  createButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 18,
  },
  cancelButton: { paddingVertical: 12, alignItems: "center" },
  cancelButtonText: { fontFamily: FONTS.bold, fontSize: 16 },
});
