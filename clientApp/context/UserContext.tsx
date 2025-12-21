import React, { createContext, useState, useContext, ReactNode, useEffect } from 'react';
import AsyncStorage from '@react-native-async-storage/async-storage';
import { User, Address } from '../types';
import { BYPASS_AUTH, MOCK_USER, MOCK_ADDRESS } from '../config/dev.config';
import ApiService from '../services/api';

interface UserContextType {
  user: User | null;
  addresses: Address[];
  selectedAddress: Address | null;
  setUser: (user: User | null) => void;
  setAddresses: (addresses: Address[]) => void;
  setSelectedAddress: (address: Address | null) => void;
  updateUser: (updates: Partial<User>) => void;
  addAddress: (address: Omit<Address, 'id'>) => Promise<Address>;
  loadAddressesFromAPI: () => Promise<void>;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

const USER_STORAGE_KEY = '@watergo_user';
const ADDRESSES_STORAGE_KEY = '@watergo_addresses';
const SELECTED_ADDRESS_STORAGE_KEY = '@watergo_selected_address';

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);
  const [isLoaded, setIsLoaded] = useState(false);

  // Load persisted data on mount
  useEffect(() => {
    loadPersistedData();
  }, []);

  const loadPersistedData = async () => {
    try {
      if (BYPASS_AUTH) {
        setUser(MOCK_USER);
        setAddresses([MOCK_ADDRESS]);
        // Don't pre-select address - user should select manually
        setSelectedAddress(null);
        setIsLoaded(true);
        return;
      }

      const [userData, addressesData, selectedAddressData] = await Promise.all([
        AsyncStorage.getItem(USER_STORAGE_KEY),
        AsyncStorage.getItem(ADDRESSES_STORAGE_KEY),
        AsyncStorage.getItem(SELECTED_ADDRESS_STORAGE_KEY),
      ]);

      if (userData) setUser(JSON.parse(userData));

      const parsedAddresses = addressesData ? JSON.parse(addressesData) : [];
      setAddresses(parsedAddresses);

      // Only set selected address if it exists in the addresses array
      if (selectedAddressData) {
        const parsedSelectedAddress = JSON.parse(selectedAddressData);
        const addressExists = parsedAddresses.some((addr: Address) => addr.id === parsedSelectedAddress.id);
        if (addressExists) {
          setSelectedAddress(parsedSelectedAddress);
        } else {
          // Address was deleted, clear selection
          setSelectedAddress(null);
          await AsyncStorage.removeItem(SELECTED_ADDRESS_STORAGE_KEY);
        }
      }
    } catch (error) {
      console.error('Failed to load persisted user data:', error);
    } finally {
      setIsLoaded(true);
    }
  };

  // Persist user data whenever it changes
  useEffect(() => {
    if (!isLoaded) return;
    if (user) {
      AsyncStorage.setItem(USER_STORAGE_KEY, JSON.stringify(user));
    } else {
      AsyncStorage.removeItem(USER_STORAGE_KEY);
    }
  }, [user, isLoaded]);

  // Persist addresses whenever they change
  useEffect(() => {
    if (!isLoaded) return;
    if (addresses.length > 0) {
      AsyncStorage.setItem(ADDRESSES_STORAGE_KEY, JSON.stringify(addresses));
    } else {
      AsyncStorage.removeItem(ADDRESSES_STORAGE_KEY);
    }
  }, [addresses, isLoaded]);

  // Persist selected address whenever it changes
  useEffect(() => {
    if (!isLoaded) return;
    if (selectedAddress) {
      AsyncStorage.setItem(SELECTED_ADDRESS_STORAGE_KEY, JSON.stringify(selectedAddress));
    } else {
      AsyncStorage.removeItem(SELECTED_ADDRESS_STORAGE_KEY);
    }
  }, [selectedAddress, isLoaded]);

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    } else {
      // Create a new user object during signup if user doesn't exist yet
      setUser({
        id: '',
        name: updates.name || 'Guest',
        phone: updates.phone || '',
        language: updates.language || 'en',
        ...updates,
      } as User);
    }
  };

  const addAddress = async (address: Omit<Address, 'id'>): Promise<Address> => {
    // Call API first to get the proper ID
    try {
      const savedAddress = await ApiService.addAddress(address);
      console.log('UserContext - Address saved with API, received ID:', savedAddress.id);

      // Add the saved address (with correct ID) to local state
      setAddresses(prev => [...prev, savedAddress]);
      console.log('UserContext - Address added to state:', savedAddress);

      return savedAddress;
    } catch (error) {
      console.error('UserContext - Failed to add address with API:', error);
      // Create a fallback address with temporary ID if API fails
      const fallbackAddress: Address = {
        ...address,
        id: `temp_${Date.now()}`,
      };
      setAddresses(prev => [...prev, fallbackAddress]);
      return fallbackAddress;
    }
  };

  // Load addresses from API (used after login for returning users)
  const loadAddressesFromAPI = async (): Promise<void> => {
    try {
      console.log('UserContext - Loading addresses from API...');
      const apiAddresses = await ApiService.getUserAddresses();
      console.log('UserContext - Loaded addresses from API:', apiAddresses.length);
      if (apiAddresses && apiAddresses.length > 0) {
        setAddresses(apiAddresses);
      }
    } catch (error) {
      console.error('UserContext - Failed to load addresses from API:', error);
    }
  };

  const setSelectedAddressWithLogging = (address: Address | null) => {
    console.log('Setting selected address:', address);
    setSelectedAddress(address);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        addresses,
        selectedAddress,
        setUser,
        setAddresses,
        setSelectedAddress: setSelectedAddressWithLogging,
        updateUser,
        addAddress,
        loadAddressesFromAPI,
      }}
    >
      {children}
    </UserContext.Provider>
  );
};

export const useUser = () => {
  const context = useContext(UserContext);
  if (context === undefined) {
    throw new Error('useUser must be used within a UserProvider');
  }
  return context;
};
