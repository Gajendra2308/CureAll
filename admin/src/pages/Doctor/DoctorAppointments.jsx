import React, { useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { AppContext } from './../../context/AppContext';
import { useNavigate } from 'react-router-dom';

const DoctorAppointments = () => {
  const [appointments, setAppointments] = useState([]);
  const [doctorId, setDoctorId] = useState(null);
  const { backendUrl } = useContext(AppContext);
  const navigate = useNavigate();
  const [loading, setLoading] = useState(true);

  const getDoctorIdFromJWT = () => {
    const token = localStorage.getItem("dToken");
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1]));
      return payload?.userSpecificId || null;
    } catch (error) {
      console.error("Error decoding JWT:", error);
      return null;
    }
  };

  useEffect(() => {
    const id = getDoctorIdFromJWT();
    if (id) {
      setDoctorId(id);
      fetchAppointments(id);
    } else {
      toast.error("Doctor ID not found in JWT");
      setLoading(false);
    }
  }, []);

  const fetchAppointments = async (id) => {
    try {
      const token = localStorage.getItem("dToken");
      if (!token) {
        toast.error("Authorization token missing. Please log in again.");
        return;
      }

      const response = await axios.get(`${backendUrl}/api/appointment/doctor/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });

      const fetchedAppointments = response.data?.$values || [];
      setAppointments(Array.isArray(fetchedAppointments) ? fetchedAppointments : []);
    } catch (error) {
      toast.error("Error fetching appointments");
      console.error(error);
    } finally {
      setLoading(false);
    }
  };

  // Navigate to treatment record page with appointmentID in query params
  const handleAppointmentClick = (appointmentID) => {
    navigate(`/doctor-treatmentRecord/${appointmentID}`);
  };

  if (loading) {
    return <div>Loading appointments...</div>;
  }

  // Instead of showing "No appointments found", show loading message.
  if (appointments.length === 0) {
    return <div>Loading appointments...</div>;
  }

  return (
    <div className="w-full max-w-6xl m-5">
      <p className="mb-3 text-lg font-medium">All Appointments</p>

      <div className="bg-white border rounded text-sm max-h-[80vh] overflow-y-scroll">
        {/* Updated header without Age column */}
        <div className="max-sm:hidden grid grid-cols-[0.5fr_2fr_1fr_3fr] gap-1 py-3 px-6 border-b">
          <p>#</p>
          <p>Patient</p>
          <p>Payment</p>
          <p>Date & Time</p>
        </div>

        {appointments.map((item, index) => (
          <div
            key={item.appointmentID}
            className="flex flex-wrap justify-between max-sm:gap-5 max-sm:text-base sm:grid grid-cols-[0.5fr_2fr_1fr_3fr] gap-1 items-center text-gray-500 py-3 px-6 border-b hover:bg-gray-50 cursor-pointer"
            onClick={() => handleAppointmentClick(item.appointmentID)}
          >
            <p className="max-sm:hidden">{index + 1}</p>
            <div className="flex items-center gap-2">
              <img src={item.patientImage || 'default_image.png'} className="w-8 rounded-full" alt="" />
              <p>{item.patientName}</p>
            </div>
            <div>
              <p className="text-xs inline border border-primary px-2 rounded-full">
                {item.paymentStatus ? 'Online' : 'CASH'}
              </p>
            </div>
            <p>
              {new Date(item.appointmentDate).toLocaleDateString()} at {item.appointmentTime}
            </p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default DoctorAppointments;
