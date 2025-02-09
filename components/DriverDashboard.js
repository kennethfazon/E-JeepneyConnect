// import React, { useEffect, useState } from 'react';
// import { View, Text, Alert, StyleSheet, TouchableOpacity } from 'react-native';
// import AsyncStorage from '@react-native-async-storage/async-storage';
// import api from '../services/api';
// import Icon from 'react-native-vector-icons/Ionicons';
// import Mapbox from '@rnmapbox/maps';
// import axios from 'axios';
// import * as Location from 'expo-location';

// Mapbox.setAccessToken('pk.eyJ1IjoicmljYXJkb2pyIiwiYSI6ImNtMjAwN2hubzBjdTUyanNmZDNobjlwdnMifQ.dByj0fl6cgi8yoYTbx9VfA');

// const DriverDashboard = ({ navigation }) => {
//   const [fullName, setFullName] = useState(''); 
//   const [resIds, setResIds] = useState(''); 
//   const [temPlate, setTemplate] = useState(''); 
  
//   const [username, setUsername] = useState(''); 
//   const [resId, setResId] = useState(null);
//   const [driverLocation, setDriverLocation] = useState(null);
//   const [passengerLocations, setPassengerLocations] = useState([]);
//   const [routeCoordinates, setRouteCoordinates] = useState([]);
//   const [moving, setMoving] = useState(false);
//   const [token, setToken] = useState(null);
//   const [loggedOut, setLoggedOut] = useState(false);  // New state for tracking logout
  
  // // State to manage the camera view dynamically
  // const [cameraPosition, setCameraPosition] = useState({
  //   latitude: 0,
  //   longitude: 0,
  //   zoomLevel: 11.5,  // Default zoom level
  // });

  // // Haversine formula to calculate the distance between two points (in kilometers)
  // const haversineDistance = (lat1, lon1, lat2, lon2) => {
  //   const R = 6371; // Earth radius in km
  //   const dLat = (lat2 - lat1) * Math.PI / 180;
  //   const dLon = (lon2 - lon1) * Math.PI / 180;
  //   const a =
  //     Math.sin(dLat / 2) * Math.sin(dLat / 2) +
  //     Math.cos(lat1 * Math.PI / 180) * Math.cos(lat2 * Math.PI / 180) *
  //     Math.sin(dLon / 2) * Math.sin(dLon / 2);
  //   const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
  //   return R * c; // Returns distance in km
  // };

//   const fetchUserName = async () => {
//     const token = await AsyncStorage.getItem('userToken'); // Retrieve token
//     if (!token) {
//       Alert.alert('No token found. Please login.');
//       return;
//     }
//     try {
//       const response = await api.get('/dashboard', {
//         headers: { 'x-access-token': token }, // Pass the token in the request
//       });

//       // Set the full name based on the response data
//       setTemplate(response.data.temPlate)
//       setResIds(response.data.resIds)
//       setUsername(response.data.username)
//       setFullName(response.data.fullName || ''); // Ensure it's a valid string
//     } catch (err) {
//       Alert.alert('Error fetching user data: ' + err.message);
//     }
//   };

//   useEffect(() => {
//     if (token) {
//       fetchReservationId();
//     }
//   }, [token]);
  
//   useEffect(() => {
//     const fetchReservationId = async () => {
//       if (!token) return;
//       try {
//         const response = await api.get('/api/getReservationId', {
//           headers: { 'x-access-token': token },
//         });
//         setResId(response.data.res_id);
//       } catch (err) {
//         Alert.alert('Error fetching reservation ID', err.message);
//       }
//     };
  
//     if (token) {
//       fetchReservationId();
//     }
//   }, [token]); // This effect runs when the token changes
  

  // const fetchPassengerLocations = async () => {
  //   if (!token) return;
  //   try {
  //     const response = await api.get('/api/getJeepAndPassengerLocations', {
  //       headers: { 'x-access-token': token },
  //     });
  //     setPassengerLocations(response.data.passengerLocations);
  //   } catch (err) {
  //     console.error('Error fetching passenger locations:', err.message);
  //   }
  // };

  // const fetchRouteToPassenger = async (driverLocation, passengerLocation) => {
  //   try {
  //     const { latitude: driverLat, longitude: driverLng } = driverLocation;
  //     const { latitude: passengerLat, longitude: passengerLng } = passengerLocation;

  //     const response = await axios.get(
  //       `https://api.mapbox.com/directions/v5/mapbox/driving/${driverLng},${driverLat};${passengerLng},${passengerLat}`,
  //       {
  //         params: {
  //           geometries: 'geojson',
  //           access_token: 'sk.eyJ1IjoicmljYXJkb2pyIiwiYSI6ImNtNDQ5ZG51bjBsY3oya3Npejd0NDNiMzQifQ.wvg5PRoD-ed6k2swJduO0A',
  //         },
  //       }
  //     );

  //     const routeGeoJSON = response.data.routes[0].geometry;
  //     setRouteCoordinates(routeGeoJSON.coordinates);
  //   } catch (error) {
  //     console.error('Error fetching route:', error.message);
  //     Alert.alert('Error', 'Unable to fetch route.');
  //   }
  // };

  // const findNearestPassenger = () => {
  //   if (!driverLocation || passengerLocations.length === 0) return null;

  //   let nearestPassenger = null;
  //   let minDistance = Infinity;

  //   passengerLocations.forEach((passenger) => {
  //     const distance = haversineDistance(driverLocation.latitude, driverLocation.longitude, passenger.latitude, passenger.longitude);

  //     if (distance < minDistance) {
  //       minDistance = distance;
  //       nearestPassenger = passenger;
  //     }
  //   });

  //   return nearestPassenger;
  // };

  // const simulateDriverMovement = async (route) => {
  //   if (!route || route.length === 0 || loggedOut || !token) return;  // Stop if logged out or no token
  
  //   setMoving(true);
  //   const busSpeed = 40; // Set bus speed in km/h (natural bus speed)
  //   const updateInterval = 1000; // Update every 1000 ms (1 second)
  
  //   const token = await AsyncStorage.getItem('userToken');
    
  //   let currentStep = 0;
  //   let totalSteps = 0;
    
  //   // Calculate total number of steps for the entire route
  //   for (let i = 0; i < route.length - 1; i++) {
  //     const [startLng, startLat] = route[i];
  //     const [endLng, endLat] = route[i + 1];
  
  //     const distance = haversineDistance(startLat, startLng, endLat, endLng); // in km
  //     const timeToTravel = (distance / busSpeed) * 3600 * 1000; // time to travel this segment in ms (distance/speed)
  
  //     const numSteps = Math.floor(timeToTravel / updateInterval); // Number of updates for this segment
  //     totalSteps += numSteps; // Sum total steps across all segments
  //   }
  
  //   let intervalId = setInterval(async () => {
  //     if (!token || loggedOut) {
  //       clearInterval(intervalId);  // Stop updating if logged out or no token
  //       setMoving(false);
  //       return;
  //     }

  //     if (currentStep < totalSteps) {
  //       let accumulatedDistance = 0;
  //       let currentSegmentIndex = 0;
  //       let remainingSteps = currentStep;
  
  //       // Traverse the route segments to calculate the next position
  //       while (remainingSteps >= 0) {
  //         const [startLng, startLat] = route[currentSegmentIndex];
  //         const [endLng, endLat] = route[currentSegmentIndex + 1];
  
  //         const distance = haversineDistance(startLat, startLng, endLat, endLng); // in km
  //         const segmentSteps = Math.floor((distance / busSpeed) * 3600 * 1000 / updateInterval);
  
  //         if (remainingSteps < segmentSteps) {
  //           const latStep = (endLat - startLat) / segmentSteps;
  //           const lngStep = (endLng - startLng) / segmentSteps;
  
  //           const newLat = startLat + latStep * remainingSteps;
  //           const newLng = startLng + lngStep * remainingSteps;
  
  //           setDriverLocation({ latitude: newLat, longitude: newLng });
  
  //           // Update camera position dynamically
  //           setCameraPosition({
  //             latitude: newLat,
  //             longitude: newLng,
  //             zoomLevel: 11.5,  // You can adjust zoom level based on your needs
  //           });
  
  //           // Send driver location to the server every second
  //           try {
  //             await api.post('/updatedriverLocation', {
  //               latitude: newLat,
  //               longitude: newLng,
  //             }, {
  //               headers: {
  //                 'x-access-token': token,
  //               },
  //             });
  //           } catch (error) {
  //             console.error('Error sending location:', error);
  //           }
  
  //           break; // Break out once we have updated the current position
  //         }
  
  //         remainingSteps -= segmentSteps;
  //         currentSegmentIndex++;
  //       }
  
  //       currentStep++;
  //     } else {
  //       clearInterval(intervalId); // Stop updating when all steps are completed
  //       setMoving(false);
  //     }
  //   }, updateInterval);
  // };

  // useEffect(() => {
  //   fetchUserName();
  // }, []);

  // useEffect(() => {
  //   if (token) {
  //     fetchReservationId();
  //     fetchPassengerLocations();
  //   }
  // }, [token]);

  // useEffect(() => {
  //   const fetchDriverInitialLocation = async () => {
  //     if (!token) return;  // Skip if no token
  
  //     const { status } = await Location.requestForegroundPermissionsAsync();
  //     if (status !== 'granted') {
  //       Alert.alert('Permission Denied', 'Allow location access to proceed.');
  //       return;
  //     }
  
  //     // Get the driver's current location
  //     const userLocation = await Location.getCurrentPositionAsync({});
  //     const { latitude, longitude } = userLocation.coords;
  
  //     // Update the driver's location in the state
  //     setDriverLocation({ latitude, longitude });
  
  //     // Update the camera position
  //     setCameraPosition({
  //       latitude,
  //       longitude,
  //       zoomLevel: 11.5,
  //     });
  
  //     // Now call the API to insert the location into the database
  //     try {
  //       const response = await api.post('/updatedriverLocation', {
  //         latitude,
  //         longitude,
  //       }, {
  //         headers: {
  //           'x-access-token': token,
  //         },
  //       });
  
  //       if (response.status === 200) {
  //         console.log('Driver location updated successfully in the database');
  //       } else {
  //         console.error('Failed to update location in the database');
  //       }
  //     } catch (error) {
  //       console.error('Error sending location to the server:', error.message);
  //       Alert.alert('Error', 'Unable to update location');
  //     }
  //   };
  
  //   fetchDriverInitialLocation();
  // }, [token]);  // This effect runs when the component mounts and token changes
  

  // useEffect(() => {
  //   if (driverLocation && !moving && passengerLocations.length > 0 && !loggedOut && token) {
  //     const nearestPassenger = findNearestPassenger();
  //     if (nearestPassenger) {
  //       fetchRouteToPassenger(driverLocation, nearestPassenger).then(() => {
  //         simulateDriverMovement(routeCoordinates).then(() => {
  //           setPassengerLocations((prev) =>
  //             prev.filter(
  //               (passenger) =>
  //                 passenger.latitude !== nearestPassenger.latitude &&
  //                 passenger.longitude !== nearestPassenger.longitude
  //             )
  //           );
  //         });
  //       });
  //     }
  //   }
  // }, [driverLocation, passengerLocations, loggedOut, token]);

//   const logout = async () => {
//     const token = await AsyncStorage.getItem('userToken');
    
//     if (!token) {
//       alert('No token found, you are already logged out.');
//       return;
//     }

//     api.post('/logout', {}, { headers: { 'x-access-token': token } })
//       .then(async () => {
//         await AsyncStorage.removeItem('userToken');
//         navigation.navigate('Welcome');  
//       })
//       .catch(err => alert('Logout error: ' + err.message));
//   };

//   const handlePlusButtonClick = () => {
//     if (resIds && temPlate == 2 ) {
//       navigation.navigate('ManageSeats2', { res_id: resIds }); // Navigate to ManageSeats with res_id
//     }else if (resIds && temPlate == 1 ) {
//       navigation.navigate('ManageSeats', { res_id: resIds }); // Navigate to ManageSeats with res_id
//     }
//      else {
//       Alert.alert('Error', 'No reservation ID found');
//     }
//   };
  
//   return (
//     <View style={styles.container}>
//       <Text style={styles.welcomeText}>Welcome, {fullName}</Text>
//       <TouchableOpacity style={styles.logoutButton} onPress={logout}>
//         <Text style={styles.logoutText}>Logout</Text>
//       </TouchableOpacity>

      // {driverLocation ? (
      //   <Mapbox.MapView
      //     styleURL="mapbox://styles/mapbox/streets-v11"
      //     style={styles.map}
      //     camera={{
      //       centerCoordinate: [cameraPosition.longitude, cameraPosition.latitude],
      //       zoomLevel: cameraPosition.zoomLevel,
      //     }}
      //   >
      //     <Mapbox.Camera
      //       centerCoordinate={[cameraPosition.longitude, cameraPosition.latitude]}
      //       zoomLevel={cameraPosition.zoomLevel}
      //       animationMode="flyTo"
      //       animationDuration={2000}
      //     />
      //     <Mapbox.MarkerView
      //       id="driver-location"
      //       coordinate={[driverLocation.longitude, driverLocation.latitude]}
      //     >
      //       <View style={styles.vehicleMarker}>
      //         <Icon name="car-sport" size={30} color="blue" />
      //       </View>
      //     </Mapbox.MarkerView>

      //     {passengerLocations.map((location, index) => (
      //       <Mapbox.MarkerView
      //         key={index}
      //         id={`passenger-location-${index}`}
      //         coordinate={[location.longitude, location.latitude]}
      //       >
      //         <View style={styles.redMarker}>
      //           <Icon name="location-sharp" size={30} color="red" />
      //         </View>
      //       </Mapbox.MarkerView>
      //     ))}

      //     {/* Route LineLayer */}
      //     {routeCoordinates.length > 0 && (
      //       <Mapbox.ShapeSource
      //         id="routeSource"
      //         shape={{
      //           type: 'Feature',
      //           geometry: {
      //             type: 'LineString',
      //             coordinates: routeCoordinates,
      //           },
      //         }}
      //       >
      //         <Mapbox.LineLayer
      //           id="routeLine"
      //           style={{
      //             lineColor: '#007bff',
      //             lineWidth: 4,
      //           }}
      //         />
      //       </Mapbox.ShapeSource>
      //     )}
      //   </Mapbox.MapView>
      // ) : (
      //   <Text>Loading map...</Text>
      // )}

//       <View style={styles.navBar}>
//         <TouchableOpacity style={styles.navButton}>
//           <Icon name="home-outline" size={30} color="#007bff" />
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.plusButton} onPress={handlePlusButtonClick}>
//           <Icon name="add-outline" size={40} color="white" />
//         </TouchableOpacity>
//         <TouchableOpacity style={styles.navButton}>
//           <Icon name="settings-outline" size={30} color="#748c94" />
//         </TouchableOpacity>
//       </View>
//     </View>
//   );
// };



 

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     justifyContent: 'center',
//     alignItems: 'center',
//     backgroundColor: '#f5f5f5',
//     paddingTop: 20,
//     paddingBottom: 20,
//   },
//   marker: { 
//     alignItems: 'center', 
//     justifyContent: 'center' 
//   },
  
//   welcomeText: {
//     fontSize: 24,
//     fontWeight: '600',
//     color: '#333',
//     marginBottom: 10,
//     textAlign: 'center',
//   },
//   logoutButton: {
//     backgroundColor: '#ff6347',
//     paddingVertical: 10,
//     paddingHorizontal: 30,
//     borderRadius: 20,
//     marginTop: 15,
//     marginBottom: 20,
//   },
//   logoutText: {
//     color: 'white',
//     fontWeight: 'bold',
//     fontSize: 16,
//   },
//   map: {
//     flex: 1,
//     width: '100%',
//     height: '60%',
//     marginBottom: 20,
//     borderRadius: 10,
//     overflow: 'hidden',
//   },
//   markerImage: {
//     width: 30,
//     height: 30,
//   },
//   navBar: {
//     position: 'absolute',
//     bottom: 10,
//     left: 40,
//     right: 40,
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     backgroundColor: '#F5EFFF',
//     borderRadius: 20,
//     height: 60,
//     paddingHorizontal: 25,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 10 },
//     shadowOpacity: 0.1,
//     shadowRadius: 5,
//     elevation: 10,
//   },
//   navButton: {
//     alignItems: 'center',
//     justifyContent: 'center',
//   },
//   plusButton: {
//     width: 60,
//     height: 60,
//     borderRadius: 10,
//     backgroundColor: '#007bff',
//     justifyContent: 'center',
//     alignItems: 'center',
//     shadowColor: '#007bff',
//     shadowOffset: { width: 0, height: 10 },
//     shadowOpacity: 0.25,
//     shadowRadius: 3.5,
//     elevation: 5,
//     marginBottom: 20,
//     position: 'relative',
//     top: -20,
//   },
// });

// export default DriverDashboard;


import React, { useState, useEffect } from 'react';
import { View, Text, StyleSheet, SafeAreaView, StatusBar, ScrollView, TouchableOpacity, Alert, Modal, TextInput } from 'react-native';
import { Ionicons } from '@expo/vector-icons';
import AsyncStorage from '@react-native-async-storage/async-storage';
import api from '../services/api';
import Icon from 'react-native-vector-icons/Ionicons';
import Mapbox from '@rnmapbox/maps'; // Make sure Mapbox is imported
import * as Location from 'expo-location';
import polyline from 'polyline';


// Set your Mapbox access token here
Mapbox.setAccessToken('pk.eyJ1IjoicmljYXJkb2pyIiwiYSI6ImNtMjAwN2hubzBjdTUyanNmZDNobjlwdnMifQ.dByj0fl6cgi8yoYTbx9VfA');

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

const DriverDashboard = ({ navigation }) => {
  const [fullName, setFullName] = useState('');
  const [resIds, setResIds] = useState('');
  const [temPlate, setTemplate] = useState('');
  const [plateNumber, setPlateNumber] = useState('');
  const [userId, setUserId] = useState('');
  const [showLogout, setShowLogout] = useState(false);
  const [showReport, setReport] = useState(false);
  const [ticketLocations, setTicketLocations] = useState([]);
  const [username, setUsername] = useState('');
  const [driverLocation, setDriverLocation] = useState(null);
  const [routeGeometry, setRouteGeometry] = useState(null);

  const [token, setToken] = useState(null);
  const currentDate = new Date();

    // Modal state for reporting a problem
    const [modalVisible, setModalVisible] = useState(false);
    const [problemDescription, setProblemDescription] = useState('');
 

  const fetchUserName = async () => {
    const token = await AsyncStorage.getItem('userToken');
    if (!token) {
      Alert.alert('No token found. Please login.');
      return;
    }
    try {
      const response = await api.get('/dashboard', {
        headers: { 'x-access-token': token },
      });

      setUserId(response.data.id);
      setTemplate(response.data.temPlate);
      setPlateNumber(response.data.plate_number);
      setResIds(response.data.resIds);
      setUsername(response.data.username);
      setFullName(response.data.fullName || '');
    } catch (err) {
      Alert.alert('Error fetching user data: ' + err.message);
    }
  };

  useEffect(() => {
    if (token) {
      fetchReservationId();
    }
  }, [token]);

  const handleProfileClick = () => {
    setShowLogout(!showLogout);
    setReport(!showReport);
  };
  const handleReportProblem = () => {
    setModalVisible(true); // Show the modal
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

  useEffect(() => {
    fetchUserName();
  }, []);

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


  const handlePlusButtonClick = () => {
    if (resIds && temPlate == 2) {
      navigation.navigate('ManageSeats2', { res_id: resIds });
    } else if (resIds && temPlate == 1) {
      navigation.navigate('ManageSeats', { res_id: resIds });
    } else {
      Alert.alert('Error', 'No reservation ID found');
    }
  };

  const sendLocationToBackend = async (latitude, longitude) => {
    try {
      const token = await AsyncStorage.getItem('userToken');
      if (!token) {
        return;
      }
      const response = await api.post(
        '/updatedriverLocation',  // Replace with your actual backend URL
        { latitude, longitude },
        {
          headers: {
            'x-access-token': token,  // Use the stored token
          },
        }
      );
    } catch (error) {
      console.error('Error sending location:', error);
    }
  };

  // Function to fetch driver and passenger locations
  const fetchDriverAndPassengerLocations = async () => {
    try {
      const response = await api.get(`/getDriverAndPassengerLocation/${resIds}`);
      console.log("Driver and Passenger Locations:", response.data);
      setTicketLocations(response.data.passengerLocations); // Assuming `passengerLocations` comes from API
      setDriverLocation(response.data.driverLocation); // Assuming `driverLocation` comes from API
    } catch (err) {
     
    }
  };

  useEffect(() => {
    const getLocation = async () => {
      let { status } = await Location.requestForegroundPermissionsAsync();
      if (status !== 'granted') {
        Alert.alert('Permission denied to access location');
        return;
      }

      let location = await Location.getCurrentPositionAsync({});
      setDriverLocation(location.coords);  // Store the location in state
      sendLocationToBackend(location.coords.latitude, location.coords.longitude);

      fetchDriverAndPassengerLocations(); // Fetch driver and passenger locations after obtaining initial location

      const locationInterval = setInterval(async () => {
        location = await Location.getCurrentPositionAsync({});
        setDriverLocation(location.coords);  // Update state with new location
        sendLocationToBackend(location.coords.latitude, location.coords.longitude);
      }, 5000); // 5 seconds interval

      return () => clearInterval(locationInterval);
    };

    getLocation();
  }, [resIds]); // Runs once when the component mounts

  useEffect(() => {
    if (driverLocation && ticketLocations.length > 0) {
      fetchRouteToNearestPassenger(driverLocation, ticketLocations);
    }
  }, [driverLocation, ticketLocations]);
 
  const fetchRouteToNearestPassenger = async (driverCoords, ticketLocations) => {
    if (!ticketLocations.length) {
      console.log('No passenger locations available');
      return;
    }
  
    let nearestPassenger = null;
    let minDistance = Infinity;
  
    // Calculate distance between two points (Haversine formula)
    const calculateDistance = (lat1, lon1, lat2, lon2) => {
      const R = 6371000; // Earth's radius in meters
      const φ1 = lat1 * Math.PI / 180;
      const φ2 = lat2 * Math.PI / 180;
      const Δφ = (lat2 - lat1) * Math.PI / 180;
      const Δλ = (lon2 - lon1) * Math.PI / 180;
  
      const a = Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
                Math.cos(φ1) * Math.cos(φ2) *
                Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
      const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));
      return R * c;
    };
  
    // Find the nearest passenger location
    ticketLocations.forEach(ticket => {
      const distance = calculateDistance(driverCoords.latitude, driverCoords.longitude, ticket.latitude, ticket.longitude);
      if (distance < minDistance) {
        minDistance = distance;
        nearestPassenger = ticket;
      }
    });
  
    if (nearestPassenger) {
      try {
        const driverLongitude = driverCoords.longitude;
        const driverLatitude = driverCoords.latitude;
        const passengerLongitude = nearestPassenger.longitude;
        const passengerLatitude = nearestPassenger.latitude;
  
        // console.log(`Fetching route from Driver: [${driverLongitude}, ${driverLatitude}] to Passenger: [${passengerLongitude}, ${passengerLatitude}]`);
  
        // Request route from Mapbox Directions API
        const response = await fetch(
          `https://api.mapbox.com/directions/v5/mapbox/driving/${driverLongitude},${driverLatitude};${passengerLongitude},${passengerLatitude}?geometries=geojson&access_token=pk.eyJ1IjoicmljYXJkb2pyIiwiYSI6ImNtMjAwN2hubzBjdTUyanNmZDNobjlwdnMifQ.dByj0fl6cgi8yoYTbx9VfA`
        );
  
        const data = await response.json();
  
        if (data.routes && data.routes.length > 0) {
          const route = data.routes[0];
  
          if (route.geometry) {
            setRouteGeometry(route.geometry); // Directly use GeoJSON format
            // console.log('Route geometry set successfully:', route.geometry);
          } else {
            console.error('No route geometry found');
          }
        } else {
          console.error('No valid route found');
        }
      } catch (error) {
        console.error('Error fetching route:', error);
      }
    } else {
      console.log('No nearest passenger found');
    }
  };
  const handleSubmitReport = async () => {
    if (!problemDescription) {
      Alert.alert('Error', 'Please provide a description of the problem.');
      return;
    }
  
    try {
      // Send the problem report to the backend
      const response = await api.post(
        '/reportProblem',  // Replace with your actual backend URL
        {
          jeep_id: resIds,  // Passing the reservation ID as jeep_id
          problemDescription,  // The problem description from the user
        }
      );
  
      if (response.status === 200) {
        Alert.alert('Problem Reported', 'Thank you for reporting the issue!');
        setModalVisible(false); // Close the modal
        setProblemDescription(''); // Clear the description
      } else {
        Alert.alert('Error', 'Failed to report the problem');
      }
    } catch (error) {
      console.error('Error reporting problem:', error);
      Alert.alert('Error', 'An error occurred while reporting the problem');
    }
  };
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
                    top: 46,
                    left: -30,
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
              {showReport && (
                <TouchableOpacity
                onPress={handleReportProblem}
                  style={{
                    position: 'absolute',
                    top: 20,
                    left: -60,
                    backgroundColor: COLORS.primary,
                    paddingVertical: 8,
                    paddingHorizontal: 16,
                    borderRadius: 4,
                    whiteSpace: 'nowrap',
                    minWidth: 'auto',
                  }}
                >
                  <Text style={{ color: COLORS.white, fontSize: 16, flexWrap: 'nowrap' }}>
                    Report a problem
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
            <View style={styles.plateNumberContainer}>
              <Text style={styles.plateNumberLabel}>Plate No.</Text>
              <Text style={styles.plateNumberValue}>{resIds}</Text>
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

<View style={styles.mapContainer}>
  {driverLocation ? (
    <Mapbox.MapView styleURL="mapbox://styles/mapbox/streets-v11" style={styles.mapView}>
      <Mapbox.Camera
        zoomLevel={12}
        centerCoordinate={[driverLocation.longitude, driverLocation.latitude]}
      />

      {/* Driver Location Marker */}
      <Mapbox.PointAnnotation id="driver-marker" coordinate={[driverLocation.longitude, driverLocation.latitude]}>
        <Ionicons name="location" size={20} color={'red'} />
      </Mapbox.PointAnnotation>

      {/* Passenger Location Markers */}
      {ticketLocations.map((ticket, index) => (
        <Mapbox.PointAnnotation key={`ticket-${index}`} id={`ticket-marker-${index}`} coordinate={[ticket.longitude, ticket.latitude]}>
          <Ionicons name="location" size={20} color={'blue'} />
        </Mapbox.PointAnnotation>
      ))}

      {/* Render Route Line using GeoJSON */}
      {routeGeometry && (
        <Mapbox.ShapeSource id="route-source" shape={routeGeometry}>
          <Mapbox.LineLayer
            id="route-layer"
            style={{
              lineColor: 'green',
              lineWidth: 5,
              lineOpacity: 0.8,
            }}
          />
        </Mapbox.ShapeSource>
      )}
    </Mapbox.MapView>
  ) : (
    <Text>Loading location...</Text>
  )}
</View>


        </ScrollView>
      </SafeAreaView>

           {/* Report Problem Modal */}
           <Modal
        visible={modalVisible}
        animationType="slide"
        transparent={true}
        onRequestClose={() => setModalVisible(false)}
      >
        <View style={styles.modalBackground}>
          <View style={styles.modalContainer}>
            <Text style={styles.modalTitle}>Report a Problem</Text>
            <TextInput
              style={styles.textInput}
              placeholder="Describe the problem..."
              value={problemDescription}
              onChangeText={setProblemDescription}
              multiline
              numberOfLines={4}
            />
            <View style={styles.modalButtons}>
              <TouchableOpacity onPress={handleSubmitReport} style={styles.submitButton}>
                <Text style={styles.buttonText}>Submit</Text>
              </TouchableOpacity>
              <TouchableOpacity onPress={() => setModalVisible(false)} style={styles.cancelButton}>
                <Text style={styles.buttonText}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </Modal>

      {/* Navigation Bar */}
      <View style={styles.navBar}>
        <TouchableOpacity style={styles.navButton}>
          <Icon name="home-outline" size={30} color="#007bff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.plusButton} onPress={handlePlusButtonClick}>
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

  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    width: '80%',
    backgroundColor: COLORS.white,
    padding: 20,
    borderRadius: 10,
    elevation: 10,
  },
  modalTitle: {
    fontSize: 18,
    fontWeight: 'bold',
    marginBottom: 10,
    color: COLORS.primary,
  },
  textInput: {
    borderWidth: 1,
    borderColor: COLORS.lightGray,
    padding: 10,
    borderRadius: 8,
    marginBottom: 20,
    height: 100,
    textAlignVertical: 'top',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
  },
  submitButton: {
    backgroundColor: COLORS.secondary,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  cancelButton: {
    backgroundColor: COLORS.danger,
    paddingVertical: 10,
    paddingHorizontal: 20,
    borderRadius: 5,
  },
  buttonText: {
    color: COLORS.white,
    fontSize: 16,
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

export default DriverDashboard;

