import React, { useContext, useEffect, useState } from "react";
import { useParams, useNavigate } from "react-router-dom";
import { AppContext } from "../context/AppContext";
import axios from "axios";

const Appointment = () => {
  const { docId } = useParams();
  const { currencySymbol, backendUrl, userId } = useContext(AppContext);
  const navigate = useNavigate();
  const daysOfWeek = ["SUN", "MON", "TUE", "WED", "THU", "FRI", "SAT"];

  const [docInfo, setDocInfo] = useState(null);
  const [docSlots, setDocSlots] = useState([]);
  const [slotIndex, setSlotIndex] = useState(0);
  const [slotTime, setSlotTime] = useState("");

  useEffect(() => {
    // // Check if the user is logged in
    // const token = localStorage.getItem("token");
    // if (!token) {
    //   navigate("/login");
    //   return;
    // }
    
    const fetchDocInfo = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/doctor/${docId}`);
        setDocInfo(response.data);
      } catch (error) {
        console.error("Error fetching doctor info:", error);
      }
    };
    fetchDocInfo();
  }, [docId, backendUrl, navigate]);

  useEffect(() => {
    if (docInfo) {
      generateSlots();
    }
  }, [docInfo]);

  const generateSlots = () => {
    let today = new Date();
    let slots = [];

    for (let i = 0; i < 7; i++) {
      let currentDate = new Date(today);
      currentDate.setDate(today.getDate() + i);
      let endTime = new Date(currentDate);
      endTime.setHours(21, 0, 0, 0);

      if (i === 0) {
        let now = new Date();
        currentDate.setHours(now.getHours() >= 10 ? now.getHours() + 1 : 10);
        currentDate.setMinutes(now.getMinutes() > 30 ? 30 : 0);
      } else {
        currentDate.setHours(10, 0, 0, 0);
      }

      let timeSlots = [];
      while (currentDate < endTime) {
        timeSlots.push({
          dateTime: new Date(currentDate),
          time: currentDate.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" })
        });
        currentDate.setMinutes(currentDate.getMinutes() + 30);
      }

      slots.push(timeSlots);
    }
    setDocSlots(slots);
  };

  const handleBookAppointment = () => {
    navigate("/appointment-reason", {
      state: {
        doctorId: docId,
        patientId: userId,
        appointmentDate: docSlots[slotIndex][0]?.dateTime,
        appointmentTime: slotTime,
      },
    });
  };

  return docInfo && (
    <div className="container mx-auto p-6">
      <div className="flex flex-col sm:flex-row gap-6 py-6">
        <img className="w-48 h-48 rounded-lg object-cover" src={`data:image/png;base64,${docInfo.imageUrl}`} alt={docInfo.name} />
        <div className="flex-1 border p-6 rounded-lg shadow-lg">
          <h2 className="text-2xl font-semibold text-gray-900">{docInfo.name}</h2>
          <p className="text-gray-600">{docInfo.specialization} - {docInfo.hospitalName}</p>
          <p className="text-gray-600">Department: {docInfo.departmentName}</p>
          <p className="text-gray-600">Contact: {docInfo.phone} | {docInfo.email}</p>
          <p className="text-gray-700 mt-3 font-medium">Appointment Fee: {currencySymbol}500</p>
        </div>
      </div>

      <div className="mt-6">
        <h3 className="text-lg font-semibold">Booking Slots</h3>
        <div className="flex gap-3 overflow-x-auto py-4">
          {docSlots.map((slots, index) => (
            <div key={index} onClick={() => setSlotIndex(index)} className={`cursor-pointer px-4 py-2 rounded-full ${slotIndex === index ? "bg-blue-600 text-white" : "border"}`}>
              <p>{slots[0] && daysOfWeek[slots[0].dateTime.getDay()]}</p>
              <p>{slots[0] && slots[0].dateTime.getDate()}</p>
            </div>
          ))}
        </div>
        <div className="flex gap-3 overflow-x-auto py-2">
          {docSlots[slotIndex] && docSlots[slotIndex].map((item, index) => (
            <span key={index} onClick={() => setSlotTime(item.time)} className={`cursor-pointer px-4 py-2 rounded-full ${item.time === slotTime ? "bg-blue-600 text-white" : "border"}`}>{item.time}</span>
          ))}
        </div>
        <button onClick={handleBookAppointment} className="bg-blue-600 text-white px-6 py-3 rounded-lg mt-4">
          Book an appointment
        </button>
      </div>
    </div>
  );
};

export default Appointment;
