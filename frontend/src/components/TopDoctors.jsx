import React, { useContext, useEffect, useState } from 'react'
import { useNavigate } from 'react-router-dom'
import { AppContext } from '../context/AppContext';
import axios from 'axios';

const TopDoctors = () => {
  const navigate = useNavigate();
  const [doctorsData, setDoctorsData] = useState([]);
  const { backendUrl } = useContext(AppContext);

  const fetchDoctorsData = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/doctor`);
      // Ensure that $values is an array and assign it to doctorsData
      if (response.data && Array.isArray(response.data.$values)) {
        setDoctorsData(response.data.$values);
      } else {
        setDoctorsData([]); // If $values is not an array, set it to empty array
      }
      console.log(response); // Check the structure of the response
    } catch (error) {
      console.error('Error fetching doctors data:', error);
    }
  };

  useEffect(() => {
    fetchDoctorsData();
  }, []);

  return (
    <div className="flex flex-col items-center gap-4 my-16 text-gray-900 md:mx-10">
      <h1 className="text-3xl font-medium">Top Doctors to Book</h1>
      <p className="sm:w-1/3 text-center text-sm">
        Simply browse through our extensive list of trusted doctors.
      </p>
      <div className="w-full grid grid-cols-auto gap-4 pt-5 gap-y-6 px-3 sm:px-0">
        {doctorsData.slice(0, 10).map((item, index) => {
          console.log(item.imageUrl); // Debugging to check the base64 image data
          return (
            <div
              onClick={() => {
                navigate(`/appointment/${item.doctorID}`);
                scrollTo(0, 0);
              }}
              className="border border-blue-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-10px] transition-all duration-500"
              key={index}
            >
              {item.imageUrl ? (
                <img
                  className="bg-blue-50"
                  src={`data:image/png;base64,${item.imageUrl}`}
                  alt="Doctor Image"
                />
              ) : (
                <div className="bg-gray-200 w-full h-40 flex items-center justify-center text-sm text-gray-500">
                  No Image Available
                </div>
              )}
              <div className="p-4">
                <div className="flex items-center gap-2 text-sm text-center text-green-500">
                  <p className="w-2 h-2 bg-green-500 rounded-full"></p>
                  <p>Available</p>
                </div>
                <div>
                  <p className="text-gray-900 text-lg font-medium">{item.name}</p>
                  <p className="text-gray-600 text-sm">{item.specialization}</p>
                </div>
              </div>
            </div>
          );
        })}
      </div>
      <button
        onClick={() => {
          navigate('/doctors');
          scrollTo(0, 0);
        }}
        className="bg-blue-50 text-gray-600 px-12 py-3 rounded-full mt-10"
      >
        more
      </button>
    </div>
  );
};

export default TopDoctors;
