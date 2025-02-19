import React from "react";
import { Link } from "react-router-dom";

const AppointmentSuccess = () => {
  return (
    <div className="flex flex-col items-center justify-center min-h-screen bg-gray-100">
      <div className="bg-white p-8 rounded-lg shadow-lg text-center">
        <h2 className="text-2xl font-bold text-green-600">Appointment Confirmed!</h2>
        <p className="text-gray-600 mt-2">
          Your appointment has been successfully booked. We will notify you with further details.
        </p>
        
        <div className="mt-6">
          <Link to="/" className="bg-blue-600 text-white px-6 py-3 rounded-lg hover:bg-blue-700">
            Go to Home Page
          </Link>
        </div>
      </div>
    </div>
  );
};

export default AppointmentSuccess;
