import React, { useState, useEffect, useMemo } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  StyleSheet,
  Modal,
  FlatList,
  Image,
  Pressable,
} from 'react-native';
import { ChevronRight, Check } from 'lucide-react-native';
import { FONTS, SIZES } from '../constants/theme';
import { useTheme } from '../context/ThemeContext';
import type { Emoji } from '../context/MoodContext';
import { getDailyMoods, getLocalDateKey, saveDailyMood } from '../lib/storage';

interface RepresentativeMoodCardProps {
  journals: any[];
  emojis: Emoji[];
  date: Date;
  onRepresentativeChanged?: (emotionId: number) => void;
  onPress?: () => void;
}

export default function RepresentativeMoodCard({
  journals,
  emojis,
  date,
  onRepresentativeChanged,
  onPress,
}: RepresentativeMoodCardProps) {
  const { colors } = useTheme();
  const [representativeId, setRepresentativeId] = useState<number | null>(null);
  const [isManual, setIsManual] = useState(false);
  const [modalVisible, setModalVisible] = useState(false);

  const dateStr = getLocalDateKey(date);

  // Calculate mood data (percentage per emotion)
  const moodData = useMemo(() => {
    if (journals.length === 0 || emojis.length === 0) return [];

    const counts: Record<number, number> = {};
    journals.forEach((j) => {
      const match = emojis.find(
        (e) => e.emotion_id === Number(j.typeEmoji) || e.id === Number(j.typeEmoji)
      );
      const eId = match?.emotion_id;
      if (eId) counts[eId] = (counts[eId] || 0) + 1;
    });

    const total = journals.length;
    return Object.keys(counts)
      .map((id) => {
        const emotionId = Number(id);
        const emoji = emojis.find((e) => e.emotion_id === emotionId);
        return {
          emotionId,
          percentage: Math.round((counts[emotionId] / total) * 100),
          emoji,
        };
      })
      .sort((a, b) => b.percentage - a.percentage);
  }, [journals, emojis]);

  // Load stored selection or default to highest %
  useEffect(() => {
    const loadSelection = async () => {
      const stored = await getDailyMoods();
      if (stored[dateStr] !== undefined) {
        setRepresentativeId(stored[dateStr]);
        setIsManual(true);
      } else if (moodData.length > 0) {
        setRepresentativeId(moodData[0].emotionId);
        setIsManual(false);
      }
    };
    loadSelection();
  }, [dateStr, moodData]);

  const handleSelect = async (emotionId: number) => {
    await saveDailyMood(dateStr, emotionId);
    setRepresentativeId(emotionId);
    setIsManual(true);
    setModalVisible(false);
    if (onRepresentativeChanged) onRepresentativeChanged(emotionId);
  };

  const representative = emojis.find((e) => e.emotion_id === representativeId);

  if (journals.length === 0 || !representative) return null;

  return (
    <>
      {/* Compact card shown inline */}
      <TouchableOpacity
        onPress={onPress || (() => setModalVisible(true))}
        activeOpacity={0.85}
        style={[styles.card, { backgroundColor: colors.backgroundCard, borderColor: colors.border }]}
      >
        <View style={styles.cardLeft}>
          <Text style={[styles.cardLabel, { color: colors.text.dark }]}>
            Cảm xúc đại diện hôm nay
          </Text>
          <View style={styles.moodRow}>
            <Image source={{ uri: representative.image }} style={styles.cardEmoji} />
            <Text style={[styles.cardName, { color: colors.text.dark }]}>
              {representative.emotion_name}
            </Text>
            {!isManual && (
              <View style={[styles.autoBadge, { backgroundColor: colors.primary + '22' }]}>
                <Text style={[styles.autoBadgeText, { color: colors.primary }]}>Tự động</Text>
              </View>
            )}
          </View>
        </View>
        <ChevronRight size={20} color={colors.text.dark} />
      </TouchableOpacity>

      {/* Full modal with all moods */}
      <Modal
        visible={modalVisible}
        transparent
        animationType="slide"
        onRequestClose={() => setModalVisible(false)}
      >
        <Pressable style={styles.overlay} onPress={() => setModalVisible(false)} />
        <View style={[styles.sheet, { backgroundColor: colors.backgroundCard }]}>
          <View style={[styles.sheetHandle, { backgroundColor: colors.border }]} />

          <Text style={[styles.sheetTitle, { color: colors.secondary }]}>
            Cảm xúc đại diện hôm nay của bạn
          </Text>
          <Text style={[styles.sheetSubtitle, { color: colors.text.dark }]}>
            Chọn cảm xúc bạn muốn hiển thị trên lịch
          </Text>

          <FlatList
            data={moodData}
            keyExtractor={(item) => String(item.emotionId)}
            style={styles.list}
            renderItem={({ item }) => {
              const isSelected = representativeId === item.emotionId;
              return (
                <TouchableOpacity
                  onPress={() => handleSelect(item.emotionId)}
                  style={[
                    styles.moodRow2,
                    {
                      backgroundColor: isSelected
                        ? colors.primary + '15'
                        : 'transparent',
                      borderColor: isSelected ? colors.primary : colors.border,
                    },
                  ]}
                  activeOpacity={0.7}
                >
                  <Image source={{ uri: item.emoji?.image }} style={styles.listEmoji} />
                  <View style={styles.listInfo}>
                    <Text style={[styles.listName, { color: colors.text.dark }]}>
                      {item.emoji?.emotion_name}
                    </Text>
                    <View style={styles.barContainer}>
                      <View
                        style={[
                          styles.bar,
                          {
                            width: `${item.percentage}%`,
                            backgroundColor: isSelected ? colors.primary : colors.text.dark,
                          },
                        ]}
                      />
                    </View>
                  </View>
                  <Text style={[styles.listPercent, { color: isSelected ? colors.primary : colors.text.dark }]}>
                    {item.percentage}%
                  </Text>
                  {isSelected ? (
                    <View style={[styles.checkCircle, { backgroundColor: colors.primary }]}>
                      <Check size={12} color="#FFF" />
                    </View>
                  ) : (
                    <View style={[styles.checkCircle, { backgroundColor: 'transparent', borderColor: colors.border, borderWidth: 1.5 }]} />
                  )}
                </TouchableOpacity>
              );
            }}
          />
        </View>
      </Modal>
    </>
  );
}

const styles = StyleSheet.create({
  card: {
    flexDirection: 'row',
    alignItems: 'center',
    marginHorizontal: SIZES.spacing.xl,
    marginVertical: SIZES.spacing.m,
    padding: SIZES.spacing.l,
    borderRadius: SIZES.radius.xl,
    borderWidth: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.08,
    shadowRadius: 6,
    elevation: 2,
  },
  cardLeft: {
    flex: 1,
  },
  cardLabel: {
    fontFamily: FONTS.regular,
    fontSize: 12,
    marginBottom: 6,
  },
  moodRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  cardEmoji: {
    width: 36,
    height: 36,
  },
  cardName: {
    fontFamily: FONTS.bold,
    fontSize: 16,
  },
  autoBadge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 10,
    marginLeft: 4,
  },
  autoBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 10,
  },
  // Modal styles
  overlay: {
    flex: 1,
    backgroundColor: 'rgba(0,0,0,0.4)',
  },
  sheet: {
    borderTopLeftRadius: SIZES.radius.xxxl,
    borderTopRightRadius: SIZES.radius.xxxl,
    padding: SIZES.spacing.xl,
    paddingBottom: 40,
    maxHeight: '70%',
  },
  sheetHandle: {
    width: 40,
    height: 4,
    borderRadius: 2,
    alignSelf: 'center',
    marginBottom: SIZES.spacing.l,
  },
  sheetTitle: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    textAlign: 'center',
    marginBottom: 4,
  },
  sheetSubtitle: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    textAlign: 'center',
    marginBottom: SIZES.spacing.l,
  },
  list: {
    flexGrow: 0,
  },
  moodRow2: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: SIZES.spacing.m,
    borderRadius: SIZES.radius.large,
    borderWidth: 1,
    marginBottom: SIZES.spacing.s,
    gap: SIZES.spacing.m,
  },
  listEmoji: {
    width: 44,
    height: 44,
  },
  listInfo: {
    flex: 1,
    gap: 4,
  },
  listName: {
    fontFamily: FONTS.bold,
    fontSize: 15,
  },
  barContainer: {
    height: 6,
    backgroundColor: '#E5E7EB',
    borderRadius: 3,
    overflow: 'hidden',
  },
  bar: {
    height: 6,
    borderRadius: 3,
  },
  listPercent: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    width: 36,
    textAlign: 'right',
  },
  checkCircle: {
    width: 22,
    height: 22,
    borderRadius: 11,
    alignItems: 'center',
    justifyContent: 'center',
  },
});
