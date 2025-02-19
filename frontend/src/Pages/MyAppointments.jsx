import React, { useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios';
import { toast } from 'react-toastify';

const MyAppointments = () => {
  const { backendUrl } = useContext(AppContext);

  // States for data
  const [appointments, setAppointments] = useState([]);
  const [doctors, setDoctors] = useState({});
  const [hospitals, setHospitals] = useState({});
  const [loading, setLoading] = useState(true);
  const [error, setError] = useState(null);
  const [paymentLoading, setPaymentLoading] = useState(false);
  const [patientData, setPatientData] = useState(null);
  // Map of appointmentID to isVisibleToPatient (true means paid)
  const [appointmentVisibilityMap, setAppointmentVisibilityMap] = useState({});

  // Get token and decode it to extract patientId
  const token = localStorage.getItem("token");
  const decodedToken = token ? JSON.parse(atob(token.split(".")[1])) : null;
  const patientId = decodedToken ? decodedToken.userSpecificId : null;

  // Fetch appointments and patient data
  useEffect(() => {
    if (!token || !patientId) {
      setError("Please login to view your appointments.");
      setLoading(false);
      return;
    }

    const fetchAppointments = async () => {
      try {
        const response = await axios.get(
          `${backendUrl}/api/appointment/patient/${patientId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        console.log("API response for appointments:", response.data);
    
        // Ensure the data is always an array.
        let appointmentsData = response.data?.$values ?? [];
        setAppointments(Array.isArray(appointmentsData) ? appointmentsData : []);
    
        if (appointmentsData.length === 0) {
          setError("No appointments found for this patient.");
        }
      } catch (err) {
        console.error("Error fetching appointments:", err);
        setError("Failed to fetch appointments");
      } finally {
        setLoading(false);
      }
    };

    const fetchPatientData = async () => {
      try {
        const response = await axios.get(
          `${backendUrl}/api/patient/${patientId}`,
          { headers: { Authorization: `Bearer ${token}` } }
        );
        if (response.data) {
          setPatientData(response.data);
        } else {
          setError("Failed to retrieve patient data.");
        }
      } catch (err) {
        console.error("Error fetching patient data:", err);
        setError("Failed to fetch patient data");
      }
    };

    fetchAppointments();
    fetchPatientData();
  }, [backendUrl, token, patientId]);

  // Fetch visible treatment records for the patient and create a mapping based on appointmentID.
  useEffect(() => {
    if (!patientId) return;
    axios
      .get(`${backendUrl}/api/treatmentrecords/patient/${patientId}/visible`, {
        headers: { Authorization: `Bearer ${token}` }
      })
      .then(response => {
        // Assuming the response returns an object with a "$values" property.
        const treatmentRecords = response.data?.$values || [];
        // Build a map where each key is an appointmentID and its value is isVisibleToPatient.
        const visibilityMap = {};
        treatmentRecords.forEach(record => {
          visibilityMap[record.appointmentID] = record.isVisibleToPatient;
        });
        setAppointmentVisibilityMap(visibilityMap);
      })
      .catch(err => {
        console.error("Error fetching visible treatment records:", err);
      });
  }, [backendUrl, token, patientId]);

  // Fetch doctor and hospital details for each appointment.
  useEffect(() => {
    const fetchDoctorsAndHospitals = async () => {
      if (appointments.length === 0) return;
      try {
        // Fetch doctor details.
        const doctorPromises = appointments.map(appointment =>
          axios.get(`${backendUrl}/api/doctor/${appointment.doctorID}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        );
        const doctorResponses = await Promise.all(doctorPromises);
        const doctorData = doctorResponses.reduce((acc, response) => {
          acc[response.data.doctorID] = response.data;
          return acc;
        }, {});
        setDoctors(doctorData);

        // Extract unique hospital IDs.
        const hospitalIds = [
          ...new Set(doctorResponses.map(response => response.data.hospitalID))
        ];
        // Fetch hospital details.
        const hospitalPromises = hospitalIds.map(hospitalId =>
          axios.get(`${backendUrl}/api/hospital/${hospitalId}`, {
            headers: { Authorization: `Bearer ${token}` }
          })
        );
        const hospitalResponses = await Promise.all(hospitalPromises);
        const hospitalData = hospitalResponses.reduce((acc, response) => {
          acc[response.data.hospitalID] = response.data;
          return acc;
        }, {});
        setHospitals(hospitalData);
      } catch (err) {
        console.error("Error fetching doctor or hospital details:", err);
        setError("Failed to fetch doctor or hospital details");
      }
    };

    fetchDoctorsAndHospitals();
  }, [appointments, backendUrl, token]);

  // Payment handler with Razorpay integration.
  const handlePayOnline = async (appointment) => {
    if (!patientData) {
      setError("Patient data is missing. Cannot proceed.");
      return;
    }
    if (!appointment.treatmentRecordID || appointment.treatmentRecordID === 0) {
      setError("No treatment record available for this appointment.");
      return;
    }

    // Retrieve the doctor details for this appointment to extract the fees.
    const doctorDetails = doctors[appointment.doctorID];
    // Use doctor's fees if available, otherwise fallback to a default value (e.g., 1000).
    const amount = doctorDetails && doctorDetails.fees ? doctorDetails.fees : 1000;

    try {
      setPaymentLoading(true);
      const options = {
        key: "rzp_test_LMZHnNT5VlTSU1", // Replace with your actual Razorpay publishable key.
        amount: amount * 100, // Convert amount to paise.
        currency: "INR",
        name: "Appointment Payment",
        description: "Payment for your appointment",
        prefill: {
          name: patientData.name,
          email: patientData.email,
          contact: patientData.contactNumber
        },
        theme: {
          color: "#3399cc"
        },
        handler: async function(response) {
          try {
            toast.success("Payment Successful: " + response.razorpay_payment_id);
            // Update treatment record's visibility via your API.
            const updateResponse = await axios.put(
              `${backendUrl}/api/treatmentrecords/${appointment.treatmentRecordID}/visibility`,
              { IsVisibleToPatient: true },
              { headers: { Authorization: `Bearer ${token}` } }
            );
            if (updateResponse.status === 200) {
              toast.success("Your treatment record is now visible.");
              // Update the appointmentVisibilityMap state for this appointment.
              setAppointmentVisibilityMap(prev => ({
                ...prev,
                [appointment.appointmentID]: true
              }));
            } else {
              toast.warning("Payment succeeded, but updating the record failed.");
            }
          } catch (err) {
            console.error("Error updating treatment record after payment:", err);
            toast.warning("Payment succeeded, but error updating record: " + err.message);
          }
        },
        modal: {
          ondismiss: function() {
            toast.info("Payment popup closed");
          }
        }
      };

      const rzp1 = new window.Razorpay(options);
      rzp1.open();
    } catch (error) {
      console.error("Error processing payment:", error);
      toast.error("Payment failed: " + error.message);
    } finally {
      setPaymentLoading(false);
    }
  };

  // Handle appointment cancellation.
  const handleDelete = async (appointmentId) => {
    if (!token) {
      setError("Please login to cancel an appointment.");
      return;
    }
    try {
      const response = await axios.delete(
        `${backendUrl}/api/appointment/${appointmentId}`,
        { headers: { Authorization: `Bearer ${token}` } }
      );
      if (response.status === 200) {
        setAppointments(prevAppointments =>
          prevAppointments.filter(app => app.appointmentID !== appointmentId)
        );
        toast.success("Appointment canceled successfully.");
      } else {
        setError("Failed to cancel the appointment.");
      }
    } catch (err) {
      console.error("Error deleting appointment:", err);
      setError("Failed to cancel the appointment.");
    }
  };

  return (
    <div>
      <p className="pb-3 mt-12 font-medium text-zinc-700 border-b">My appointments</p>
      {loading && <p>Loading appointments...</p>}
      {error && <p className="text-red-500">{error}</p>}
      <div>
        {appointments.length === 0 && !loading && !error && (
          <p>No appointments available.</p>
        )}
        {appointments.map((appointment, index) => {
          const doctor = doctors[appointment.doctorID];
          const hospital = doctor && doctor.hospitalID ? hospitals[doctor.hospitalID] : null;
          // Check visibility using appointmentID from the visibility map.
          const isPaid = appointmentVisibilityMap[appointment.appointmentID] === true;
          return (
            <div
              key={index}
              className="grid grid-cols-[1fr_2fr] gap-4 sm:flex sm:gap-6 py-2 border-b"
            >
              <div>
                {doctor && doctor.imageUrl && (
                  <img
                    className="w-32 bg-indigo-50"
                    src={`data:image/png;base64,${doctor.imageUrl}`}
                    alt={doctor.name}
                  />
                )}
              </div>
              <div className="flex-1 text-sm text-zinc-600">
                <p className="text-neutral-800 font-semibold">
                  {doctor ? doctor.name : "Doctor not found"}
                </p>
                <p>{doctor ? doctor.specialization : "Speciality not available"}</p>
                <p className="text-zinc-700 font-medium mt-1">Hospital:</p>
                {hospital ? (
                  <>
                    <p className="text-xs">{hospital.name},</p>
                    <p className="text-xs">{hospital.address}</p>
                  </>
                ) : (
                  <p className="text-xs">Hospital information not available</p>
                )}
                <p className="text-xs mt-1">
                  <span className="text-sm text-neutral-700 font-medium">Date & Time:</span>{" "}
                  {new Date(appointment.appointmentDate).toLocaleDateString()} |{" "}
                  {appointment.appointmentTime}
                </p>
              </div>
              <div className="flex flex-col gap-2 justify-end">
                {isPaid ? (
                  <div className="text-green-600 font-semibold">Paid</div>
                ) : (
                  <>
                    <button
                      onClick={() => handlePayOnline(appointment)}
                      className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-primary hover:text-white transition-all duration-300"
                    >
                      {paymentLoading ? "Processing..." : "Pay Online"}
                    </button>
                    <button
                      onClick={() => handleDelete(appointment.appointmentID)}
                      className="text-sm text-stone-500 text-center sm:min-w-48 py-2 border rounded hover:bg-red-600 hover:text-white transition-all duration-300"
                    >
                      Cancel Appointment
                    </button>
                  </>
                )}
              </div>
            </div>
          );
        })}
      </div>
    </div>
  );
};

export default MyAppointments;
