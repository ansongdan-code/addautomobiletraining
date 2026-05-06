import React, { useEffect } from 'react';
import { View, Text, FlatList, TouchableOpacity, StyleSheet } from 'react-native';
import { useDispatch, useSelector } from 'react-redux';
import { useNavigation } from '@react-navigation/native';
import { fetchCourses } from '../../store/slices/courseSlice';
import { RootState, AppDispatch } from '../../store';
import { COLORS } from '../../constants/colors';

const CoursesScreen = () => {
  const dispatch = useDispatch<AppDispatch>();
  const navigation = useNavigation();
  const { courses, isLoading } = useSelector((state: RootState) => state.courses);

  useEffect(() => {
    dispatch(fetchCourses());
  }, [dispatch]);

  const renderCourse = ({ item }: { item: any }) => (
    <TouchableOpacity
      style={styles.courseItem}
      onPress={() => (navigation as any).navigate('CourseDetail', { courseId: item._id, courseData: item })}
    >
      <Text style={styles.courseTitle}>{item.title}</Text>
      <Text style={styles.courseDescription}>{item.description}</Text>
      <Text style={styles.coursePrice}>${item.price}</Text>
    </TouchableOpacity>
  );

  if (isLoading) {
    return (
      <View style={styles.container}>
        <Text style={styles.loadingText}>Loading courses...</Text>
      </View>
    );
  }

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Available Courses</Text>
      <FlatList
        data={courses}
        renderItem={renderCourse}
        keyExtractor={(item) => item._id}
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
  title: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: COLORS.text,
  },
  loadingText: {
    color: COLORS.textLight,
    textAlign: 'center',
    marginTop: 20,
  },
  courseItem: {
    padding: 15,
    borderWidth: 1,
    borderColor: COLORS.border,
    borderRadius: 8,
    marginBottom: 15,
    backgroundColor: COLORS.white,
    elevation: 2,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 1 },
    shadowOpacity: 0.1,
    shadowRadius: 2,
  },
  courseTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  courseDescription: {
    fontSize: 14,
    color: COLORS.textLight,
    marginVertical: 5,
  },
  coursePrice: {
    fontSize: 16,
    fontWeight: 'bold',
    color: COLORS.primary,
  },
});

export default CoursesScreen;