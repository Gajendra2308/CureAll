import React, { useState, useEffect } from "react";
import { useLocation, useNavigate } from "react-router-dom";
import axios from "axios";
import { AppContext } from "../context/AppContext";
import { useContext } from "react";
import { toast } from "react-toastify";

const AppointmentReason = () => {
  const location = useLocation();
  const navigate = useNavigate();
  const { doctorId, appointmentDate, appointmentTime } = location.state || {};
  const { backendUrl, userId, loading } = useContext(AppContext);
  const [reason, setReason] = useState("");

  useEffect(() => {
     // Check if the user is logged in
     const token = localStorage.getItem("token");
     if (!token) {
      toast.error("Please log in first!" , {position : "top-right" , autoClose:3000})
       navigate("/login");
       return;
     }
    console.log("UserID (PatientID):", userId); // Debugging: Check if patient ID is being retrieved

    // If userId is still null, trigger a page refresh
    if (userId === null && !loading) {
      console.log("User ID not found, refreshing page...");
      window.location.reload(); // This triggers the page to reload
    }
  }, [loading, userId]);

  const handleSubmit = async (event) => {
    event.preventDefault();

    if (loading) {
      alert("User is still loading, please wait.");
      return;
    }

    if (!userId || !doctorId || !appointmentDate || !appointmentTime) {
      alert("Missing appointment details. Please try again.");
      return;
    }

    const formattedTime = new Date(`1970-01-01 ${appointmentTime}`).toLocaleTimeString("en-GB", { hour12: false });

    const appointmentData = {
      PatientID: userId,
      DoctorID: doctorId,
      AppointmentDate: appointmentDate,
      AppointmentTime: formattedTime,
      Reason: reason,
      Status: 0,
    };

    try {
      const response = await axios.post(
        `${backendUrl}/api/appointment`,
        appointmentData,
        { headers: { "Content-Type": "application/json",
        'Authorization' : `Bearer ${localStorage.getItem('token')}`}}
      );
      console.log("Appointment created successfully:", response.data);
      navigate("/appointment-success");
    } catch (error) {
      console.error("Error creating appointment:", error);
      alert("There was an error while creating your appointment. Please try again.");
    }
  };

  if (loading) {
    return (
      <div className="container mx-auto p-6">
        <h2 className="text-2xl font-semibold">Loading User Information...</h2>
      </div>
    );
  }

  if (!userId) {
    return (
      <div className="container mx-auto p-6">
        <h2 className="text-2xl font-semibold">User not found. Please log in again.</h2>
      </div>
    );
  }

  return (
    <div className="container mx-auto p-6">
      <h2 className="text-2xl font-semibold">Enter Appointment Reason</h2>
      <form onSubmit={handleSubmit}>
        <div className="mt-4">
          <label htmlFor="reason" className="block text-sm font-medium text-gray-700">
            Reason for appointment
          </label>
          <textarea
            id="reason"
            rows="4"
            className="mt-1 block w-full border border-gray-300 rounded-md shadow-sm focus:ring-indigo-500 focus:border-indigo-500"
            placeholder="Enter reason for your appointment"
            value={reason}
            onChange={(e) => setReason(e.target.value)}
            required
          />
        </div>

        <button
          type="submit"
          className={`mt-6 px-6 py-3 rounded-lg text-white ${loading ? "bg-gray-400 cursor-not-allowed" : "bg-blue-600 hover:bg-blue-700"}`}
          disabled={loading}
        >
          {loading ? "Loading..." : "Submit Appointment"}
        </button>
      </form>
    </div>
  );
};

export default AppointmentReason;
