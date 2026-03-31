import React, { useState } from 'react';
import {
  View, Text, StyleSheet, TouchableOpacity,
  ScrollView, Image, Dimensions, ImageBackground,
  Switch
} from 'react-native';
import {
  Bell, Globe, Database, Mail, Star,
  Shield, LogOut, ChevronRight, Crown, Sparkles, Lock
} from 'lucide-react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import { COLORS } from '../constants/colors';
import { FONTS, SIZES } from '../constants/theme';
import { BACKGROUNDS } from '../constants/images';

const { width } = Dimensions.get('window');

const THEME_PREVIEWS = [
  { id: '1', name: 'Natural', colors: ['#506F3F', '#e8f5e9', '#fffde7'], active: true },
  { id: '2', name: 'Sunset', colors: ['#e65100', '#fff3e0', '#fbe9e7'], active: false },
  { id: '3', name: 'Ocean', colors: ['#01579b', '#e1f5fe', '#e0f7fa'], active: false },
  { id: '4', name: 'Berry', colors: ['#880e4f', '#fce4ec', '#f3e5f5'], active: false },
];

const APP_ICONS = [
  { id: '1', image: 'https://images.unsplash.com/photo-1490750967868-88aa4f44baee?w=100&auto=format&fit=crop&q=60', active: true },
  { id: '2', image: 'https://images.unsplash.com/photo-1501004318776-cd2ba00a7f17?w=100&auto=format&fit=crop&q=60', active: false },
  { id: '3', image: 'https://images.unsplash.com/photo-1518531933037-91b2f5f229cc?w=100&auto=format&fit=crop&q=60', active: false },
  { id: '4', image: 'https://images.unsplash.com/photo-1462275646964-a0e3c11f18a6?w=100&auto=format&fit=crop&q=60', active: false },
];

interface SettingItemProps {
  icon: any;
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  showSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (val: boolean) => void;
}

function SettingItem({ icon, label, value, onPress, showChevron = true, showSwitch, switchValue, onSwitchChange }: SettingItemProps) {
  return (
    <TouchableOpacity style={settingStyles.item} onPress={onPress} activeOpacity={0.7}>
      <View style={settingStyles.itemLeft}>
        <View style={settingStyles.iconCircle}>
          {React.createElement(icon as any, { size: 20, color: COLORS.primary })}
        </View>
        <Text style={settingStyles.itemLabel}>{label}</Text>
      </View>
      <View style={settingStyles.itemRight}>
        {value && <Text style={settingStyles.itemValue}>{value}</Text>}
        {showSwitch ? (
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            trackColor={{ false: '#d1d5db', true: '#a7c4a0' }}
            thumbColor={switchValue ? COLORS.primary : '#f4f3f4'}
          />
        ) : showChevron ? (
          React.createElement(ChevronRight as any, { size: 18, color: COLORS.text.muted })
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

export default function SettingScreen({ onLogout }: { onLogout?: () => void }) {
  const [notifications, setNotifications] = useState(true);
  const [selectedTheme, setSelectedTheme] = useState('1');
  const [selectedIcon, setSelectedIcon] = useState('1');

  return (
    <ImageBackground
      source={BACKGROUNDS.home}
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView showsVerticalScrollIndicator={false} contentContainerStyle={styles.scrollContent}>

          {/* Profile Section */}
          <View style={styles.profileSection}>
            <Image
              source={{ uri: 'https://i.pravatar.cc/150?u=elena' }}
              style={styles.avatar}
            />
            <View style={styles.profileInfo}>
              <Text style={styles.profileName}>Elena Meadows</Text>
              <View style={styles.proBadge}>
                {React.createElement(Crown as any, { size: 12, color: '#d4a017' })}
                <Text style={styles.proBadgeText}>PRO MEMBER</Text>
              </View>
            </View>
          </View>

          {/* Premium Banner */}
          <View style={styles.premiumBanner}>
            <View style={styles.premiumIconRow}>
              {React.createElement(Sparkles as any, { size: 20, color: '#d4a017' })}
              <Text style={styles.premiumTitle}>Unlock the Wildflower Tier</Text>
            </View>
            <Text style={styles.premiumDesc}>
              Get unlimited journal entries, advanced emotional analytics, and exclusive meadow themes.
            </Text>
            <TouchableOpacity style={styles.premiumButton}>
              <Text style={styles.premiumButtonText}>Start your free trial</Text>
            </TouchableOpacity>
          </View>
          {/* Change Theme */}
          <View style={styles.card}>
            <Text style={styles.cardTitle}>Change Theme</Text>
            <ScrollView horizontal showsHorizontalScrollIndicator={false} style={styles.themeScroll}>
              {THEME_PREVIEWS.map((theme) => (
                <TouchableOpacity
                  key={theme.id}
                  style={[
                    styles.themeCard,
                    { backgroundColor: theme.colors[1] },
                    selectedTheme === theme.id && styles.themeCardActive,
                  ]}
                  onPress={() => setSelectedTheme(theme.id)}
                >
                  <View style={[styles.themeTopBar, { backgroundColor: theme.colors[0] }]} />
                  <View style={styles.themeContent}>
                    <View style={[styles.themeLine, { backgroundColor: theme.colors[0], width: '60%' }]} />
                    <View style={[styles.themeLine, { backgroundColor: theme.colors[2], width: '80%' }]} />
                    <View style={[styles.themeLine, { backgroundColor: theme.colors[0], width: '40%', opacity: 0.4 }]} />
                  </View>
                  <Text style={[styles.themeName, { color: theme.colors[0] }]}>{theme.name}</Text>
                </TouchableOpacity>
              ))}
            </ScrollView>
          </View>

          {/* Settings List */}
          <View style={styles.settingsCard}>
            <SettingItem
              icon={Bell}
              label="Notifications"
              showChevron={false}
              showSwitch
              switchValue={notifications}
              onSwitchChange={setNotifications}
            />
            <SettingItem icon={Globe} label="Language" value="Tiếng Việt" />
            <SettingItem icon={Database} label="Data & Sync" />
            <SettingItem icon={Lock} label="Lock app" />
          </View>

          <View style={styles.settingsCard}>
            <SettingItem icon={Mail} label="Write Email Feedback" />
            <SettingItem icon={Star} label="Rate the App" />
            <SettingItem icon={Shield} label="Privacy Policy" />
          </View>

          {/* Sign Out */}
          <TouchableOpacity style={styles.signOutButton} onPress={onLogout}>
            {React.createElement(LogOut as any, { size: 18, color: COLORS.text.white })}
            <Text style={styles.signOutText}>Sign Out</Text>
          </TouchableOpacity>

          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>
    </ImageBackground>
  );
}

const settingStyles = StyleSheet.create({
  item: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'space-between',
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.divider,
  },
  itemLeft: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 14,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: 'rgba(80, 111, 63, 0.1)',
    justifyContent: 'center',
    alignItems: 'center',
  },
  itemLabel: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.text.dark,
  },
  itemRight: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
  },
  itemValue: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.text.muted,
  },
});

const styles = StyleSheet.create({
  container: {
    flex: 1,
  },
  safeArea: {
    flex: 1,
  },
  scrollContent: {
    paddingHorizontal: SIZES.spacing.xl,
    paddingTop: SIZES.spacing.m,
  },

  // Profile
  profileSection: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 24,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
    borderColor: COLORS.primary,
  },
  profileInfo: {
    marginLeft: 16,
  },
  profileName: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    color: COLORS.text.dark,
    marginBottom: 4,
  },
  proBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fff7e0',
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
    alignSelf: 'flex-start',
  },
  proBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: '#d4a017',
    letterSpacing: 1,
  },

  // Premium Banner
  premiumBanner: {
    backgroundColor: 'rgba(80, 111, 63, 0.12)',
    borderRadius: SIZES.radius.xxl,
    padding: 20,
    marginBottom: 28,
    borderWidth: 1,
    borderColor: 'rgba(80, 111, 63, 0.2)',
  },
  premiumIconRow: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 8,
    marginBottom: 8,
  },
  premiumTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.text.dark,
  },
  premiumDesc: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.text.dark,
    opacity: 0.7,
    lineHeight: 20,
    marginBottom: 16,
  },
  premiumButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: 'center',
  },
  premiumButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.text.white,
  },

  // Section Label
  sectionLabel: {
    fontFamily: FONTS.bold,
    fontSize: 11,
    color: COLORS.text.muted,
    letterSpacing: 1.5,
    marginBottom: 12,
  },

  // Theme / Icon Cards
  card: {
    backgroundColor: COLORS.background.overlay,
    borderRadius: SIZES.radius.xxl,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  cardTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.text.dark,
    marginBottom: 14,
  },
  themeScroll: {
    marginHorizontal: -4,
  },
  themeCard: {
    width: 80,
    height: 110,
    borderRadius: 16,
    marginHorizontal: 6,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  themeCardActive: {
    borderColor: COLORS.primary,
  },
  themeTopBar: {
    height: 24,
    borderTopLeftRadius: 14,
    borderTopRightRadius: 14,
  },
  themeContent: {
    flex: 1,
    padding: 8,
    gap: 6,
    justifyContent: 'center',
  },
  themeLine: {
    height: 6,
    borderRadius: 3,
  },
  themeName: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    textAlign: 'center',
    paddingBottom: 6,
  },
  iconRow: {
    flexDirection: 'row',
    gap: 12,
  },
  appIconCard: {
    width: 56,
    height: 56,
    borderRadius: 16,
    overflow: 'hidden',
    borderWidth: 2,
    borderColor: 'transparent',
  },
  appIconActive: {
    borderColor: COLORS.primary,
  },
  appIconImage: {
    width: '100%',
    height: '100%',
  },

  // Settings Cards
  settingsCard: {
    backgroundColor: COLORS.background.overlay,
    borderRadius: SIZES.radius.xxl,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
    borderColor: COLORS.border,
  },

  // Sign Out
  signOutButton: {
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingVertical: 16,
    borderRadius: 28,
    borderWidth: 1.5,
    borderColor: COLORS.error,
    gap: 10,
    marginTop: 8,
    backgroundColor: COLORS.error,
  },
  signOutText: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.text.white,
  },
});
