import React, { useState, useEffect, useContext } from 'react';
import axios from 'axios';
import { AppContext } from '../../context/AppContext';

const DepartmentList = () => {
  const [departments, setDepartments] = useState([]);
  const [filteredDepartments, setFilteredDepartments] = useState([]);
  const [hospitals, setHospitals] = useState([]);
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState('');
  const [sortOrder, setSortOrder] = useState('asc'); // State to track sorting order
  const { backendUrl } = useContext(AppContext);

  // Fetch departments and hospitals data from the backend
  useEffect(() => {
    const fetchDepartmentsAndHospitals = async () => {
      try {
        // Fetch departments data
        const deptResponse = await axios.get(`${backendUrl}/api/department`);
        if (deptResponse.data && Array.isArray(deptResponse.data.$values)) {
          setDepartments(deptResponse.data.$values);
          setFilteredDepartments(deptResponse.data.$values); // Set filtered departments initially
        } else {
          setError('Invalid department data format');
        }

        // Fetch hospitals data
        const hospitalResponse = await axios.get(`${backendUrl}/api/hospital`);
        if (hospitalResponse.data && Array.isArray(hospitalResponse.data.$values)) {
          setHospitals(hospitalResponse.data.$values);
        } else {
          setError('Invalid hospital data format');
        }

      } catch (err) {
        setError('Failed to load departments or hospitals');
      } finally {
        setLoading(false);
      }
    };

    fetchDepartmentsAndHospitals();
  }, [backendUrl]);

  const handleHospitalChange = (event) => {
    const selectedHospital = event.target.value;
    // Filter departments based on the selected hospital
    if (selectedHospital === 'all') {
      setFilteredDepartments(departments); // Show all departments
    } else {
      setFilteredDepartments(departments.filter(department => department.hospitalName === selectedHospital));
    }
  };

  const deleteDepartment = async (id) => {
    try {
      const deleteResponse = await axios.delete(`${backendUrl}/api/department/${id}`, 
      {
        headers:{
          "Authorization" : "Bearer " + localStorage.getItem("aToken")
        }
      }
      
      );
      if (deleteResponse.status === 200) {
        setDepartments((prevDepartments) => prevDepartments.filter((dept) => dept.departmentID !== id));
        setFilteredDepartments((prevDepartments) => prevDepartments.filter((dept) => dept.departmentID !== id));
      } else {
        console.error("Error: Failed to delete. Response status:", deleteResponse.status);
        setError('Failed to delete department');
      }
    } catch (err) {
      console.error("Error response:", err.response?.data || err.message);
      setError('Failed to delete department');
    }
  };

  // Function to handle sorting based on hospital name
  const handleSortChange = () => {
    const sortedDepartments = [...filteredDepartments].sort((a, b) => {
      const hospitalA = a.hospitalName.toLowerCase();
      const hospitalB = b.hospitalName.toLowerCase();
      if (sortOrder === 'asc') {
        return hospitalA < hospitalB ? -1 : 1;
      } else {
        return hospitalA > hospitalB ? -1 : 1;
      }
    });

    setFilteredDepartments(sortedDepartments);
    setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc');
  };

  if (loading) {
    return <div>Loading...</div>;
  }

  if (error) {
    return <div>{error}</div>;
  }

  return (
    <div className="m-5 max-h-[90vh] overflow-y-scroll">
      <h1 className="text-lg font-medium">Department List</h1>

      {/* Dropdown for selecting a hospital */}
      <div className="my-4">
        <select
          className="border p-2 rounded"
          onChange={handleHospitalChange}
        >
          <option value="all">All Hospitals</option>
          {hospitals.map((hospital) => (
            <option key={hospital.hospitalID} value={hospital.name}>
              {hospital.name}
            </option>
          ))}
        </select>
      </div>

      {/* Button for sorting by hospital name */}
      <button
        onClick={handleSortChange}
        className="bg-blue-500 text-white px-4 py-2 rounded-full mt-4"
      >
        Sort by Hospital {sortOrder === 'asc' ? '↓' : '↑'}
      </button>

      <div className="w-full flex flex-wrap gap-4 pt-5 gap-y-6">
        {filteredDepartments.map((department) => (
          <div
            className="border border-[#C9D8FF] rounded-xl max-w-56 overflow-hidden cursor-pointer group"
            key={department.departmentID}
          >
            <div className="p-4">
              {/* Display department image if available */}
              {department.imageBase64 && (
                <img
                  src={`data:image/svg+xml;base64,${department.imageBase64}`}
                  alt={department.name}
                  className="w-full h-32 object-cover rounded-md mb-4"
                />
              )}

              <p className="text-[#262626] text-lg font-medium">{department.name}</p>
              <p className="text-[#5C5C5C] text-sm">{department.hospitalName}</p>
              <p className="text-[#5C5C5C] text-sm">{department.description}</p>

              <div className="mt-2">
                <button
                  onClick={() => deleteDepartment(department.departmentID)}
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

export default DepartmentList;
