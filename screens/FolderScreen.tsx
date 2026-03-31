import React from 'react';
import { 
  View, Text, StyleSheet, TouchableOpacity, 
  ScrollView, Image, Dimensions, ImageBackground 
} from 'react-native';
import { 
  ChevronRight, Languages, Dumbbell, Zap, Plus, 
  Compass, ArrowRight
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { FONTS, SIZES } from '../constants/theme';
import { BACKGROUNDS } from '../constants/images';
import CreateJourneyScreen from './CreateJourneyScreen';
import { Modal } from 'react-native';

const { width } = Dimensions.get('window');

const JOURNEYS_DATA = [
  {
    id: '1',
    title: 'Hành trình học Tiếng Trung',
    description: 'Mỗi ngày 5 từ mới, tích lũy kiến thức qua từng trang vở nhỏ.',
    postCount: 42,
    lastImage: 'https://images.unsplash.com/photo-1544306094-d246b53ed810?w=500&auto=format&fit=crop&q=60',
    icon: React.createElement(Languages as any, { size: 20, color: COLORS.text.dark }),
    bgColor: '#fdf4db',// Light yellow
    statusText: 'Tiếp tục viết',
  },
  {
    id: '2',
    title: 'Hành trình Giảm cân',
    description: 'Chạy bộ mỗi sáng, ghi lại những giọt mồ hôi và sự nỗ lực.',
    postCount: 18,
    lastImage: 'https://images.unsplash.com/photo-1517836357463-d25dfeac3438?w=500&auto=format&fit=crop&q=60',
    icon: React.createElement(Zap as any, { size: 20, color: COLORS.text.dark }),
    bgColor: '#e2f3df', // Light green
    statusText: 'Cập nhật tiến độ',
  },
  {
    id: '3',
    title: 'Hành trình học Thế dục',
    description: 'Yoga và thiền định mỗi tối để cân bằng tâm hồn.',
    postCount: 6,
    lastImage: 'https://images.unsplash.com/photo-1506126613408-eca07ce68773?w=500&auto=format&fit=crop&q=60',
    icon: React.createElement(Dumbbell as any, { size: 20, color: COLORS.text.dark }),
    bgColor: '#fdf4db', // Light yellow/cream
    statusText: 'Bắt đầu buổi tập',
  },
];

export default function FolderScreen({ navigation }: { navigation: any }) {
  const [showCreateModal, setShowCreateModal] = React.useState(false);

  return (
    <ImageBackground 
      source={BACKGROUNDS.journeys} 
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>
          {/* Main Banner */}
          <ImageBackground
  source={BACKGROUNDS.add} // ảnh của bạn
  style={styles.banner}
  imageStyle={{}}
>
  <Text style={styles.bannerTitle}>
    Khám phá bản thân qua từng trang nhật ký
  </Text>
  <Text style={styles.bannerSubtitle}>
    Lưu giữ những bước tiến nhỏ mỗi ngày để thấy hành trình của bạn rạng rỡ như thế nào.
  </Text>
</ImageBackground>

          {/* Journeys List */}
          {JOURNEYS_DATA.map((item) => (
            <View key={item.id} style={styles.journeyCard}>
                <View style={styles.cardHeader}>
                    <View style={styles.badge}>
                        <Text style={styles.badgeText}>{item.postCount} BÀI VIẾT</Text>
                    </View>
                  
                </View>

                <View style={styles.cardMain}>
                    <View style={styles.textColumn}>
                        <Text style={styles.journeyTitle}>{item.title}</Text>
                        <Text style={styles.journeyDesc}>{item.description}</Text>
                        <TouchableOpacity style={styles.ctaButton}>
                            <Text style={styles.ctaText}>{item.statusText}</Text>
                            {React.createElement(ArrowRight as any, { size: 16, color: COLORS.text.dark, style: { marginLeft: 6 } })}
                        </TouchableOpacity>
                    </View>
                    <Image source={{ uri: item.lastImage }} style={styles.lastPhoto} />
                </View>
            </View>
          ))}

          <TouchableOpacity 
            style={styles.bottomActionButton}
            onPress={() => setShowCreateModal(true)}
          >
             {React.createElement(Compass as any, { size: 20, color: COLORS.text.white, style: { marginRight: 8 } })}
             <Text style={styles.bottomActionText}>Bắt đầu Hành trình mới</Text>
          </TouchableOpacity>

          <View style={{ height: 120 }} />
        </ScrollView>

        <Modal
          visible={showCreateModal}
          animationType="slide"
          onRequestClose={() => setShowCreateModal(false)}
        >
          <CreateJourneyScreen onClose={() => setShowCreateModal(false)} />
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
  scrollContent: {
    paddingHorizontal: SIZES.spacing.xl,
    paddingTop: SIZES.spacing.l,
  },
  banner: {
    backgroundColor: '#f1f8e8', // Light greenish matched from image
    borderRadius: SIZES.radius.xxl,
    padding: SIZES.spacing.xl,
    marginBottom: SIZES.spacing.xl,
    position: 'relative',
    overflow: 'hidden',
  },
  flowerIconPlaceholder: {
    position: 'absolute',
    top: -10,
    right: 20,
    width: 60,
    height: 60,
    opacity: 0.2,
  },
  flowerPetal: {
    position: 'absolute',
    width: 20,
    height: 20,
    borderRadius: 10,
    backgroundColor: COLORS.secondary,
  },
  bannerTitle: {
    fontFamily: FONTS.bold,
    fontSize: 28,
    lineHeight: 34,
    color: COLORS.text.dark,
    marginBottom: SIZES.spacing.m,
    maxWidth: '85%',
  },
  bannerSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.text.dark,
    lineHeight: 20,
    opacity: 0.8,
  },
  journeyCard: {
    backgroundColor: COLORS.background.overlay,
    borderRadius: SIZES.radius.xxl,
    padding: SIZES.spacing.l,
    marginBottom: SIZES.spacing.l,
    // shadowColor: '#000',
    // shadowOffset: { width: 0, height: 4 },
    // shadowOpacity: 0.05,
    // shadowRadius: 10,
    // elevation: 2,
  },
  cardHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacing.m,
  },
  badge: {
    backgroundColor: COLORS.primary, // Pale yellow matched from image
    paddingHorizontal: 12,
    paddingVertical: 4,
    borderRadius: SIZES.radius.medium,
  },
  badgeText: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: COLORS.text.white, 
  },
  iconCircle: {
    width: 40,
    height: 40,
    borderRadius: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  cardMain: {
    flexDirection: 'row',
    alignItems: 'flex-start',
  },
  textColumn: {
    flex: 1,
    paddingRight: SIZES.spacing.m,
  },
  journeyTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.text.dark,
    marginBottom: SIZES.spacing.xs,
  },
  journeyDesc: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.text.dark,
    lineHeight: 20,
    opacity: 0.7,
    marginBottom: SIZES.spacing.m,
  },
  ctaButton: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  ctaText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.text.dark,
  },
  lastPhoto: {
    width: 70,
    height: 70,
    borderRadius: 35,
    borderWidth: 1,
    borderColor: COLORS.divider,
  },
  newJourneySection: {
    borderWidth: 1,
    borderColor: COLORS.divider,
    borderStyle: 'dashed',
    borderRadius: SIZES.radius.xxl,
    padding: SIZES.spacing.xl,
    alignItems: 'center',
    justifyContent: 'center',
    marginBottom: SIZES.spacing.xl,
  },
  plusIconCircle: {
    width: 54,
    height: 54,
    borderRadius: 27,
    backgroundColor: '#f1f8e8',
    justifyContent: 'center',
    alignItems: 'center',
    marginBottom: SIZES.spacing.m,
  },
  newJourneyTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.text.dark,
    marginBottom: 4,
  },
  newJourneySub: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    color: COLORS.text.dark,
    opacity: 0.6,
  },
  bottomActionButton: {
    backgroundColor: '#506F3F',
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 14,
    borderRadius: 30, // Large radius for pill button
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 4,
  },
  bottomActionText: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.text.white,
  },
});
