// RegisterButton.jsx
import React, { useState } from 'react';
import axios from 'axios';
import ReviewModal from './ReviewModal';

const RegisterButton = ({ place }) => {
  const [showModal, setShowModal] = useState(false);

  const handleRegister = () => {
    setShowModal(true);
  };

  const handleSave = async (review) => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'https://9294-218-234-149-213.ngrok-free.app/api/v1/restaurant',
        {
          x: place.x,
          y: place.y,
          name: place.place_name,
          review: review
        },
        {
          headers: { 
            Authorization: `Bearer ${token}`,
            'ngrok-skip-browser-warning': true
          }
        }
      );
      alert('Restaurant registered successfully with review!');
      setShowModal(false);
    } catch (error) {
      console.error('Failed to register restaurant:', error);
      alert('Failed to register restaurant. Please try again.');
    }
  };

  return (
    <>
      <button className="register-button" onClick={handleRegister}>
        Register
      </button>
      {showModal && (
        <ReviewModal
          place={place}
          onSave={handleSave}
          onClose={() => setShowModal(false)}
        />
      )}
    </>
  );
};

export default RegisterButton;