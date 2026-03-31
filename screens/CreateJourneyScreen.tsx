import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  TextInput, KeyboardAvoidingView, Platform, 
  ScrollView, ImageBackground, Alert
} from 'react-native';
import { COLORS } from '../constants/colors';
import { FONTS, SIZES } from '../constants/theme';
import { BACKGROUNDS } from '../constants/images';
import { SafeAreaView } from 'react-native-safe-area-context';

export default function CreateJourneyScreen({ navigation, onClose }: { navigation?: any; onClose?: () => void }) {
  const [title, setTitle] = useState('');
  const [description, setDescription] = useState('');

  const handleCreate = () => {
    if (!title.trim()) {
      Alert.alert('Lỗi', 'Vui lòng nhập tên hành trình!');
      return;
    }
    
    // Simulate creation
    Alert.alert('Thành công', `Hành trình "${title}" đã được tạo!`, [
      { text: 'OK', onPress: () => {
        if (onClose) onClose();
        else if (navigation) navigation.goBack();
      }}
    ]);
  };

  return (
    <ImageBackground 
      source={BACKGROUNDS.detail} 
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <KeyboardAvoidingView 
          behavior={Platform.OS === 'ios' ? 'padding' : 'height'}
          style={styles.flex}
        >
          <ScrollView contentContainerStyle={styles.scrollContent}>
            <View style={styles.header}>
              <Text style={styles.title}>Bắt đầu Hành trình mới</Text>
              <Text style={styles.subtitle}>Thiết lập mục tiêu và bắt đầu ghi lại những khoảnh khắc đáng nhớ.</Text>
            </View>

            <View style={styles.inputSection}>
              <Text style={styles.label}>Tên hành trình</Text>
              <TextInput
                style={styles.input}
                placeholder="Ví dụ: Hành trình học Vẽ, Yoga mỗi ngày..."
                placeholderTextColor={COLORS.text.muted}
                value={title}
                onChangeText={setTitle}
              />

              <Text style={styles.label}>Mô tả hành trình (Không bắt buộc)</Text>
              <View style={styles.textAreaContainer}>
                <TextInput
                  style={styles.textArea}
                  placeholder="Ghi chú ngắn gọn về mục tiêu của bạn..."
                  placeholderTextColor={COLORS.text.muted}
                  multiline
                  textAlignVertical="top"
                  value={description}
                  onChangeText={setDescription}
                />
              </View>
            </View>

            <View style={styles.footer}>
              <TouchableOpacity 
                style={styles.createButton}
                onPress={handleCreate}
              >
                <Text style={styles.createButtonText}>Bắt đầu ngay</Text>
              </TouchableOpacity>

              <TouchableOpacity 
                style={styles.cancelButton}
                onPress={() => {
                  if (onClose) onClose();
                  else if (navigation) navigation.goBack();
                }}
              >
                <Text style={styles.cancelButtonText}>Hủy</Text>
              </TouchableOpacity>
            </View>
          </ScrollView>
        </KeyboardAvoidingView>
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
  flex: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SIZES.spacing.xl,
    paddingTop: SIZES.spacing.xxl,

  },
  header: {
    marginBottom: 40,
    alignItems: 'center',
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 28,
    color: COLORS.text.dark,
    textAlign: 'center',
    marginBottom: 12,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.text.dark,
    opacity: 0.6,
    textAlign: 'center',
    lineHeight: 22,
  },
  inputSection: {
    marginBottom: 40,
  },
  label: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.text.dark,
    marginBottom: SIZES.spacing.s,
    marginLeft: 4,
  },
  input: {
    backgroundColor: COLORS.background.overlay,
    borderRadius: SIZES.radius.large,
    padding: SIZES.spacing.m,
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.text.dark,
    borderWidth: 1,
    borderColor: COLORS.border,
    marginBottom: SIZES.spacing.xl,
  },
  textAreaContainer: {
    backgroundColor: COLORS.background.overlay,
    borderRadius: SIZES.radius.large,
    padding: SIZES.spacing.m,
    borderWidth: 1,
    borderColor: COLORS.border,
    minHeight: 120,
    flex: 1,
  },
  textArea: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.text.dark,
    height: '100%',
  },
  footer: {
    gap: 16,
  },
  createButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 16,
    borderRadius: SIZES.radius.xxl,
    alignItems: 'center',
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.2,
    shadowRadius: 10,
    elevation: 4,
  },
  createButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.text.white,
  },
  cancelButton: {
    paddingVertical: 12,
    alignItems: 'center',
  },
  cancelButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.text.muted,
  },
});
