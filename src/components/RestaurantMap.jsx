import React, { useEffect, useState, useRef } from 'react';
import axios from 'axios';
import RegisterButton from './RegisterButton';
import MarkerInfo from './MarkerInfo';


const KAKAO_APP_KEY = '13ae7eab289fd28ffbdc282b63f4f621';

const loadKakaoMaps = () => {
  return new Promise((resolve, reject) => {
    if (window.kakao && window.kakao.maps) {
      resolve(window.kakao.maps);
    } else {
      const script = document.createElement('script');
      script.type = 'text/javascript';
      script.src = `//dapi.kakao.com/v2/maps/sdk.js?appkey=${KAKAO_APP_KEY}&libraries=services&autoload=false`;
      script.onload = () => window.kakao.maps.load(() => resolve(window.kakao.maps));
      script.onerror = reject;
      document.head.appendChild(script);
    }
  });
};

const RestaurantMap = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [selectedPlace, setSelectedPlace] = useState(null);
  const [markerInfo, setMarkerInfo] = useState(null);
  const mapRef = useRef(null);
  const [map, setMap] = useState(null);
  const [kakaoMaps, setKakaoMaps] = useState(null);
  const [registeredMarkers, setRegisteredMarkers] = useState([]);
  const [searchMarkers, setSearchMarkers] = useState([]);


  const clearSearchMarkers = () => {
    searchMarkers.forEach(marker => marker.setMap(null));
    setSearchMarkers([]);
  };

  useEffect(() => {
    let isMounted = true;
    loadKakaoMaps()
      .then((maps) => {
        if (isMounted) {
          setKakaoMaps(maps);
        }
      })
      .catch((error) => console.error('Failed to load Kakao Maps:', error));

    return () => {
      isMounted = false;
    };
  }, []);

  useEffect(() => {
    if (kakaoMaps && mapRef.current && !map) {
      const options = {
        center: new kakaoMaps.LatLng(37.566826, 126.9786567),
        level: 3
      };
      const newMap = new kakaoMaps.Map(mapRef.current, options);
      setMap(newMap);
      loadRegisteredMarkers(newMap, kakaoMaps);
    }
  }, [kakaoMaps, map]);

  const loadRegisteredMarkers = async (mapInstance, maps) => {
    try {
      const token = localStorage.getItem('token');
      const response = await axios.get('https://9c7a-218-234-149-213.ngrok-free.app/api/v1/restaurant', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'ngrok-skip-browser-warning': true
        }
      });
      const newMarkers = response.data.map(restaurant => 
        displayMarker(mapInstance, maps, restaurant, true)
      );
      setRegisteredMarkers(newMarkers);
    } catch (error) {
      console.error('Failed to load registered markers:', error);
    }
  };
  const handleSearch = (e) => {
    e.preventDefault();
    if (map && kakaoMaps && searchQuery) {
      const ps = new kakaoMaps.services.Places();
      ps.keywordSearch(searchQuery, (data, status) => {
        if (status === kakaoMaps.services.Status.OK) {
          const place = data[0]; // Get the first result
          
          // Check in both registered and search markers
          const existingRegisteredMarker = registeredMarkers.find(marker => 
            marker.getPosition().getLat().toFixed(7) === parseFloat(place.y).toFixed(7) && 
            marker.getPosition().getLng().toFixed(7) === parseFloat(place.x).toFixed(7)
          );
  
          const existingSearchMarker = searchMarkers.find(marker => 
            marker.getPosition().getLat().toFixed(7) === parseFloat(place.y).toFixed(7) && 
            marker.getPosition().getLng().toFixed(7) === parseFloat(place.x).toFixed(7)
          );
  
          if (existingRegisteredMarker || existingSearchMarker) {
            // If a marker already exists at this location, center the map on it
            clearSearchMarkers();
            const existingMarker = existingRegisteredMarker || existingSearchMarker;
            map.setCenter(existingMarker.getPosition());
            map.setLevel(3); // Zoom in to a closer level
            setSelectedPlace(place);

          } else {
            // If no marker exists, clear existing search markers and create a new one
            clearSearchMarkers();
            const bounds = new kakaoMaps.LatLngBounds();
            const newMarker = displayMarker(map, kakaoMaps, place, false);
            setSearchMarkers([newMarker]);
            bounds.extend(newMarker.getPosition());
            map.setBounds(bounds);
            setSelectedPlace(place);

          }
        }
      });
    }
  };
  const displayMarker = (mapInstance, maps, place, isRegistered) => {
    const markerPosition = new maps.LatLng(place.y, place.x);
    let markerImage;
  
    if (isRegistered) {
      markerImage = new maps.MarkerImage(
        'https://velog.velcdn.com/images/steven0507/post/89548d24-4b92-458d-b135-88026b9da1fc/image.png',
        new maps.Size(32, 32),
        { offset: new maps.Point(16, 32) }
      );
    }
  
    const marker = new maps.Marker({
      map: mapInstance,
      position: markerPosition,
      image: isRegistered ? markerImage : null
    });
  
    maps.event.addListener(marker, 'click', () => {
      setSelectedPlace(place);
      setMarkerInfo(place);
    });
  
    return marker;
  };
 
  useEffect(() => {
    if (map && kakaoMaps) {
      kakaoMaps.event.addListener(map, 'zoom_changed', () => {
        console.log('Zoom level changed');
        if (selectedPlace) {
          setSelectedPlace(selectedPlace);
        }
      });
    }
  }, [map, kakaoMaps, selectedPlace]);

  return (
    <div className="restaurant-map">
      <form onSubmit={handleSearch} className="search-bar">
        <input
          type="text"
          value={searchQuery}
          onChange={(e) => setSearchQuery(e.target.value)}
          placeholder="Search for restaurants"
        />
        <button type="submit">Search</button>
      </form>
      <div ref={mapRef} className="map-container"></div>
      
      {markerInfo && <MarkerInfo place={markerInfo} onClose={() => setMarkerInfo(null)} />}
    </div>
  );
};

export default RestaurantMap;
