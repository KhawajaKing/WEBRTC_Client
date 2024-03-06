'use client' // This line is unnecessary and might be causing issues

import AsyncStorage from '@react-native-async-storage/async-storage';
import React, { createContext, useState, useEffect } from 'react'; // Import React and other necessary modules

// Create a context
const VariableContext = createContext();

// Create a global state provider component
const GlobalStateProvider = ({ children }) => {
  // Initialize currentUser as null initially
  const [currentUser, setCurrentUser] = useState(null);

  // Define setUser function
  const setUser = async (data) => {
    const string=JSON.stringify(data[0])
    await AsyncStorage.setItem('userMail', string); // Save email to AsyncStorage
    setCurrentUser(data[0]); // Update currentUser state
  };

  // Define removeUser function
  const removeUser = async () => {
    await AsyncStorage.removeItem('userMail'); // Remove email from AsyncStorage
    setCurrentUser(null); // Update currentUser state to null
  };

  // Load currentUser from AsyncStorage when component mounts
  useEffect(() => {
    const loadUser = async () => {
      try {
        const user = await AsyncStorage.getItem('userMail'); // Retrieve email from AsyncStorage
        const parse=JSON.parse(user)
        setCurrentUser(parse); // Update currentUser state
      } catch (error) {
        console.error('Error loading user:', error);
      }
    };

    loadUser(); // Call loadUser function
  }, []); // Empty dependency array ensures this effect only runs once

  // Provide currentUser, setUser, and removeUser to child components via context
  return (
    <VariableContext.Provider value={{ currentUser, setUser, removeUser }}>
      {children}
    </VariableContext.Provider>
  );
};

// Export GlobalStateProvider and VariableContext
export { GlobalStateProvider, VariableContext };