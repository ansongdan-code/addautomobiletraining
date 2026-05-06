import React, { useEffect } from 'react';
import { View, Text, FlatList, StyleSheet, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchUsers } from '../../store/slices/adminSlice';
import { RootState, AppDispatch } from '../../store';
import { COLORS } from '../../constants/colors';

const UsersScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { users, pagination, isLoading, error } = useSelector((state: RootState) => state.admin);

  useEffect(() => {
    dispatch(fetchUsers({ page: 1, limit: 20 }));
  }, [dispatch]);

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Users Management</Text>
      {isLoading && <ActivityIndicator size="large" color={COLORS.primary} />}
      {error && <Text style={styles.error}>{error}</Text>}
      <FlatList
        data={users}
        keyExtractor={(item) => item._id}
        renderItem={({ item }) => (
          <View style={styles.userItem}>
            <Text style={styles.userName}>{item.name}</Text>
            <Text style={styles.userEmail}>{item.email}</Text>
            <View style={styles.badgeContainer}>
              <View style={[styles.badge, { backgroundColor: item.role === 'admin' ? COLORS.primary : COLORS.secondary }]}>
                <Text style={styles.badgeText}>{item.role}</Text>
              </View>
              <View style={[styles.badge, { backgroundColor: item.isActive ? COLORS.success : COLORS.error }]}>
                <Text style={styles.badgeText}>{item.isActive ? 'Active' : 'Disabled'}</Text>
              </View>
            </View>
          </View>
        )}
        showsVerticalScrollIndicator={false}
      />
      {pagination && <Text style={styles.pagination}>Page {pagination.page} of {pagination.pages}</Text>}
    </View>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: COLORS.background },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: COLORS.text },
  userItem: {
    padding: 15,
    backgroundColor: COLORS.white,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    marginBottom: 12,
    elevation: 1,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  userName: { fontSize: 16, fontWeight: 'bold', color: COLORS.text },
  userEmail: { fontSize: 14, color: COLORS.textLight, marginBottom: 8 },
  badgeContainer: { flexDirection: 'row' },
  badge: {
    paddingHorizontal: 8,
    paddingVertical: 2,
    borderRadius: 4,
    marginRight: 8,
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 12,
    fontWeight: 'bold',
    textTransform: 'capitalize',
  },
  pagination: { marginTop: 15, textAlign: 'center', color: COLORS.textLight },
  error: { color: COLORS.error, marginBottom: 10, textAlign: 'center' },
});

export default UsersScreen;