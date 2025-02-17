import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  FlatList,
  StyleSheet,
  TouchableOpacity,
  TextInput,
  Modal,
  Alert,
  Animated,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import api from '../../services/api';

const Driverlist = ({ navigation }) => {
  const [users, setUsers] = useState([]);
  const [modalVisible, setModalVisible] = useState(false);
  const [editMode, setEditMode] = useState(false);
  const [selectedUser, setSelectedUser] = useState(null);
  const [username, setUsername] = useState('');
  const [password, setPassword] = useState('');
  const [lastname, setLastname] = useState('');
  const [firstname, setFirstname] = useState('');
  const [middlename, setMiddlename] = useState('');
  const [cpNumber, setCpNumber] = useState('');

  const [toastVisible, setToastVisible] = useState(false);
  const [toastMessage, setToastMessage] = useState('');
  const [toastType, setToastType] = useState('success');
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const positionAnim = useRef(new Animated.Value(-100)).current;

  // Fetch users when the component loads
  const fetchUsers = async () => {
    try {
      const response = await api.get('/users');
      const driverUsers = response.data.filter(user => user.typeofuser === 'driver');
      setUsers(driverUsers);
    } catch (error) {
      console.error('Error fetching users:', error);
    }
  };

  useEffect(() => {
    fetchUsers();
  }, []);

  const showToast = (message, type = 'success') => {
    setToastMessage(message);
    setToastType(type);
    setToastVisible(true);
  };

  const hideToast = () => {
    Animated.timing(fadeAnim, {
      toValue: 0,
      duration: 300,
      useNativeDriver: true,
    }).start();

    Animated.timing(positionAnim, {
      toValue: -100,
      duration: 300,
      useNativeDriver: true,
    }).start();

    setTimeout(() => {
      setToastVisible(false);
    }, 300);
  };

  useEffect(() => {
    if (toastVisible) {
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 300,
        useNativeDriver: true,
      }).start();

      Animated.timing(positionAnim, {
        toValue: 20,
        duration: 300,
        useNativeDriver: true,
      }).start();

      const timer = setTimeout(() => {
        hideToast();
      }, 3000);

      return () => clearTimeout(timer);
    }
  }, [toastVisible]);

  const getBackgroundColor = () => {
    switch (toastType) {
      case 'success':
        return '#28a745'; // Green for success
      case 'error':
        return '#dc3545'; // Red for error
      case 'info':
        return '#17a2b8'; // Blue for info
      default:
        return '#6c757d'; // Grey for default
    }
  };

  const handleRegisterOrUpdate = async () => {
    if (!username || !password || !lastname || !firstname || !middlename || !cpNumber) {
      showToast('All fields are required.', 'error');
      return;
    }

    try {
      if (editMode) {
        await api.put(`/users/${selectedUser.id}`, { username, password, lastname, firstname, middlename, cp_number: cpNumber, typeofuser: 'driver' });
        setUsers(users.map(user => user.id === selectedUser.id ? { ...user, username, lastname, firstname, middlename, cp_number: cpNumber } : user));
        showToast('User updated successfully!', 'success');
      } else {
        await api.post('/register', { username, password, lastname, firstname, middlename, cp_number: cpNumber, typeofuser: 'driver' });
        fetchUsers(); // Refresh users list
        showToast('User registered successfully!', 'success');
      }
      resetForm();
    } catch (error) {
      showToast('Registration error: ' + error.message, 'error');
    }
  };

  const handleEdit = (user) => {
    setEditMode(true);
    setSelectedUser(user);
    setUsername(user.username);
    setPassword(''); // Do not pre-fill password
    setLastname(user.lastname);
    setFirstname(user.firstname);
    setMiddlename(user.middlename);
    setCpNumber(user.cp_number);
    setModalVisible(true);
  };

  const handleDelete = async (userId) => {
    Alert.alert(
      'Delete User',
      'Are you sure you want to delete this user?',
      [
        {
          text: 'Cancel',
          style: 'cancel',
        },
        {
          text: 'Delete',
          onPress: async () => {
            try {
              await api.delete(`/users/${userId}`);
              setUsers(users.filter(user => user.id !== userId));
              showToast('User deleted successfully!', 'success');
            } catch (error) {
              showToast('Failed to delete user: ' + error.message, 'error');
            }
          },
        },
      ],
      { cancelable: false }
    );
  };

  const resetForm = () => {
    setUsername('');
    setPassword('');
    setLastname('');
    setFirstname('');
    setMiddlename('');
    setCpNumber('');
    setModalVisible(false);
    setEditMode(false);
    setSelectedUser(null);
  };

  const renderItem = ({ item }) => (
    <View style={styles.item}>
      <Text style={styles.name}>{item.lastname} {item.firstname}</Text>
      <View style={styles.buttonContainer}>
        <TouchableOpacity style={styles.editButton} onPress={() => handleEdit(item)}>
          <Icon name="pencil" size={20} color="#fff" />
        </TouchableOpacity>
        <TouchableOpacity style={styles.iconButton} onPress={() => handleDelete(item.id)}>
          <Icon name="trash" size={20} color="#fff" />
        </TouchableOpacity>
      </View>
    </View>
  );

  return (
    <>
      <View style={styles.container}>
        <View style={styles.header}>
          <Text style={styles.title}>Drivers</Text>
          <TouchableOpacity style={styles.addButton} onPress={() => setModalVisible(true)}>
            <Icon name="add" size={24} color="#fff" />
          </TouchableOpacity>
        </View>
        <FlatList
  data={users.sort((a, b) => a.lastname.localeCompare(b.lastname))} // Sort by last name
  renderItem={renderItem}
  keyExtractor={(item) => item.id.toString()}
/>


        {/* Modal for Add/Edit User */}
        <Modal visible={modalVisible} animationType="slide" transparent={true}>
          <View style={styles.modalBackground}>
            <View style={styles.modalContainer}>
              <Text style={styles.modalTitle}>{editMode ? 'Edit User' : 'Add New User'}</Text>

              <TextInput
                style={styles.input}
                placeholder="Username"
                value={username}
                onChangeText={setUsername}
              />
              <TextInput
                style={styles.input}
                placeholder="Password"
                value={password}
                secureTextEntry
                onChangeText={setPassword}
              />
              <TextInput
                style={styles.input}
                placeholder="Last Name"
                value={lastname}
                onChangeText={setLastname}
              />
              <TextInput
                style={styles.input}
                placeholder="First Name"
                value={firstname}
                onChangeText={setFirstname}
              />
              <TextInput
                style={styles.input}
                placeholder="Middle Name"
                value={middlename}
                onChangeText={setMiddlename}
              />
              <TextInput
                style={styles.input}
                placeholder="CP Number"
                value={cpNumber}
                onChangeText={setCpNumber}
                keyboardType="phone-pad"
              />

              <TouchableOpacity style={styles.saveButton} onPress={handleRegisterOrUpdate}>
                <Text style={styles.saveButtonText}>{editMode ? 'Update' : 'Register'}</Text>
              </TouchableOpacity>

              <TouchableOpacity onPress={resetForm}>
                <Text style={styles.cancelButton}>Cancel</Text>
              </TouchableOpacity>
            </View>
          </View>
        </Modal>
      </View>

      {/* Toast */}
      {toastVisible && (
        <Animated.View
          style={[styles.toast, { backgroundColor: getBackgroundColor(), opacity: fadeAnim, transform: [{ translateY: positionAnim }] }]}
        >
          <Icon
            name={toastType === 'success' ? 'checkmark-circle' : 'close-circle'}
            size={20}
            color="white"
            style={styles.toastIcon}
          />
          <Text style={styles.toastText}>{toastMessage}</Text>
        </Animated.View>
      )}
    </>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#f8f8f8',
    paddingTop: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 16,
    marginBottom: 10,
  },
  title: {
    fontSize: 24,
    fontWeight: 'bold',
  },
  addButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
  },
  item: {
    backgroundColor: '#fff',
    padding: 20,
    marginVertical: 8,
    marginHorizontal: 16,
    borderRadius: 8,
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    elevation: 2,
  },
  name: {
    fontSize: 18,
  },
  buttonContainer: {
    flexDirection: 'row',
  },
  iconButton: {
    backgroundColor: 'red',
    padding: 10,
    borderRadius: 5,
    marginLeft: 5,
  },
  editButton: {
    backgroundColor: '#007bff',
    padding: 10,
    borderRadius: 5,
    marginLeft: 5,
  },
  modalBackground: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: 'rgba(0, 0, 0, 0.5)',
  },
  modalContainer: {
    backgroundColor: '#fff',
    padding: 20,
    borderRadius: 10,
    width: '90%',
    maxWidth: 400,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 10 },
    shadowOpacity: 0.1,
    shadowRadius: 5,
  },
  modalTitle: {
    fontSize: 24,
    fontWeight: 'bold',
    marginBottom: 20,
    color: '#333',
    textAlign: 'center',
  },
  input: {
    backgroundColor: '#fff',
    padding: 12,
    marginBottom: 12,
    borderRadius: 8,
    borderWidth: 1,
    borderColor: '#ddd',
    width: '100%',
    fontSize: 16,
  },
  saveButton: {
    backgroundColor: '#28a745',
    padding: 15,
    borderRadius: 8,
    width: '100%',
    alignItems: 'center',
    marginBottom: 15,
  },
  saveButtonText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: 'bold',
  },
  cancelButton: {
    color: '#007bff',
    fontSize: 16,
    textAlign: 'center',
    marginTop: 10,
  },
  toast: {
    position: 'absolute',
    top: 20,
    left: 20,
    right: 20,
    padding: 15,
    borderRadius: 10,
    flexDirection: 'row',
    alignItems: 'center',
    zIndex: 100,
  },
  toastText: {
    color: 'white',
    fontSize: 16,
    marginLeft: 10,
  },
  toastIcon: {
    marginLeft: 10,
  },
});

export default Driverlist;



// import React, { useState, useCallback } from 'react';
// import {
//   View,
//   Text,
//   StyleSheet,
//   FlatList,
//   TouchableOpacity,
//   Alert,
//   StatusBar,
//   SafeAreaView,
//   TextInput,
//   Animated,
//   Image,
// } from 'react-native';
// import { Feather } from '@expo/vector-icons';

// const AnimatedTouchable = Animated.createAnimatedComponent(TouchableOpacity);

// const App = () => {
//   const [drivers, setDrivers] = useState([
//     { 
//       id: '1', 
//       name: 'Juan dela Cruz', 
//       plateNumber: 'ABC 123', 
//       route: 'Guadalupe-Pateros', 
//       status: 'Active',
//       tripCount: 142,
//       rating: 4.8
//     },
//     { 
//       id: '2', 
//       name: 'Pedro Santos', 
//       plateNumber: 'XYZ 789', 
//       route: 'Cubao-Divisoria', 
//       status: 'On Break',
//       tripCount: 98,
//       rating: 4.6
//     },
//     { 
//       id: '3', 
//       name: 'Mario Reyes', 
//       plateNumber: 'DEF 456', 
//       route: 'Alabang-Baclaran', 
//       status: 'Active',
//       tripCount: 215,
//       rating: 4.9
//     },
//   ]);
//   const [searchQuery, setSearchQuery] = useState('');
//   const [selectedFilter, setSelectedFilter] = useState('All');

//   const filters = ['All', 'Active', 'On Break'];

//   const filteredDrivers = drivers.filter(driver => {
//     const matchesSearch = driver.name.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       driver.plateNumber.toLowerCase().includes(searchQuery.toLowerCase()) ||
//       driver.route.toLowerCase().includes(searchQuery.toLowerCase());
    
//     const matchesFilter = selectedFilter === 'All' || driver.status === selectedFilter;
    
//     return matchesSearch && matchesFilter;
//   });

//   const handleEdit = (driver) => {
//     Alert.alert(
//       'Edit Driver',
//       `Edit details for ${driver.name}`,
//       [
//         { text: 'Cancel', style: 'cancel' },
//         { text: 'Edit', onPress: () => console.log('Edit pressed for:', driver.id) },
//       ]
//     );
//   };

//   const handleDelete = (driverId, driverName) => {
//     Alert.alert(
//       'Delete Driver',
//       `Are you sure you want to delete ${driverName}?`,
//       [
//         { text: 'Cancel', style: 'cancel' },
//         {
//           text: 'Delete',
//           onPress: () => setDrivers(drivers.filter(driver => driver.id !== driverId)),
//           style: 'destructive',
//         },
//       ]
//     );
//   };

//   const getStatusColor = (status) => {
//     switch (status.toLowerCase()) {
//       case 'active': return '#10B981';
//       case 'on break': return '#F59E0B';
//       default: return '#6B7280';
//     }
//   };

//   const renderStarRating = (rating) => {
//     const stars = [];
//     for (let i = 1; i <= 5; i++) {
//       stars.push(
//         <Feather
//           key={i}
//           name={i <= rating ? 'star' : 'star'}
//           size={14}
//           color={i <= rating ? '#FCD34D' : '#E5E7EB'}
//           style={{ marginRight: 2 }}
//         />
//       );
//     }
//     return stars;
//   };

//   const renderDriver = ({ item, index }) => (
//     <AnimatedTouchable
//       style={[styles.card, { transform: [{ scale: 1 }] }]}
//       onPress={() => handleEdit(item)}
//       activeOpacity={0.9}
//     >
//       <View style={styles.cardContent}>
//         <View style={styles.driverInfoHeader}>
//           <View style={styles.avatarContainer}>
//             <Text style={styles.avatarText}>
//               {item.name.split(' ').map(n => n[0]).join('')}
//             </Text>
//           </View>
//           <View style={styles.headerInfo}>
//             <Text style={styles.name}>{item.name}</Text>
//             <View style={styles.ratingContainer}>
//               {renderStarRating(item.rating)}
//               <Text style={styles.ratingText}>{item.rating}</Text>
//             </View>
//           </View>
//           <View style={[styles.statusBadge, { backgroundColor: getStatusColor(item.status) }]}>
//             <Text style={styles.statusText}>{item.status}</Text>
//           </View>
//         </View>

//         <View style={styles.detailsContainer}>
//           <View style={styles.detailRow}>
//             <Feather name="truck" size={16} color="#4B5563" />
//             <Text style={styles.detailText}>{item.plateNumber}</Text>
//           </View>
//           <View style={styles.detailRow}>
//             <Feather name="map-pin" size={16} color="#4B5563" />
//             <Text style={styles.detailText}>{item.route}</Text>
//           </View>
//           <View style={styles.detailRow}>
//             <Feather name="activity" size={16} color="#4B5563" />
//             <Text style={styles.detailText}>{item.tripCount} trips completed</Text>
//           </View>
//         </View>

//         <View style={styles.cardActions}>
//           <TouchableOpacity
//             style={[styles.actionButton, styles.editButton]}
//             onPress={() => handleEdit(item)}
//           >
//             <Feather name="edit-2" size={18} color="#fff" />
//             <Text style={styles.actionButtonText}>Edit</Text>
//           </TouchableOpacity>
//           <TouchableOpacity
//             style={[styles.actionButton, styles.deleteButton]}
//             onPress={() => handleDelete(item.id, item.name)}
//           >
//             <Feather name="trash-2" size={18} color="#fff" />
//             <Text style={styles.actionButtonText}>Delete</Text>
//           </TouchableOpacity>
//         </View>
//       </View>
//     </AnimatedTouchable>
//   );

//   return (
//     <SafeAreaView style={styles.container}>
//       <StatusBar barStyle="dark-content" backgroundColor="#F9FAFB" />
      
//       <View style={styles.header}>
//         <View style={styles.headerContent}>
//           <Text style={styles.headerTitle}>Jeepney Drivers</Text>
//           <Text style={styles.headerSubtitle}>{drivers.length} total drivers</Text>
//         </View>
//         <TouchableOpacity style={styles.addButton}>
//           <Feather name="plus" size={24} color="#fff" />
//         </TouchableOpacity>
//       </View>

//       <View style={styles.searchContainer}>
//         <View style={styles.searchBar}>
//           <Feather name="search" size={20} color="#6B7280" />
//           <TextInput
//             style={styles.searchInput}
//             placeholder="Search drivers..."
//             value={searchQuery}
//             onChangeText={setSearchQuery}
//             placeholderTextColor="#9CA3AF"
//           />
//         </View>
        
//         <View style={styles.filterContainer}>
//           {filters.map(filter => (
//             <TouchableOpacity
//               key={filter}
//               style={[
//                 styles.filterButton,
//                 selectedFilter === filter && styles.filterButtonActive
//               ]}
//               onPress={() => setSelectedFilter(filter)}
//             >
//               <Text style={[
//                 styles.filterButtonText,
//                 selectedFilter === filter && styles.filterButtonTextActive
//               ]}>
//                 {filter}
//               </Text>
//             </TouchableOpacity>
//           ))}
//         </View>
//       </View>

//       <FlatList
//         data={filteredDrivers}
//         renderItem={renderDriver}
//         keyExtractor={(item) => item.id}
//         contentContainerStyle={styles.list}
//         showsVerticalScrollIndicator={false}
//       />
//     </SafeAreaView>
//   );
// };

// const styles = StyleSheet.create({
//   container: {
//     flex: 1,
//     backgroundColor: '#F9FAFB',
//   },
//   header: {
//     flexDirection: 'row',
//     justifyContent: 'space-between',
//     alignItems: 'center',
//     padding: 20,
//     backgroundColor: '#fff',
//     borderBottomWidth: 1,
//     borderBottomColor: '#F3F4F6',
//   },
//   headerContent: {
//     flex: 1,
//   },
//   headerTitle: {
//     fontSize: 28,
//     fontWeight: 'bold',
//     color: '#111827',
//     marginBottom: 4,
//   },
//   headerSubtitle: {
//     fontSize: 14,
//     color: '#6B7280',
//   },
//   addButton: {
//     backgroundColor: '#10B981',
//     width: 44,
//     height: 44,
//     borderRadius: 22,
//     justifyContent: 'center',
//     alignItems: 'center',
//     elevation: 2,
//     shadowColor: '#10B981',
//     shadowOffset: { width: 0, height: 4 },
//     shadowOpacity: 0.2,
//     shadowRadius: 8,
//   },
//   searchContainer: {
//     padding: 16,
//     backgroundColor: '#fff',
//     borderBottomWidth: 1,
//     borderBottomColor: '#F3F4F6',
//   },
//   searchBar: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     backgroundColor: '#F3F4F6',
//     paddingHorizontal: 16,
//     borderRadius: 12,
//     marginBottom: 12,
//   },
//   searchInput: {
//     flex: 1,
//     paddingVertical: 12,
//     marginLeft: 8,
//     fontSize: 16,
//     color: '#1F2937',
//   },
//   filterContainer: {
//     flexDirection: 'row',
//     gap: 8,
//   },
//   filterButton: {
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 20,
//     backgroundColor: '#F3F4F6',
//   },
//   filterButtonActive: {
//     backgroundColor: '#10B981',
//   },
//   filterButtonText: {
//     color: '#4B5563',
//     fontSize: 14,
//     fontWeight: '500',
//   },
//   filterButtonTextActive: {
//     color: '#fff',
//   },
//   list: {
//     padding: 16,
//   },
//   card: {
//     backgroundColor: '#fff',
//     borderRadius: 16,
//     marginBottom: 16,
//     elevation: 2,
//     shadowColor: '#000',
//     shadowOffset: { width: 0, height: 2 },
//     shadowOpacity: 0.1,
//     shadowRadius: 8,
//     overflow: 'hidden',
//   },
//   cardContent: {
//     padding: 16,
//   },
//   driverInfoHeader: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 16,
//   },
//   avatarContainer: {
//     width: 48,
//     height: 48,
//     borderRadius: 24,
//     backgroundColor: '#10B981',
//     justifyContent: 'center',
//     alignItems: 'center',
//     marginRight: 12,
//   },
//   avatarText: {
//     color: '#fff',
//     fontSize: 18,
//     fontWeight: 'bold',
//   },
//   headerInfo: {
//     flex: 1,
//   },
//   name: {
//     fontSize: 18,
//     fontWeight: 'bold',
//     color: '#1F2937',
//     marginBottom: 4,
//   },
//   ratingContainer: {
//     flexDirection: 'row',
//     alignItems: 'center',
//   },
//   ratingText: {
//     marginLeft: 4,
//     color: '#4B5563',
//     fontSize: 14,
//   },
//   statusBadge: {
//     paddingHorizontal: 12,
//     paddingVertical: 6,
//     borderRadius: 20,
//   },
//   statusText: {
//     color: '#fff',
//     fontSize: 12,
//     fontWeight: '600',
//   },
//   detailsContainer: {
//     backgroundColor: '#F9FAFB',
//     padding: 12,
//     borderRadius: 12,
//     marginBottom: 16,
//   },
//   detailRow: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     marginBottom: 8,
//   },
//   detailText: {
//     marginLeft: 8,
//     color: '#4B5563',
//     fontSize: 14,
//   },
//   cardActions: {
//     flexDirection: 'row',
//     justifyContent: 'flex-end',
//     gap: 8,
//   },
//   actionButton: {
//     flexDirection: 'row',
//     alignItems: 'center',
//     paddingHorizontal: 16,
//     paddingVertical: 8,
//     borderRadius: 8,
//     gap: 6,
//   },
//   editButton: {
//     backgroundColor: '#10B981',
//   },
//   deleteButton: {
//     backgroundColor: '#EF4444',
//   },
//   actionButtonText: {
//     color: '#fff',
//     fontSize: 14,
//     fontWeight: '500',
//   },
// });

// export default App;