import React, { useState, useEffect, useContext } from "react";
import { AppContext } from "../context/AppContext";
import axios from "axios";
import { toast } from "react-toastify";
import { assets } from "../assets/assets"; // Default profile picture

const MyProfile = () => {
  const { backendUrl, userId } = useContext(AppContext);
  const [userData, setUserData] = useState(null);
  const [isEdit, setIsEdit] = useState(false);
  const [loading, setLoading] = useState(true);
  const [imageFile, setImageFile] = useState(null);

  useEffect(() => {
    if (!userId) {
      setLoading(false);
      return;
    }

    const fetchUserData = async () => {
      try {
        const token = localStorage.getItem("token");
        if (!token) {
          toast.error("Please login to view your profile");
          return;
        }

        const response = await axios.get(`${backendUrl}/api/patient/${userId}`, {
          headers: { Authorization: `Bearer ${token}` },
        });

        setUserData(response.data);
        setLoading(false);
      } catch (error) {
        console.error("Error fetching user data:", error);
        toast.error("Failed to fetch user data");
        setLoading(false);
      }
    };

    fetchUserData();
  }, [userId, backendUrl]);

  // Handle Image Upload
  const handleImageUpload = async (event) => {
    const file = event.target.files[0];
    if (file) {
      setImageFile(file);

      const formData = new FormData();
      formData.append("file", file);

      try {
        const token = localStorage.getItem("token");
        const response = await axios.post(
          `${backendUrl}/api/patient/${userData.patientID}/upload-image`,
          formData,
          {
            headers: {
              Authorization: `Bearer ${token}`,
              "Content-Type": "multipart/form-data",
            },
          }
        );
        toast.success("Image uploaded successfully!");
        setUserData({ ...userData, image: response.data.image });
      } catch (error) {
        console.error("Error uploading image:", error);
        toast.error("Error uploading image.");
      }
    }
  };

  if (loading) {
    return <p className="text-center text-gray-600">Loading...</p>;
  }

  if (!userData) {
    return (
      <div className="container mx-auto p-6">
        <h2 className="text-2xl font-semibold">User not found. Please log in again.</h2>
      </div>
    );
  }

  return (
    <div className="max-w-lg mx-auto flex flex-col items-center gap-4 text-sm bg-white p-6 shadow-md rounded-lg">
      {/* Profile Image Section */}
      <div className="relative w-32 h-32 rounded-full overflow-hidden border-4 border-gray-300 shadow-lg">
        {userData.image ? (
          <img
            className="w-full h-full object-cover"
            src={`data:image/jpeg;base64,${userData.image}`}
            alt="Profile"
          />
        ) : (
          <label className="w-full h-full flex items-center justify-center bg-gray-200 cursor-pointer hover:bg-gray-300 transition">
            <span className="text-gray-600 text-xs text-center">Upload Photo</span>
            <input
              type="file"
              accept="image/*"
              onChange={handleImageUpload}
              className="hidden"
            />
          </label>
        )}
      </div>

      {/* User Details */}
      <div className="text-center">
        {isEdit ? (
          <input
            className="bg-gray-50 text-3xl font-medium w-60 text-center"
            type="text"
            value={userData.firstName}
            onChange={(e) =>
              setUserData({ ...userData, firstName: e.target.value })
            }
          />
        ) : (
          <p className="font-medium text-3xl text-neutral-800">
            {userData.firstName} {userData.lastName}
          </p>
        )}

        <p className="text-gray-500">{userData.email}</p>
      </div>

      <hr className="bg-zinc-400 h-[1px] w-full border-none my-4" />

      <div className="w-full">
        <p className="text-neutral-500 underline">CONTACT INFORMATION</p>
        <div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700">
          <p className="font-medium">Phone:</p>
          {isEdit ? (
            <input
              className="bg-gray-100 max-w-52"
              type="text"
              value={userData.phone}
              onChange={(e) =>
                setUserData({ ...userData, phone: e.target.value })
              }
            />
          ) : (
            <p className="text-blue-400">{userData.phone}</p>
          )}
          <p className="font-medium">Address:</p>
          {isEdit ? (
            <input
              className="bg-gray-50 w-full"
              onChange={(e) =>
                setUserData({ ...userData, address: e.target.value })
              }
              value={userData.address}
              type="text"
            />
          ) : (
            <p className="text-gray-500">{userData.address}</p>
          )}
        </div>
      </div>

      <div className="w-full">
        <p className="text-neutral-500 underline">BASIC INFORMATION</p>
        <div className="grid grid-cols-[1fr_3fr] gap-y-2.5 mt-3 text-neutral-700">
          <p className="font-medium">Gender:</p>
          {isEdit ? (
            <select
              className="max-w-20 bg-gray-100"
              onChange={(e) => setUserData({ ...userData, gender: e.target.value })}
              value={userData.gender}
            >
              <option value="Male">Male</option>
              <option value="Female">Female</option>
            </select>
          ) : (
            <p className="text-gray-400">{userData.gender}</p>
          )}
          <p className="font-medium">Birthday:</p>
          {isEdit ? (
            <input
              className="max-w-28 bg-gray-100"
              type="date"
              onChange={(e) =>
                setUserData({ ...userData, dateOfBirth: e.target.value })
              }
              value={userData.dateOfBirth}
            />
          ) : (
            <p className="text-gray-400">{userData.dateOfBirth}</p>
          )}
        </div>
      </div>

      <div className="mt-6">
        {isEdit ? (
          <button
            className="border border-primary px-6 py-2 rounded-full hover:bg-primary hover:text-white transition-all"
            onClick={async () => {
              try {
                const token = localStorage.getItem("token");
                await axios.patch(`${backendUrl}/api/patient/${userData.patientID}`, userData, {
                  headers: {
                    Authorization: `Bearer ${token}`,
                    "Content-Type": "application/json",
                  },
                });
                toast.success("Profile updated successfully");
                setIsEdit(false);
              } catch (error) {
                toast.error("Error updating profile");
              }
            }}
          >
            Save Changes
          </button>
        ) : (
          <button
            className="border border-primary px-6 py-2 rounded-full hover:bg-primary hover:text-white transition-all"
            onClick={() => setIsEdit(true)}
          >
            Edit Profile
          </button>
        )}
      </div>
    </div>
  );
};

export default MyProfile;
