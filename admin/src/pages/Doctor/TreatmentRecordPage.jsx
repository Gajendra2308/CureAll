import React, { useState, useEffect, useContext } from 'react';
import { useParams } from 'react-router-dom';
import axios from 'axios';
import { AppContext } from './../../context/AppContext';

const TreatmentRecordPage = () => {
    const { id } = useParams(); // Get the treatment record ID from the URL
    const [treatmentRecord, setTreatmentRecord] = useState(null);
    const [error, setError] = useState('');
    const { backendUrl } = useContext(AppContext); // Backend URL from context

    useEffect(() => {
        const fetchTreatmentRecord = async () => {
            try {
                const token = localStorage.getItem("dToken");
                if (!token) {
                    setError("Authorization token missing. Please log in again.");
                    return;
                }

                const response = await axios.get(`${backendUrl}/api/treatmentrecords/${id}`, {
                    headers: {
                        Authorization: `Bearer ${token}`,
                    },
                });

                setTreatmentRecord(response.data);
            } catch (err) {
                setError("Failed to fetch treatment record.");
                console.error(err);
            }
        };

        fetchTreatmentRecord();
    }, [id, backendUrl]);

    if (error) return <p className="text-red-500">{error}</p>;
    if (!treatmentRecord) return <p>Loading...</p>;

    return (
        <div className="w-full max-w-lg mx-auto mt-8">
            <h2 className="text-2xl font-bold mb-4">Treatment Record Details</h2>

            <div className="mb-4">
                <strong>Patient:</strong> {treatmentRecord.PatientName}
            </div>

            <div className="mb-4">
                <strong>Doctor:</strong> {treatmentRecord.DoctorName}
            </div>

            <div className="mb-4">
                <strong>Treatment Date:</strong> {new Date(treatmentRecord.TreatmentDate).toLocaleString()}
            </div>

            <div className="mb-4">
                <strong>Description:</strong> {treatmentRecord.Description}
            </div>

            <div className="mb-4">
                <strong>Billing:</strong> ${treatmentRecord.Billing?.Amount}
            </div>

            <div className="mb-4">
                <strong>Status:</strong> {treatmentRecord.IsVisibleToPatient ? 'Visible to Patient' : 'Not Visible to Patient'}
            </div>
        </div>
    );
};

export default TreatmentRecordPage;
