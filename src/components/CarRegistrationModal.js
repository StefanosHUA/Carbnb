import React, { useRef } from 'react';
import CarRegistration from '../pages/CarRegistration';

function CarRegistrationModal({ onClose }) {
  const mouseDownRef = useRef(null);
  const isDraggingRef = useRef(false);

  const handleMouseDown = (e) => {
    // Track where the mouse was pressed
    if (e.target === e.currentTarget) {
      // Mouse was pressed on the overlay (background)
      mouseDownRef.current = { 
        x: e.clientX, 
        y: e.clientY,
        target: e.target,
        currentTarget: e.currentTarget
      };
      isDraggingRef.current = false;
    } else {
      // Mouse was pressed on the modal content - don't close even if released outside
      mouseDownRef.current = { 
        x: e.clientX, 
        y: e.clientY,
        target: e.target,
        currentTarget: e.currentTarget,
        pressedOnContent: true
      };
      isDraggingRef.current = false;
    }
  };

  const handleMouseMove = (e) => {
    // If mouse moved more than 5px, consider it a drag
    if (mouseDownRef.current) {
      const deltaX = Math.abs(e.clientX - mouseDownRef.current.x);
      const deltaY = Math.abs(e.clientY - mouseDownRef.current.y);
      if (deltaX > 5 || deltaY > 5) {
        isDraggingRef.current = true;
      }
    }
  };

  const handleMouseUp = (e) => {
    // Reset on mouse up
    if (mouseDownRef.current) {
      mouseDownRef.current = null;
      isDraggingRef.current = false;
    }
  };

  const handleClick = (e) => {
    // Only close if:
    // 1. Clicking directly on the overlay (background)
    // 2. Mouse was pressed on the overlay (not on content)
    // 3. Not dragging
    if (
      e.target === e.currentTarget && 
      mouseDownRef.current &&
      mouseDownRef.current.target === mouseDownRef.current.currentTarget &&
      !mouseDownRef.current.pressedOnContent &&
      !isDraggingRef.current
    ) {
      onClose();
    }
    // Reset
    mouseDownRef.current = null;
    isDraggingRef.current = false;
  };

  return (
    <div 
      className="car-registration-modal-overlay" 
      onClick={handleClick}
      onMouseDown={handleMouseDown}
      onMouseMove={handleMouseMove}
      onMouseUp={handleMouseUp}
    >
      <div 
        className="car-registration-modal-content" 
        onClick={(e) => e.stopPropagation()}
        onMouseDown={(e) => {
          // Track that mouse was pressed on content
          mouseDownRef.current = {
            x: e.clientX,
            y: e.clientY,
            target: e.target,
            currentTarget: e.currentTarget,
            pressedOnContent: true
          };
          isDraggingRef.current = false;
        }}
        onMouseMove={handleMouseMove}
        onMouseUp={handleMouseUp}
      >
        <CarRegistration onClose={onClose} />
      </div>
    </div>
  );
}

export default CarRegistrationModal;

