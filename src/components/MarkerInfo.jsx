import React from 'react';
import RegisterButton from './RegisterButton';

const MarkerInfo = ({ place, onClose }) => {
  return (
    <div className="marker-info">
      <h3>{place.place_name}</h3>
      <p>{place.address_name}</p>
      <p>{place.phone}</p>
      <div className="button-container">
        <button className="close-button" onClick={onClose}>Close</button>
      </div>
    </div>
  );
};

export default MarkerInfo;
