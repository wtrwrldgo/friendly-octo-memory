/**
 * Background Location Task
 * Defines the task that runs when the app is in background
 */

import * as TaskManager from 'expo-task-manager';
import * as Location from 'expo-location';
import { BACKGROUND_LOCATION_TASK } from '../services/location.service';
import { useDriverStore } from '../stores/useDriverStore';
import ApiService from '../services/api.service';

// Define the location data type
interface LocationTaskData {
  locations: Location.LocationObject[];
}

// Define the background location task
TaskManager.defineTask(
  BACKGROUND_LOCATION_TASK,
  async ({ data, error }: TaskManager.TaskManagerTaskBody<LocationTaskData>) => {
    if (error) {
      console.error('Background location task error:', error);
      return;
    }

    if (data) {
      const { locations } = data as LocationTaskData;

      if (locations && locations.length > 0) {
        const location = locations[0];

        console.log('[Background] Location update:', {
          lat: location.coords.latitude.toFixed(6),
          lng: location.coords.longitude.toFixed(6),
          timestamp: new Date(location.timestamp).toISOString(),
        });

        try {
          // Get driver from store
          const driver = useDriverStore.getState().driver;
          const activeOrder = useDriverStore.getState().activeOrder;

          if (driver && activeOrder) {
            // Update location in backend
            await ApiService.updateDriverLocation(
              driver.id,
              location.coords.latitude,
              location.coords.longitude
            );

            // Update local store
            useDriverStore.getState().updateCurrentLocation({
              latitude: location.coords.latitude,
              longitude: location.coords.longitude,
              accuracy: location.coords.accuracy,
              altitude: location.coords.altitude,
              heading: location.coords.heading,
              speed: location.coords.speed,
              timestamp: location.timestamp,
            });

            console.log('[Background] Location updated in backend');
          } else {
            console.log('[Background] No active order, skipping location update');
          }
        } catch (error) {
          console.error('[Background] Error updating location:', error);
        }
      }
    }
  }
);

// Export a function to verify task is registered
export const isBackgroundTaskRegistered = async (): Promise<boolean> => {
  return await TaskManager.isTaskDefined(BACKGROUND_LOCATION_TASK);
};
