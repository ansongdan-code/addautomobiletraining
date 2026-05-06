import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import AdminDashboardScreen from '../screens/admin/AdminDashboardScreen';
import UsersScreen from '../screens/admin/UsersScreen';
import CoursesAdminScreen from '../screens/admin/CoursesAdminScreen';
import AnalyticsScreen from '../screens/admin/AnalyticsScreen';
import BlogAdminScreen from '../screens/admin/BlogAdminScreen';
import WebsiteEditorScreen from '../screens/admin/WebsiteEditorScreen';
import { COLORS } from '../constants/colors';

const Drawer = createDrawerNavigator();

const AdminDrawerNavigator = () => {
  return (
    <Drawer.Navigator
      screenOptions={{
        drawerActiveTintColor: COLORS.primary,
        drawerInactiveTintColor: COLORS.textLight,
        headerTintColor: COLORS.primary,
        headerStyle: {
          backgroundColor: COLORS.background,
        },
      }}
    >
      <Drawer.Screen name="Dashboard" component={AdminDashboardScreen} />
      <Drawer.Screen name="Users" component={UsersScreen} />
      <Drawer.Screen name="Courses" component={CoursesAdminScreen} />
      <Drawer.Screen name="Analytics" component={AnalyticsScreen} />
      <Drawer.Screen name="Blog" component={BlogAdminScreen} />
      <Drawer.Screen name="Website Editor" component={WebsiteEditorScreen} />
    </Drawer.Navigator>
  );
};

export default AdminDrawerNavigator;