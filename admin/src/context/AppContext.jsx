import { createContext, useState, useEffect } from "react";

export const AppContext = createContext();

const AppContextProvider = (props) => {
  const backendUrl = "http://localhost:5250"; // Your backend API endpoint

  const [doctors, setDoctors] = useState([]);
  const [appointments, setAppointments] = useState([]);
  const [patients, setPatients] = useState([]);

  const token = localStorage.getItem("aToken"); // Use aToken instead of token
  const userId = token ? JSON.parse(atob(token.split(".")[1])).userSpecificId : null;

  const slotDateFormat = (slotDate) => {
    if (!slotDate || typeof slotDate !== "string") {
      return "Invalid Date";
    }
    const months = ["Jan", "Feb", "Mar", "Apr", "May", "Jun", "Jul", "Aug", "Sep", "Oct", "Nov", "Dec"];
    const dateArray = slotDate.split('_');
    if (dateArray.length !== 3 || isNaN(dateArray[1]) || Number(dateArray[1]) < 1 || Number(dateArray[1]) > 12) {
      return "Invalid Date";
    }
    return `${dateArray[0]} ${months[Number(dateArray[1]) - 1]} ${dateArray[2]}`;
  };

  const changeAvailability = (docId) => {
    const updatedDoctors = doctors.map((doctor) =>
      doctor.id === docId ? { ...doctor, available: !doctor.available } : doctor
    );
    setDoctors(updatedDoctors);
  };

  const cancelAppointment = (appointmentId) => {
    const updatedAppointments = appointments.filter((appointment) => appointment.id !== appointmentId);
    setAppointments(updatedAppointments);
  };

  const extractData = (data) => {
    return data && data.$values ? data.$values : data;
  };

  const getAuthHeaders = () => {
    const headers = {};
    const token = localStorage.getItem("aToken");
    if (token) {
      headers["Authorization"] = `Bearer ${token}`;
    }
    return headers;
  };

  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/doctor`, {
          headers: getAuthHeaders()
        });
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        setDoctors(extractData(data) || []);
      } catch (error) {
        console.error("Error fetching doctors:", error);
      }
    };
    fetchDoctors();
  }, [backendUrl, token]);

  useEffect(() => {
    const fetchAppointments = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/appointment`, {
          headers: getAuthHeaders()
        });
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        setAppointments(extractData(data) || []);
      } catch (error) {
        console.error("Error fetching appointments:", error);
      }
    };
    fetchAppointments();
  }, [backendUrl, token]);

  useEffect(() => {
    const fetchPatients = async () => {
      try {
        const response = await fetch(`${backendUrl}/api/patient`, {
          headers: getAuthHeaders()
        });
        if (!response.ok) {
          throw new Error(`Error: ${response.status}`);
        }
        const data = await response.json();
        setPatients(extractData(data) || []);
      } catch (error) {
        console.error("Error fetching patients:", error);
      }
    };
    fetchPatients();
  }, [backendUrl, token]);

  const value = {
    backendUrl,
    slotDateFormat,
    doctors,
    appointments,
    patients,
    changeAvailability,
    cancelAppointment,
    userId,
  };

  return (
    <AppContext.Provider value={value}>
      {props.children}
    </AppContext.Provider>
  );
};

export default AppContextProvider;
