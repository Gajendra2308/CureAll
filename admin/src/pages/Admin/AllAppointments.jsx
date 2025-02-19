import React, { useContext, useState } from "react";
import { AppContext } from "../../context/AppContext";
import axios from "axios";
import { CheckCircle, XCircle } from "lucide-react";
import { assets } from "../../assets/assets";

const AllAppointments = () => {
  // Consume required values from context.
  const {
    slotDateFormat,
    calculateAge,    // Ensure your context provides this if used.
    currency,
    backendUrl,
    appointments,    // Already fetched from context.
    doctors,
    patients,
  } = useContext(AppContext);

  const [error, setError] = useState(null);
  const [loading, setLoading] = useState(false);

  // Update appointment status using backend API.
  const updateAppointmentStatus = async (id, newStatus) => {
    try {
      // Update the status in the backend.
      await axios.put(`${backendUrl}/api/appointment/${id}/status`, { newStatus });
      // For simplicity, here we reload the page to refresh the data.
      window.location.reload();
    } catch (err) {
      console.error(`Error updating status to ${newStatus}:`, err);
    }
  };

  // If loading state is true, show loading message.
  if (loading) return <p>Loading appointments...</p>;
  if (error) return <p className="text-red-500">{error}</p>;

  // Instead of showing "No appointments found", we show a loading message.
  if (!Array.isArray(appointments) || appointments.length === 0) {
    return <p className="text-gray-500">Loading appointments...</p>;
  }

  return (
    <div className="w-full max-w-6xl m-5">
      <p className="mb-3 text-lg font-medium">All Appointments</p>

      <div className="bg-white border rounded text-sm max-h-[80vh] overflow-y-scroll">
        <div className="hidden sm:grid grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_2fr] grid-flow-col py-3 px-6 border-b">
          <p>#</p>
          <p>Patient</p>
          <p>Age</p>
          <p>Date & Time</p>
          <p>Doctor</p>
          <p>Fees</p>
          <p>Action</p>
        </div>

        {appointments.map((item, index) => (
          <div
            className="flex flex-wrap justify-between max-sm:gap-2 sm:grid sm:grid-cols-[0.5fr_3fr_1fr_3fr_3fr_1fr_2fr] items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50"
            key={item.appointmentID}
          >
            <p className="max-sm:hidden">{index + 1}</p>
            <div className="flex items-center gap-2">
              <img
                src={item.userData?.image || assets.default_user}
                className="w-8 rounded-full"
                alt=""
              />
              <p>{item.patientName || "Unknown"}</p>
            </div>
            <p className="max-sm:hidden">
              {item.userData?.dob ? calculateAge(item.userData.dob) : "N/A"}
            </p>
            <p>
              {item.appointmentDate ? slotDateFormat(item.appointmentDate) : "Unknown"},{" "}
              {item.appointmentTime || "N/A"}
            </p>
            <div className="flex items-center gap-2">
              <img
                src={item.docData?.image || assets.default_doctor}
                className="w-8 rounded-full bg-gray-200"
                alt=""
              />
              <p>{item.doctorName || "Unknown"}</p>
            </div>
            <p>
              {currency}
              {item.amount || "0"}
            </p>

            {/* Conditional Rendering for Actions or Status */}
            {item.status === 2 ? (  // Status 'Cancelled' (2)
              <p className="text-red-500 text-xs font-medium">Cancelled</p>
            ) : item.status === 1 ? ( // Status 'Completed' (1)
              <p className="text-green-500 text-xs font-medium">Completed</p>
            ) : item.status === 0 ? (  // Status 'Scheduled' (0)
              <div className="flex gap-3">
                <button
                  className="p-2 bg-green-500 text-white rounded-full hover:bg-green-600 transition"
                  onClick={() => updateAppointmentStatus(item.appointmentID, 1)} // Send 1 for Completed
                >
                  <CheckCircle size={20} />
                </button>
                <button
                  className="p-2 bg-red-500 text-white rounded-full hover:bg-red-600 transition"
                  onClick={() => updateAppointmentStatus(item.appointmentID, 2)} // Send 2 for Cancelled
                >
                  <XCircle size={20} />
                </button>
              </div>
            ) : null}
          </div>
        ))}
      </div>
    </div>
  );
};

export default AllAppointments;
