import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { assets } from '../../assets/assets';
import { AppContext } from '../../context/AppContext';

const DoctorsList = () => {
  const [doctors, setDoctors] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const { backendUrl } = useContext(AppContext);

  // States for sorting/filtering
  const [selectedHospital, setSelectedHospital] = useState('All');
  const [selectedDepartment, setSelectedDepartment] = useState('All');

  // Fetch doctors data from the backend
  useEffect(() => {
    const fetchDoctors = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/doctor`);
        if (response.data && Array.isArray(response.data.$values)) {
          const doctorsData = response.data.$values;
          console.log('Doctors Data:', doctorsData); // Log data to inspect its structure
          setDoctors(doctorsData);
        } else {
          setError('Invalid data format');
        }
      } catch (err) {
        setError('Failed to load doctors');
      } finally {
        setLoading(false);
      }
    };

    fetchDoctors();
  }, [backendUrl]);

  const deleteDoctor = async (id) => {
    try {
      // Send DELETE request to delete the doctor by ID
      const deleteResponse = await axios.delete(`${backendUrl}/api/doctor/${id}`
      ,{
        headers:{
          "Authorization" : "Bearer " + localStorage.getItem("aToken")
        }
      }
      );

      // Check if the delete was successful
      if (deleteResponse.status === 200) {
        // Remove the deleted doctor from the local state
        setDoctors((prevDoctors) => prevDoctors.filter((doctor) => doctor.doctorID !== id));
      } else {
        console.error("Error: Failed to delete. Response status:", deleteResponse.status);
        setError('Failed to delete doctor');
      }
    } catch (err) {
      console.error("Error response:", err.response?.data || err.message);
      setError('Failed to delete doctor');
    }
  };

  // Check if hospital and department are present in the doctor object
  const hospitals = [...new Set(doctors.map((doctor) => doctor.hospitalName))];
  const departments = [...new Set(doctors.map((doctor) => doctor.departmentName))];

  // Filter doctors based on selected hospital and department
  const filteredDoctors = doctors.filter((doctor) => {
    const isHospitalMatch = selectedHospital === 'All' || doctor.hospitalName === selectedHospital;
    const isDepartmentMatch = selectedDepartment === 'All' || doctor.departmentName === selectedDepartment;
    return isHospitalMatch && isDepartmentMatch;
  });

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="m-5 max-h-[90vh] overflow-y-scroll">
      <h1 className="text-lg font-medium">All Doctors</h1>

      {/* Hospital Dropdown */}
      <div className="mb-4">
        <label htmlFor="hospital" className="text-sm">Select Hospital: </label>
        <select
          id="hospital"
          value={selectedHospital}
          onChange={(e) => setSelectedHospital(e.target.value)}
          className="p-2 border rounded-md"
        >
          <option value="All">All Hospitals</option>
          {hospitals.map((hospital, index) => (
            <option key={index} value={hospital}>{hospital}</option>
          ))}
        </select>
      </div>

      {/* Department Dropdown */}
      <div className="mb-4">
        <label htmlFor="department" className="text-sm">Select Department: </label>
        <select
          id="department"
          value={selectedDepartment}
          onChange={(e) => setSelectedDepartment(e.target.value)}
          className="p-2 border rounded-md"
        >
          <option value="All">All Departments</option>
          {departments.map((department, index) => (
            <option key={index} value={department}>{department}</option>
          ))}
        </select>
      </div>

      <div className="w-full flex flex-wrap gap-4 pt-5 gap-y-6">
        {filteredDoctors.map((doctor) => (
          <div className="border border-[#C9D8FF] rounded-xl max-w-56 overflow-hidden cursor-pointer group" key={doctor.doctorID}>
            <img
              className="bg-[#EAEFFF] group-hover:bg-primary transition-all duration-500"
              src={doctor.imageUrl ? `data:image/jpeg;base64,${doctor.imageUrl}` : assets.doctor_icon}
              alt={doctor.name}
            />
            <div className="p-4">
              <p className="text-[#262626] text-lg font-medium">{doctor.name}</p>
              <p className="text-[#5C5C5C] text-sm">{doctor.specialization}</p>
              <div className="mt-2">
                <button
                  onClick={() => deleteDoctor(doctor.doctorID)}
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

export default DoctorsList;
