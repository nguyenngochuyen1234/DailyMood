import React from 'react';
import { View, Text, Image, StyleSheet, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import { useTheme } from '../context/ThemeContext';
import { FONTS, SIZES } from '../constants/theme';

const PostCard = ({ item }: { item: any }) => {
  const { colors } = useTheme();
  const navigation = useNavigation<any>();

  return (
    <TouchableOpacity
      activeOpacity={0.8}
      style={[
        styles.postCard, 
        { 
          backgroundColor: colors.backgroundCard, 
          borderColor: colors.border,
          shadowColor: colors.border,
        }
      ]}
      onPress={() => navigation.navigate("EditEntry", { journalId: item.id })}
    >
      <View style={styles.postHeader}>
        <View style={styles.moodBadge}>
          <Text style={[styles.userName, { color: colors.text.dark }]}>{item.time || item.date}</Text>
          <Image
            source={item.moodIcon || require('../assets/icon/icon4.png')}
            style={{ width: 40, height: 40 }}
          />
        </View>
      </View>

      {item.image && (
        <TouchableOpacity
          activeOpacity={0.9}
          onPress={(event) => {
            event.stopPropagation();
            navigation.navigate("ImageViewer", {
              images: [item.image],
              initialIndex: 0,
            });
          }}
        >
          <Image source={{ uri: item.image }} style={styles.postImage} />
        </TouchableOpacity>
      )}

      {item.text && (
        <Text style={[styles.postText, { color: colors.text.dark }]}>{item.text}</Text>
      )}
    </TouchableOpacity>
  );
};

const styles = StyleSheet.create({
  postCard: {
    borderRadius: SIZES.radius.xxl,
    padding: SIZES.spacing.xl,
    marginBottom: SIZES.spacing.xl,
    borderWidth: 1,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 10,
    elevation: 3,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacing.m,
  },
  userName: {
    fontFamily: FONTS.bold,
    fontSize: 16,
  },
  moodBadge: {
    flexDirection: 'row',
    alignItems: 'center',
    gap: 10,
    justifyContent: 'space-between',
    width: '100%',
  },
  postImage: {
    width: '100%',
    height: 200,
    borderRadius: SIZES.radius.xl,
    marginBottom: SIZES.spacing.m,
  },
  postText: {
    fontFamily: FONTS.regular,
    fontSize: 16,
    lineHeight: 24,
    marginBottom: SIZES.spacing.m,
  },
});

export default PostCard;
