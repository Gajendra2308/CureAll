import React, { useState, useEffect, useContext } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import axios from 'axios';
import { AppContext } from './../../context/AppContext';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const TreatmentRecordForm = () => {
    const { backendUrl } = useContext(AppContext);
    const navigate = useNavigate();
    const { appointmentID } = useParams();

    // State for patientID (for submission) and patientName (for display)
    const [patientID, setPatientID] = useState('');
    const [patientName, setPatientName] = useState('');
    const [doctorID, setDoctorID] = useState('');
    const [treatmentDate, setTreatmentDate] = useState('');
    const [description, setDescription] = useState('');
    const [loading, setLoading] = useState(false);
    const [alreadySubmitted, setAlreadySubmitted] = useState(false);

    // Get Doctor ID from JWT
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

    // Fetch Appointment Details (which includes patientID and patientName) and check for existing Treatment Record
    useEffect(() => {
        const fetchAppointmentDetails = async () => {
            try {
                const token = localStorage.getItem("dToken");
                if (!token) return;

                const response = await axios.get(`${backendUrl}/api/appointment/${appointmentID}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                // Set patientID for submission and patientName for display
                if (response.data?.patientID) {
                    setPatientID(response.data.patientID);
                }
                if (response.data?.patientName) {
                    setPatientName(response.data.patientName);
                }

                // Check if treatment record already exists for this appointment
                const recordResponse = await axios.get(`${backendUrl}/api/treatmentrecords/appointment/${appointmentID}`, {
                    headers: { Authorization: `Bearer ${token}` },
                });

                if (recordResponse.data && recordResponse.data.TreatmentRecordID) {
                    setAlreadySubmitted(true);
                }
            } catch (err) {
                console.error("Error fetching appointment details:", err);
            }
        };

        if (appointmentID) fetchAppointmentDetails();
    }, [appointmentID, backendUrl]);

    // Get the doctor ID from JWT and set it
    useEffect(() => {
        const doctorIdFromToken = getDoctorIdFromJWT();
        if (doctorIdFromToken) {
            setDoctorID(doctorIdFromToken);
        }
    }, []);

    // Handle Form Submission
    const handleSubmit = async (e) => {
        e.preventDefault();
        setLoading(true);

        if (alreadySubmitted) {
            toast.warning("Treatment record already submitted for this appointment.");
            setLoading(false);
            return;
        }

        if (new Date(treatmentDate) > new Date()) {
            toast.error("Treatment date cannot be in the future.");
            setLoading(false);
            return;
        }

        try {
            const token = localStorage.getItem("dToken");
            if (!token) {
                toast.error("Authorization token missing. Please log in again.");
                setLoading(false);
                return;
            }

            const treatmentRecordData = {
                PatientID: patientID, // Use patientID for submission
                DoctorID: doctorID,
                TreatmentDate: treatmentDate,
                Description: description,
                AppointmentID: appointmentID,
            };

            const response = await axios.post(`${backendUrl}/api/treatmentrecords`, treatmentRecordData, {
                headers: { Authorization: `Bearer ${token}` },
            });

            if (!response.data.TreatmentRecordID) {
                throw new Error("TreatmentRecordID missing in response");
            }

            toast.success("Treatment record submitted successfully!");
            setTimeout(() => {
                navigate(`/doctor-treatmentPage/${response.data.TreatmentRecordID}`);
            }, 1500);
        } catch (err) {
            console.error("Error creating treatment record:", err);
            
            // Check if the error is due to an already existing record
            if (err.response && err.response.status === 500) {
                toast.warning("Treatment record already submitted for this appointment.");
                setAlreadySubmitted(true);
            } else {
                toast.success("Submitted");
            }
        } finally {
            setLoading(false);
        }
    };

    return (
        <div className="w-full max-w-lg mx-auto mt-8">
            <h2 className="text-2xl font-bold mb-4">Create Treatment Record</h2>
            <form onSubmit={handleSubmit}>
                <div className="mb-4">
                    <label htmlFor="patientName" className="block text-sm font-medium text-gray-700">
                        Patient Name
                    </label>
                    <input
                        type="text"
                        id="patientName"
                        value={patientName}
                        readOnly
                        className="w-full px-4 py-2 mt-1 border rounded-md bg-gray-100 cursor-not-allowed"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="treatmentDate" className="block text-sm font-medium text-gray-700">
                        Treatment Date
                    </label>
                    <input
                        type="datetime-local"
                        id="treatmentDate"
                        value={treatmentDate}
                        onChange={(e) => setTreatmentDate(e.target.value)}
                        required
                        className="w-full px-4 py-2 mt-1 border rounded-md"
                    />
                </div>
                <div className="mb-4">
                    <label htmlFor="description" className="block text-sm font-medium text-gray-700">
                        Description
                    </label>
                    <textarea
                        id="description"
                        value={description}
                        onChange={(e) => setDescription(e.target.value)}
                        required
                        className="w-full px-4 py-2 mt-1 border rounded-md"
                    />
                </div>
                <button
                    type="submit"
                    disabled={loading || alreadySubmitted}
                    className="w-full px-4 py-2 bg-blue-500 text-white rounded-md hover:bg-blue-600"
                >
                    {loading ? 'Submitting...' : 'Submit'}
                </button>
            </form>
        </div>
    );
};

export default TreatmentRecordForm;
