import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { createStackNavigator } from '@react-navigation/stack';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import HomeScreen from '../screens/student/HomeScreen';
import CoursesScreen from '../screens/student/CoursesScreen';
import CourseDetailScreen from '../screens/student/CourseDetailScreen';
import PaymentScreen from '../screens/student/PaymentScreen';
import EnrolledCoursesScreen from '../screens/student/EnrolledCoursesScreen';
import BlogScreen from '../screens/student/BlogScreen';
import ProfileScreen from '../screens/student/ProfileScreen';
import { COLORS } from '../constants/colors';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();
const RootStack = createNativeStackNavigator();

const CoursesStack = () => (
  <Stack.Navigator>
    <Stack.Screen name="CoursesList" component={CoursesScreen} options={{ title: 'Browse Courses' }} />
    <Stack.Screen name="CourseDetail" component={CourseDetailScreen} options={{ title: 'Course Details' }} />
  </Stack.Navigator>
);

const TabNavigator = () => {
  return (
    <Tab.Navigator
      screenOptions={{
        headerShown: false,
        tabBarActiveTintColor: COLORS.primary,
        tabBarInactiveTintColor: COLORS.gray,
      }}
    >
      <Tab.Screen 
        name="Home" 
        component={HomeScreen}
        options={{ title: 'Home' }}
      />
      <Tab.Screen 
        name="MyCourses" 
        component={EnrolledCoursesScreen}
        options={{ title: 'My Courses' }}
      />
      <Tab.Screen 
        name="Courses" 
        component={CoursesStack} 
        options={{ title: 'Browse' }}
      />
      <Tab.Screen 
        name="Blog" 
        component={BlogScreen}
        options={{ title: 'Blog' }}
      />
      <Tab.Screen 
        name="Profile" 
        component={ProfileScreen}
        options={{ title: 'Profile' }}
      />
    </Tab.Navigator>
  );
};

const StudentTabNavigator = () => {
  return (
    <RootStack.Navigator
      screenOptions={{
        headerShown: false,
      }}
    >
      <RootStack.Screen 
        name="TabNavigator" 
        component={TabNavigator}
      />
      <RootStack.Group screenOptions={{ presentation: 'modal' }}>
        <RootStack.Screen 
          name="Payment" 
          component={PaymentScreen}
        />
      </RootStack.Group>
    </RootStack.Navigator>
  );
};

export default StudentTabNavigator;