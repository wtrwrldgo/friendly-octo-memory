import { useState } from 'react';
import NavigationService, { NavigationApp } from '../services/navigation.service';

export function useNavigationPicker() {
  const [isVisible, setIsVisible] = useState(false);
  const [destination, setDestination] = useState<{
    latitude: number;
    longitude: number;
    label?: string;
  } | null>(null);

  const showPicker = (latitude: number, longitude: number, label?: string) => {
    setDestination({ latitude, longitude, label });
    setIsVisible(true);
  };

  const hidePicker = () => {
    setIsVisible(false);
  };

  const handleSelectApp = async (app: NavigationApp) => {
    if (!destination) return;

    try {
      await NavigationService.navigateTo(
        destination.latitude,
        destination.longitude,
        destination.label,
        app
      );
    } catch (error: any) {
      console.error('Navigation error:', error);
      // Optionally show error to user
    }
  };

  return {
    isVisible,
    showPicker,
    hidePicker,
    handleSelectApp,
  };
}
