import React from 'react';

interface ErrorMessageProps {
  message: string;
}

const ErrorMessage: React.FC<ErrorMessageProps> = ({ message }) => {
  return <div className="error text-center text-white mt-8">{message}</div>; // Tampilkan pesan kesalahan
};

export default ErrorMessage;
