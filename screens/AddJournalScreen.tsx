import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  TextInput, Image, ScrollView, Dimensions,
  ImageBackground, Platform, Alert
} from 'react-native';
import { 
  ArrowLeft, Check, Camera, X, 
  ChevronDown, Calendar, Compass,
  Languages, Zap, Dumbbell, Plus
} from 'lucide-react-native';
import { Modal, FlatList } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { FONTS, SIZES } from '../constants/theme';
import { BACKGROUNDS } from '../constants/images';

const { width } = Dimensions.get('window');

export const MOOD_ICONS = [
  require('../assets/icon/icon1.png'),
  require('../assets/icon/icon2.png'),
  require('../assets/icon/icon3.png'),
  require('../assets/icon/icon4.png'),
  require('../assets/icon/icon5.png'),
];

const JOURNEYS = [
  { id: '0', title: 'Không chọn', icon: React.createElement(Compass as any, { size: 20, color: COLORS.text.muted }), bgColor: COLORS.background.soft },
  { id: '1', title: 'Hành trình học Tiếng Trung', icon: React.createElement(Languages as any, { size: 20, color: COLORS.text.dark }), bgColor: '#fdf4db' },
  { id: '2', title: 'Hành trình Giảm cân', icon: React.createElement(Zap as any, { size: 20, color: COLORS.text.dark }), bgColor: '#e2f3df' },
  { id: '3', title: 'Hành trình học Thế dục', icon: React.createElement(Dumbbell as any, { size: 20, color: COLORS.text.dark }), bgColor: '#fdf4db' },
];

export default function AddJournalScreen({ navigation }: { navigation: any }) {
  const [selectedMood, setSelectedMood] = useState(0);
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');
  const [images, setImages] = useState<string[]>([]);
  const [selectedJourney, setSelectedJourney] = useState(JOURNEYS[0]);
  const [showJourneyPicker, setShowJourneyPicker] = useState(false);
  
  // Current date & time
  const now = new Date();
  const dateString = `${String(now.getDate()).padStart(2, '0')}/${String(now.getMonth() + 1).padStart(2, '0')}/${now.getFullYear()}`;
  const timeString = now.toLocaleTimeString([], { hour: '2-digit', minute: '2-digit', hour12: true });

  const handleSave = () => {
    Alert.alert('Thành công', 'Nhật ký của bạn đã được lưu!', [
      { text: 'OK', onPress: () => navigation.goBack() }
    ]);
  };

  const handleAddPhoto = () => {
    // Mocking image selection for now
    const mockImages = [
      'https://images.unsplash.com/photo-1499750310107-5fef28a66643?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1506744038136-46273834b3fb?w=500&auto=format&fit=crop&q=60',
      'https://images.unsplash.com/photo-1495474472287-4d71bcdd2085?w=500&auto=format&fit=crop&q=60'
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
    <ImageBackground 
      source={BACKGROUNDS.add} 
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        {/* Header */}
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            {React.createElement(ArrowLeft as any, { size: 28, color: COLORS.text.dark })}
          </TouchableOpacity>
          <Text style={styles.headerTitle}>New Journal Entry</Text>
          <TouchableOpacity onPress={handleSave} style={styles.saveButton}>
            {React.createElement(Check as any, { size: 20, color: COLORS.text.white })}
            <Text style={styles.saveText}>Save</Text>
          </TouchableOpacity>
        </View>

        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Mood Selector */}
          <View style={styles.section}>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.moodContainer}>
              {MOOD_ICONS.map((icon, index) => (
                <TouchableOpacity 
                  key={index} 
                  onPress={() => setSelectedMood(index)}
                  style={[
                    styles.moodItem, 
                    selectedMood === index && styles.activeMoodItem
                  ]}
                >
                  <Image source={icon} style={styles.moodIcon} />
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Date & Time */}
          <View style={styles.dateTimeContainer}>
            <View style={styles.dateDisplay}>
              <Text style={styles.dateTimeText}>{dateString}</Text>
            </View>
            <TouchableOpacity style={styles.timePicker}>
              <Text style={styles.dateTimeText}>{timeString}</Text>
              {React.createElement(ChevronDown as any, { size: 16, color: COLORS.text.dark })}
            </TouchableOpacity>
          </View>

          {/* Journey Picker */}
          <View style={styles.section}>
            <Text style={styles.sectionLabel}>Chọn Hành trình</Text>
            <TouchableOpacity 
              style={styles.journeyPickerTrigger}
              onPress={() => setShowJourneyPicker(true)}
            >
              <View style={styles.journeyTriggerLeft}>
                <View style={[styles.miniIconCircle, { backgroundColor: selectedJourney.bgColor }]}>
                  {selectedJourney.icon}
                </View>
                <Text style={[
                  styles.selectedJourneyText,
                  selectedJourney.id === '0' && { color: COLORS.text.muted }
                ]}>
                  {selectedJourney.title}
                </Text>
              </View>
              {React.createElement(ChevronDown as any, { size: 20, color: COLORS.text.dark })}
            </TouchableOpacity>
          </View>

          {/* Input Fields */}
          <View style={styles.inputSection}>
            <TextInput
              style={styles.titleInput}
              placeholder="Title (Optional)"
              placeholderTextColor={COLORS.text.muted}
              value={title}
              onChangeText={setTitle}
            />
            <View style={styles.descriptionContainer}>
              <TextInput
                style={styles.descriptionInput}
                placeholder="Write about your day..."
                placeholderTextColor={COLORS.text.muted}
                multiline
                textAlignVertical="top"
                value={description}
                onChangeText={setDescription}
              />
            </View>
          </View>

          {/* Add Photo Button */}
          <TouchableOpacity style={styles.addPhotoButton} onPress={handleAddPhoto}>
            {React.createElement(Camera as any, { size: 24, color: COLORS.text.white, style: { marginRight: 8 } })}
            <Text style={styles.buttonText}>Add Photo</Text>
          </TouchableOpacity>

          {/* Photo Gallery Preview */}
          {images.length > 0 && (
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.galleryContainer}>
              {images.map((img, index) => (
                <View key={index} style={styles.imagePreviewContainer}>
                  <Image source={{ uri: img }} style={styles.imagePreview} />
                  <TouchableOpacity 
                    style={styles.removeImageButton}
                    onPress={() => removeImage(index)}
                  >
                    {React.createElement(X as any, { size: 12, color: COLORS.text.white })}
                  </TouchableOpacity>
                </View>
              ))}
            </ScrollView>
          )}

          {/* Spacing for keyboard */}
          <View style={{ height: 100 }} />
        </ScrollView>

        {/* Journey Picker Modal */}
        <Modal
          visible={showJourneyPicker}
          transparent
          animationType="fade"
          onRequestClose={() => setShowJourneyPicker(false)}
        >
          <TouchableOpacity 
            style={styles.modalOverlay} 
            activeOpacity={1} 
            onPress={() => setShowJourneyPicker(false)}
          >
            <View style={styles.modalContent}>
              <Text style={styles.modalTitle}>Chọn Hành trình</Text>
              {JOURNEYS.map((item) => (
                <TouchableOpacity 
                  key={item.id} 
                  style={[
                    styles.journeyOption,
                    selectedJourney.id === item.id && styles.selectedOption
                  ]}
                  onPress={() => {
                    setSelectedJourney(item);
                    setShowJourneyPicker(false);
                  }}
                >
                  <View style={[styles.miniIconCircle, { backgroundColor: item.bgColor }]}>
                    {item.icon}
                  </View>
                  <Text style={styles.optionText}>{item.title}</Text>
                  {selectedJourney.id === item.id && React.createElement(Check as any, { size: 18, color: COLORS.primary })}
                </TouchableOpacity>
              ))}
              <TouchableOpacity 
                style={[
                  styles.journeyOption,
                ]}
                onPress={() => {
                  setShowJourneyPicker(false);
                  navigation.navigate('CreateJourney');
                }}
              >
                {React.createElement(Plus as any, { size: 20, color: COLORS.primary })}
                <Text style={[styles.optionText, { color: COLORS.primary, fontFamily: FONTS.bold }]}>
                  Tạo hành trình mới
                </Text>
              </TouchableOpacity>
            </View>
          </TouchableOpacity>
        </Modal>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: SIZES.spacing.xl,
    paddingVertical: SIZES.spacing.s,
  },
  headerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: COLORS.text.dark,
  },
  saveButton: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.primary,
    paddingHorizontal: SIZES.spacing.m,
    paddingVertical: 6,
    borderRadius: SIZES.radius.xl,
    gap: 4,
  },
  saveText: {
    color: COLORS.text.white,
    fontFamily: FONTS.bold,
    fontSize: 16,
  },
  scrollContent: {
    paddingHorizontal: SIZES.spacing.xl,
    paddingTop: SIZES.spacing.s,
  },
  section: {
    marginBottom: SIZES.spacing.xxl,
  },
  moodContainer: {
    paddingVertical: SIZES.spacing.s,
    gap: SIZES.spacing.m,
  },
  moodItem: {
    width: 60,
    height: 60,
    borderRadius: SIZES.radius.large,
    backgroundColor: COLORS.background.soft,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  activeMoodItem: {
    borderColor: COLORS.primary,
    backgroundColor: COLORS.background.white,
  },
  moodIcon: {
    width: 48,
    height: 48,
  },
  dateTimeContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: SIZES.spacing.xl,
    gap: SIZES.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    paddingBottom: SIZES.spacing.m,
  },
  dateDisplay: {
    flex: 1,
    paddingVertical: SIZES.spacing.s,
    borderRightWidth: 1,
    borderRightColor: COLORS.divider,
  },
  timePicker: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: COLORS.background.cream,
    paddingHorizontal: SIZES.spacing.m,
    paddingVertical: SIZES.spacing.s,
    borderRadius: SIZES.radius.medium,
    gap: SIZES.spacing.s,
  },
  dateTimeText: {
    fontFamily: FONTS.regular,
    fontSize: 18,
    color: COLORS.text.dark,
  },
  inputSection: {
    marginBottom: SIZES.spacing.xl,
  },
  titleInput: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.text.dark,
    marginBottom: SIZES.spacing.m,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
    paddingBottom: SIZES.spacing.s,
  },
  descriptionContainer: {
    backgroundColor: COLORS.background.overlay,
    borderRadius: SIZES.radius.xl,
    padding: SIZES.spacing.l,
    borderWidth: 1,
    borderColor: 'rgba(80, 111, 63, 0.2)',
    minHeight: 200,
  },
  descriptionInput: {
    fontFamily: FONTS.regular,
    fontSize: 18,
    color: COLORS.text.dark,
    lineHeight: 24,
  },
  addPhotoButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.primary,
    paddingVertical: 14,
    borderRadius: SIZES.radius.xxl,
    marginBottom: SIZES.spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 4,
  },
  buttonText: {
    color: COLORS.text.white,
    fontFamily: FONTS.bold,
    fontSize: 18,
  },
  galleryContainer: {
    marginBottom: SIZES.spacing.xl,
  },
  imagePreviewContainer: {
    marginRight: SIZES.spacing.m,
    position: 'relative',
  },
  imagePreview: {
    width: 120,
    height: 120,
    borderRadius: SIZES.radius.large,
  },
  removeImageButton: {
    position: 'absolute',
    top: -6,
    right: -6,
    backgroundColor: COLORS.error,
    width: 24,
    height: 24,
    borderRadius: 12,
    justifyContent: 'center',
    alignItems: 'center',
    borderWidth: 2,
    borderColor: COLORS.background.white,
  },
  sectionLabel: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.text.dark,
    marginBottom: SIZES.spacing.s,
  },
  journeyPickerTrigger: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    backgroundColor: COLORS.background.overlay,
    padding: SIZES.spacing.m,
    borderRadius: SIZES.radius.large,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  journeyTriggerLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 12,
  },
  miniIconCircle: {
    width: 32,
    height: 32,
    borderRadius: 16,
    justifyContent: 'center',
    alignItems: 'center',
  },
  selectedJourneyText: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.text.dark,
  },
  modalOverlay: {
    flex: 1,
    backgroundColor: 'rgba(0, 0, 0, 0.4)',
    justifyContent: 'center',
    padding: SIZES.spacing.xl,
  },
  modalContent: {
    backgroundColor: COLORS.background.white,
    borderRadius: SIZES.radius.xxl,
    padding: SIZES.spacing.xl,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.2,
    shadowRadius: 20,
    elevation: 10,
  },
  modalTitle: {
    fontFamily: FONTS.bold,
    fontSize: 20,
    color: COLORS.text.dark,
    marginBottom: SIZES.spacing.l,
    textAlign: 'center',
  },
  journeyOption: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.spacing.m,
    borderRadius: SIZES.radius.large,
    marginBottom: SIZES.spacing.s,
    gap: 12,
  },
  selectedOption: {
    backgroundColor: 'rgba(80, 111, 63, 0.05)',
    borderWidth: 1,
    borderColor: COLORS.primary,
  },
  optionText: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.text.dark,
  },
});
