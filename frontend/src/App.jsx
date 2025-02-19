import React from "react";
import { Route, Routes } from "react-router-dom";
import Home from "./Pages/Home";
import Doctors from "./Pages/Doctors";
import Login from "./Pages/Login";
import About from "./Pages/About";
import Myprofile from "./Pages/Myprofile";
import Appointment from "./Pages/Appointment";
import MyAppointments from "./Pages/Myappointments";
import Contact from "./Pages/Contact";
import Navbar from "./components/Navbar";
import Footer from "./components/Footer";
import { ToastContainer } from "react-toastify";
import ProtectedRoute from "./components/ProtectedRoute";
import AppointmentReason from "./Pages/AppointmentReason";
import AppointmentSuccess from "./Pages/AppointmentSuccess";
import Hospitals from "./Pages/Hospitals";
import { AuthProvider } from "./context/AuthContext";
import TreatmentRecords from "./Pages/TreatmentRecords";

const App = () => {
  return (
    <div className="mx-4 sm:mx-[10%]">
      <AuthProvider>
      <Navbar />
      <Routes>
        
        <Route
          path="/login"
          element={
            <ProtectedRoute>
              <Login />
            </ProtectedRoute>
          }
        />

        <Route path="/" element={<Home />} />
        <Route path="/doctors" element={<Doctors />} />
        <Route path="/doctors/:speciality" element={<Doctors />} />
        <Route path="/about" element={<About />} />
        <Route path="/contact" element={<Contact />} />
        <Route path="/my-profile" element={<Myprofile />} />
        <Route path='/hospitals' element={<Hospitals />} />
        <Route path="/my-appointments" element={<MyAppointments />} />
        <Route path="/appointment/:docId" element={<Appointment />} />
        <Route path="/appointment-reason" element={<AppointmentReason />} />
        <Route path="/appointment-success" element={<AppointmentSuccess/>}/>
        <Route path="/treatmentRecords" element={<TreatmentRecords/>}/>
      </Routes>
      <ToastContainer
        position="top-right"
        autoClose={5000}
        hideProgressBar={false}
        newestOnTop={false}
        closeOnClick
        rtl={false}
        pauseOnFocusLoss
        draggable
        pauseOnHover
      />
      <Footer />
      </AuthProvider>
    </div>
  );
};

export default App;
