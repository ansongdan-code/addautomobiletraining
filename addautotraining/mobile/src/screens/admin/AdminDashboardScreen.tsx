import React, { useEffect } from 'react';
import { View, Text, StyleSheet, ActivityIndicator, ScrollView } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchDashboardStats } from '../../store/slices/adminSlice';
import { RootState, AppDispatch } from '../../store';
import { COLORS } from '../../constants/colors';

const AdminDashboardScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { stats, isLoading, error } = useSelector((state: RootState) => state.admin);

  useEffect(() => {
    dispatch(fetchDashboardStats());
  }, [dispatch]);

  const StatCard = ({ title, value }: { title: string, value: number | string }) => (
    <View style={styles.statCard}>
      <Text style={styles.statTitle}>{title}</Text>
      <Text style={styles.statValue}>{value}</Text>
    </View>
  );

  return (
    <ScrollView style={styles.container}>
      <Text style={styles.title}>Admin Dashboard</Text>
      {isLoading && <ActivityIndicator size="large" color={COLORS.primary} style={{ marginTop: 20 }} />}
      {error && <Text style={styles.error}>{error}</Text>}
      {stats && (
        <View style={styles.statsContainer}>
          <StatCard title="Total Users" value={stats.totalUsers} />
          <StatCard title="Total Courses" value={stats.totalCourses} />
          <StatCard title="Total Videos" value={stats.totalVideos} />
          <StatCard title="Total Blog Posts" value={stats.totalBlogPosts} />
          <StatCard title="Total Enrollments" value={stats.totalEnrollments} />
        </View>
      )}
    </ScrollView>
  );
};

const styles = StyleSheet.create({
  container: { flex: 1, padding: 20, backgroundColor: COLORS.background },
  title: { fontSize: 24, fontWeight: 'bold', marginBottom: 20, color: COLORS.text },
  statsContainer: {
    flexDirection: 'row',
    flexWrap: 'wrap',
    justifyContent: 'space-between'
  },
  statCard: {
    backgroundColor: COLORS.white,
    width: '48%',
    padding: 15,
    borderRadius: 10,
    marginBottom: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  statTitle: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 5,
  },
  statValue: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
  error: { color: COLORS.error, marginTop: 10, textAlign: 'center' },
});

export default AdminDashboardScreen;