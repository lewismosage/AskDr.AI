// src/lib/apiHelpers.ts
import api from './api';

export const fetchNearbyClinics = (
  latitude: number,
  longitude: number,
  radius_km = 5
) => {
  return api.post('/clinics/nearby/', {
    latitude,
    longitude,
    radius_km,
  });
};
