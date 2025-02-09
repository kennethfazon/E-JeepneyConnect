import React, { useEffect, useState } from 'react';

import axios from 'axios';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, ScrollView, TouchableOpacity, Alert } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../../services/api';


const COLORS = {
  primary: '#4e73df',
  secondary: '#1cc88a',
  accent: '#f6c23e',
  background: '#f8f9fc',
  white: '#ffffff',
  text: '#5a5c69',
  lightGray: '#e3e6f0',
  softWhite: '#fdfdfe',
  danger: '#e74a3b',
};
const Home = ({ navigation }) => {
  const [fullName, setFullName] = useState(''); // State to hold the full name
  const [showLogout, setShowLogout] = useState(false);
  // Function to fetch the logged-in user's full name

  const currentDate = new Date();
  const fetchUserName = async () => {
    const token = await AsyncStorage.getItem('userToken'); // Retrieve token

    if (!token) {
      Alert.alert('No token found. Please login.');
      return;
    }

    try {
      const response = await api.get('/dashboard', {
        headers: { 'x-access-token': token }, // Pass the token in the request
      });
      
      // Set the full name based on the response data
      setFullName(response.data.fullName || ""); 
    } catch (err) {
      Alert.alert('Error fetching user data: ' + err.message);
    }
  };

  
  const handleProfileClick = () => {
    setShowLogout(!showLogout);
  };

  const formattedDate = currentDate.toLocaleDateString('en-PH', {
    weekday: 'long',
    year: 'numeric',
    month: 'long',
    day: 'numeric',
  });
  
  const statsData = [
    { label: 'Total Revenue', value: '₱ 45,670', icon: 'cash', trend: '+12.5%', gradient: [COLORS.primary, COLORS.secondary] },
    { label: 'Total Passenger', value: '42', icon: 'person', trend: '+5', gradient: [COLORS.accent, COLORS.secondary] },
  ];

  const detailsData = [
    { label: 'Routes Completed', value: '18', icon: 'navigate' },
    { label: 'Total Passengers', value: '326', icon: 'people' },
    { label: 'Avg. Income per Trip', value: '₱ 1,087', icon: 'wallet' },
  ];


  const getTerminalType = async () => {
    const token = await AsyncStorage.getItem('userToken');
  
    if (!token) {
      Alert.alert('No token found. Please login.');
      return;
    }
  
    try {
      const response = await api.get('/terminal-type', {
        headers: { 'x-access-token': token }
      });
      const terminalType = response.data.terminal_type;
      if (terminalType === 'Pamana') {
        navigation.navigate('Pamana');
      } else if (terminalType === 'Sitex') {
        navigation.navigate('Sitex');
      } else {
        Alert.alert('Unknown terminal type');
      }
    } catch (err) {
      Alert.alert('Error fetching terminal type: ' + err.message);
    }
  };

  const logout = async () => {
    const token = await AsyncStorage.getItem('userToken');
    
    if (!token) {
      alert('No token found, you are already logged out.');
      return;
    }

    api.post('/logout', {}, { headers: { 'x-access-token': token } })
      .then(async () => {
        await AsyncStorage.removeItem('userToken');
        navigation.navigate('Welcome');  
      })
      .catch(err => alert('Logout error: ' + err.message));
  };

  // Fetch the username when the component mounts
  useEffect(() => {
    fetchUserName(); // Call the function to fetch the user's name
  }, []);

  return (
    <>
       <SafeAreaView style={styles.container}>
        <StatusBar barStyle="light-content" backgroundColor={COLORS.primary} />
        <ScrollView showsVerticalScrollIndicator={false} style={styles.scrollView}>
          {/* Header */}
          <View style={[styles.header, { backgroundColor: COLORS.primary }]}>
            <View>
              <Text style={styles.headerTitle}>Sales Dashboard</Text>
              <Text style={styles.dateText}>{formattedDate}</Text>
            </View>
            <View style={{ flexDirection: 'row', alignItems: 'center' }}>
              <View style={styles.notificationBadge}>
                <Ionicons name="notifications-outline" size={24} color={COLORS.white} />
                <View style={styles.badge}>
                  <Text style={styles.badgeText}>2</Text>
                </View>
              </View>

              {/* Profile Icon and Log Out Toggle */}
              <TouchableOpacity onPress={handleProfileClick} style={{ marginLeft: 16 }}>
                <Ionicons name="person-circle-outline" size={24} color={COLORS.white} />
              </TouchableOpacity>

              {showLogout && (
                <TouchableOpacity
                  onPress={logout}
                  style={{
                    position: 'absolute',
                    top: 30,
                    left: 0,
                    backgroundColor: COLORS.primary,
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                    borderRadius: 4,
                    whiteSpace: 'nowrap',
                    minWidth: 'auto',
                  }}
                >
                  <Text style={{ color: COLORS.white, fontSize: 16, flexWrap: 'nowrap' }}>
                    Log Out
                  </Text>
                </TouchableOpacity>
              )}
            </View>
          </View>

          {/* Plate No. and Driver Section */}
          <View style={styles.plateDriverContainer}>
            <View style={styles.plateDriverContent}>
              <Text style={styles.welcomeText}>Welcome,</Text>
              <Text style={styles.driverName}>{fullName}</Text>
            </View>
           
          </View>

               {/* Stats Cards */}
               <View style={styles.statsContainer}>
            {statsData.map((stat, index) => (
              <View
                key={stat.label}
                style={[
                  styles.statCard,
                  { backgroundColor: stat.gradient[0], marginLeft: index === 0 ? 0 : 10 },
                ]}
              >
                <View style={styles.statHeader}>
                  <Ionicons name={stat.icon} size={28} color={COLORS.white} />
                  <Text style={styles.statLabel}>{stat.label}</Text>
                </View>
                <Text style={styles.statValue}>{stat.value}</Text>
                <Text style={styles.statTrend}>{stat.trend}</Text>
              </View>
            ))}
          </View>
         
        </ScrollView>
      </SafeAreaView>

      
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navButton}>
          <Icon name="home-outline" size={30} color="#007bff" />
        </TouchableOpacity>
        
        <TouchableOpacity
          style={styles.plusButton}
          onPress={getTerminalType} // Trigger the check and navigation here
        >
          <Icon name="add-outline" size={40} color="white" />
        </TouchableOpacity>
        
        <TouchableOpacity style={styles.navButton}>
          <Icon name="settings-outline" size={30} color="#748c94" />
        </TouchableOpacity>
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: COLORS.background,
  },
  mapContainer: {
    height: 300, // Ensure the map has a consistent height
    marginTop: 20,
    marginHorizontal: 15, // Adds margin on left and right for better spacing
    borderRadius: 15, // Rounded corners for the map container
    overflow: 'hidden', // Ensures rounded corners work well with Mapbox
    shadowColor: '#000', // Adds shadow effect
    shadowOffset: { width: 0, height: 4 }, // Shadow direction
    shadowOpacity: 0.1, // Light shadow
    shadowRadius: 10, // Softens the shadow's edges
    elevation: 5, // For Android devices, adds elevation to create a shadow effect
  },
  mapView: {
    flex: 1, // Make sure the map takes up the full space of the container
  },
  loadingText: {
    textAlign: 'center',
    color: '#333',
    fontSize: 16,
    padding: 20,
  },
  scrollView: {
    flex: 1,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 10,
    paddingBottom: 20,
    borderBottomLeftRadius: 25,
    borderBottomRightRadius: 25,
  },
  headerTitle: {
    color: COLORS.white,
    fontSize: 28,
    fontWeight: '700',
    marginBottom: 5,
  },
  dateText: {
    color: 'rgba(255,255,255,0.8)',
    fontSize: 16,
  },
  notificationBadge: {
    position: 'relative',
  },
  badge: {
    position: 'absolute',
    top: -8,
    right: -8,
    backgroundColor: COLORS.danger,
    borderRadius: 10,
    width: 20,
    height: 20,
    justifyContent: 'center',
    alignItems: 'center',
  },
  badgeText: {
    color: COLORS.white,
    fontSize: 10,
    fontWeight: 'bold',
  },
  plateDriverContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    marginHorizontal: 20,
    marginTop: 20,
    padding: 15,
    backgroundColor: COLORS.white,
    borderRadius: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  plateDriverContent: {
    flexDirection: 'column',
  },
  welcomeText: {
    color: COLORS.primary,
    fontSize: 16,
    fontWeight: '500',
  },
  driverName: {
    color: COLORS.text,
    fontSize: 22,
    fontWeight: '700',
    marginTop: 5,
  },
  plateNumberContainer: {
    alignItems: 'flex-end',
  },
  plateNumberLabel: {
    color: COLORS.text,
    fontSize: 12,
    marginBottom: 2,
  },
  plateNumberValue: {
    color: COLORS.primary,
    fontSize: 20,
    fontWeight: '700',
  },
  statsContainer: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginHorizontal: 20,
    marginTop: 20,
  },
  statCard: {
    flex: 1,
    padding: 15,
    borderRadius: 20,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.15,
    shadowRadius: 10,
    elevation: 6,
  },
  statHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 10,
  },
  statLabel: {
    marginLeft: 10,
    color: COLORS.white,
    fontSize: 14,
    fontWeight: '600',
  },
  statValue: {
    fontSize: 28,
    fontWeight: 'bold',
    color: COLORS.white,
    marginTop: 5,
  },
  statTrend: {
    marginTop: 5,
    color: COLORS.white,
    fontSize: 14,
  },
  detailContainer: {
    backgroundColor: COLORS.white,
    marginHorizontal: 20,
    marginTop: 20,
    borderRadius: 15,
    padding: 15,
    shadowColor: COLORS.primary,
    shadowOffset: { width: 0, height: 4 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 5,
  },
  detailTitle: {
    fontSize: 20,
    fontWeight: 'bold',
    color: COLORS.text,
    marginBottom: 10,
  },
  detailRow: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 10,
  },
  detailRowBorder: {
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  detailRowContent: {
    flexDirection: 'row',
    alignItems: 'center',
  },
  detailLabel: {
    color: COLORS.text,
    fontSize: 16,
    marginLeft: 10,
  },
  detailValue: {
    color: COLORS.text,
    fontSize: 16,
    fontWeight: 'bold',
  },
 
  mapHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: COLORS.lightGray,
  },
  mapTitle: {
    marginLeft: 10,
    fontSize: 18,
    fontWeight: 'bold',
    color: COLORS.text,
  },
  mapPlaceholder: {
    height: 300,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: COLORS.lightGray,
    borderBottomLeftRadius: 15,
    borderBottomRightRadius: 15,
  },
  mapText: {
    color: COLORS.primary,
    fontSize: 16,
    marginTop: 10,
    fontWeight: '600',
  },
    navBar: {
    position: 'absolute',
    bottom: 10,
    left: 40,
    right: 40,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    backgroundColor: '#F5EFFF',
    borderRadius: 20,
    height: 60,
    paddingHorizontal: 25,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
    elevation: 10,
  },
  navButton: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  plusButton: {
    width: 60,
    height: 60,
    borderRadius: 10,
    backgroundColor: '#007bff',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.25,
    shadowRadius: 3.5,
    elevation: 5,
    marginBottom: 20,
    position: 'relative',
    top: -20,
  },
});




export default Home;
