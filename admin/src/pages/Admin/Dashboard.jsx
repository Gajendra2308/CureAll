import React, { useContext, useEffect, useState } from 'react';
import { assets } from '../../assets/assets';
import { AppContext } from '../../context/AppContext';

const Dashboard = () => {
  const { slotDateFormat, backendUrl, doctors, appointments, patients } = useContext(AppContext);

  const [dashData, setDashData] = useState({
    doctors: 0,
    appointments: 0,
    patients: 0,
    latestAppointments: [],
  });

  const [loading, setLoading] = useState(true);

  useEffect(() => {
    if (doctors && appointments && patients) {
      const doctorCount = Array.isArray(doctors) ? doctors.length : 0;
      const appointmentCount = Array.isArray(appointments) ? appointments.length : 0;
      const patientCount = Array.isArray(patients) ? patients.length : 0;

      let sortedAppointments = [...appointments];
      sortedAppointments.sort((a, b) => new Date(b.appointmentDate) - new Date(a.appointmentDate));
      const latestAppointments = sortedAppointments.slice(0, 5).map((appointment) => {
        const patient = patients.find(p => p.patientID === appointment.patientID);
        const doctor = doctors.find(d => d.doctorID === appointment.doctorID);
        return {
          ...appointment,
          patientName: patient ? `${patient.firstName} ${patient.lastName}` : 'Unknown',
          doctorName: doctor ? doctor.name : 'Unknown',
          doctorImage: doctor ? doctor.imageUrl : '',
        };
      });

      setDashData({
        doctors: doctorCount,
        appointments: appointmentCount,
        patients: patientCount,
        latestAppointments,
      });
      setLoading(false);
    }
  }, [doctors, appointments, patients, slotDateFormat]);

  if (loading) {
    return <div>Loading...</div>;
  }

  return (
    <div className='m-5'>
      <div className='flex flex-wrap gap-3'>
        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
          <img className='w-14' src={assets.doctor_icon} alt='' />
          <div>
            <p className='text-xl font-semibold text-gray-600'>{dashData.doctors}</p>
            <p className='text-gray-400'>Doctors</p>
          </div>
        </div>
        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
          <img className='w-14' src={assets.appointments_icon} alt='' />
          <div>
            <p className='text-xl font-semibold text-gray-600'>{dashData.appointments}</p>
            <p className='text-gray-400'>Appointments</p>
          </div>
        </div>
        <div className='flex items-center gap-2 bg-white p-4 min-w-52 rounded border-2 border-gray-100 cursor-pointer hover:scale-105 transition-all'>
          <img className='w-14' src={assets.patients_icon} alt='' />
          <div>
            <p className='text-xl font-semibold text-gray-600'>{dashData.patients}</p>
            <p className='text-gray-400'>Patients</p>
          </div>
        </div>
      </div>

      <div className='bg-white mt-5'>
        <div className='flex items-center gap-2.5 px-4 py-4 rounded-t border'>
          <img src={assets.list_icon} alt='' />
          <p className='font-semibold'>Latest Bookings</p>
        </div>
        <div className='pt-4 border border-t-0'>
          {dashData.latestAppointments.length > 0 ? (
            dashData.latestAppointments.map((appointment, index) => (
              <div
                key={index}
                className='flex items-center px-6 py-3 gap-3 hover:bg-gray-100'
              >
                <img
                  className='rounded-full w-10'
                  src={`data:image/png;base64,${appointment.doctorImage}`}
                  alt='Doctor'
                />
                <div className='flex-1 text-sm'>
                  <p className='text-gray-800 font-medium'>{appointment.doctorName}</p>
                  <p className='text-gray-600'>
                    Booking on {slotDateFormat(appointment.appointmentDate)} at {appointment.appointmentTime}
                  </p>
                </div>
                {appointment.status === 'Cancelled' ? (
                  <p className='text-red-400 text-xs font-medium'>Cancelled</p>
                ) : appointment.status === 'Completed' ? (
                  <p className='text-green-500 text-xs font-medium'>Completed</p>
                ) : (
                  <img
                    onClick={() => {}}
                    className='w-10 cursor-pointer'
                    src={assets.cancel_icon}
                    alt='Cancel Appointment'
                  />
                )}
              </div>
            ))
          ) : (
            <p>Loading...</p>
          )}
        </div>
      </div>
    </div>
  );
};

export default Dashboard;
