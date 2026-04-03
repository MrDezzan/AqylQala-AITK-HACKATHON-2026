import { TileLayer } from 'react-leaflet';

// Professional TomTom Traffic Flow Integration
// Note: You can get a free API Key at https://developer.tomtom.com/ (2,500 calls/day)
// Using Vite environment variables (VITE_TOMTOM_API_KEY)
const TOMTOM_TRAFFIC_KEY = import.meta.env.VITE_TOMTOM_API_KEY || 'YOUR_TOMTOM_API_KEY_HERE';

export default function TrafficLayer() {
  // Restored to the original working v4 format with {s} subdomains
  // style: relative (Original standard style)
  
  const trafficUrl = `https://{s}.api.tomtom.com/traffic/map/4/tile/flow/relative/{z}/{x}/{y}.png?key=${TOMTOM_TRAFFIC_KEY}`;

  return (
    <TileLayer
      url={trafficUrl}
      subdomains={['a', 'b', 'c', 'd']}
      opacity={0.8}
      zIndex={500} // Set below markers (600+) for better visibility
      className="traffic-tiles-overlay"
      attribution='&copy; <a href="https://www.tomtom.com/en_gb/legal/terms-and-conditions/">TomTom</a>'
    />
  );
}
