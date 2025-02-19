import React, { useState, useEffect, useContext } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { AppContext } from './../../context/AppContext';

const DoctorProfile = () => {
  const [profileData, setProfileData] = useState({
    name: "",
    degree: "",
    speciality: "",
    experience: "",
    image: "",
    fees: 0,
    available: false,
  });

  const [isEdit, setIsEdit] = useState(false);
  const { backendUrl } = useContext(AppContext);
  const [doctorId, setDoctorId] = useState(null);
  const [imageFile, setImageFile] = useState(null); // To hold the new image file

  // Function to decode JWT and extract userSpecificId (Doctor ID)
  const getDoctorIdFromJWT = () => {
    const token = localStorage.getItem("dToken"); // Retrieve JWT from local storage
    if (!token) return null;

    try {
      const payload = JSON.parse(atob(token.split('.')[1])); // Decode Base64 payload
      return payload?.userSpecificId || null; // Extract userSpecificId instead of doctorId
    } catch (error) {
      console.error("Error decoding JWT:", error);
      return null;
    }
  };

  useEffect(() => {
    const id = getDoctorIdFromJWT();
    if (id) {
      setDoctorId(id);
      fetchDoctorProfile(id);
    } else {
      toast.error("Doctor ID not found in JWT");
    }
  }, []);

  const fetchDoctorProfile = async (id) => {
    try {
      const token = localStorage.getItem("dToken"); // Get token for auth
      if (!token) {
        toast.error("Authorization token missing. Please log in again.");
        return;
      }

      const response = await axios.get(`${backendUrl}/api/doctor/${id}`, {
        headers: { Authorization: `Bearer ${token}` },
      });
      const doctor = response.data;
      setProfileData({
        name: doctor.name,
        degree: doctor.degree,
        speciality: doctor.specialization,
        experience: doctor.experience,
        image: doctor.imageUrl
          ? `data:image/png;base64,${doctor.imageUrl}`
          : "https://via.placeholder.com/150",
        fees: doctor.fees || 200,
        available: doctor.available || true,
      });
    } catch (error) {
      toast.error("Error fetching doctor profile");
      console.error(error);
    }
  };

  // Handle image file change
  const handleImageChange = (e) => {
    const file = e.target.files[0];
    if (file) {
      setImageFile(file);
      const reader = new FileReader();
      reader.onloadend = () => {
        setProfileData((prev) => ({
          ...prev,
          image: reader.result, // Display the selected image preview
        }));
      };
      reader.readAsDataURL(file);
    }
  };

  // Handle name change
  const handleNameChange = (e) => {
    setProfileData((prev) => ({
      ...prev,
      name: e.target.value,
    }));
  };

  // Handle fee change
  const handleFeeChange = (e) => {
    setProfileData((prev) => ({
      ...prev,
      fees: e.target.value,
    }));
  };

  // Handle experience change
  const handleExperienceChange = (e) => {
    setProfileData((prev) => ({
      ...prev,
      experience: e.target.value,
    }));
  };

  const updateProfile = async () => {
    if (!doctorId) {
      toast.error("Doctor ID is missing");
      return;
    }

    try {
      const token = localStorage.getItem("dToken"); // Get token for auth
      if (!token) {
        toast.error("Authorization token missing. Please log in again.");
        return;
      }

      const formData = new FormData();
      formData.append("name", profileData.name);
      formData.append("degree", profileData.degree);
      formData.append("specialization", profileData.speciality);
      formData.append("experience", profileData.experience);
      formData.append("available", profileData.available);
      formData.append("fees", profileData.fees);

      // Append image if available
      if (imageFile) {
        formData.append("ImageFile", imageFile);
      }

      await axios.put(`${backendUrl}/api/doctor/${doctorId}`, formData, {
        headers: {
          Authorization: `Bearer ${token}`,
          'Content-Type': 'multipart/form-data',
        },
      });

      toast.success("Profile updated successfully");
      setIsEdit(false);
    } catch (error) {
      toast.error("Error updating profile");
      console.error(error);
    }
  };

  return (
    <div className="flex flex-col gap-4 m-5">
      <div>
        <img
          className="bg-primary/80 w-full sm:max-w-64 rounded-lg"
          src={profileData.image}
          alt="Doctor"
        />
      </div>

      <div className="flex-1 border border-stone-100 rounded-lg p-8 py-7 bg-white">
        {/* Name section */}
        {isEdit ? (
          <input
            type="text"
            value={profileData.name}
            onChange={handleNameChange}
            className="text-3xl font-medium text-gray-700 border border-gray-300 rounded-md px-3 py-2 mb-2 w-full"
          />
        ) : (
          <p className="flex items-center gap-2 text-3xl font-medium text-gray-700">
            {profileData.name}
          </p>
        )}

        <div className="flex items-center gap-2 mt-1 text-gray-600">
          <p>
            {profileData.degree} - {profileData.speciality}
          </p>
          <button className="py-0.5 px-2 border text-xs rounded-full">
            {profileData.experience}
          </button>
        </div>

        <p className="text-gray-600 font-medium mt-4">
          Appointment fee:{" "}
          <span className="text-gray-800">
            {`₹ ${profileData.fees}`}
          </span>
        </p>

        {isEdit && (
          <>
            {/* Image upload */}
            <div className="mt-4">
              <label className="block mb-1 font-medium">Upload Image:</label>
              <input type="file" accept="image/*" onChange={handleImageChange} />
            </div>

            {/* Fee input */}
            <div className="mt-4">
              <label htmlFor="fees" className="block font-medium">
                Appointment Fee:
              </label>
              <input
                type="number"
                id="fees"
                value={profileData.fees}
                onChange={handleFeeChange}
                className="border rounded-md px-3 py-1 w-24 mt-2"
              />
            </div>
          </>
        )}

        {isEdit ? (
          <button
            onClick={updateProfile}
            className="px-4 py-1 border border-primary text-sm rounded-full mt-5 hover:bg-primary hover:text-white transition-all"
          >
            Save
          </button>
        ) : (
          <button
            onClick={() => setIsEdit(true)}
            className="px-4 py-1 border border-primary text-sm rounded-full mt-5 hover:bg-primary hover:text-white transition-all"
          >
            Edit
          </button>
        )}
      </div>
    </div>
  );
};

export default DoctorProfile;
