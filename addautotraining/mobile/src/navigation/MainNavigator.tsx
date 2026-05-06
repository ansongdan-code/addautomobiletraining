import React from 'react';
import { createDrawerNavigator } from '@react-navigation/drawer';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import { useSelector } from 'react-redux';
import { RootState } from '../store';
import StudentTabNavigator from './StudentTabNavigator';
import AdminDrawerNavigator from './AdminDrawerNavigator';

const Drawer = createDrawerNavigator();

const MainNavigator = () => {
  const { user } = useSelector((state: RootState) => state.auth);

  if (user?.role === 'admin' || user?.role === 'super_admin') {
    return <AdminDrawerNavigator />;
  }

  return <StudentTabNavigator />;
};

export default MainNavigator;