import { useEffect } from 'react';
import { useMap } from 'react-leaflet';
import L from 'leaflet';

/**
 * Custom Geolocation control to center the map on the user's position.
 * Best practice from React-Leaflet documentation.
 */
const LocateControl = () => {
  const map = useMap();

  useEffect(() => {
    map.on('locationfound', (e) => {
      map.flyTo(e.latlng, 16);
      
      // Optional marker for user location
      L.circle(e.latlng, { radius: e.accuracy, color: '#3B82F6', fillOpacity: 0.1 }).addTo(map);
      L.marker(e.latlng, {
        icon: L.divIcon({
          className: 'user-location-marker',
          html: '<div style="background-color: #3B82F6; width: 12px; height: 12px; border-radius: 50%; border: 2px solid white; box-shadow: 0 0 10px #3B82F6"></div>',
          iconSize: [12, 12],
          iconAnchor: [6, 6]
        })
      }).addTo(map);
    });

    map.on('locationerror', (e) => {
      console.error('[Geolocation Error]', e.message);
      // alert('Не удалось определить ваше местоположение');
    });
  }, [map]);

  return null;
};

export default LocateControl;
