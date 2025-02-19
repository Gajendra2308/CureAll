import React, { useContext, useEffect, useState } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { AppContext } from '../context/AppContext';

const TreatmentRecords = () => {
  const [treatmentRecords, setTreatmentRecords] = useState([]);
  const [patientId, setPatientId] = useState(null);
  const { backendUrl } = useContext(AppContext);
  const [loading, setLoading] = useState(true);

  const getPatientIdFromJWT = () => {
    const token = localStorage.getItem("token");
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
    const id = getPatientIdFromJWT();
    if (id) {
      setPatientId(id);
      fetchTreatmentRecords(id);
    } else {
      toast.error("Patient ID not found in JWT");
      setLoading(false);
    }
  }, []);

  const fetchTreatmentRecords = async (id) => {
    try {
      const token = localStorage.getItem("token");
      if (!token) {
        toast.error("Authorization token missing. Please log in again.");
        return;
      }
  
      const response = await axios.get(`${backendUrl}/api/TreatmentRecords/patient/${id}/visible`, {
        headers: { Authorization: `Bearer ${token}` },
      });
  
      if (response.status === 200) {
        const fetchedRecords = response.data?.$values || [];
        
        if (fetchedRecords.length === 0) {
          toast.info("No treatment records found.");
        }
        
        setTreatmentRecords(Array.isArray(fetchedRecords) ? fetchedRecords : []);
      } else {
        toast.error("Failed to retrieve treatment records.");
      }
    } catch (error) {
      toast.error("An error occurred while fetching treatment records.");
      console.error("Error fetching treatment records:", error);
    } finally {
      setLoading(false);
    }
  };
  
  if (loading) {
    return <div>Loading treatment records...</div>;
  }

  if (treatmentRecords.length === 0) {
    return <div>No treatment records available</div>;
  }

  return (
    <div className="w-full max-w-6xl m-5">
      <p className="mb-3 text-lg font-medium">All Treatment Records</p>

      <div className="bg-white border rounded text-sm max-h-[80vh] overflow-y-scroll">
        <div className="max-sm:hidden grid grid-cols-[0.5fr_2fr_3fr] gap-1 py-3 px-6 border-b">
          <p>Id</p>
          <p>Doctor</p>
          <p>Description</p>
        </div>

        {treatmentRecords.map((item, index) => (
          <div key={item.treatmentRecordID} className="flex flex-wrap justify-between max-sm:gap-5 max-sm:text-base sm:grid grid-cols-[0.5fr_2fr_3fr] gap-1 items-center text-gray-500 py-3 px-6 border-b">
            <p className="max-sm:hidden">{index + 1}</p>
            <div className="flex items-center gap-2">
              <p>{item.doctorName}</p>
            </div>
            <p>{item.description}</p>
          </div>
        ))}
      </div>
    </div>
  );
};

export default TreatmentRecords;
