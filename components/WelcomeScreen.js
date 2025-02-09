import React, { useEffect, useState } from 'react';
import { 
  View, 
  Text, 
  StyleSheet, 
  TouchableOpacity, 
  Image, 
  Animated, 
  Dimensions,
  StatusBar,
  Alert
} from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';
import Modal from 'react-native-modal';
import api from '../services/api';
const { width, height } = Dimensions.get('window');

const WelcomeScreen = ({ navigation }) => {
    const [isModalVisible, setModalVisible] = useState(false);
    const [selectedDestination, setSelectedDestination] = useState(null);

    const toggleModal = () => {
        setModalVisible(!isModalVisible);
    };

    const saveSelection = async () => {
        if (selectedDestination) {
            try {
                const response = await api.post('/trips', {
                    destination: selectedDestination,
                });

                if (response.status === 200) {
                    navigation.navigate('NearestJeep', { trips: response.data, selectedDestination });
                    toggleModal();
                } else {
                    Alert.alert('Error', response.data.message || 'Failed to fetch trips');
                }
            } catch (error) {
                Alert.alert('Error', 'Unable to connect to server');
            }
        } else {
            alert('Please select a destination!');
        }
    };

    const handleSelection = (destination) => {
        setSelectedDestination(destination);
    };

    const fadeAnim = new Animated.Value(0);
    const slideAnim = new Animated.Value(50);
    const scaleAnim = new Animated.Value(0.9);

    useEffect(() => {
        Animated.parallel([
            Animated.timing(fadeAnim, {
                toValue: 1,
                duration: 1000,
                useNativeDriver: true,
            }),
            Animated.spring(slideAnim, {
                toValue: 0,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
            Animated.spring(scaleAnim, {
                toValue: 1,
                tension: 50,
                friction: 7,
                useNativeDriver: true,
            }),
        ]).start();
    }, []);

    return (
        <View style={styles.container}>
            <StatusBar barStyle="dark-content" />
            
            {/* Background Gradient */}
            <View style={styles.gradient}>
                <View style={styles.topDecoration}>
                    <View style={styles.wave} />
                </View>
            </View>

            {/* Header Section */}
            <Animated.View 
                style={[
                    styles.header,
                    { opacity: fadeAnim, transform: [{ translateY: slideAnim }] }
                ]}
            >
                <TouchableOpacity 
                    style={styles.backButton}
                    onPress={() => navigation.goBack()}
                >
                    <View style={styles.iconButton}>
                        <Icon name="arrow-back-ios" size={24} color="#4a90e2" />
                    </View>
                </TouchableOpacity>

                <TouchableOpacity 
                    style={styles.loginButton}
                    onPress={() => navigation.navigate('Login')}
                >
                    <View style={styles.loginButtonStyle}>
                        <Text style={styles.loginText}>Login</Text>
                    </View>
                </TouchableOpacity>
            </Animated.View>

            {/* Brand Section */}
            <Animated.View 
                style={[
                    styles.brandContainer,
                    { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
                ]}
            >
                <Text style={styles.brandText}>BGS</Text>
                <Text style={styles.transcoText}>TRANSCO</Text>
                <Text style={styles.tagline}>Your Premium Transport Partner</Text>
            </Animated.View>

            {/* Image Section */}
            <Animated.View 
                style={[
                    styles.imageContainer,
                    { opacity: fadeAnim, transform: [{ scale: scaleAnim }] }
                ]}
            >
                <Image
                    source={require('./welcome.png')}
                    style={styles.logo}
                    resizeMode="contain"
                />
            </Animated.View>

            {/* Footer Section */}
            <Animated.View 
                style={[
                    styles.footer,
                    { opacity: fadeAnim, transform: [{ translateY: Animated.multiply(slideAnim, -1) }] }
                ]}
            >
                <Text style={styles.footerText}>
                    Travel with comfort and style
                </Text>
                <TouchableOpacity
                    style={styles.bookNowButton}
                    onPress={toggleModal}
                    activeOpacity={0.8}
                >
                    <View style={styles.gradientButton}>
                        <Text style={styles.bookNowText}>BOOK NOW</Text>
                    </View>
                </TouchableOpacity>
            </Animated.View>

            {/* Modal */}
            <Modal isVisible={isModalVisible} onBackdropPress={toggleModal} style={styles.modal}>
                <View style={styles.modalContent}>
                    <Text style={styles.questionText}>Where would you like to go?</Text>

                    {/* Destination Options */}
                    {['Gubat', 'Sorsogon'].map((destination) => (
                        <TouchableOpacity
                            key={destination}
                            style={[
                                styles.optionButton,
                                selectedDestination === destination && styles.selectedOption,
                            ]}
                            onPress={() => handleSelection(destination)}
                        >
                            <Icon
                                name="location-on"
                                size={20}
                                color={selectedDestination === destination ? '#fff' : '#007bff'}
                            />
                            <Text
                                style={[
                                    styles.optionText,
                                    selectedDestination === destination && styles.selectedOptionText,
                                ]}
                            >
                                {destination}
                            </Text>
                        </TouchableOpacity>
                    ))}

                    {/* Modal Buttons */}
                    <View style={styles.modalButtons}>
                        <TouchableOpacity style={styles.modalButtonClose} onPress={toggleModal}>
                            <Text style={styles.buttonTextSecondary}>Close</Text>
                        </TouchableOpacity>

                        <TouchableOpacity style={styles.modalButtonSave} onPress={saveSelection}>
                            <Text style={styles.buttonText}>Save</Text>
                        </TouchableOpacity>
                    </View>
                </View>
            </Modal>
        </View>
    );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    backgroundColor: '#ffffff',
  },
  gradient: {
    position: 'absolute',
    left: 0,
    right: 0,
    top: 0,
    height: height,
    backgroundColor: 'linear-gradient(180deg, #ffffff, #e8f3ff, #f5f9ff)', // Adjust as needed for custom gradient
  },
  topDecoration: {
    position: 'absolute',
    top: 0,
    left: 0,
    right: 0,
    height: 200,
    overflow: 'hidden',
  },
  wave: {
    position: 'absolute',
    top: -100,
    left: 0,
    right: 0,
    height: 200,
    backgroundColor: '#e1f0ff', // Color for the wave
    borderBottomLeftRadius: 50,
    borderBottomRightRadius: 50,
  },
  header: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    alignItems: 'center',
    paddingHorizontal: 20,
    paddingTop: 60,
    paddingBottom: 20,
    zIndex: 1,
  },
  iconButton: {
    backgroundColor: '#ffffff',
    borderRadius: 25,
    padding: 12,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButton: {
    borderRadius: 25,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 4,
    elevation: 3,
  },
  loginButtonStyle: {
    paddingVertical: 12,
    paddingHorizontal: 24,
    backgroundColor: '#4a90e2', // Blue color for login button
  },
  loginText: {
    color: '#fff',
    fontWeight: '600',
    fontSize: 16,
  },
  brandContainer: {
    alignItems: 'center',
    marginTop: 20,
  },
  brandText: {
    fontSize: 48,
    fontWeight: '800',
    color: '#4a90e2',
    letterSpacing: 8,
  },
  transcoText: {
    fontSize: 24,
    fontWeight: '600',
    color: '#357abd',
    letterSpacing: 4,
    marginTop: -5,
  },
  tagline: {
    fontSize: 16,
    color: '#666666',
    marginTop: 10,
    fontWeight: '500',
  },
  imageContainer: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    padding: 20,
  },
  logo: {
    width: width * 0.8,
    height: height * 0.3,
  },
  footer: {
    alignItems: 'center',
    paddingBottom: 40,
    paddingHorizontal: 20,
  },
  footerText: {
    fontSize: 18,
    color: '#666666',
    marginBottom: 20,
    fontWeight: '500',
  },
  bookNowButton: {
    width: '90%',
    height: 70,
    borderRadius: 35,
    overflow: 'hidden',
    shadowColor: '#000',
    shadowOffset: {
      width: 0,
      height: 4,
    },
    shadowOpacity: 0.2,
    shadowRadius: 4.65,
    elevation: 8,
  },
  gradientButton: {
    flex: 1,
    flexDirection: 'row',
    alignItems: 'center',
    justifyContent: 'center',
    paddingHorizontal: 20,
    backgroundColor: '#4a90e2', // Blue color for button
  },
  bookNowText: {
    color: '#fff',
    fontSize: 18,
    fontWeight: '700',
    marginRight: 10,
  },
  modal: {
    justifyContent: 'flex-end',
    margin: 0,
  },
  modalContent: {
    backgroundColor: '#fff',
    borderTopLeftRadius: 25,
    borderTopRightRadius: 25,
    padding: 20,
  },
  questionText: {
    fontSize: 20,
    fontWeight: 'bold',
    marginBottom: 20,
  },
  optionButton: {
    flexDirection: 'row',
    alignItems: 'center',
    padding: 15,
    borderBottomWidth: 1,
    borderBottomColor: '#eee',
  },
  optionText: {
    fontSize: 18,
    color: '#555',
    marginLeft: 10,
  },
  selectedOption: {
    backgroundColor: '#4a90e2',
  },
  selectedOptionText: {
    color: '#fff',
  },
  modalButtons: {
    flexDirection: 'row',
    justifyContent: 'space-between',
    marginTop: 30,
  },
  modalButtonClose: {
    width: '45%',
    padding: 12,
    borderRadius: 25,
    backgroundColor: '#ddd',
    alignItems: 'center',
  },
  modalButtonSave: {
    width: '45%',
    padding: 12,
    borderRadius: 25,
    backgroundColor: '#4a90e2',
    alignItems: 'center',
  },
  buttonText: {
    color: '#fff',
    fontSize: 16,
    fontWeight: 'bold',
  },
  buttonTextSecondary: {
    color: '#4a90e2',
    fontSize: 16,
    fontWeight: 'bold',
  },
});

export default WelcomeScreen;
