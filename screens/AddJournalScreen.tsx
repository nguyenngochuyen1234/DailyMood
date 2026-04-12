import React, { useState, useRef } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Image,
  ScrollView,
  Dimensions,
  ImageBackground,
  Alert,
  ActivityIndicator,
} from "react-native";
import {
  ArrowLeft,
  Check,
  Camera,
  X,
  ChevronDown,
  Trash2,
  Mic,
} from "lucide-react-native";
import Voice, { SpeechResultsEvent } from "@react-native-voice/voice";
import * as ImagePicker from "expo-image-picker";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { useMood } from "../context/MoodContext";
import { FONTS, SIZES } from "../constants/theme";
import JourneyPicker from "../components/JourneyPicker";
import MoodSelector from "../components/MoodSelector";
import {
  saveWithManualSync,
  saveWithAutoSync,
  getJourneys,
  getJournals,
  updateJournal,
  deleteJournal,
} from "../lib/storage";
import { Journey } from "../types/models";
import { useGoogleAuth } from "../hooks/useGoogleAuth";
import { saveImageLocally } from "../lib/fileHelper";


const { width } = Dimensions.get("window");

export default function AddJournalScreen({
  navigation,
  route,
}: {
  navigation: any;
  route?: any;
}) {
  const { journalId, initialMoodId } = route?.params || {};
  const isEditing = !!journalId;

  const { backgrounds, colors } = useTheme();
  const { emojis, loading } = useMood();
  const { accessToken } = useGoogleAuth(); // Lấy token từ hook

  // BIẾN MANUALLY ĐƯỢC YÊU CẦU: can be true/false để test
  const isPro = true;

  const [selectedMoodId, setSelectedMoodId] = useState<number | null>(null);

  // Khởi tạo mood mặc định khi emoji được tải xong
  React.useEffect(() => {
    if (emojis.length > 0 && !isEditing) {
      if (initialMoodId) {
        setSelectedMoodId(initialMoodId);
        // Xóa tham số sau khi đã sử dụng để tránh bị áp dụng lại
        navigation.setParams({ initialMoodId: undefined });
      } else if (selectedMoodId === null) {
        setSelectedMoodId(emojis[0].emotion_id);
      }
    }
  }, [emojis, isEditing, initialMoodId, navigation]);
  const [description, setDescription] = useState("");
  const [isDescriptionFocused, setIsDescriptionFocused] = useState(false);
  const [images, setImages] = useState<string[]>([]);
  const [originalTime, setOriginalTime] = useState<string | null>(null);

  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null);
  const [showJourneyPicker, setShowJourneyPicker] = useState(false);
  const [isListeningDescription, setIsListeningDescription] = useState(false);
  const activeListeningField = useRef<'title' | 'description' | null>(null);
  const preSpeechContent = useRef<string>("");

  const { language: appLanguage } = useMood();

  React.useEffect(() => {
    Voice.onSpeechResults = onSpeechResults;
    Voice.onSpeechError = (e) => {
      console.error("Speech error: ", e);
      setIsListeningDescription(false);
      activeListeningField.current = null;
    };

    return () => {
      Voice.destroy().then(Voice.removeAllListeners);
    };
  }, []);

  const onSpeechResults = (e: SpeechResultsEvent) => {
    if (e.value && e.value.length > 0) {
      const text = e.value[0];
      if (activeListeningField.current === 'description') {
        const newText = preSpeechContent.current + (preSpeechContent.current.length > 0 ? " " : "") + text;
        setDescription(newText);
      }
    }
  };

  const toggleListening = async (field: 'description') => {
    const isCurrentlyListening = isListeningDescription;

    try {
      if (isCurrentlyListening) {
        await Voice.stop();
        setIsListeningDescription(false);
        activeListeningField.current = null;
      } else {
        // Stop any existing listening first
        await Voice.stop();
        setIsListeningDescription(false);

        // Start listening with the correct language
        const lang = appLanguage === 'vi' ? 'vi-VN' : 'en-US';
        preSpeechContent.current = description;
        await Voice.start(lang);
        setIsListeningDescription(true);
        activeListeningField.current = 'description';
      }
    } catch (e) {
      console.error(e);
      Alert.alert("Lỗi", "Không thể sử dụng chức năng giọng nói.");
    }
  };

  React.useEffect(() => {
    const initData = async () => {
      const data = await getJourneys();
      setJourneys(data);
      if (journalId) {
        const dbJournals = await getJournals();
        const journalToEdit = dbJournals.find((j) => j.id === journalId);
        if (journalToEdit) {
          setDescription(journalToEdit.description || "");
          setImages(journalToEdit.images || []);
          
          // Migration: Resolve old ID-based typeEmoji to emotion_id if possible
          const storedEmojiVal = Number(journalToEdit.typeEmoji);
          const foundEmoji = emojis.find(e => e.id === storedEmojiVal);
          if (foundEmoji) {
            setSelectedMoodId(foundEmoji.emotion_id);
          } else {
            setSelectedMoodId(storedEmojiVal);
          }
          const foundJourney = data.find(
            (j) => j.id === journalToEdit.journeyId,
          );
          setSelectedJourney(foundJourney || null);
          setOriginalTime(journalToEdit.time);
        }
      }
    };
    initData();
  }, [journalId]);

  // Current date & time
  const now = new Date();
  const dateString = `${String(now.getDate()).padStart(2, "0")}/${String(now.getMonth() + 1).padStart(2, "0")}/${now.getFullYear()}`;
  const timeString = now.toLocaleTimeString([], {
    hour: "2-digit",
    minute: "2-digit",
    hour12: true,
  });


  const clearForm = () => {
    setDescription("");
    setImages([]);
    setSelectedMoodId(emojis.length > 0 ? emojis[0].emotion_id : null);
    setSelectedJourney(null);
  };

  const handleSave = async () => {
    if (selectedMoodId === null) {
      Alert.alert("Lỗi", "Vui lòng chọn cảm xúc!");
      return;
    }
    try {
      const journalData = {
        id: isEditing ? journalId : Date.now().toString(),
        typeEmoji: selectedMoodId,
        time: isEditing && originalTime ? originalTime : now.toISOString(),
        journeyId: selectedJourney?.id || null,
        description: description.trim(),
        images: images,
      };

      if (isEditing) {
        await updateJournal(journalData);
        clearForm();
        navigation.goBack();
      } else {
        // Sử dụng logic phân tầng dựa trên isPro
        if (isPro) {
          await saveWithAutoSync('journal', journalData, accessToken);
        } else {
          await saveWithManualSync('journal', journalData);
        }
        clearForm();
        navigation.goBack();
      }
    } catch (e) {
      Alert.alert("Lỗi", "Lưu thất bại!");
    }
  };

  const handleDelete = () => {
    Alert.alert("Xoá Nhật Ký", "Bạn có chắc muốn xoá nhật ký này vĩnh viễn?", [
      { text: "Huỷ", style: "cancel" },
      {
        text: "Xoá",
        style: "destructive",
        onPress: () => {
          deleteJournal(journalId)
            .then(() => {
              navigation.goBack();
            })
            .catch((e) => {
              Alert.alert("Lỗi", "Xóa thất bại!");
            });
        },
      },
    ]);
  };

  const handleAddPhoto = async () => {
    // 1. Kiểm tra giới hạn 3 ảnh
    if (images.length >= 3) {
      Alert.alert("Thông báo", "Bạn chỉ được tải lên tối đa 3 ảnh.");
      return;
    }

    // 2. Xin quyền truy cập thư viện ảnh
    const { status } = await ImagePicker.requestMediaLibraryPermissionsAsync();
    if (status !== 'granted') {
      Alert.alert("Lỗi", "Ứng dụng cần quyền truy cập thư viện ảnh để thực hiện chức năng này.");
      return;
    }

    // 3. Mở thư viện ảnh
    try {
      const result = await ImagePicker.launchImageLibraryAsync({
        mediaTypes: ['images'],
        allowsMultipleSelection: true,
        selectionLimit: 3 - images.length, // Giới hạn chỉ chọn thêm số ảnh còn thiếu
        quality: 0.8,
      });

      if (!result.canceled) {
        // Lưu ảnh vào thư mục local vĩnh viễn
        const localUris = await Promise.all(
          result.assets.map(asset => saveImageLocally(asset.uri))
        );

        // Đảm bảo không vượt quá 3 ảnh
        const newImages = [...images, ...localUris].slice(0, 3);
        setImages(newImages);
      }
    } catch (error) {
      console.error("Error picking images:", error);
      Alert.alert("Lỗi", "Không thể chọn ảnh.");
    }
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  return (
    <ImageBackground
      source={backgrounds.add}
      style={[styles.container, { backgroundColor: colors.background.main }]}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            {React.createElement(ArrowLeft as any, {
              size: 28,
              color: colors.text.dark,
            })}
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text.dark }]}>
            {isEditing ? "Edit Journal" : "New Journal Entry"}
          </Text>
          <View style={{ flexDirection: "row", alignItems: "center", gap: 10 }}>
            {isEditing && (
              <TouchableOpacity onPress={handleDelete} style={{ padding: 6 }}>
                {React.createElement(Trash2 as any, {
                  size: 24,
                  color: colors.error,
                })}
              </TouchableOpacity>
            )}
          </View>
        </View>

        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Mood Selector */}
          <View style={styles.section}>
            <MoodSelector
              emojis={emojis}
              loading={loading}
              selectedMoodId={selectedMoodId}
              onMoodChange={setSelectedMoodId}
            />

            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginTop: SIZES.spacing.s,
              }}
            >
              <TouchableOpacity onPress={() => navigation.navigate("AllMoods")}>
                <Text
                  style={{
                    fontFamily: FONTS.bold,
                    color: colors.text.dark,
                    fontSize: 16,
                  }}
                >
                  Thêm
                </Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Date & Time */}
          <View
            style={[
              styles.dateTimeContainer,
              { borderBottomColor: colors.border },
            ]}
          >
            <View
              style={[styles.dateDisplay, { borderRightColor: colors.border }]}
            >
              <Text style={[styles.dateTimeText, { color: colors.text.dark }]}>
                {dateString}
              </Text>
            </View>
            <TouchableOpacity
              style={[
                styles.timePicker,
                { backgroundColor: colors.background.cream },
              ]}
            >
              <Text style={[styles.dateTimeText, { color: colors.primary }]}>
                {timeString}
              </Text>
              {React.createElement(ChevronDown as any, {
                size: 16,
                color: colors.primary,
              })}
            </TouchableOpacity>
          </View>

          {/* Journey Picker */}
          <JourneyPicker
            selectedJourney={selectedJourney}
            journeys={journeys}
            onPress={() => setShowJourneyPicker(true)}
            onJourneySelect={setSelectedJourney}
            showModal={showJourneyPicker}
            onModalClose={() => setShowJourneyPicker(false)}
            onCreateNewJourney={() => navigation.navigate("CreateJourney")}
          />

          {/* Input Fields */}
          <View style={styles.inputSection}>
            <View style={[styles.descriptionWrapper, {
              backgroundColor: colors.backgroundCard,
              borderWidth: 1,
              borderColor: colors.border,

            }]}>
              <TextInput
                style={[styles.descriptionInput, { color: colors.text.dark, borderWidth: 2, borderColor: isDescriptionFocused ? colors.primary : colors.border }]}
                placeholder="Write about your day..."
                placeholderTextColor={colors.text.muted}
                multiline
                textAlignVertical="top"
                value={description}
                onChangeText={setDescription}
                onFocus={() => setIsDescriptionFocused(true)}
                onBlur={() => setIsDescriptionFocused(false)}
              />
              <View style={styles.micIconDescription}>
                <TouchableOpacity onPress={handleAddPhoto} style={{ padding: 8 }}>
                  {React.createElement(Camera as any, {
                    size: 22,
                    color: colors.text.muted,
                  })}
                </TouchableOpacity>
                <TouchableOpacity onPress={() => toggleListening('description')} style={{ padding: 8 }}>
                  {React.createElement(Mic as any, {
                    size: 22,
                    color: isListeningDescription ? colors.error : colors.text.muted,
                  })}
                </TouchableOpacity>
              </View>
            </View>
          </View>




          {/* Add Photo Button */}
          <View style={{ flexDirection: 'row', gap: 12, marginBottom: SIZES.spacing.xl }}>


            {/* Photo Gallery Preview */}
            {images.length > 0 && (
              <ScrollView
                horizontal
                showsHorizontalScrollIndicator={false}
                style={styles.galleryContainer}
              >
                {images.map((img, index) => (
                  <View key={index} style={styles.imagePreviewContainer}>
                    <Image source={{ uri: img }} style={styles.imagePreview} />
                    <TouchableOpacity
                      style={[
                        styles.removeImageButton,
                        {
                          backgroundColor: colors.primary,
                          borderColor: colors.background.white,
                        },
                      ]}
                      onPress={() => removeImage(index)}
                    >
                      {React.createElement(X as any, {
                        size: 12,
                        color: colors.text.white,
                      })}
                    </TouchableOpacity>
                  </View>
                ))}
              </ScrollView>
            )}
          </View>

          <TouchableOpacity
            onPress={handleSave}
            style={[styles.bottomSaveButton, { backgroundColor: colors.primary }]}
          >
            {React.createElement(Check as any, {
              size: 24,
              color: colors.text.textOnDark,
            })}
            <Text style={[styles.bottomSaveText, { color: colors.text.textOnDark }]}>
              {isEditing ? "Update Journal" : "Save Journal"}
            </Text>
          </TouchableOpacity>

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  sectionLabel: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    marginBottom: SIZES.spacing.s,
  },
  safeArea: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SIZES.spacing.xl,
    paddingVertical: SIZES.spacing.s,
  },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 22 },
  bottomSaveButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 16,
    borderRadius: SIZES.radius.xl,
    marginTop: SIZES.spacing.xl,
    gap: 8,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 4,
  },
  bottomSaveText: { 
    fontFamily: FONTS.bold, 
    fontSize: 18 
  },
  scrollContent: {
    paddingHorizontal: SIZES.spacing.xl,
    paddingTop: SIZES.spacing.s,
  },
  section: { marginBottom: SIZES.spacing.xxl },
  moodContainer: { paddingVertical: SIZES.spacing.s, gap: SIZES.spacing.m },
  moodItem: {
    paddingHorizontal: SIZES.spacing.m,
    borderRadius: SIZES.radius.large,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
    borderColor: "transparent",
  },
  moodIcon: { width: 48, height: 48 },
  dateTimeContainer: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: SIZES.spacing.xl,
    gap: SIZES.spacing.m,

    paddingBottom: SIZES.spacing.m,
  },
  dateDisplay: {
    flex: 1,
    paddingVertical: SIZES.spacing.s,
    borderRightWidth: 1,
  },
  timePicker: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SIZES.spacing.m,
    paddingVertical: SIZES.spacing.s,
    borderRadius: SIZES.radius.medium,
    gap: SIZES.spacing.s,
  },
  dateTimeText: { fontFamily: FONTS.regular, fontSize: 18 },
  inputSection: { marginBottom: SIZES.spacing.xl },

  descriptionInput: {
    fontFamily: FONTS.regular,
    fontSize: 18,
    lineHeight: 24,
    flex: 1,
    borderRadius: SIZES.radius.xl,
    padding: SIZES.spacing.l,

    minHeight: 200,

  },
  buttonText: { fontFamily: FONTS.bold, fontSize: 18 },
  galleryContainer: { marginBottom: SIZES.spacing.xl },
  imagePreviewContainer: { marginRight: SIZES.spacing.m, position: "relative", marginTop: 6 },
  imagePreview: { width: 120, height: 120, borderRadius: SIZES.radius.large },
  removeImageButton: {
    position: "absolute",
    top: -6,
    right: -6,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: "center",
    alignItems: "center",
    borderWidth: 2,
  },
  descriptionWrapper: {
    borderRadius: SIZES.radius.xl,
    borderWidth: 1,
    minHeight: 200,
    position: 'relative',

  },
  micIconDescription: {
    position: 'absolute',
    right: 12,
    bottom: 12,
    padding: 4,
    borderRadius: 20,
    backgroundColor: 'rgba(0,0,0,0.03)',
    flexDirection: 'row',
    alignItems: 'center',
    gap: 4,
  },
  smallIconButton: {
    width: 56,
    height: 56,
    borderRadius: 28,
    justifyContent: "center",
    alignItems: "center",
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
});
