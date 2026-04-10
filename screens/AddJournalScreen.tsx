import React, { useState } from "react";
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
import { ArrowLeft, Check, Camera, X, ChevronDown, Trash2 } from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { useTheme } from "../context/ThemeContext";
import { useMood } from "../context/MoodContext";
import { FONTS, SIZES } from "../constants/theme";
import JourneyPicker from "../components/JourneyPicker";
import { saveJournal, getJourneys, getJournals, updateJournal, deleteJournal } from '../lib/storage';
import { Journey } from '../types/models';

const { width } = Dimensions.get("window");

export default function AddJournalScreen({ navigation, route }: { navigation: any, route?: any }) {
  const { journalId } = route?.params || {};
  const isEditing = !!journalId;

  const { colors, backgrounds } = useTheme();
  const { emojis, loading } = useMood();
  const [selectedMoodId, setSelectedMoodId] = useState<number | null>(null);

  // Khởi tạo mood mặc định khi emoji được tải xong
  React.useEffect(() => {
    if (emojis.length > 0 && selectedMoodId === null && !isEditing) {
      setSelectedMoodId(emojis[0].id);
    }
  }, [emojis, isEditing]);
  const [title, setTitle] = useState("");
  const [description, setDescription] = useState("");
  const [images, setImages] = useState<string[]>([]);
  const [originalTime, setOriginalTime] = useState<string | null>(null);
  
  const [journeys, setJourneys] = useState<Journey[]>([]);
  const [selectedJourney, setSelectedJourney] = useState<Journey | null>(null);
  const [showJourneyPicker, setShowJourneyPicker] = useState(false);

  React.useEffect(() => {
    const initData = async () => {
      const data = await getJourneys();
      setJourneys(data);
      if (journalId) {
         const dbJournals = await getJournals();
         const journalToEdit = dbJournals.find(j => j.id === journalId);
         if(journalToEdit) {
            setTitle(journalToEdit.title || "");
            setDescription(journalToEdit.description || "");
            setImages(journalToEdit.images || []);
            setSelectedMoodId(Number(journalToEdit.typeEmoji));
            const foundJourney = data.find(j => j.id === journalToEdit.journeyId);
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

  const handleSave = async () => {
    if (selectedMoodId === null) {
      Alert.alert('Lỗi', 'Vui lòng chọn cảm xúc!');
      return;
    }
    try {
      const journalData = {
        id: isEditing ? journalId : Date.now().toString(),
        typeEmoji: selectedMoodId,
        time: isEditing && originalTime ? originalTime : now.toISOString(),
        journeyId: selectedJourney?.id || null,
        title: title.trim(),
        description: description.trim(),
        images: images,
      };

      if (isEditing) {
         await updateJournal(journalData);
         navigation.goBack();
      } else {
         await saveJournal(journalData);
         navigation.goBack();
      }
    } catch (e) {
      Alert.alert('Lỗi', 'Lưu thất bại!');
    }
  };

  const handleDelete = () => {
    Alert.alert('Xoá Nhật Ký', 'Bạn có chắc muốn xoá nhật ký này vĩnh viễn?', [
      { text: 'Huỷ', style: 'cancel' },
      { text: 'Xoá', style: 'destructive', onPress: () => {
         deleteJournal(journalId).then(() => {
           navigation.goBack();
         }).catch((e) => {
           Alert.alert('Lỗi', 'Xóa thất bại!');
         });
      }}
    ])
  };

  const handleAddPhoto = () => {
    if (images.length >= 3) {
      Alert.alert('Thông báo', 'Bạn chỉ được tải lên tối đa 3 ảnh.');
      return;
    }
    const mockImages = [
      "https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=500&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&auto=format&fit=crop&q=60",
      "https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&auto=format&fit=crop&q=60",
    ];
    const randomImg = mockImages[Math.floor(Math.random() * mockImages.length)];
    setImages([...images, randomImg]);
  };

  const removeImage = (index: number) => {
    const newImages = [...images];
    newImages.splice(index, 1);
    setImages(newImages);
  };

  return (
    <ImageBackground source={backgrounds.add} style={[styles.container, { backgroundColor: colors.background.main }]}>
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            {React.createElement(ArrowLeft as any, { size: 28, color: colors.text.dark })}
          </TouchableOpacity>
          <Text style={[styles.headerTitle, { color: colors.text.dark }]}>
            {isEditing ? "Edit Journal" : "New Journal Entry"}
          </Text>
          <View style={{ flexDirection: 'row', alignItems: 'center', gap: 10 }}>
            {isEditing && (
              <TouchableOpacity onPress={handleDelete} style={{ padding: 6 }}>
                {React.createElement(Trash2 as any, { size: 24, color: colors.error })}
              </TouchableOpacity>
            )}
            <TouchableOpacity onPress={handleSave} style={[styles.saveButton, { backgroundColor: colors.primary }]}>
              {React.createElement(Check as any, { size: 20, color: colors.text.textOnDark })}
              <Text style={[styles.saveText, { color: colors.text.textOnDark }]}>{isEditing ? "Update" : "Save"}</Text>
            </TouchableOpacity>
          </View>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Mood Selector */}
          <View style={styles.section}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.moodContainer}>
              {loading ? (
                <ActivityIndicator color={colors.primary} style={{ padding: 20 }} />
              ) : (
                emojis.map((emoji) => (
                  <TouchableOpacity
                    key={emoji.id}
                    onPress={() => setSelectedMoodId(emoji.id)}
                    style={[
                      styles.moodItem,
                      { backgroundColor: colors.background.soft },
                      selectedMoodId === emoji.id && { borderColor: colors.primary, backgroundColor: colors.background.white },
                    ]}
                  >
                    <Image source={{ uri: emoji.image }} style={styles.moodIcon} />
                  </TouchableOpacity>
                ))
              )}
            </ScrollView>
            
            <View style={{ flexDirection: 'row', justifyContent: 'space-between', alignItems: 'center', marginTop: SIZES.spacing.s }}>
              <Text style={[styles.sectionLabel, { color: colors.text.dark, marginBottom: 0 }]}>
                {emojis.find((item) => item.id === selectedMoodId)?.emotion_name || "Đang tải..."}
              </Text>
              <TouchableOpacity onPress={() => navigation.navigate("AllMoods")}>
                <Text style={{ fontFamily: FONTS.bold, color: colors.primary, fontSize: 16 }}>Thêm</Text>
              </TouchableOpacity>
            </View>
          </View>

          {/* Date & Time */}
          <View style={[styles.dateTimeContainer, { borderBottomColor: colors.border }]}>
            <View style={[styles.dateDisplay, { borderRightColor: colors.border }]}>
              <Text style={[styles.dateTimeText, { color: colors.text.dark }]}>{dateString}</Text>
            </View>
            <TouchableOpacity style={[styles.timePicker, { backgroundColor: colors.background.cream }]}>
              <Text style={[styles.dateTimeText, { color: colors.text.dark }]}>{timeString}</Text>
              {React.createElement(ChevronDown as any, { size: 16, color: colors.text.dark })}
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
            <TextInput
              style={[styles.titleInput, { color: colors.text.dark, borderBottomColor: colors.border }]}
              placeholder="Title (Optional)"
              placeholderTextColor={colors.text.muted}
              value={title}
              onChangeText={setTitle}
            />
            <View style={[styles.descriptionContainer, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}>
              <TextInput
                style={[styles.descriptionInput, { color: colors.text.dark }]}
                placeholder="Write about your day..."
                placeholderTextColor={colors.text.muted}
                multiline
                textAlignVertical="top"
                value={description}
                onChangeText={setDescription}
              />
            </View>
          </View>

          {/* Add Photo Button */}
          <TouchableOpacity style={[styles.addPhotoButton, { backgroundColor: colors.primary }]} onPress={handleAddPhoto}>
            {React.createElement(Camera as any, { size: 24, color: colors.text.textOnDark, style: { marginRight: 8 } })}
            <Text style={[styles.buttonText, { color: colors.text.textOnDark }]}>Add Photo</Text>
          </TouchableOpacity>

          {/* Photo Gallery Preview */}
          {images.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.galleryContainer}>
              {images.map((img, index) => (
                <View key={index} style={styles.imagePreviewContainer}>
                  <Image source={{ uri: img }} style={styles.imagePreview} />
                  <TouchableOpacity
                    style={[styles.removeImageButton, { backgroundColor: colors.error, borderColor: colors.background.white }]}
                    onPress={() => removeImage(index)}
                  >
                    {React.createElement(X as any, { size: 12, color: colors.text.white })}
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}

          <View style={{ height: 100 }} />
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  sectionLabel: { fontFamily: FONTS.bold, fontSize: 16, marginBottom: SIZES.spacing.s },
  safeArea: { flex: 1 },
  header: {
    flexDirection: "row",
    justifyContent: "space-between",
    alignItems: "center",
    paddingHorizontal: SIZES.spacing.xl,
    paddingVertical: SIZES.spacing.s,
  },
  headerTitle: { fontFamily: FONTS.bold, fontSize: 22 },
  saveButton: {
    flexDirection: "row",
    alignItems: "center",
    paddingHorizontal: SIZES.spacing.m,
    paddingVertical: 6,
    borderRadius: SIZES.radius.xl,
    gap: 4,
  },
  saveText: { fontFamily: FONTS.bold, fontSize: 16 },
  scrollContent: { paddingHorizontal: SIZES.spacing.xl, paddingTop: SIZES.spacing.s },
  section: { marginBottom: SIZES.spacing.xxl },
  moodContainer: { paddingVertical: SIZES.spacing.s, gap: SIZES.spacing.m },
  moodItem: {
    width: 60,
    height: 60,
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
    borderBottomWidth: 1,
    paddingBottom: SIZES.spacing.m,
  },
  dateDisplay: { flex: 1, paddingVertical: SIZES.spacing.s, borderRightWidth: 1 },
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
  titleInput: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    marginBottom: SIZES.spacing.m,
    borderBottomWidth: 1,
    paddingBottom: SIZES.spacing.s,
  },
  descriptionContainer: {
    borderRadius: SIZES.radius.xl,
    padding: SIZES.spacing.l,
    borderWidth: 1,
    minHeight: 200,
  },
  descriptionInput: { fontFamily: FONTS.regular, fontSize: 18, lineHeight: 24 },
  addPhotoButton: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "center",
    paddingVertical: 14,
    borderRadius: SIZES.radius.xxl,
    marginBottom: SIZES.spacing.xl,
    shadowColor: "#000",
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: { fontFamily: FONTS.bold, fontSize: 18 },
  galleryContainer: { marginBottom: SIZES.spacing.xl },
  imagePreviewContainer: { marginRight: SIZES.spacing.m, position: "relative" },
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
});
