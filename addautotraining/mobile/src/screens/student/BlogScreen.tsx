import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

const BlogScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Blog</Text>
      <Text style={styles.text}>Blog posts will be displayed here.</Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
  },
  text: {
    color: COLORS.textLight,
  }
});

export default BlogScreen;