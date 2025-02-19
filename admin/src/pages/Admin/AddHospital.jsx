import { useContext, useState } from "react";
import axios from "axios";
import { AppContext } from "../../context/AppContext";

const AddHospital = () => {
    const [hospital, setHospital] = useState({
        name: "",
        address: "",
        phone: "",
        email: "",
        imageFile: null, // Added for the image file
    });

    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const { backendUrl } = useContext(AppContext);

    const handleChange = (e) => {
        if (e.target.name === "imageFile") {
            setHospital({ ...hospital, imageFile: e.target.files[0] });
        } else {
            setHospital({ ...hospital, [e.target.name]: e.target.value });
        }
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        // Create FormData to handle file upload
        const formData = new FormData();
        formData.append("name", hospital.name);
        formData.append("address", hospital.address);
        formData.append("phone", hospital.phone);
        formData.append("email", hospital.email);
        if (hospital.imageFile) {
            formData.append("imageFile", hospital.imageFile);
        }

        try {
            const response = await axios.post(`${backendUrl}/api/hospital`, formData, {
                headers: { "Content-Type": "multipart/form-data",
                        "Authorization" : "Bearer " + localStorage.getItem("aToken")
            }, // Set content type for FormData

            });

            setMessage("Hospital added successfully!");
            setHospital({ name: "", address: "", phone: "", email: "", imageFile: null }); // Reset form
        } catch (err) {
            setError("Error adding hospital. Please try again.");
        }
    };

    return (
        <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
            <h2 className="text-2xl font-semibold mb-4">Add New Hospital</h2>
            {message && <p className="text-green-600">{message}</p>}
            {error && <p className="text-red-600">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block font-medium">Hospital Name</label>
                    <input
                        type="text"
                        name="name"
                        value={hospital.name}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border rounded-md"
                    />
                </div>
                <div>
                    <label className="block font-medium">Address</label>
                    <input
                        type="text"
                        name="address"
                        value={hospital.address}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border rounded-md"
                    />
                </div>
                <div>
                    <label className="block font-medium">Phone</label>
                    <input
                        type="text"
                        name="phone"
                        value={hospital.phone}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border rounded-md"
                    />
                </div>
                <div>
                    <label className="block font-medium">Email</label>
                    <input
                        type="email"
                        name="email"
                        value={hospital.email}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border rounded-md"
                    />
                </div>
                <div>
                    <label className="block font-medium">Upload Image</label>
                    <input
                        type="file"
                        name="imageFile"
                        onChange={handleChange}
                        className="w-full px-3 py-2 border rounded-md"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
                >
                    Add Hospital
                </button>
            </form>
        </div>
    );
};

export default AddHospital;
