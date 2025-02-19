import { createContext, useState, useEffect } from "react";
import { toast } from 'react-toastify';

// Hardcoded JSON data
const appointmentsData = [
  {
    id: 1,
    doctorId: 1,
    patientName: "Alice",
    date: "20_01_2025",
    time: "10:00 AM",
    status: "Confirmed"
  },
  {
    id: 2,
    doctorId: 2,
    patientName: "Bob",
    date: "21_01_2025",
    time: "02:00 PM",
    status: "Pending"
  }
];

const profileData = {
  id: 1,
  name: "Dr. John Doe",
  speciality: "Cardiology",
  experience: "10 years",
  about: "Experienced cardiologist specializing in heart surgeries.",
  image: "https://via.placeholder.com/150"
};

const dashData = {
  totalAppointments: 50,
  completedAppointments: 30,
  pendingAppointments: 20
};

export const DoctorContext = createContext();

const DoctorContextProvider = (props) => {

  const [appointments, setAppointments] = useState([]);
  const [dashDataState, setDashData] = useState(false);
  const [profileDataState, setProfileData] = useState(false);
  const [dToken, setDToken] = useState(localStorage.getItem('dToken') ? localStorage.getItem('dToken') : '')

  // Simulate fetching doctor appointments (from hardcoded data)
  useEffect(() => {
    setAppointments(appointmentsData);
  }, []);

  // Simulate fetching profile data (from hardcoded data)
  useEffect(() => {
    setProfileData(profileData);
  }, []);

  // Simulate fetching dashboard data (from hardcoded data)
  useEffect(() => {
    setDashData(dashData);
  }, []);

  // Function to cancel an appointment (from hardcoded data)
  const cancelAppointment = (appointmentId) => {
    const updatedAppointments = appointments.filter((appointment) => appointment.id !== appointmentId);
    setAppointments(updatedAppointments);
    toast.success("Appointment canceled successfully.");
  };

  // Function to mark an appointment as completed (from hardcoded data)
  const completeAppointment = (appointmentId) => {
    const updatedAppointments = appointments.map((appointment) =>
      appointment.id === appointmentId ? { ...appointment, status: "Completed" } : appointment
    );
    setAppointments(updatedAppointments);
    toast.success("Appointment marked as completed.");
  };

  const value = {
    dToken, setDToken,
    appointments,
    cancelAppointment,
    completeAppointment,
    dashDataState, 
    profileDataState, 
    setProfileData,
  };

  return (
    <DoctorContext.Provider value={value}>
      {props.children}
    </DoctorContext.Provider>
  );
};

export default DoctorContextProvider;
