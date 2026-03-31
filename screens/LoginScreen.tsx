import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, 
  TouchableOpacity, ImageBackground, Image, ScrollView,
  Dimensions
} from 'react-native';
import { Mail, Lock, Eye, EyeOff, ArrowRight } from 'lucide-react-native';
import { COLORS } from '../constants/colors';
import { FONTS, SIZES } from '../constants/theme';
import { BACKGROUNDS } from '../constants/images';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function LoginScreen({ navigation, onLogin }: { navigation: any, onLogin: () => void }) {
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  return (
    <ImageBackground 
      source={BACKGROUNDS.auth} 
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Chào mừng trở lại</Text>
            <Text style={styles.subtitle}>Viết tiếp câu chuyện của bạn trong khu vườn tâm hồn.</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>EMAIL</Text>
            <View style={styles.inputContainer}>
              {React.createElement(Mail as any, { size: 20, color: COLORS.text.muted, style: styles.inputIcon })}
              <TextInput
                style={styles.input}
                placeholder="email@vi-du.vn"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <View style={styles.labelRow}>
               <Text style={styles.label}>MẬT KHẨU</Text>
               <TouchableOpacity>
                 <Text style={styles.forgotPasswordText}>Quên mật khẩu?</Text>
               </TouchableOpacity>
            </View>
            <View style={styles.inputContainer}>
              {React.createElement(Lock as any, { size: 20, color: COLORS.text.muted, style: styles.inputIcon })}
              <TextInput
                style={styles.input}
                placeholder="********"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={!showPassword}
              />
              <TouchableOpacity onPress={() => setShowPassword(!showPassword)}>
                {React.createElement(showPassword ? EyeOff as any : Eye as any, { size: 20, color: COLORS.text.muted })}
              </TouchableOpacity>
            </View>

            <TouchableOpacity style={styles.loginButton} onPress={onLogin}>
              <Text style={styles.loginButtonText}>Đăng nhập</Text>
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
               <View style={styles.divider} />
               <Text style={styles.dividerText}>HOẶC TIẾP TỤC VỚI</Text>
               <View style={styles.divider} />
            </View>

            <View style={styles.socialButtons}>
               <TouchableOpacity style={styles.socialButton}>
                  <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png' }} style={styles.socialIcon} />
                  <Text style={styles.socialText}>Google</Text>
               </TouchableOpacity>
               <TouchableOpacity style={styles.socialButton}>
                  <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/0/747.png' }} style={styles.socialIcon} />
                  <Text style={styles.socialText}>Apple</Text>
               </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.signUpLink}
              onPress={() => navigation.navigate('Register')}
            >
               <Text style={styles.signUpText}>
                  Chưa có tài khoản? <Text style={styles.signUpTextBtn}>Đăng ký ngay</Text>
               </Text>
            </TouchableOpacity>
          </View>
          <View style={{ height: 40 }} />
        </ScrollView>
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
    paddingHorizontal: SIZES.spacing.xxl,
    paddingTop: 60,
  },
  header: {
    marginBottom: 40,
  },
  title: {
    fontFamily: FONTS.bold,
    fontSize: 32,
    color: COLORS.text.dark,
    marginBottom: SIZES.spacing.s,
  },
  subtitle: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.text.dark,
    opacity: 0.7,
    lineHeight: 24,
  },
  form: {
    flex: 1,
  },
  label: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.text.dark,
    marginBottom: SIZES.spacing.s,
    letterSpacing: 1,
  },
  labelRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SIZES.spacing.l,
    marginBottom: SIZES.spacing.s,
  },
  forgotPasswordText: {
    fontFamily: FONTS.bold,
    fontSize: 12,
    color: COLORS.text.muted,
  },
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbe6', // Pale yellowish tint matching images
    borderRadius: SIZES.radius.large,
    paddingHorizontal: SIZES.spacing.m,
    height: 56,
    borderWidth: 1,
    borderColor: 'rgba(255, 255, 255, 0.3)',
  },
  inputIcon: {
    marginRight: SIZES.spacing.s,
  },
  input: {
    flex: 1,
    fontFamily: FONTS.regular,
    fontSize: 16,
    color: COLORS.text.dark,
  },
  loginButton: {
    backgroundColor: '#506F3F',
    height: 56,
    borderRadius: 28,
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  loginButtonText: {
    fontFamily: FONTS.bold,
    fontSize: 18,
    color: COLORS.text.white,
  },
  dividerContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    marginVertical: 40,
  },
  divider: {
    flex: 1,
    height: 1,
    backgroundColor: COLORS.divider,
    opacity: 0.3,
  },
  dividerText: {
    fontFamily: FONTS.bold,
    fontSize: 10,
    color: COLORS.text.muted,
    marginHorizontal: SIZES.spacing.m,
    letterSpacing: 1,
  },
  socialButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    gap: SIZES.spacing.m,
  },
  socialButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    backgroundColor: COLORS.background.white,
    height: 50,
    borderRadius: 25,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  socialIcon: {
    width: 20,
    height: 20,
    marginRight: 10,
  },
  socialText: {
    fontFamily: FONTS.bold,
    fontSize: 14,
    color: COLORS.text.dark,
  },
  signUpLink: {
    marginTop: 30,
    alignItems: 'center',
  },
  signUpText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.text.dark,
    opacity: 0.7,
  },
  signUpTextBtn: {
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  }
});
