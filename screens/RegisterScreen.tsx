import React, { useState } from 'react';
import { 
  View, Text, StyleSheet, TextInput, 
  TouchableOpacity, ImageBackground, Image, ScrollView,
  Dimensions
} from 'react-native';
import { Mail, Lock, User, ArrowRight, Circle } from 'lucide-react-native';
import { COLORS } from '../constants/colors';
import { FONTS, SIZES } from '../constants/theme';
import { BACKGROUNDS } from '../constants/images';
import { SafeAreaView } from 'react-native-safe-area-context';

const { width } = Dimensions.get('window');

export default function RegisterScreen({ navigation, onRegister }: { navigation: any, onRegister: () => void }) {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [agreed, setAgreed] = useState(false);

  return (
    <ImageBackground 
      source={BACKGROUNDS.auth} 
      style={styles.container}
    >
      <SafeAreaView style={styles.safeArea}>
        <ScrollView contentContainerStyle={styles.scrollContent} showsVerticalScrollIndicator={false}>
          <View style={styles.header}>
            <Text style={styles.title}>Bắt đầu hành trình</Text>
            <Text style={styles.subtitle}>Ghi lại những khoảnh khắc bình yên giữa đồng nội xanh mướt.</Text>
          </View>

          <View style={styles.form}>
            <Text style={styles.label}>Họ và tên</Text>
            <View style={styles.inputContainer}>
              {React.createElement(User as any, { size: 20, color: COLORS.text.muted, style: styles.inputIcon })}
              <TextInput
                style={styles.input}
                placeholder="Nguyễn Văn A"
                value={name}
                onChangeText={setName}
              />
            </View>

            <Text style={[styles.label, { marginTop: SIZES.spacing.l }]}>Email</Text>
            <View style={styles.inputContainer}>
              {React.createElement(Mail as any, { size: 20, color: COLORS.text.muted, style: styles.inputIcon })}
              <TextInput
                style={styles.input}
                placeholder="email@example.com"
                value={email}
                onChangeText={setEmail}
                keyboardType="email-address"
                autoCapitalize="none"
              />
            </View>

            <Text style={[styles.label, { marginTop: SIZES.spacing.l }]}>Mật khẩu</Text>
            <View style={styles.inputContainer}>
              {React.createElement(Lock as any, { size: 20, color: COLORS.text.muted, style: styles.inputIcon })}
              <TextInput
                style={styles.input}
                placeholder="********"
                value={password}
                onChangeText={setPassword}
                secureTextEntry={true}
              />
            </View>

            <TouchableOpacity 
              style={styles.checkboxContainer}
              onPress={() => setAgreed(!agreed)}
            >
               <View style={[styles.checkbox, agreed && styles.checkboxActive]}>
                  {agreed && <View style={styles.checkboxInner} />}
               </View>
               <Text style={styles.checkboxText}>
                  Tôi đồng ý với <Text style={styles.linkText}>Điều khoản dịch vụ</Text> và <Text style={styles.linkText}>Chính sách bảo mật</Text>.
               </Text>
            </TouchableOpacity>

            <TouchableOpacity style={styles.registerButton} onPress={onRegister}>
              <Text style={styles.registerButtonText}>Tạo tài khoản</Text>
              {React.createElement(ArrowRight as any, { size: 20, color: COLORS.text.white, style: { marginLeft: 10 } })}
            </TouchableOpacity>

            <View style={styles.dividerContainer}>
               <View style={styles.divider} />
               <Text style={styles.dividerText}>HOẶC ĐĂNG KÝ BẰNG</Text>
               <View style={styles.divider} />
            </View>

            <View style={styles.socialButtons}>
               <TouchableOpacity style={styles.socialButton}>
                  <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/2991/2991148.png' }} style={styles.socialIcon} />
                  <Text style={styles.socialText}>Google</Text>
               </TouchableOpacity>
               <TouchableOpacity style={styles.socialButton}>
                  <Image source={{ uri: 'https://cdn-icons-png.flaticon.com/512/124/124010.png' }} style={styles.socialIcon} />
                  <Text style={styles.socialText}>Facebook</Text>
               </TouchableOpacity>
            </View>

            <TouchableOpacity 
              style={styles.loginLink}
              onPress={() => navigation.navigate('Login')}
            >
               <Text style={styles.loginText}>
                  Đã có tài khoản? <Text style={styles.loginTextBtn}>Đăng nhập ngay</Text>
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
  inputContainer: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#fffbe6',
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
  checkboxContainer: {
    flexDirection: 'row',
    marginTop: 30,
    paddingRight: SIZES.spacing.xl,
  },
  checkbox: {
    width: 20,
    height: 20,
    borderRadius: 10,
    borderWidth: 2,
    borderColor: COLORS.primary,
    marginRight: 12,
    marginTop: 2,
    justifyContent: 'center',
    alignItems: 'center',
  },
  checkboxActive: {
    backgroundColor: COLORS.background.white,
  },
  checkboxInner: {
    width: 10,
    height: 10,
    borderRadius: 5,
    backgroundColor: COLORS.primary,
  },
  checkboxText: {
    fontFamily: FONTS.regular,
    fontSize: 13,
    color: COLORS.text.dark,
    opacity: 0.7,
    lineHeight: 18,
  },
  linkText: {
    fontFamily: FONTS.bold,
    textDecorationLine: 'underline',
  },
  registerButton: {
    backgroundColor: '#506F3F',
    height: 56,
    borderRadius: 28,
    flexDirection: 'row',
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 40,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  registerButtonText: {
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
  loginLink: {
    marginTop: 30,
    alignItems: 'center',
  },
  loginText: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.text.dark,
    opacity: 0.7,
  },
  loginTextBtn: {
    fontFamily: FONTS.bold,
    color: COLORS.primary,
  }
});
