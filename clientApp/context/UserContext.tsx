import React, { createContext, useState, useContext, ReactNode } from 'react';
import { User, Address } from '../types';

interface UserContextType {
  user: User | null;
  addresses: Address[];
  selectedAddress: Address | null;
  setUser: (user: User | null) => void;
  setAddresses: (addresses: Address[]) => void;
  setSelectedAddress: (address: Address | null) => void;
  updateUser: (updates: Partial<User>) => void;
  addAddress: (address: Address) => void;
}

const UserContext = createContext<UserContextType | undefined>(undefined);

export const UserProvider: React.FC<{ children: ReactNode }> = ({ children }) => {
  const [user, setUser] = useState<User | null>(null);
  const [addresses, setAddresses] = useState<Address[]>([]);
  const [selectedAddress, setSelectedAddress] = useState<Address | null>(null);

  const updateUser = (updates: Partial<User>) => {
    if (user) {
      setUser({ ...user, ...updates });
    }
  };

  const addAddress = (address: Address) => {
    setAddresses([...addresses, address]);
  };

  return (
    <UserContext.Provider
      value={{
        user,
        addresses,
        selectedAddress,
        setUser,
        setAddresses,
        setSelectedAddress,
        updateUser,
        addAddress,
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
