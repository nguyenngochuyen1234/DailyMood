import React from 'react';
import { View, Text, Image, TouchableOpacity, StyleSheet } from 'react-native';
import { Heart, MessageCircle, Share2 } from 'lucide-react-native';
import { COLORS } from '../constants/colors';
import { FONTS, SIZES } from '../constants/theme';

const PostCard = ({ item }: { item: any }) => (
  <View style={styles.postCard}>
    <View style={styles.postHeader}>

      <View style={styles.moodBadge}>
        <Text style={styles.userName}>{item.time}</Text>
        <Image
          source={require('../assets/icon/icon4.png')}
          style={{ width: 40, height: 40 }}
        />
      </View>
    </View>

    {item.image && (
      <Image source={{ uri: item.image }} style={styles.postImage} />
    )}

    {item.text && (
      <Text style={styles.postText}>{item.text}</Text>
    )}
  </View>
);

const styles = StyleSheet.create({
  postCard: {
    backgroundColor: COLORS.background.overlay,
    borderRadius: SIZES.radius.xxl,
    padding: SIZES.spacing.xl,
    marginBottom: SIZES.spacing.xl,
    borderWidth: 1,
    borderColor: COLORS.border,
    // elevation: 2,
  },
  postHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginBottom: SIZES.spacing.m,
  },
  userInfo: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  avatar: {
    width: 40,
    height: 40,
    borderRadius: 20,
    marginRight: 10,
  },
  userName: {
    fontFamily: FONTS.bold,
    fontSize: 16,
    color: COLORS.text.dark,
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
    color: COLORS.text.dark,
    lineHeight: 24,
    marginBottom: SIZES.spacing.m,
  },
  postFooter: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginTop: SIZES.spacing.xs,
    borderTopWidth: 1,
    borderTopColor: COLORS.divider,
    paddingTop: SIZES.spacing.m,
  },
  postTime: {
    fontFamily: FONTS.regular,
    fontSize: 14,
    color: COLORS.text.muted,
  },
  postActions: {
    flexDirection: 'row',
    gap: SIZES.spacing.l,
  },
  actionButton: {
    padding: SIZES.spacing.xs,
  },
});

export default PostCard;
