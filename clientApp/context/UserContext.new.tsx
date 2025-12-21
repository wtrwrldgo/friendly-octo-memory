// DEPRECATED: This file is a compatibility shim.
// New code should use stores/useUserStore.ts and stores/useAddressStore.ts instead.

import React, { ReactNode, useEffect } from 'react';
import { useUserStore } from '../stores/useUserStore';
import { useAddressStore } from '../stores/useAddressStore';
import { User, Address } from '../types';
import ApiService from '../services/api';

// Re-export hook for backward compatibility
export const useUser = () => {
  const user = useUserStore((state) => state.user);
  const setUser = useUserStore((state) => state.setUser);

  const addresses = useAddressStore((state) => state.addresses);
  const setAddresses = useAddressStore((state) => state.setAddresses);
  const selectedAddress = useAddressStore((state) => state.selectedAddress);
  const setSelectedAddress = useAddressStore((state) => state.setSelectedAddress);
  const addAddressToStore = useAddressStore((state) => state.addAddress);

  const updateUser = async (updates: Partial<User>) => {
    if (user) {
      const updatedUser = { ...user, ...updates };
      await setUser(updatedUser);
    }
  };

  const addAddress = async (address: Omit<Address, 'id'>): Promise<Address> => {
    const newAddress = await ApiService.addAddress(address);
    addAddressToStore(newAddress);
    return newAddress;
  };

  return {
    user,
    addresses,
    selectedAddress,
    setUser,
    setAddresses,
    setSelectedAddress,
    updateUser,
    addAddress,
  };
};

// Empty provider for backward compatibility
export const UserProvider = ({ children }: { children: ReactNode }) => {
  const loadUser = useUserStore((state) => state.loadUser);
  const loadToken = useUserStore((state) => state.loadToken);
  const loadOnboardingStatus = useUserStore((state) => state.loadOnboardingStatus);
  const loadSelectedAddress = useAddressStore((state) => state.loadSelectedAddress);

  useEffect(() => {
    loadUser();
    loadToken();
    loadOnboardingStatus();
    loadSelectedAddress();
  }, []);

  return <>{children}</>;
};
