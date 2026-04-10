import React from 'react';
import { View, Text, StyleSheet, TouchableOpacity, ScrollView, ImageBackground, Image } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { ArrowLeft } from 'lucide-react-native';
import { useTheme } from '../context/ThemeContext';
import { useMood } from '../context/MoodContext';
import { FONTS, SIZES } from '../constants/theme';
// import { MOOD_ICONS } from '../constants/moods'; // Không dùng nữa

// MOOD_SETS đã được chuyển vào database (bảng typeEmoji)

export default function AllMoodsScreen({ navigation }: any) {
  const { colors, backgrounds } = useTheme();
  const { types, language, setSelectedTypeId, selectedTypeId } = useMood();
  const [allEmojis, setAllEmojis] = React.useState<any[]>([]);

  React.useEffect(() => {
    const fetchAllEmojis = async () => {
      const { data, error } = await import('../lib/supabase').then(m => 
        m.supabase.from('emojis').select('type_id, image')
      );
      if (data) setAllEmojis(data);
    };
    fetchAllEmojis();
  }, []);

  return (
    <ImageBackground source={backgrounds.home} style={[styles.container, { backgroundColor: colors.background.main }]}>
      <SafeAreaView style={styles.safeArea}>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()}>
            <ArrowLeft color={colors.text.dark} size={24} />
          </TouchableOpacity>
          <Text style={[styles.screenTitle, { color: colors.text.dark }]}>Bộ cảm xúc</Text>
          <View style={{ width: 24 }} />
        </View>

        <ScrollView contentContainerStyle={styles.scrollContent}>
          {types.map((set) => (
            <View key={set.id} style={[styles.setCard, { backgroundColor: colors.backgroundCard, borderWidth: selectedTypeId === set.id ? 2 : 1, borderColor: selectedTypeId === set.id ? colors.primary : colors.border }]}>
              <View style={styles.setHeader}>
                <View style={{ flex: 1 }}>
                  <Text style={[styles.setName, { color: colors.text.dark }]}>{set.name[language] || set.name['en']}</Text>
                  <Text style={[styles.setDesc, { color: colors.text.muted }]}>{set.description?.[language] || set.description?.['en']}</Text>
                </View>
                <TouchableOpacity 
                  style={[styles.selectBtn, { backgroundColor: selectedTypeId === set.id ? colors.text.muted : colors.primary }]} 
                  onPress={() => {
                    setSelectedTypeId(set.id);
                    navigation.goBack();
                  }}
                  disabled={selectedTypeId === set.id}
                >
                  <Text style={styles.selectBtnText}>{selectedTypeId === set.id ? 'Đang dùng' : 'Chọn'}</Text>
                </TouchableOpacity>
              </View>
              
              <View style={styles.iconRow}>
                {allEmojis
                  .filter(e => e.type_id === set.id)
                  .map((emoji, idx) => (
                    <View key={idx} style={styles.iconWrapper}>
                      <Image source={{ uri: emoji.image }} style={styles.icon} />
                    </View>
                  ))}
              </View>
            </View>
          ))}
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  header: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingHorizontal: SIZES.spacing.xl,
    paddingVertical: SIZES.spacing.m,
  },
  screenTitle: { fontFamily: FONTS.bold, fontSize: 20 },
  scrollContent: { paddingHorizontal: SIZES.spacing.xl, paddingBottom: 40, paddingTop: 10 },
  setCard: {
    borderRadius: SIZES.radius.xl,
    padding: 16,
    marginBottom: SIZES.spacing.l,
    borderWidth: 1,
  },
  setHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: 16,
  },
  setName: { fontFamily: FONTS.bold, fontSize: 18 },
  setDesc: { fontFamily: FONTS.regular, fontSize: 14, marginTop: 2 },
  selectBtn: {
    paddingHorizontal: 16,
    paddingVertical: 8,
    borderRadius: 20,
    marginLeft: 10,
  },
  selectBtnText: {
    fontFamily: FONTS.bold,
    color: '#fff',
    fontSize: 14,
  },
  iconRow: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    gap: 8,
    marginTop: 8,
  },
  iconWrapper: {
    width: 40,
    height: 40,
  },
  icon: {
    width: 48,
    height: 48,
    resizeMode: 'contain',
  }
});
