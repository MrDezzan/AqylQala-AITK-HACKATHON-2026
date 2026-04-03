import { useEffect } from 'react';
import { useMap } from 'react-leaflet';

interface MapResizerProps {
  toggle: any; // React state like isReporting or selectedProblem
}

/**
 * Ensures the map tiles are correctly updated when the layout changes.
 * Especially useful when a sidebar opens/closes.
 */
const MapResizer = ({ toggle }: MapResizerProps) => {
  const map = useMap();

  useEffect(() => {
    // Small delay to allow the DOM to settle before recalculating map size
    const timer = setTimeout(() => {
      map.invalidateSize({ animate: true });
    }, 400);

    return () => clearTimeout(timer);
  }, [map, toggle]);

  return null;
};

export default MapResizer;
