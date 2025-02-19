import React, { useContext, useState, useEffect } from 'react';
import { AppContext } from '../context/AppContext';
import { useNavigate } from 'react-router-dom';
import axios from 'axios';

const Hospitals = () => {
  const navigate = useNavigate();
  const [hospitalData, setHospitalData] = useState([]);
  const { backendUrl } = useContext(AppContext);

  const fetchHospitalData = async () => {
    try {
      const response = await axios.get(`${backendUrl}/api/hospital`);
      if (response.data && Array.isArray(response.data.$values)) {
        setHospitalData(response.data.$values);
      } else {
        setHospitalData([]);
      }
      console.log(response.data.$values);
    } catch (error) {
      console.error('Error fetching hospital data:', error);
    }
  };

  // Fetch data on component mount
  useEffect(() => {
    fetchHospitalData();
  }, [backendUrl]);

  return (
    <div>
      <p className="text-gray-600">Browse through the available hospitals.</p>
      <div className="w-full grid grid-cols-1 sm:grid-cols-2 md:grid-cols-3 gap-6 mt-5">
        {hospitalData.map((item, index) => (
          <div
            onClick={() => { navigate(`/doctors`); window.scrollTo(0, 0); }}
            className="border border-indigo-200 rounded-xl overflow-hidden cursor-pointer hover:translate-y-[-5px] transition-all duration-300 shadow-lg"
            key={index}
          >
            {/* Hospital Image */}
            {item.imageUrl && (
              <img
                className="w-full h-48 object-cover bg-blue-50"
                src={`data:image/png;base64,${item.imageUrl}`}
                alt={item.name}
              />
            )}

            {/* Hospital Details */}
            <div className="p-4">
              <div className="flex items-center gap-2 text-sm text-green-500">
                <span className="w-2 h-2 bg-green-500 rounded-full"></span>
                <span>Available</span>
              </div>
              <p className="text-neutral-800 text-lg font-medium">{item.name}</p>
              <p className="text-gray-600 text-sm">{item.address}</p>
              <p className="text-gray-600 text-sm">{item.phone}</p>
              <p className="text-gray-600 text-sm">{item.email}</p>
            </div>
          </div>
        ))}
      </div>
    </div>
  );
};

export default Hospitals;
