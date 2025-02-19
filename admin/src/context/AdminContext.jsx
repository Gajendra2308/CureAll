import { createContext, useState, useEffect } from "react";
import { toast } from "react-toastify";

export const AdminContext = createContext();

const AdminContextProvider = (props) => {
    // Mock data (in-place of backend API)
    const mockDoctors = [
        { 
            "id": 1, 
            "name": "Dr. John Doe", 
            "degree": "MD", 
            "speciality": "Cardiology", 
            "available": true, 
            "experience": "5 years", 
            "fees": 300, 
            "about": "Experienced Cardiologist.", 
            "address": { "line1": "123 Main St", "line2": "City" }
        },
        { 
            "id": 2, 
            "name": "Dr. Jane Smith", 
            "degree": "MBBS", 
            "speciality": "Pediatrics", 
            "available": false, 
            "experience": "3 years", 
            "fees": 150, 
            "about": "Pediatric Specialist.", 
            "address": { "line1": "456 Elm St", "line2": "Town" }
        }
    ];

    const mockAppointments = [
        { 
            "id": 1, 
            "doctorId": 1, 
            "patient": "Alice", 
            "time": "2025-01-30 10:00 AM", 
            "status": "Booked"
        },
        { 
            "id": 2, 
            "doctorId": 2, 
            "patient": "Bob", 
            "time": "2025-01-31 11:00 AM", 
            "status": "Canceled"
        }
    ];

    const mockDashData = {
        "totalDoctors": 2,
        "totalAppointments": 1,
        "canceledAppointments": 1
    };

    // State management
    const [aToken, setAToken] = useState(localStorage.getItem('aToken') || '');
    const [appointments, setAppointments] = useState(mockAppointments);
    const [doctors, setDoctors] = useState(mockDoctors);
    const [dashData, setDashData] = useState(mockDashData);

    // Simulate getting all doctors from the static JSON data
    const getAllDoctors = async () => {
        setTimeout(() => {
            setDoctors(mockDoctors);
        }, 500);
    };

    // Simulate changing doctor's availability
    const changeAvailability = async (docId) => {
        setDoctors((prevDoctors) => {
            return prevDoctors.map((doctor) => {
                if (doctor.id === docId) {
                    doctor.available = !doctor.available;
                }
                return doctor;
            });
        });
        toast.success("Doctor's availability updated!");
    };

    // Simulate getting all appointments from static JSON data
    const getAllAppointments = async () => {
        setTimeout(() => {
            setAppointments(mockAppointments.reverse());
        }, 500);
    };

    // Simulate canceling an appointment
    const cancelAppointment = async (appointmentId) => {
        setAppointments((prevAppointments) => {
            return prevAppointments.map((appointment) => {
                if (appointment.id === appointmentId) {
                    appointment.status = "Canceled";
                }
                return appointment;
            });
        });
        toast.success("Appointment canceled!");
    };

    // Simulate getting dashboard data
    const getDashData = async () => {
        setTimeout(() => {
            setDashData(mockDashData);
        }, 500);
    };

    // Fetch all necessary data when the token is set
    useEffect(() => {
        if (aToken) {
            getAllDoctors();
            getAllAppointments();
            getDashData();
        }
    }, [aToken]);

    const value = {
        aToken,
        setAToken,
        doctors,
        getAllDoctors,
        changeAvailability,
        appointments,
        getAllAppointments,
        getDashData,
        cancelAppointment,
        dashData,
    };

    return (
        <AdminContext.Provider value={value}>
            {props.children}
        </AdminContext.Provider>
    );
};

export default AdminContextProvider;
