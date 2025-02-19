import React, { useContext } from "react";
import { DoctorContext } from "./context/DoctorContext";
import { AdminContext } from "./context/AdminContext";
import { Route, Routes, Navigate } from "react-router-dom";
import { ToastContainer } from "react-toastify";
import "react-toastify/dist/ReactToastify.css";
import Navbar from "./components/Navbar";
import Sidebar from "./components/Sidebar";
import Dashboard from "./pages/Admin/Dashboard";
import AllAppointments from "./pages/Admin/AllAppointments";
import AddDoctor from "./pages/Admin/AddDoctor";
import DoctorsList from "./pages/Admin/DoctorsList";
import Login from "./pages/Login";
import DoctorAppointments from "./pages/Doctor/DoctorAppointments";
import DoctorDashboard from "./pages/Doctor/DoctorDashboard";
import DoctorProfile from "./pages/Doctor/DoctorProfile";
import AddHospital from "./pages/Admin/AddHospital";
import AddDepartment from "./pages/Admin/AddDepartment";
import HospitalsList from "./pages/Admin/HospitalList";
import DepartmentList from "./pages/Admin/DepartmentList";
import TreatmentRecordForm from "./pages/Doctor/TreatmentRecordForm";
import TreatmentRecordPage from "./pages/Doctor/TreatmentRecordPage";

const App = () => {
  const { dToken } = useContext(DoctorContext);
  const { aToken } = useContext(AdminContext);

  return (
    <div className="bg-[#F8F9FD]">
      <ToastContainer />
      {dToken || aToken ? (
        <>
          <Navbar />
          <div className="flex items-start">
            <Sidebar />
            <Routes>
              {/* Redirect based on login type */}
              <Route
                path="/"
                element={
                  aToken ? (
                    <Navigate to="/admin-dashboard" />
                  ) : dToken ? (
                    <Navigate to="/doctor-appointments" />
                  ) : (
                    <Login />
                  )
                }
              />
              {/* Admin Routes */}
              {aToken && (
                <>
                  <Route path="/admin-dashboard" element={<Dashboard />} />
                  <Route
                    path="/all-appointments"
                    element={<AllAppointments />}
                  />
                  <Route path="/add-doctor" element={<AddDoctor />} />
                  <Route path="/add-hospital" element={<AddHospital />} />
                  <Route path="/add-department" element={<AddDepartment />} />
                  <Route path="/doctor-list" element={<DoctorsList />} />
                  <Route path="/hospital-list" element={<HospitalsList />} />
                  <Route path="/department-list" element={<DepartmentList />} />
                </>
              )}
              {/* Doctor Routes */}
              {dToken && (
                <>
                  {/* <Route
                    path="/doctor-appointments"
                    element={<DoctorAppointments />}
                  /> */}
                  <Route
                    path="/doctor-appointments"
                    element={<DoctorAppointments />}
                  />
                  <Route path="/doctor-profile" element={<DoctorProfile />} />
                  <Route path="/doctor-treatmentRecord/:appointmentID" element={<TreatmentRecordForm />} />
                  <Route path="/doctor-treatmentPage/:treatmentRecordID" element={<TreatmentRecordPage />} />
                </>
              )}
            </Routes>
          </div>
        </>
      ) : (
        <>
          <Login />
        </>
      )}
    </div>
  );
};

export default App;
