import React, { useState, useEffect } from 'react';
import Login from 'components/Login';
import RestaurantMap from 'components/RestaurantMap';
import './App.css';

function App() {
  const [isLoggedIn, setIsLoggedIn] = useState(false);

  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      setIsLoggedIn(true);
    }
  }, []);

  const handleLogin = () => {
    setIsLoggedIn(true);
  };

  return (
    <div className="App">
      {!isLoggedIn ? (
        <Login onLogin={handleLogin} />
      ) : (
        <RestaurantMap />
      )}
    </div>
  );
}

export default App;