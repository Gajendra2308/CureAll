import React, { useContext, useEffect, useState } from 'react';
import { useNavigate, useParams } from 'react-router-dom';
import { AppContext } from '../context/AppContext';
import axios from 'axios';

const Doctors = () => {
  const [doctorsData, setDoctorsData] = useState([]);
  const [hospitalData, setHospitalData] = useState([]);
  const [filterDoc, setFilterDoc] = useState([]);
  const [selectedHospital, setSelectedHospital] = useState('');
  const { backendUrl } = useContext(AppContext);
  const navigate = useNavigate();
  const { speciality } = useParams();

  // Fetch doctors
  const fetchDoctorsData = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/doctor`);
      if (response.data && Array.isArray(response.data.$values)) {
        setDoctorsData(response.data.$values);
      } else {
        setDoctorsData([]);
      }
    } catch (error) {
      console.error('Error fetching doctors data:', error);
    }
  };

  // Fetch hospitals
  const fetchHospitalData = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/hospital`);
      if (response.data && Array.isArray(response.data.$values)) {
        setHospitalData(response.data.$values);
      } else {
        setHospitalData([]);
      }
    } catch (error) {
      console.error('Error fetching hospital data:', error);
    }
  };

  // Fetch data on mount
  useEffect(() => {
    fetchDoctorsData();
    fetchHospitalData();
  }, []);

  // Apply filters based on specialization and hospital
  const applyFilter = () => {
    let filteredDoctors = [...doctorsData];

    if (speciality) {
      filteredDoctors = filteredDoctors.filter(doc =>
        doc.specialization.toLowerCase().trim().includes(speciality.toLowerCase().trim())
      );
    }

    if (selectedHospital) {
      filteredDoctors = filteredDoctors.filter(doc => doc.hospitalName === selectedHospital);
    }

    setFilterDoc(filteredDoctors);
  };

  // Apply filter when doctorsData, speciality, or selectedHospital changes
  useEffect(() => {
    applyFilter();
  }, [doctorsData, speciality, selectedHospital]);

  return (
    <div>
      <p className="text-gray-600">Browse through the doctors specialist.</p>

      {/* Hospital Dropdown */}
      <div className="mt-3">
        <label className="text-gray-700 font-medium">Filter by Hospital:</label>
        <select
          className="ml-2 p-2 border border-gray-300 rounded-md"
          value={selectedHospital}
          onChange={(e) => setSelectedHospital(e.target.value)}
        >
          <option value="">All Hospitals</option>
          {hospitalData.map((hospital) => (
            <option key={hospital.hospitalID} value={hospital.name}>
              {hospital.name}
            </option>
          ))}
        </select>
      </div>

      {/* Specialization Filter */}
      <div className="flex flex-col sm:flex-row items-start gap-5 mt-5">
        <div className="flex flex-col gap-4 text-sm text-gray-600">
          {['General physician', 'Gynecologist', 'Dermatologist', 'Pediatrician', 'Neurologist', 'Gastroenterologist'].map(spec => (
            <p
              key={spec}
              onClick={() => (speciality === spec ? navigate('/doctors') : navigate(`/doctors/${spec}`))}
              className={`w-[94vw] sm:w-auto pl-3 py-1.5 pr-16 border border-gray-300 rounded transition-all cursor-pointer ${speciality === spec ? 'bg-indigo-100 text-black' : ''}`}
            >
              {spec}
            </p>
          ))}
        </div>

        {/* Doctors List */}
        <div className="w-full grid grid-cols-auto gap-4 gap-y-6">
          {filterDoc.map((item, index) => (
            <div
              onClick={() => navigate(`/appointment/${item.doctorID}`)}
              className="border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500"
              key={index}
            >
              <img className="bg-blue-50 w-full h-48 object-cover" src={`data:image/png;base64,${item.imageUrl}`} alt={item.name} />
              <div className="p-4">
                <div className="flex items-center gap-2 text-sm text-center text-green-500">
                  <p className="w-2 h-2 bg-green-500 rounded-full"></p>
                  <p>Available</p>
                </div>
                <p className="text-gray-900 text-lg font-medium">{item.name}</p>
                <p className="text-gray-600 text-sm">{item.specialization}</p>
                <p className="text-gray-500 text-xs">{item.hospitalName}</p>
              </div>
            </div>
          ))}
        </div>
      </div>
    </div>
  );
};

export default Doctors;
