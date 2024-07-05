// ReviewModal.jsx
import React, { useState } from 'react';

const ReviewModal = ({ place, onSave, onClose }) => {
  const [review, setReview] = useState('');

  const handleSave = () => {
    onSave(review);
  };

  return (
    <div className="modal">
      <div className="modal-content">
        <h2>Leave a Review for {place.place_name}</h2>
        <textarea
          value={review}
          onChange={(e) => setReview(e.target.value)}
          placeholder="Write your review here..."
        />
        <div className="modal-buttons">
          <button onClick={onClose}>Cancel</button>
          <button onClick={handleSave}>Save</button>
        </div>
      </div>
    </div>
  );
};

export default ReviewModal;