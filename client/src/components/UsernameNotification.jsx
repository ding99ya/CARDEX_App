import React, { useEffect } from "react";

const UsernameNotification = ({ message, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 2000);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div className="bg-red-500 text-white py-2 px-4 rounded shadow-md z-50">
      <p>{message}</p>
    </div>
  );
};

export default UsernameNotification;
