import React, { useContext, useState, useEffect } from 'react';
import { Link } from 'react-router-dom';
import axios from 'axios';
import { AppContext } from '../context/AppContext';

const SpecialityMenu = () => {
  const { backendUrl } = useContext(AppContext);
  const [specialityData, setSpecialityData] = useState([]);

  useEffect(() => {
    const fetchSpecialities = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/department`);
        const departments = response.data.$values || [];

        // Debugging log
        console.log("Fetched Departments:", departments);

        setSpecialityData(departments);
      } catch (error) {
        console.error('Error fetching speciality data:', error);
      }
    };

    fetchSpecialities();
  }, [backendUrl]);

  return (
    <div className='flex flex-col items-center gap-4 py-16 text-gray-600' id='speciality'>
      <h1 className='text-3xl font-medium'>Find By Speciality</h1>
      <p className='sm:w-1/3 text-center text-sm'>
        Simply browse through our extensive list of trusted doctors, schedule your appointment hassle-free.
      </p>
      <div className='flex sm:justify-center gap-4 pt-5 w-full overflow-scroll'>
        {specialityData.length > 0 ? (
          specialityData.map((item) => (
            <Link
              key={item.$id}
              onClick={() => scrollTo(0, 0)}
              className='flex flex-col items-center text-xs cursor-pointer flex-shrink-0 hover:translate-y-[-10px] transition-all duration-500'
              to={`/doctors/${item.name}`}
            >
              <img
                    className='w-16 sm:w-24 mb-2'
                    src={`data:image/svg+xml;base64,${item.imageBase64}`}
                    alt={item.name}
                  />
              <p>{item.name}</p>
            </Link>
          ))
        ) : (
          <p>No specialities available.</p>
        )}
      </div>
    </div>
  );
};

export default SpecialityMenu;
