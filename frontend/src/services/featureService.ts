// src/services/featureService.ts
import axios from 'axios';

export const checkFeaturePermission = async (featureName: string): Promise<boolean> => {
  try {
    const response = await axios.get(`/api/features/check/?feature=${featureName}`);
    return response.data.has_access;
  } catch (error) {
    console.error('Error checking feature permission:', error);
    return false;
  }
};

export const recordFeatureUsage = async (featureName: string): Promise<void> => {
  try {
    await axios.post('/api/features/record-usage/', { feature: featureName });
  } catch (error) {
    console.error('Error recording feature usage:', error);
  }
};