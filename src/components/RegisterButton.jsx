import React from 'react';
import axios from 'axios';

const RegisterButton = ({ place }) => {
  const handleRegister = async () => {
    try {
      const token = localStorage.getItem('token');
      await axios.post(
        'http://localhost:8080/api/v1/restaurant',
        {
          x: place.x,
          y: place.y,
          name: place.place_name
        },
        {
          headers: { Authorization: `Bearer ${token}` }
        }
      );
      alert('Restaurant registered successfully!');
    } catch (error) {
      console.error('Failed to register restaurant:', error);
      alert('Failed to register restaurant. Please try again.');
    }
  };

  return (
    <button className="register-button" onClick={handleRegister}>
      Register
    </button>
  );
};

export default RegisterButton;
