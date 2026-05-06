import React from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { COLORS } from '../../constants/colors';

const WebsiteEditorScreen = () => {
  return (
    <View style={styles.container}>
      <Text style={styles.title}>Website Editor</Text>
      <Text style={styles.text}>Configure your website layout and theme.</Text>
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

export default WebsiteEditorScreen;