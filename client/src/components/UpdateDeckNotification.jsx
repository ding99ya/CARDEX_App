import React, { useEffect } from "react";

const Notification = ({ message, alert, onClose }) => {
  useEffect(() => {
    const timer = setTimeout(() => {
      onClose();
    }, 1500);

    return () => clearTimeout(timer);
  }, [onClose]);

  return (
    <div
      className={`${
        alert ? "bg-red-500 " : "bg-green-300"
      } text-white py-2 px-4 rounded shadow-md z-50`}
    >
      <p>{message}</p>
    </div>
  );
};

export default Notification;
