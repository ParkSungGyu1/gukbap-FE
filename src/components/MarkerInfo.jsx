import React from 'react';
import RegisterButton from './RegisterButton';

const MarkerInfo = ({ place, onClose }) => {
  const isRegistered = place.hasOwnProperty('user');

  return (
    <div className="marker-info">
      <h3>{place.place_name || place.name}</h3>
      {isRegistered ? (
        <>
          <p>Username: {place.user.username}</p>
          <p>Review: {place.review}</p>
        </>
      ) : (
        <>
          <p>{place.address_name}</p>
          <p>{place.phone}</p>
        </>
      )}
      <div className="button-container">
        <button className="close-button" onClick={onClose}>Close</button>
        {!isRegistered && <RegisterButton place={place} />}
      </div>
    </div>
  );
};

export default MarkerInfo;