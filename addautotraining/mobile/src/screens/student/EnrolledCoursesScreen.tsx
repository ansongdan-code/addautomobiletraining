import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet, ActivityIndicator } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { fetchEnrolledCourses } from '../../store/slices/courseSlice';
import { RootState, AppDispatch } from '../../store';
import { COLORS } from '../../constants/colors';

const EnrolledCoursesScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const { enrolledCourses, isLoading, error } = useSelector((state: RootState) => state.courses);

  useEffect(() => {
    dispatch(fetchEnrolledCourses());
  }, [dispatch]);

  const renderCourse = ({ item }: { item: any }) => (
    <View style={styles.courseCard}>
      <Text style={styles.courseTitle}>{item.title}</Text>
      <Text style={styles.courseDescription}>{item.description}</Text>
      <View style={styles.progressContainer}>
        <Text style={styles.progressLabel}>Progress:</Text>
        <View style={styles.progressBar}>
          <View
            style={[
              styles.progressFill,
              { width: `${item.progress || 0}%` }
            ]}
          />
        </View>
        <Text style={styles.progressPercent}>{item.progress || 0}%</Text>
      </View>
      <TouchableOpacity style={styles.continueButton}>
        <Text style={styles.continueText}>Continue Learning</Text>
      </TouchableOpacity>
    </View>
  );

  if (isLoading) {
    return (
      <View style={styles.centerContainer}>
        <ActivityIndicator size="large" color={COLORS.primary} />
      </View>
    );
  }

  if (error) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.errorText}>{error}</Text>
      </View>
    );
  }

  if (enrolledCourses.length === 0) {
    return (
      <View style={styles.centerContainer}>
        <Text style={styles.emptyText}>No enrolled courses yet</Text>
        <Text style={styles.emptySubtext}>Enroll in a course to get started</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>My Courses</Text>
      <FlatList
        data={enrolledCourses}
        renderItem={renderCourse}
        keyExtractor={(item) => item._id}
        refreshing={isLoading}
        onRefresh={() => dispatch(fetchEnrolledCourses())}
        showsVerticalScrollIndicator={false}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    padding: 20,
    backgroundColor: COLORS.background,
  },
  centerContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.background,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: COLORS.text,
  },
  courseCard: {
    backgroundColor: COLORS.white,
    padding: 15,
    borderRadius: 8,
    marginBottom: 15,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 3,
    borderWidth: 1,
    borderColor: COLORS.border,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 5,
    color: COLORS.text,
  },
  courseDescription: {
    fontSize: 14,
    color: COLORS.textLight,
    marginBottom: 12,
  },
  progressContainer: {
    marginBottom: 12,
  },
  progressLabel: {
    fontSize: 12,
    color: COLORS.textLight,
    marginBottom: 5,
  },
  progressBar: {
    height: 8,
    backgroundColor: '#e0e0e0',
    borderRadius: 4,
    overflow: 'hidden',
    marginBottom: 5,
  },
  progressFill: {
    height: '100%',
    backgroundColor: COLORS.primary,
    borderRadius: 4,
  },
  progressPercent: {
    fontSize: 12,
    color: COLORS.primary,
    fontWeight: 'bold',
  },
  continueButton: {
    backgroundColor: COLORS.primary,
    paddingVertical: 10,
    borderRadius: 6,
    alignItems: 'center',
  },
  continueText: {
    color: COLORS.white,
    fontWeight: 'bold',
    fontSize: 14,
  },
  errorText: {
    color: COLORS.error,
    fontSize: 16,
    marginBottom: 10,
  },
  emptyText: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.textLight,
    marginBottom: 5,
  },
  emptySubtext: {
    fontSize: 14,
    color: COLORS.gray,
  },
});

export default EnrolledCoursesScreen;