import { useContext, useState, useEffect } from "react";
import axios from "axios";
import { AppContext } from "../../context/AppContext";

const AddDepartment = () => {
    const [department, setDepartment] = useState({
        name: "",
        description: "",
        hospitalID: "",
        imageFile: null,
    });
    const [hospitals, setHospitals] = useState([]);
    const [message, setMessage] = useState("");
    const [error, setError] = useState("");
    const { backendUrl } = useContext(AppContext);

    useEffect(() => {
        const fetchHospitals = async () => {
            try {
                const response = await axios.get(`${backendUrl}/api/hospital`);
                console.log("Fetched hospitals:", response.data);
                // Extract hospitals from the response and set it to state
                const hospitalList = response.data.$values || [];
                setHospitals(hospitalList);
            } catch (err) {
                console.error("Error fetching hospitals", err);
                setHospitals([]);
            }
        };
        fetchHospitals();
    }, [backendUrl]);

    const handleChange = (e) => {
        setDepartment({ ...department, [e.target.name]: e.target.value });
    };

    const handleFileChange = (e) => {
        setDepartment({ ...department, imageFile: e.target.files[0] });
    };

    const handleSubmit = async (e) => {
        e.preventDefault();
        setMessage("");
        setError("");

        const formData = new FormData();
        formData.append("name", department.name);
        formData.append("description", department.description);
        formData.append("hospitalID", department.hospitalID);
        if (department.imageFile) {
            formData.append("imageFile", department.imageFile);
        }

        try {
            const response = await axios.post(`${backendUrl}/api/department`, formData, {
                headers: { "Content-Type": "multipart/form-data",
                "Authorization" : "Bearer " + localStorage.getItem("aToken")
            },
            });

            setMessage("Department added successfully!");
            setDepartment({ name: "", description: "", hospitalID: "", imageFile: null }); // Reset form
        } catch (err) {
            setError("Error adding department. Please try again.");
        }
    };

    return (
        <div className="max-w-lg mx-auto p-6 bg-white shadow-lg rounded-lg mt-10">
            <h2 className="text-2xl font-semibold mb-4">Add New Department</h2>
            {message && <p className="text-green-600">{message}</p>}
            {error && <p className="text-red-600">{error}</p>}

            <form onSubmit={handleSubmit} className="space-y-4">
                <div>
                    <label className="block font-medium">Department Name</label>
                    <input
                        type="text"
                        name="name"
                        value={department.name}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border rounded-md"
                    />
                </div>
                <div>
                    <label className="block font-medium">Description</label>
                    <input
                        type="text"
                        name="description"
                        value={department.description}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border rounded-md"
                    />
                </div>
                <div>
                    <label className="block font-medium">Hospital</label>
                    <select
                        name="hospitalID"
                        value={department.hospitalID}
                        onChange={handleChange}
                        required
                        className="w-full px-3 py-2 border rounded-md"
                    >
                        <option value="">Select a Hospital</option>
                        {Array.isArray(hospitals) && hospitals.map((hospital) => (
                            <option key={hospital.hospitalID} value={hospital.hospitalID}>
                                {hospital.name}
                            </option>
                        ))}
                    </select>
                </div>
                <div>
                    <label className="block font-medium">Upload Image</label>
                    <input
                        type="file"
                        name="imageFile"
                        accept="image/*"
                        onChange={handleFileChange}
                        className="w-full px-3 py-2 border rounded-md"
                    />
                </div>
                <button
                    type="submit"
                    className="w-full bg-blue-500 text-white py-2 rounded-md hover:bg-blue-600 transition"
                >
                    Add Department
                </button>
            </form>
        </div>
    );
};

export default AddDepartment;
