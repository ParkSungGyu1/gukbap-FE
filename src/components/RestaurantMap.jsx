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
      const response = await axios.get('https://ad39-218-234-149-213.ngrok-free.app/api/v1/restaurant', {
        headers: { 
          Authorization: `Bearer ${token}`,
          'ngrok-skip-browser-warning': true
        }
      });
      response.data.forEach((restaurant) => {
        displayMarker(mapInstance, maps, restaurant);
      });
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
          const bounds = new kakaoMaps.LatLngBounds();
          const place = data[0]; // Get the first result
          setSelectedPlace(place);
          displayMarker(map, kakaoMaps, place);
          bounds.extend(new kakaoMaps.LatLng(place.y, place.x));
          map.setBounds(bounds);
        }
      });
    }
  };

  const displayMarker = (mapInstance, maps, place) => {
    const marker = new maps.Marker({
      map: mapInstance,
      position: new maps.LatLng(place.y, place.x)
    });

    maps.event.addListener(marker, 'click', () => {
      setSelectedPlace(place);
      setMarkerInfo(place);
    });
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
      {selectedPlace && <RegisterButton place={selectedPlace} />}
      {markerInfo && <MarkerInfo place={markerInfo} onClose={() => setMarkerInfo(null)} />}
    </div>
  );
};

export default RestaurantMap;
