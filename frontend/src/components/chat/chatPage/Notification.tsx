import React from 'react';

interface NotificationProps {
  message: string;
  onClose: () => void;
}

const Notification: React.FC<NotificationProps> = ({ message, onClose }) => {
  return (
    <div className="notification">
      <p>{message}</p>
    </div>
  );
};

export default Notification;
