import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { assets } from '../../assets/assets';
import { AppContext } from '../../context/AppContext';

const HospitalsList = () => {
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { backendUrl } = useContext(AppContext);

  // Fetch hospitals data from the backend
  useEffect(() => {
    const fetchHospitals = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/hospital`);
        console.log(response)
        if (response.data && Array.isArray(response.data.$values)) {
          setHospitals(response.data.$values);
        } else {
          setError('Invalid data format');
        }
      } catch (err) {
        setError('Failed to load hospitals');
      } finally {
        setLoading(false);
      }
    };

    fetchHospitals();
  }, [backendUrl]);

  const deleteHospital = async (id) => {
    try {
      // Step 1: Send DELETE request to delete the hospital by ID
      const deleteResponse = await axios.delete(`${backendUrl}/api/hospital/${id}`,
      {
        headers: {
          "Authorization" : "Bearer " + localStorage.getItem("aToken")
        }
      });

      // Step 2: Check if the delete was successful
      if (deleteResponse.status === 200) {
        // Remove the deleted hospital from the local state
        setHospitals((prevHospitals) => prevHospitals.filter((hospital) => hospital.hospitalID !== id));
      } else {
        console.error("Error: Failed to delete. Response status:", deleteResponse.status);
        setError('Failed to delete hospital');
      }
    } catch (err) {
      console.error("Error response:", err.response?.data || err.message);
      setError('Failed to delete hospital');
    }
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="m-5 max-h-[90vh] overflow-y-scroll">
      <h1 className="text-lg font-medium">All Hospitals</h1>
      <div className="w-full flex flex-wrap gap-4 pt-5 gap-y-6">
        {hospitals.map((hospital) => (
          <div className="border border-[#C9D8FF] rounded-xl max-w-56 overflow-hidden cursor-pointer group" key={hospital.hospitalID}>
            <img
              className="bg-[#EAEFFF] group-hover:bg-primary transition-all duration-500"
              src={hospital.imageUrl ? `data:image/png;base64,${hospital.imageUrl}` : assets.hospital_icon}
              alt={hospital.name}
            />
            <div className="p-4">
              <p className="text-[#262626] text-lg font-medium">{hospital.name}</p>
              <p className="text-[#5C5C5C] text-sm">{hospital.address}</p>
              <div className="mt-2">
                <button
                  onClick={() => deleteHospital(hospital.hospitalID)}
                  className="bg-red-500 text-white px-4 py-2 rounded-full mt-2"
                >
                  Delete
                </button>
              </div>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default HospitalsList;
