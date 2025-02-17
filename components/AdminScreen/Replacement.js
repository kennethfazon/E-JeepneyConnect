import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import { Picker } from '@react-native-picker/picker';
import Toast from 'react-native-toast-message';
import api from '../../services/api'; // Ensure this is pointing to the correct api service

const Replacement = () => {
    const [problemJeeps, setProblemJeeps] = useState([]);
    const [jeeps, setJeeps] = useState([]);
    const [selectedJeeps, setSelectedJeeps] = useState({}); // Track selected jeeps per problem jeep

    useEffect(() => {
        fetchProblemJeeps();
    }, []);

    // Fetch problem jeeps from the backend
    const fetchProblemJeeps = async () => {
        try {
            const response = await api.get('/api/problem-jeeps');
            setProblemJeeps(response.data);
        } catch (error) {
            console.error('Error fetching problem jeeps:', error);
        }
    };

    useEffect(() => {
        // Fetch available jeeps with problem = NULL from backend using axios
        const fetchAvailableJeeps = async () => {
          try {
            const response = await api.get('/fetchAvailableJeeps'); // Adjust the URL if needed
            setJeeps(response.data); // Set the jeep data to state
          } catch (error) {
            console.error('Error fetching available jeeps:', error);
          }
        };
    
        fetchAvailableJeeps();
    }, []);

 

    const handlePickerChange = (jeepId, selectedJeepId) => {
        setSelectedJeeps(prevSelectedJeeps => ({
            ...prevSelectedJeeps,
            [jeepId]: selectedJeepId
        }));
    };

    const handleTransfer = async (problemJeepId) => {
        const replacementJeepId = selectedJeeps[problemJeepId];

        if (!replacementJeepId) {
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'Please select a replacement jeepney.',
            });
            return;
        }

        try {
            const response = await api.post('/transfer-passengers', {
                problematicJeepId: problemJeepId,
                replacementJeepId: replacementJeepId
            });

            Toast.show({
                type: 'success',
                text1: 'Success',
                text2: 'Passengers transferred successfully.',
            });
        } catch (error) {
            console.error('Error during passenger transfer:', error);
            Toast.show({
                type: 'error',
                text1: 'Error',
                text2: 'An error occurred while transferring passengers.',
            });
        }
    };

    return (
        <ScrollView style={{ padding: 20, backgroundColor: '#f4f4f4' }}>
            <Text style={{ fontSize: 26, fontWeight: 'bold', marginBottom: 20, textAlign: 'center', color: '#333' }}>🚍 Jeepney Replacement</Text>
            {problemJeeps.map(problemJeep => (
                <View key={problemJeep.jeep_id} style={{ marginBottom: 20, padding: 20, borderRadius: 12, backgroundColor: '#ffffff', shadowColor: '#000', shadowOffset: { width: 0, height: 4 }, shadowOpacity: 0.1, shadowRadius: 6, elevation: 6 }}>
                    <Text style={{ fontSize: 18, fontWeight: 'bold', color: '#d9534f', marginBottom: 8 }}>🚨 Problematic Jeepney: {problemJeep.plate_number}</Text>
                    <Text style={{ fontSize: 16, marginBottom: 10, color: '#555' }}>Select a replacement jeepney:</Text>
                    <View style={{ borderWidth: 1, borderColor: '#ddd', borderRadius: 8, overflow: 'hidden', marginBottom: 12 }}>
                        <Picker
                            selectedValue={selectedJeeps[problemJeep.jeep_id] || ''}
                            onValueChange={(itemValue) => handlePickerChange(problemJeep.jeep_id, itemValue)}
                        >
                            <Picker.Item label="Select a jeep" value="" />
                            {jeeps.map((jeep) => (
                                <Picker.Item key={jeep.jeep_id} label={jeep.plate_number} value={jeep.jeep_id} />
                            ))}
                        </Picker>
                    </View>
                    <TouchableOpacity onPress={() => handleTransfer(problemJeep.jeep_id)} style={{ backgroundColor: '#007bff', padding: 14, borderRadius: 8, alignItems: 'center' }}>
                        <Text style={{ color: 'white', fontSize: 16, fontWeight: 'bold' }}>🔄 Transfer Passengers</Text>
                    </TouchableOpacity>
                </View>
            ))}
            <Toast />
        </ScrollView>
    );
};

export default Replacement;
