import React, { useEffect, useState } from 'react';
import { View, Text, FlatList, StyleSheet, TouchableOpacity, Alert, Animated } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import api from '../../services/api';
import { useFonts, Poppins_400Regular, Poppins_700Bold } from '@expo-google-fonts/poppins';
import Feather from '@expo/vector-icons/Feather';
import AsyncStorage from '@react-native-async-storage/async-storage';


const NearestJeep = ({ route, navigation }) => {
  const { trips } = route.params;
  const [updatedTrips, setUpdatedTrips] = useState([]);
  const [standbyJeeps, setStandbyJeeps] = useState([]);
  const [isStandbyVisible, setStandbyVisible] = useState(false);
  const [showDropdown, setShowDropdown] = useState(false);

  const toggleDropdown = () => {
    setShowDropdown(!showDropdown);
  };
  // Load fonts
  let [fontsLoaded] = useFonts({
    Poppins_400Regular,
    Poppins_700Bold,
  });

  // Sidebar state
  const [isSidebarVisible, setSidebarVisible] = useState(false);
  const sidebarAnimation = useState(new Animated.Value(300))[0];
  const [isHistoryVisible, setHistoryVisible] = useState(false);
  const historyAnimation = useState(new Animated.Value(300))[0];
  const [history, setHistory] = useState([]);
  // Example notifications
  const exampleNotifications = [
    { id: 1, text: 'Jeepney #101 is nearby with 5 seats available.' },
    { id: 2, text: 'Jeepney #202 has departed. Track its location now!' },
    { id: 3, text: 'Jeepney #303 is on standby at Station A.' },
  ];


  

  useEffect(() => {
    const fetchHistory = async () => {
      try {
        // Get the device_id from AsyncStorage
        const deviceId = await AsyncStorage.getItem('device_id');
        
        if (deviceId) {
          // Make an API call to fetch ticket history
          const response = await api.get(`/api/tickets/history?device_id=${deviceId}`);
          
          if (response.status === 200) {
            setHistory(response.data); // Set the ticket history
          } else {
            Alert.alert('Error', 'Failed to fetch ticket history');
          }
        } else {
          Alert.alert('Error', 'No device ID found');
        }
      } catch (error) {
        
      }
    };

    fetchHistory();
  }, []); // Only fetch when the component mounts


  // Sidebar toggle animation
  const toggleSidebar = () => {
    if (isSidebarVisible) {
      Animated.timing(sidebarAnimation, {
        toValue: 300,
        duration: 300,
        useNativeDriver: false,
      }).start(() => setSidebarVisible(false));
    } else {
      setSidebarVisible(true);
      Animated.timing(sidebarAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };



  // Helper function to format the date
  const formatDate = (dateString) => {
    const date = new Date(dateString);
    const options = { weekday: 'long', year: 'numeric', month: 'long', day: 'numeric' };
    return date.toLocaleDateString('en-US', options);
  };

  const formatTime = (dateString) => {
    // If the dateString looks like just a time (e.g., "03:24:21"), prepend the current date
    if (dateString && dateString.match(/^(\d{2}):(\d{2}):(\d{2})$/)) {
      const currentDate = new Date();
      const fullDateString = `${currentDate.getFullYear()}-${(currentDate.getMonth() + 1).toString().padStart(2, '0')}-${currentDate.getDate().toString().padStart(2, '0')}T${dateString}`;
      dateString = fullDateString;
    }
  
    const date = new Date(dateString);
  
    if (isNaN(date)) {
      console.warn('Invalid date string:', dateString);
      return 'Invalid time';
    }
  
    let hours = date.getHours();
    const minutes = date.getMinutes();
    const ampm = hours >= 12 ? 'PM' : 'AM';
  
    // Convert hours from 24-hour to 12-hour format
    hours = hours % 12;
    hours = hours ? hours : 12; // the hour '0' should be '12'
    const minutesFormatted = minutes < 10 ? '0' + minutes : minutes;
  
    return `${hours}:${minutesFormatted} ${ampm}`;
  };
  
  


 
  const toggleHistory = () => {
    if (isHistoryVisible) {
      Animated.timing(historyAnimation, {
        toValue: 300,
        duration: 300,
        useNativeDriver: false,
      }).start(() => setHistoryVisible(false));
    } else {
      setHistoryVisible(true);
      Animated.timing(historyAnimation, {
        toValue: 0,
        duration: 300,
        useNativeDriver: false,
      }).start();
    }
  };

  // Add a function to navigate to TicketHistory screen
const handleHistoryItemPress = (ticketId) => {
  // Navigate to TicketHistory and pass ticketId as a parameter
  navigation.navigate('TicketHistory', { ticketId });
};

  // Fetch available seats for each trip in the trips array
  const fetchTripsWithSeats = async () => {
    try {
      const updatedTripsData = await Promise.all(
        trips.map(async (trip) => {
          const seatsResponse = await api.get(`/api/seats/${trip.jeep_id}`);
          const availableSeats = seatsResponse.data.availableSeatsCount;

          return { 
            ...trip, 
            available_seats: availableSeats,
            template: seatsResponse.data.template, 
          };
        })
      );
      setUpdatedTrips(updatedTripsData);
    } catch (error) {
      Alert.alert('Error', 'Unable to fetch available seats');
    }
  };

  // Function to fetch standby jeeps based on the selected destination
  const fetchStandbyJeeps = async () => {
    try {
      const response = await api.get(`/standby-jeeps?destination=${route.params.selectedDestination}`);
      if (response.status === 200) {
        const updatedJeeps = await Promise.all(
          response.data.map(async (jeep) => {
            const seatsResponse = await api.get(`/api/seats/${jeep.jeep_id}`);
            const availableSeats = Object.values(seatsResponse.data).filter((seat) => seat === 'available').length;
            return { ...jeep, available_seats: availableSeats };
          })
        );
        setStandbyJeeps(updatedJeeps);
        setStandbyVisible(true);
      } else {
        Alert.alert('Error', 'Failed to fetch standby jeeps');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to connect to server');
    }
  };

  const handleLocationPress = async (jeep_id) => {
    try {
      const response = await api.get(`/api/driver_location/${jeep_id}`);
      const { latitude, longitude } = response.data;

      if (latitude && longitude) {
        navigation.navigate('Map', { latitude, longitude });
      } else {
        Alert.alert('Error', 'Location data is missing for this jeep.');
      }
    } catch (error) {
      Alert.alert('Error', 'Unable to fetch the location');
    }
  };

  const handleViewSeatsPress = (jeep_id, template) => {
    if (template === 1) {
      navigation.navigate('Seats', { jeep_id });
    } else if (template === 2) {
      navigation.navigate('SeatsTwo', { jeep_id });
    } else {
      Alert.alert('Error', 'Unknown jeep template.');
    }
  };

  useEffect(() => {
    fetchTripsWithSeats();
  }, [trips]);

  if (isStandbyVisible) {
    return (
      <>
        <View style={styles.header}>
          <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
            <Ionicons name="arrow-back" size={24} color="#000" />
          </TouchableOpacity>

          <Text style={styles.title}>Standby Jeeps</Text>

          
        </View>
        <View style={styles.container}>
          <FlatList
            data={standbyJeeps}
            keyExtractor={(item) => item.jeep_id.toString()}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <Ionicons name="location-outline" size={24} color="#007bff" />
                    <Text style={styles.cardTitle}>Standby</Text>
                  </View>
                  <Text style={styles.cardInfo}>Plate Number: {item.plate_number || 'Unknown'}</Text>
                  <Text style={styles.cardInfo}>Available Seats: {item.available_seats}</Text>
                </View>
                <TouchableOpacity
                  style={styles.detailsButton}
                  onPress={() => handleViewSeatsPress(item.jeep_id, item.template)}
                >
                  <Text style={styles.detailsButtonText}>View Seats</Text>
                </TouchableOpacity>
              </View>
            )}
          />
          <TouchableOpacity style={styles.backButton} onPress={() => setStandbyVisible(false)}>
            <Text style={styles.detailsButtonText}>Back to Trips</Text>
          </TouchableOpacity>
        </View>
      </>
    );
  }

  return (
    <>
      {/* Sidebar */}
      <Animated.View
        style={[
          styles.sidebar,
          { transform: [{ translateX: sidebarAnimation }] },
        ]}
      >
        <View style={styles.sidebarHeader}>
          <Text style={styles.sidebarTitle}>Notifications</Text>
          <TouchableOpacity onPress={toggleSidebar}>
            <Ionicons name="close" size={24} color="black" />
          </TouchableOpacity>
        </View>
        <View style={styles.sidebarContent}>
          {exampleNotifications.map((notification) => (
            <View key={notification.id} style={styles.notificationItem}>
              <Ionicons name="notifications-outline" size={24} color="black" />
              <Text style={styles.notificationText}>{notification.text}</Text>
            </View>
          ))}
        </View>
      </Animated.View>

     
<Animated.View
  style={[styles.sidebar, { transform: [{ translateX: historyAnimation }] }]}
>
  <View style={styles.sidebarHeader}>
    <Text style={styles.sidebarTitle}>History</Text>
    <TouchableOpacity onPress={toggleHistory}>
      <Ionicons name="close" size={24} color="black" />
    </TouchableOpacity>
  </View>
  <View style={styles.sidebarContent}>
    {history.length > 0 ? (
      history.map((ticket) => (
        <TouchableOpacity
          key={ticket.id}
          onPress={() => handleHistoryItemPress(ticket.id)} // Navigate to TicketHistory
          style={styles.notificationItem}
        >
          <Ionicons name="time" size={24} color="black" />
          <View style={styles.notificationTextContainer}>
            {/* Date and Time formatting */}
            <Text style={styles.timeText}>{formatDate(ticket.date)}</Text>
            <Text style={styles.timeText}>{formatTime(ticket.time)}</Text>
            <Text style={styles.detailsText}>
              Jeep#: {ticket.jeep_id} - Ticket#: {ticket.id}
            </Text>
          </View>
        </TouchableOpacity>
      ))
    ) : (
      <Text style={styles.notificationText}>No history available</Text>
    )}
  </View>
</Animated.View>

      {/* Main Content */}
      <View style={styles.header}>
        <TouchableOpacity onPress={() => navigation.goBack()} style={styles.backButton}>
          <Ionicons name="arrow-back" size={24} color="#000" />
        </TouchableOpacity>

        <Text style={styles.title}>Nearest Jeep</Text>
        

        <Ionicons name="notifications" size={24} color="#000" onPress={toggleSidebar} style={styles.notif} />
        <Feather name="more-horizontal" size={24} color="black" onPress={toggleDropdown} />
        {showDropdown && (
        <View style={styles.dropdown} >
          <View style={styles.dropdownItem} >
            <Feather name="clock" size={20} color="black" style={styles.icon}  onPress={toggleHistory}/>
            <Text style={styles.dropdownText} >History</Text>
          </View>
        </View>
      )}
      </View>

      <View style={styles.container}>
        <TouchableOpacity style={styles.standbyButton} onPress={fetchStandbyJeeps}>
          <Text style={styles.standbyButtonText}> View Standby Jeeps</Text>
        </TouchableOpacity>

        {(!updatedTrips || updatedTrips.length === 0) ? (
          <View style={styles.emptyContainer}>
            <Ionicons name="bus-outline" size={80} color="#ccc" />
            <Text style={styles.emptyText}>No trips available</Text>
          </View>
        ) : (
          <FlatList
            data={updatedTrips}
            keyExtractor={(item) => item.trip_id ? item.trip_id.toString() : Math.random().toString()}
            renderItem={({ item }) => (
              <View style={styles.card}>
                <TouchableOpacity
                  style={styles.locationButton}
                  onPress={() => handleLocationPress(item.jeep_id)}
                >
                  <Ionicons name="location-sharp" size={20} color="#fff" />
                </TouchableOpacity>
                <View style={styles.cardContent}>
                  <View style={styles.cardHeader}>
                    <Ionicons name="location-outline" size={24} color="#007bff" />
                    <Text style={styles.cardTitle}>{item.status || 'Unknown Destination'}</Text>
                  </View>
                  <Text style={styles.cardInfo}>Jeep Number: {item.plate_number || 'Unknown Jeep'}</Text>
                  
                  <Text style={styles.cardInfo}>Available Seats: {item.available_seats}</Text>
                </View>
                <TouchableOpacity
                  style={styles.detailsButton}
                  onPress={() => handleViewSeatsPress(item.jeep_id, item.template)}
                >
                  <Text style={styles.detailsButtonText}>View Seats</Text>
                </TouchableOpacity>
              </View>
            )}
          />
        )}
      </View>
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    
    flex: 1,
    padding: 24,
    backgroundColor: '#f4f7fa',
    top:20
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingVertical: 16,
    paddingHorizontal: 24,
    backgroundColor: '#fff',
    elevation: 5,
    marginTop: 25,
  },
  backButton: {
    padding: 8,
  },
  title: {
    fontSize: 22,
    fontWeight: '700',
    color: '#333',
    textAlign: 'center',
    flex: 1,
  },
  notif:{
    right: 7
  },
  standbyButton: {
    backgroundColor: '#007bff',
    borderRadius: 25,
    paddingVertical: 12,
    marginBottom: 24,
    alignItems: 'center',
    shadowColor: '#007bff',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.3,
    shadowRadius: 4,
  },
  standbyButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  sidebar: {
    position: 'absolute',
    top: 0,
    right: 0,
    width: 250,
    height: '100%',
    backgroundColor: '#fff',
    paddingTop: 50,
    paddingHorizontal: 16,
    zIndex: 100,
    shadowOpacity: 0.25,
    shadowRadius: 10,
    elevation: 5,
  },
  sidebarHeader: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
  },
  dropdown: {
    position: "absolute",
    top: 50, // Adjust based on icon position
    right: 20, // Align with the icon
    backgroundColor: "white",
    borderRadius: 5,
    elevation: 5, // Android shadow
    shadowColor: "#000", // iOS shadow
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.2,
    shadowRadius: 2,
    width: 150,
    zIndex: 10, // Keeps it on top
  },
  dropdownItem: {
    flexDirection: "row",
    alignItems: "center",
    padding: 10,
    borderBottomWidth: 1,
    borderBottomColor: "#E0E0E0",
  },
  dropdownText: {
    marginLeft: 10,
    fontSize: 16,
    color: "black",
  },
  sidebarTitle: {
    fontSize: 20,
    color: 'black',
    fontWeight: 'bold',
  },
  sidebarContent: {
    marginTop: 20,
  },
  notificationItem: {
    flexDirection: 'row',
    alignItems: 'center',
    backgroundColor: '#f7f7f7',
    padding: 12,
    borderRadius: 8,
    marginBottom: 12,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
    elevation: 3,
  },
  notificationText: {
    fontSize: 14,
    color: '#333',
    marginLeft: 8,
    flex: 1,
  },
  card: {
    backgroundColor: '#fff',
    borderRadius: 12,
    marginBottom: 16,
    elevation: 3,
    padding: 18,
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 6,
  },
  cardContent: {
    marginBottom: 16,
  },
  cardHeader: {
    flexDirection: 'row',
    alignItems: 'center',
    marginBottom: 8,
  },
  cardTitle: {
    fontSize: 18,
    fontWeight: '700',
    color: '#333',
    marginLeft: 8,
  },
  cardInfo: {
    fontSize: 14,
    color: '#777',
    marginBottom: 6,
  },
  detailsButton: {
    backgroundColor: '#007bff',
    borderRadius: 25,
    paddingVertical: 10,
    alignItems: 'center',
  },
  detailsButtonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: '600',
  },
  locationButton: {
    position: 'absolute',
    top: 16,
    right: 16,
    backgroundColor: '#007bff',
    padding: 12,
    borderRadius: 50,
    elevation: 4,
  },
  emptyContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginTop: 50,
  },
  emptyText: {
    fontSize: 18,
    color: '#777',
    marginTop: 10,
  },
});

export default NearestJeep;






// import React, { useState, useRef } from 'react';
// import { 
//   View, 
//   Text, 
//   FlatList, 
//   StyleSheet, 
//   TouchableOpacity, 
//   SafeAreaView,
//   StatusBar,
//   RefreshControl,
//   Image,
//   Animated,
//   Dimensions,
//   ScrollView
// } from 'react-native';
// import { Ionicons, MaterialCommunityIcons, Feather } from '@expo/vector-icons';

// const { width } = Dimensions.get('window');

// // Sample data for demonstration
// const jeepneyData = [
//   { id: '1', plateNumber: 'ABC 123', availableSeats: 8, route: 'Downtown - Uptown', lastUpdated: '2 mins ago', distance: '0.3 km', rating: 4.7, price: '₱15.00', eta: '4 min', driverName: 'Juan Dela Cruz', totalTrips: 1243 },
//   { id: '2', plateNumber: 'XYZ 789', availableSeats: 4, route: 'Central - Mall Area', lastUpdated: '5 mins ago', distance: '0.7 km', rating: 4.2, price: '₱12.00', eta: '7 min', driverName: 'Pedro Santos', totalTrips: 856 },
//   { id: '3', plateNumber: 'LMN 456', availableSeats: 12, route: 'University - Market', lastUpdated: 'Just now', distance: '1.2 km', rating: 4.9, price: '₱20.00', eta: '10 min', driverName: 'Maria Garcia', totalTrips: 2107 },
//   { id: '4', plateNumber: 'PQR 321', availableSeats: 0, route: 'Terminal - Hospital', lastUpdated: '10 mins ago', distance: '0.5 km', rating: 4.0, price: '₱15.00', eta: '6 min', driverName: 'Jose Reyes', totalTrips: 732 },
//   { id: '5', plateNumber: 'DEF 654', availableSeats: 6, route: 'Park - Residential Area', lastUpdated: '1 min ago', distance: '0.8 km', rating: 4.5, price: '₱18.00', eta: '8 min', driverName: 'Ana Lim', totalTrips: 1568 },
// ];

// const App = () => {
//   const [refreshing, setRefreshing] = useState(false);
//   const [activeFilter, setActiveFilter] = useState('nearest');
//   const [expandedDetails, setExpandedDetails] = useState(null);
//   const scaleAnim = useRef(new Animated.Value(1)).current;
  
//   const onRefresh = () => {
//     setRefreshing(true);
//     // Simulate a refresh
//     setTimeout(() => {
//       setRefreshing(false);
//     }, 1500);
//   };

//   const toggleExpandDetails = (id) => {
//     // Animate card scale when expanding/collapsing
//     Animated.sequence([
//       Animated.timing(scaleAnim, {
//         toValue: 0.98,
//         duration: 100,
//         useNativeDriver: true
//       }),
//       Animated.timing(scaleAnim, {
//         toValue: 1,
//         duration: 100,
//         useNativeDriver: true
//       })
//     ]).start();
    
//     setExpandedDetails(expandedDetails === id ? null : id);
//   };

//   const getSeatStatusColor = (seats) => {
//     if (seats === 0) return '#FF6B6B';    // Red for no seats
//     if (seats < 5) return '#FFD166';      // Yellow for few seats
//     return '#06D6A0';                     // Green for many seats
//   };

//   const renderProgressBar = (value) => {
//     // Convert rating to percentage (0-5 scale to 0-100%)
//     const percentage = (value / 5) * 100;
//     return (
//       <View style={styles.progressBarContainer}>
//         <View style={[styles.progressBar, { width: `${percentage}%` }]} />
//       </View>
//     );
//   };

//   const renderItem = ({ item }) => {
//     const isExpanded = expandedDetails === item.id;
//     const seatColor = getSeatStatusColor(item.availableSeats);
    
//     return (
//       <Animated.View style={{
//         transform: [{ scale: isExpanded ? 1 : scaleAnim }]
//       }}>
//         <TouchableOpacity 
//           style={[styles.card, isExpanded && styles.expandedCard]}
//           activeOpacity={0.97}
//           onPress={() => item.availableSeats > 0 && toggleExpandDetails(item.id)}>
          
//           {/* Card Header */}
//           <View style={styles.cardHeader}>
//             <View style={styles.plateNumberContainer}>
//               <Text style={styles.plateNumber}>{item.plateNumber}</Text>
//               <View style={styles.ratingContainer}>
//                 <Ionicons name="star" size={12} color="#FFD700" />
//                 <Text style={styles.ratingText}>{item.rating}</Text>
//               </View>
//             </View>
//             <View
//               style={[
//                 styles.seatsIndicator,
//                 { backgroundColor: seatColor }
//               ]}
//             >
//               <Text style={styles.seatsNumber}>{item.availableSeats}</Text>
//               <Text style={styles.seatsLabel}>
//                 {item.availableSeats === 1 ? 'seat' : 'seats'}
//               </Text>
//             </View>
//           </View>
          
//           {/* Route Information */}
//           <View style={styles.routeContainer}>
//             <View style={styles.routeIconContainer}>
//               <Ionicons name="map-outline" size={16} color="#fff" />
//             </View>
//             <Text style={styles.routeText} numberOfLines={1}>{item.route}</Text>
//           </View>
          
//           {/* Key Information Row */}
//           <View style={styles.infoRow}>
//             <View style={styles.infoItem}>
//               <Ionicons name="cash-outline" size={14} color="#2196F3" />
//               <Text style={styles.infoText}>{item.price}</Text>
//             </View>
//             <View style={styles.infoItem}>
//               <Ionicons name="time-outline" size={14} color="#2196F3" />
//               <Text style={styles.infoText}>ETA: {item.eta}</Text>
//             </View>
//             <View style={styles.infoItem}>
//               <Ionicons name="location-outline" size={14} color="#2196F3" />
//               <Text style={styles.infoText}>{item.distance}</Text>
//             </View>
//           </View>
          
//           {/* Expanded Details Section */}
//           {isExpanded && (
//             <View style={styles.expandedDetails}>
//               <View style={styles.divider} />
              
//               {/* Driver info section */}
//               <View style={styles.driverInfoContainer}>
//                 <Image
//                   source={{ uri: '/api/placeholder/60/60' }}
//                   style={styles.driverImage}
//                 />
//                 <View style={styles.driverDetails}>
//                   <Text style={styles.driverName}>{item.driverName}</Text>
//                   <View style={styles.tripContainer}>
//                     <MaterialCommunityIcons name="steering" size={14} color="#777" />
//                     <Text style={styles.tripText}>{item.totalTrips.toLocaleString()} trips</Text>
//                   </View>
//                 </View>
//                 <View style={styles.driverRating}>
//                   <View style={styles.ratingBadge}>
//                     <Text style={styles.ratingValue}>{item.rating}</Text>
//                     <Ionicons name="star" size={10} color="#fff" />
//                   </View>
//                   <Text style={styles.ratingLabel}>Driver Rating</Text>
//                 </View>
//               </View>
              
//               <View style={styles.detailsRow}>
//                 <View style={styles.detailItem}>
//                   <Text style={styles.detailLabel}>Last Updated</Text>
//                   <Text style={styles.detailValue}>{item.lastUpdated}</Text>
//                 </View>
//                 <View style={styles.detailItem}>
//                   <Text style={styles.detailLabel}>Available Seats</Text>
//                   <Text style={[styles.detailValue, { color: seatColor }]}>
//                     {item.availableSeats} / 16
//                   </Text>
//                 </View>
//               </View>
              
//               {/* Location Button - NEW */}
//               <TouchableOpacity style={styles.locationButton}>
//                 <View style={styles.locationButtonContent}>
//                   <Ionicons name="location" size={18} color="#fff" />
//                   <Text style={styles.locationButtonText}>View Live Location</Text>
//                 </View>
//                 <View style={styles.liveIndicator}>
//                   <View style={styles.liveIndicatorDot} />
//                   <Text style={styles.liveIndicatorText}>LIVE</Text>
//                 </View>
//               </TouchableOpacity>
              
//               <TouchableOpacity style={styles.bookButton}>
//                 <Text style={styles.bookButtonText}>Reserve Seat Now</Text>
//                 <Ionicons name="chevron-forward" size={16} color="#fff" />
//               </TouchableOpacity>
//             </View>
//           )}
          
//           {/* Bottom Action Area */}
//           {!isExpanded && (
//             <View style={styles.cardActions}>
//               {item.availableSeats > 0 ? (
//                 <TouchableOpacity 
//                   style={styles.viewButton}
//                   onPress={() => toggleExpandDetails(item.id)}
//                 >
//                   <Text style={styles.viewButtonText}>View Details</Text>
//                   <Ionicons name="chevron-down" size={16} color="#2196F3" />
//                 </TouchableOpacity>
//               ) : (
//                 <View style={styles.unavailableButton}>
//                   <Text style={styles.unavailableButtonText}>No Seats Available</Text>
//                 </View>
//               )}
//             </View>
//           )}
          
//           {/* Special Badge */}
//           {item.availableSeats === 0 && (
//             <View style={styles.fullBadge}>
//               <Text style={styles.fullText}>FULL</Text>
//             </View>
//           )}
//         </TouchableOpacity>
//       </Animated.View>
//     );
//   };

//   const ListEmptyComponent = () => (
//     <View style={styles.emptyContainer}>
//       <Image 
//         source={{ uri: '/api/placeholder/200/200' }} 
//         style={styles.emptyImage} 
//       />
//       <Text style={styles.emptyTitle}>No Jeepneys Found</Text>
//       <Text style={styles.emptyText}>We couldn't find any jeepneys matching your criteria</Text>
//       <TouchableOpacity style={styles.refreshButton} onPress={onRefresh}>
//         <Ionicons name="refresh" size={16} color="#fff" style={{ marginRight: 6 }} />
//         <Text style={styles.refreshButtonText}>Refresh</Text>
//       </TouchableOpacity>
//     </View>
//   );

//   const renderFilter = (filter, label, icon) => (
//     <TouchableOpacity
//       style={[styles.filterPill, activeFilter === filter && styles.activeFilterPill]}
//       onPress={() => setActiveFilter(filter)}
//     >
//       <Ionicons name={icon} size={16} color={activeFilter === filter ? '#2196F3' : '#777'} />
//       <Text style={[styles.filterText, activeFilter === filter && styles.activeFilterText]}>{label}</Text>
//     </TouchableOpacity>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="light-content" backgroundColor="#2196F3" />
      
//       {/* Header section */}
//       <View style={styles.header}>
//         <TouchableOpacity style={styles.backButton}>
//           <Ionicons name="chevron-back" size={24} color="#fff" />
//         </TouchableOpacity>
//         <View style={styles.headerTitleContainer}>
//           <Text style={styles.headerTitle}>Find a Jeepney</Text>
//           <Text style={styles.headerSubtitle}>{jeepneyData.length} jeepneys available near you</Text>
//         </View>
//         <TouchableOpacity style={styles.searchButton}>
//           <Ionicons name="search" size={22} color="#2196F3" />
//         </TouchableOpacity>
//       </View>
      
//       {/* Filter section */}
//       <View style={styles.filterContainer}>
//         <ScrollView horizontal showsHorizontalScrollIndicator={false} contentContainerStyle={styles.filterScroll}>
//           {renderFilter('nearest', 'Nearest', 'location-outline')}
//           {renderFilter('available', 'Most Seats', 'people-outline')}
//           {renderFilter('cheapest', 'Cheapest', 'cash-outline')}
//           {renderFilter('rating', 'Top Rated', 'star-outline')}
//           {renderFilter('fastest', 'Fastest', 'time-outline')}
//         </ScrollView>
//       </View>
      
//       {/* Main list */}
//       <FlatList
//         data={jeepneyData}
//         keyExtractor={(item) => item.id}
//         renderItem={renderItem}
//         contentContainerStyle={styles.listContent}
//         showsVerticalScrollIndicator={false}
//         ListEmptyComponent={ListEmptyComponent}
//         refreshControl={
//           <RefreshControl
//             refreshing={refreshing}
//             onRefresh={onRefresh}
//             colors={['#2196F3']}
//             tintColor="#2196F3"
//           />
//         }
//       />
    
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#f8f9fa',
//   },
//   header: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingTop: 16,
//     paddingBottom: 12,
//     backgroundColor: '#2196F3',
//   },
//   backButton: {
//     padding: 8,
//     borderRadius: 20,
//     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//   },
//   headerTitleContainer: {
//     flex: 1,
//     paddingHorizontal: 12,
//   },
//   headerTitle: {
//     fontSize: 22,
//     fontWeight: 'bold',
//     color: '#fff',
//   },
//   headerSubtitle: {
//     fontSize: 13,
//     color: 'rgba(255, 255, 255, 0.8)',
//     marginTop: 2,
//   },
//   searchButton: {
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     backgroundColor: '#fff',
//     alignItems: 'center',
//     justifyContent: 'center',
//     elevation: 2,
//   },
//   filterContainer: {
//     paddingVertical: 12,
//     backgroundColor: '#fff',
//     borderBottomWidth: 1,
//     borderBottomColor: '#f0f0f0',
//   },
//   filterScroll: {
//     paddingHorizontal: 16,
//   },
//   filterPill: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 14,
//     paddingVertical: 8,
//     backgroundColor: '#f5f5f5',
//     borderRadius: 20,
//     marginRight: 10,
//   },
//   activeFilterPill: {
//     backgroundColor: '#e6f2ff',
//     borderWidth: 1,
//     borderColor: '#cce4ff',
//   },
//   filterText: {
//     fontSize: 14,
//     color: '#777',
//     marginLeft: 6,
//   },
//   activeFilterText: {
//     color: '#2196F3',
//     fontWeight: '500',
//   },
//   listContent: {
//     padding: 12,
//     paddingBottom: 80, // Extra padding for bottom nav
//   },
//   card: {
//     backgroundColor: 'white',
//     borderRadius: 16,
//     marginBottom: 12,
//     padding: 16,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.05,
//     shadowRadius: 3,
//   },
//   expandedCard: {
//     marginBottom: 16,
//     elevation: 3,
//   },
//   cardHeader: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'flex-start',
//     marginBottom: 10,
//   },
//   plateNumberContainer: {
//     flex: 1,
//   },
//   plateNumber: {
//     fontSize: 18,
//     fontWeight: '700',
//     color: '#222',
//     marginBottom: 2,
//   },
//   ratingContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'rgba(255, 215, 0, 0.1)',
//     paddingHorizontal: 6,
//     paddingVertical: 2,
//     borderRadius: 4,
//     alignSelf: 'flex-start',
//   },
//   ratingText: {
//     fontSize: 12,
//     color: '#555',
//     marginLeft: 2,
//     fontWeight: '500',
//   },
//   seatsIndicator: {
//     width: 56,
//     height: 44,
//     borderRadius: 10,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginLeft: 12,
//   },
//   seatsNumber: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#fff',
//   },
//   seatsLabel: {
//     fontSize: 10,
//     color: '#fff',
//     opacity: 0.9,
//   },
//   routeContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 14,
//   },
//   routeIconContainer: {
//     width: 28,
//     height: 28,
//     borderRadius: 14,
//     backgroundColor: '#2196F3',
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginRight: 10,
//   },
//   routeText: {
//     fontSize: 14,
//     color: '#444',
//     flex: 1,
//     fontWeight: '500',
//   },
//   infoRow: {
//     flexDirection: 'row',
//     marginBottom: 12,
//     backgroundColor: '#f9f9f9',
//     borderRadius: 10,
//     padding: 10,
//   },
//   infoItem: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginRight: 16,
//   },
//   infoText: {
//     fontSize: 13,
//     color: '#555',
//     marginLeft: 4,
//     fontWeight: '500',
//   },
//   cardActions: {
//     alignItems: 'center',
//   },
//   viewButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 6,
//   },
//   viewButtonText: {
//     color: '#2196F3',
//     fontWeight: '500',
//     fontSize: 14,
//     marginRight: 2,
//   },
//   unavailableButton: {
//     backgroundColor: '#f0f0f0',
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 6,
//   },
//   unavailableButtonText: {
//     color: '#999',
//     fontWeight: '500',
//     fontSize: 13,
//   },
//   fullBadge: {
//     position: 'absolute',
//     top: -8,
//     right: 12,
//     backgroundColor: '#FF6B6B',
//     paddingHorizontal: 8,
//     paddingVertical: 3,
//     borderRadius: 12,
//   },
//   fullText: {
//     color: 'white',
//     fontSize: 10,
//     fontWeight: 'bold',
//   },
  
//   // Expanded details styles
//   expandedDetails: {
//     marginTop: 4,
//   },
//   divider: {
//     height: 1,
//     backgroundColor: '#eee',
//     marginVertical: 12,
//   },
//   driverInfoContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 16,
//     backgroundColor: '#f9f9f9',
//     padding: 12,
//     borderRadius: 12,
//   },
//   driverImage: {
//     width: 50,
//     height: 50,
//     borderRadius: 25,
//     marginRight: 12,
//   },
//   driverDetails: {
//     flex: 1,
//   },
//   driverName: {
//     fontSize: 16,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 2,
//   },
//   tripContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   tripText: {
//     fontSize: 12,
//     color: '#777',
//     marginLeft: 4,
//   },
//   driverRating: {
//     alignItems: 'center',
//   },
//   ratingBadge: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#2196F3',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//     marginBottom: 2,
//   },
//   ratingValue: {
//     color: '#fff',
//     fontWeight: 'bold',
//     fontSize: 14,
//     marginRight: 2,
//   },
//   ratingLabel: {
//     fontSize: 10,
//     color: '#777',
//   },
//   detailsRow: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     marginBottom: 16,
//   },
//   detailItem: {
//     flex: 1,
//   },
//   detailLabel: {
//     fontSize: 12,
//     color: '#999',
//     marginBottom: 4,
//   },
//   detailValue: {
//     fontSize: 14,
//     color: '#333',
//     fontWeight: '500',
//   },
//   progressBarContainer: {
//     flex: 1,
//     height: 6,
//     backgroundColor: '#eee',
//     borderRadius: 3,
//     marginLeft: 8,
//     overflow: 'hidden',
//   },
//   progressBar: {
//     height: '100%',
//     backgroundColor: '#2196F3',
//   },
//   // Location button styles - NEW
//   locationButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'space-between',
//     paddingVertical: 12,
//     paddingHorizontal: 14,
//     borderRadius: 12,
//     marginBottom: 12,
//     backgroundColor: '#009688',
//   },
//   locationButtonContent: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   locationButtonText: {
//     color: 'white',
//     fontSize: 15,
//     fontWeight: '600',
//     marginLeft: 8,
//   },
//   liveIndicator: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: 'rgba(255, 255, 255, 0.2)',
//     paddingHorizontal: 8,
//     paddingVertical: 4,
//     borderRadius: 12,
//   },
//   liveIndicatorDot: {
//     width: 6,
//     height: 6,
//     borderRadius: 3,
//     backgroundColor: '#ff4757',
//     marginRight: 4,
//   },
//   liveIndicatorText: {
//     color: 'white',
//     fontSize: 10,
//     fontWeight: 'bold',
//   },
//   bookButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     justifyContent: 'center',
//     paddingVertical: 14,
//     borderRadius: 12,
//     marginTop: 8,
//     backgroundColor: '#2196F3',
//   },
//   bookButtonText: {
//     color: 'white',
//     fontSize: 16,
//     fontWeight: '600',
//     marginRight: 4,
//   },
  
//   // Empty state styles
//   emptyContainer: {
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 24,
//     marginTop: 40,
//   },
//   emptyImage: {
//     width: 120,
//     height: 120,
//     marginBottom: 20,
//     opacity: 0.7,
//   },
//   emptyTitle: {
//     fontSize: 20,
//     fontWeight: 'bold',
//     color: '#444',
//     marginBottom: 8,
//   },
//   emptyText: {
//     fontSize: 14,
//     color: '#888',
//     textAlign: 'center',
//     marginBottom: 20,
//   },
//   refreshButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 20,
//     paddingVertical: 12,
//     borderRadius: 12,
//     backgroundColor: '#2196F3',
//   },
//   refreshButtonText: {
//     color: 'white',
//     fontWeight: '600',
//   },
  
//   // Bottom Navigation
//   bottomNav: {
//     flexDirection: 'row',
//     position: 'absolute',
//     bottom: 0,
//     left: 0,
//     right: 0,
//     backgroundColor: '#fff',
//     borderTopWidth: 1,
//     borderTopColor: '#eee',
//     paddingVertical: 8,
//     paddingHorizontal: 4,
//     elevation: 8,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: -2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 4,
//   },
//   navItem: {
//     flex: 1,
//     alignItems: 'center',
//     justifyContent: 'center',
//     padding: 4,
//   },
//   activeNavIconBg: {
//     backgroundColor: '#2196F3',
//     width: 40,
//     height: 40,
//     borderRadius: 20,
//     alignItems: 'center',
//     justifyContent: 'center',
//     marginBottom: 2,
//   },
//   navText: {
//     fontSize: 12,
//     color: '#777',
//     marginTop: 2,
//   },
//   activeNavText: {
//     color: '#2196F3',
//     fontWeight: '500',
//   },
// });

// export default App;