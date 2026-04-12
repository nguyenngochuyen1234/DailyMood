import React, { useState } from "react";
import {
  View,
  Text,
  StyleSheet,
  TouchableOpacity,
  ScrollView,
  Image,
  Dimensions,
  ImageBackground,
  Switch,
  Alert,
  ActivityIndicator,
  Modal,
} from "react-native";
import {
  Bell,
  Globe,
  Database,
  Mail,
  Star,
  Shield,
  ChevronRight,
  Crown,
  Sparkles,
  Lock,
} from "lucide-react-native";
import { SafeAreaView } from "react-native-safe-area-context";
import { FONTS, SIZES } from "../constants/theme";
import {
  useTheme,
  ThemeColors,
  ThemeBackgrounds,
} from "../context/ThemeContext";
import { useMood } from "../context/MoodContext";
import { useGoogleAuth } from "../hooks/useGoogleAuth";
import { backupToDrive, restoreFromDrive } from "../lib/googleDriveService";
import { manualSyncAll } from "../lib/storage";
const { width } = Dimensions.get("window");

// Removed static THEME_PREVIEWS as they are now fetched from Supabase via ThemeContext

interface SettingItemProps {
  icon: any;
  label: string;
  value?: string;
  onPress?: () => void;
  showChevron?: boolean;
  showSwitch?: boolean;
  switchValue?: boolean;
  onSwitchChange?: (val: boolean) => void;
  primaryColor: string;
  colors: any;
}

function SettingItem({
  icon,
  label,
  value,
  onPress,
  showChevron = true,
  showSwitch,
  switchValue,
  onSwitchChange,
  primaryColor,
  colors,
}: SettingItemProps) {
  return (
    <TouchableOpacity
      style={settingStyles.item}
      onPress={onPress}
      activeOpacity={0.7}
    >
      <View style={settingStyles.itemLeft}>
        <View
          style={[
            settingStyles.iconCircle,
            { backgroundColor: `${primaryColor}1A` },
          ]}
        >
          {React.createElement(icon as any, { size: 20, color: primaryColor })}
        </View>
        <Text style={[settingStyles.itemLabel, { color: colors.text.dark }]}>
          {label}
        </Text>
      </View>
      <View style={settingStyles.itemRight}>
        {value && <Text style={settingStyles.itemValue}>{value}</Text>}
        {showSwitch ? (
          <Switch
            value={switchValue}
            onValueChange={onSwitchChange}
            trackColor={{ false: "#d1d5db", true: `${primaryColor}80` }}
            thumbColor={switchValue ? primaryColor : "#f4f3f4"}
          />
        ) : showChevron ? (
          React.createElement(ChevronRight as any, {
            size: 18,
            color: "#94a3b8",
          })
        ) : null}
      </View>
    </TouchableOpacity>
  );
}

export default function SettingScreen({ navigation }: any) {
  const { colors, backgrounds, availableThemes, changeTheme, selectedThemeId } =
    useTheme();
  const { t, language, setLanguage } = useMood();
  const [notifications, setNotifications] = useState(true);
  // Google Drive Sync
  const { userInfo, accessToken, promptAsync, logout } = useGoogleAuth();
  const [syncLoading, setSyncLoading] = useState(false);
  const [showSyncModal, setShowSyncModal] = useState(false);

  const toggleLanguage = () => {
    const nextLang = language === "vi" ? "en" : "vi";
    setLanguage(nextLang);
  };

  const handleBackup = async () => {
    if (!accessToken) return Alert.alert("Lỗi", "Vui lòng đăng nhập trước");
    try {
      setSyncLoading(true);
      // Gọi hàm đồng bộ dữ liệu thật (Journeys + Journals)
      await manualSyncAll(accessToken);
      Alert.alert("Thành công", "Đã sao lưu toàn bộ dữ liệu lên Google Drive!");
    } catch (e: any) {
      Alert.alert("Lỗi sao lưu", e.message || "Đã có lỗi xảy ra");
    } finally {
      setSyncLoading(false);
      setShowSyncModal(false);
    }
  };

  const handleRestore = async () => {
    if (!accessToken) return Alert.alert("Lỗi", "Vui lòng đăng nhập trước");
    try {
      setSyncLoading(true);
      const data = await restoreFromDrive(accessToken);
      // Removed logging
      Alert.alert("Thành công", "Đã phục hồi dữ liệu từ Google Drive!");
    } catch (e: any) {
      Alert.alert("Lỗi", "Không lấy được dữ liệu backup cũ. " + e.message);
    } finally {
      setSyncLoading(false);
      setShowSyncModal(false);
    }
  };

  const handleThemeChange = (themeId: string) => {
    changeTheme(themeId);
  };

  return (
    <ImageBackground
      source={backgrounds.home}
      style={[styles.container, { backgroundColor: colors.background.main }]}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView
          showsVerticalScrollIndicator={false}
          contentContainerStyle={styles.scrollContent}
        >
          {/* Profile Section */}
          <View style={styles.profileSection}>
            <Image
              source={
                userInfo?.picture
                  ? { uri: userInfo.picture }
                  : {
                    uri: "https://ui-avatars.com/api/?name=Guest&background=random",
                  }
              }
              style={[styles.avatar, { borderColor: colors.primary }]}
            />
            <View style={styles.profileInfo}>
              <Text style={[styles.profileName, { color: colors.text.dark }]}>
                {userInfo
                  ? userInfo.name
                  : language === "vi"
                    ? "Khách"
                    : "Guest"}
              </Text>
              {userInfo ? (
                <Text
                  style={{
                    color: colors.text.muted,
                    fontSize: 14,
                    marginTop: -2,
                  }}
                >
                  {userInfo.email}
                </Text>
              ) : (
                <TouchableOpacity
                  onPress={() => promptAsync()}
                  style={[
                    styles.loginBadge,
                    { backgroundColor: `${colors.primary}` },
                  ]}
                >
                  <Text style={styles.loginBadgeText}>{t("login_google")}</Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Premium Banner */}
          <View
            style={[
              styles.premiumBanner,
              {
                backgroundColor: `${colors.primary}1F`,
                borderColor: `${colors.primary}33`,
              },
            ]}
          >
            <View style={styles.premiumIconRow}>
              {React.createElement(Sparkles as any, {
                size: 20,
                color: "#d4a017",
              })}
              <Text style={[styles.premiumTitle, { color: colors.text.dark }]}>
                Unlock the Wildflower Tier
              </Text>
            </View>
            <Text style={[styles.premiumDesc, { color: colors.text.dark }]}>
              Get unlimited journal entries, advanced emotional analytics, and
              exclusive meadow themes.
            </Text>
            <TouchableOpacity
              style={[
                styles.premiumButton,
                { backgroundColor: colors.primary },
              ]}
            >
              <Text
                style={[
                  styles.premiumButtonText,
                  { color: colors.text.textOnDark },
                ]}
              >
                Start your free trial
              </Text>
            </TouchableOpacity>
          </View>

          {/* Change Theme */}
          <View
            style={[
              styles.card,
              {
                backgroundColor: colors.backgroundCard,
                borderColor: colors.border,
              },
            ]}
          >
            <View
              style={{
                flexDirection: "row",
                justifyContent: "space-between",
                alignItems: "center",
                marginBottom: 14,
              }}
            >
              <Text
                style={[
                  styles.cardTitle,
                  { color: colors.text.dark, marginBottom: 0 },
                ]}
              >
                {t("theme")}
              </Text>
              <TouchableOpacity
                onPress={() => navigation.navigate("ThemeList")}
              >
                <Text
                  style={{ fontFamily: FONTS.bold, color: colors.text.dark }}
                >
                  {t("view_all")}
                </Text>
              </TouchableOpacity>
            </View>
            <ScrollView
              horizontal
              showsHorizontalScrollIndicator={false}
              style={styles.themeScroll}
            >
              {availableThemes.map((theme) => {
                const primaryColor = theme.fullTheme.colors.primary;
                const cardColor = theme.fullTheme.colors.backgroundCard;
                const textColor = theme.fullTheme.colors.text.dark;

                return (
                  <TouchableOpacity
                    key={theme.id}
                    style={[
                      styles.themeCard,
                      { backgroundColor: "#fff" },
                      selectedThemeId === theme.id && {
                        borderColor: colors.primary,
                      },
                    ]}
                    onPress={() => handleThemeChange(theme.id)}
                  >
                    <View
                      style={[
                        styles.themeTopBar,
                        { backgroundColor: primaryColor },
                      ]}
                    />
                    <View style={styles.themeContent}>
                      <View
                        style={[
                          styles.themeLine,
                          { backgroundColor: primaryColor, width: "60%" },
                        ]}
                      />
                      <View
                        style={[
                          styles.themeLine,
                          {
                            backgroundColor: textColor,
                            width: "80%",
                            opacity: 0.3,
                          },
                        ]}
                      />
                      <View
                        style={[
                          styles.themeLine,
                          {
                            backgroundColor: primaryColor,
                            width: "40%",
                            opacity: 0.4,
                          },
                        ]}
                      />
                    </View>
                    <Text
                      style={[styles.themeName, { color: primaryColor }]}
                      numberOfLines={1}
                    >
                      {theme.name}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </ScrollView>
          </View>

          {/* Settings List */}
          <View
            style={[
              styles.settingsCard,
              {
                backgroundColor: colors.backgroundCard,
                borderColor: colors.border,
              },
            ]}
          >
            <SettingItem
              icon={Bell}
              colors={colors}
              label={t("notifications")}
              showChevron={false}
              showSwitch
              switchValue={notifications}
              onSwitchChange={setNotifications}
              primaryColor={colors.primary}
            />
            <SettingItem
              icon={Globe}
              colors={colors}
              label={t("language")}
              value={language === "vi" ? "Tiếng Việt" : "English"}
              primaryColor={colors.primary}
              onPress={toggleLanguage}
            />
            <SettingItem
              icon={Database}
              colors={colors}
              label={t("data_sync")}
              primaryColor={colors.primary}
              onPress={() => setShowSyncModal(true)}
            />
            <SettingItem
              icon={Lock}
              colors={colors}
              label={t("lock_app")}
              primaryColor={colors.primary}
            />
          </View>

          <View
            style={[
              styles.settingsCard,
              {
                backgroundColor: colors.backgroundCard,
                borderColor: colors.border,
              },
            ]}
          >
            <SettingItem
              icon={Mail}
              colors={colors}
              label={t("feedback")}
              primaryColor={colors.primary}
            />
            <SettingItem
              icon={Star}
              colors={colors}
              label={t("rate_app")}
              primaryColor={colors.primary}
            />
            <SettingItem
              icon={Shield}
              colors={colors}
              label={t("privacy")}
              primaryColor={colors.primary}
            />
          </View>

          <View style={{ height: 120 }} />
        </ScrollView>
      </SafeAreaView>

      {/* Modal Đồng Bộ Google Drive */}
      <Modal visible={showSyncModal} transparent animationType="fade">
        <View style={syncStyles.modalOverlay}>
          <View
            style={[
              syncStyles.modalContent,
              { backgroundColor: colors.background.white },
            ]}
          >
            <Text style={[syncStyles.modalTitle, { color: colors.primary }]}>
              Đồng Bộ Google Drive
            </Text>

            {!userInfo ? (
              <TouchableOpacity
                style={[syncStyles.actionBtn, { backgroundColor: "#4285F4" }]}
                onPress={() => promptAsync()}
              >
                <Text style={syncStyles.btnText}>Đăng nhập với Google</Text>
              </TouchableOpacity>
            ) : (
              <View style={syncStyles.userInfoContainer}>
                {userInfo.picture && (
                  <Image
                    source={{ uri: userInfo.picture }}
                    style={syncStyles.userAvatar}
                  />
                )}
                <Text style={{ color: colors.text.dark, marginBottom: 16 }}>
                  {userInfo.email}
                </Text>

                <TouchableOpacity
                  style={[
                    syncStyles.actionBtn,
                    { backgroundColor: colors.primary, marginBottom: 8 },
                  ]}
                  onPress={handleBackup}
                  disabled={syncLoading}
                >
                  {syncLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={syncStyles.btnText}>Sao lưu lên Drive</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity
                  style={[
                    syncStyles.actionBtn,
                    { backgroundColor: colors.text.muted },
                  ]}
                  onPress={handleRestore}
                  disabled={syncLoading}
                >
                  {syncLoading ? (
                    <ActivityIndicator color="#fff" />
                  ) : (
                    <Text style={syncStyles.btnText}>Phục hồi từ Drive</Text>
                  )}
                </TouchableOpacity>

                <TouchableOpacity style={{ marginTop: 16 }} onPress={logout}>
                  <Text
                    style={{
                      color: colors.error,
                      textDecorationLine: "underline",
                    }}
                  >
                    Đăng xuất
                  </Text>
                </TouchableOpacity>
              </View>
            )}

            <TouchableOpacity
              style={syncStyles.closeBtn}
              onPress={() => setShowSyncModal(false)}
            >
              <Text style={{ color: colors.primary, marginTop: 12 }}>Đóng</Text>
            </TouchableOpacity>
          </View>
        </View>
      </Modal>
    </ImageBackground>
  );
}

const syncStyles = StyleSheet.create({
  modalOverlay: {
    flex: 1,
    backgroundColor: "rgba(0,0,0,0.5)",
    justifyContent: "center",
    alignItems: "center",
  },
  modalContent: {
    width: "85%",
    borderRadius: 16,
    padding: 24,
    alignItems: "center",
  },
  modalTitle: { fontFamily: FONTS.bold, fontSize: 18, marginBottom: 20 },
  actionBtn: {
    width: "100%",
    paddingVertical: 14,
    borderRadius: 12,
    alignItems: "center",
  },
  btnText: { color: "#fff", fontFamily: FONTS.bold, fontSize: 15 },
  userInfoContainer: { width: "100%", alignItems: "center" },
  userAvatar: { width: 50, height: 50, borderRadius: 25, marginBottom: 8 },
  closeBtn: { padding: 10, marginTop: 10 },
});

const settingStyles = StyleSheet.create({
  item: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    paddingVertical: 14,
    borderBottomWidth: 1,
    borderBottomColor: "rgba(0,0,0,0.05)",
  },
  itemLeft: {
    flexDirection: "row",
    alignItems: "center",
    gap: 14,
  },
  iconCircle: {
    width: 36,
    height: 36,
    borderRadius: 18,
    justifyContent: "center",
    alignItems: "center",
  },
  itemLabel: {
    fontFamily: FONTS.regular,
    fontSize: 16,
  },
  itemRight: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
  },
  itemValue: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: "#94a3b8",
  },
});

const styles = StyleSheet.create({
  container: { flex: 1 },
  safeArea: { flex: 1 },
  scrollContent: {
    paddingHorizontal: SIZES.spacing.xl,
    paddingTop: SIZES.spacing.m,
  },
  profileSection: {
    flexDirection: "row",
    alignItems: "center",
    marginBottom: 24,
  },
  avatar: {
    width: 64,
    height: 64,
    borderRadius: 32,
    borderWidth: 3,
  },
  profileInfo: { marginLeft: 16 },
  profileName: {
    fontFamily: FONTS.bold,
    fontSize: 22,
    marginBottom: 4,
  },
  proBadge: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#fff7e0",
    paddingHorizontal: 10,
    paddingVertical: 3,
    borderRadius: 12,
    gap: 4,
    alignSelf: "flex-start",
  },
  proBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: "#d4a017",
    letterSpacing: 1,
  },
  loginBadge: {
    paddingHorizontal: 12,
    paddingVertical: 5,
    borderRadius: 14,
    alignSelf: "flex-start",
    marginTop: 4,
  },
  loginBadgeText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: "#fff",
  },
  premiumBanner: {
    borderRadius: SIZES.radius.xxl,
    padding: 20,
    marginBottom: 28,
    borderWidth: 1,
  },
  premiumIconRow: {
    flexDirection: "row",
    alignItems: "center",
    gap: 8,
    marginBottom: 8,
  },
  premiumTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
  },
  premiumDesc: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    opacity: 0.7,
    lineHeight: 20,
    marginBottom: 16,
  },
  premiumButton: {
    paddingVertical: 12,
    borderRadius: 24,
    alignItems: "center",
  },
  premiumButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: "#FFF",
  },
  card: {
    borderRadius: SIZES.radius.xxl,
    padding: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
  cardTitle: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    marginBottom: 14,
  },
  themeScroll: { marginHorizontal: -4 },
  themeCard: {
    width: 80,
    height: 110,
    borderRadius: 16,
    marginHorizontal: 6,
    overflow: "hidden",
    borderWidth: 2,
    borderColor: "transparent",
  },
  themeTopBar: { height: 24 },
  themeContent: {
    flex: 1,
    padding: 8,
    gap: 6,
    justifyContent: "center",
  },
  themeLine: { height: 6, borderRadius: 3 },
  themeName: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    textAlign: "center",
    paddingBottom: 6,
  },
  settingsCard: {
    borderRadius: SIZES.radius.xxl,
    paddingHorizontal: 16,
    marginBottom: 16,
    borderWidth: 1,
  },
});
