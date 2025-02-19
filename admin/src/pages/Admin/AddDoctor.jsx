import React, { useContext, useState, useEffect } from 'react';
import { toast } from 'react-toastify';
import axios from 'axios';
import { AppContext } from '../../context/AppContext';

const AddDoctor = () => {
  const [docImg, setDocImg] = useState(null);
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [experience, setExperience] = useState('1 Year');
  const [fees, setFees] = useState('');
  const [speciality, setSpeciality] = useState('General physician');
  const [degree, setDegree] = useState('');
  const [address1, setAddress1] = useState('');
  const [address2, setAddress2] = useState('');
  const [phone, setPhone] = useState('');
  const [hospitalId, setHospitalId] = useState('');
  const [departmentId, setDepartmentId] = useState('');
  const { backendUrl } = useContext(AppContext);

  // State for hospitals and departments
  const [hospitals, setHospitals] = useState([]);
  const [departments, setDepartments] = useState([]);

  useEffect(() => {
    // Fetch hospitals data
    const fetchHospitals = async () => {
      try {
        const response = await axios.get(`${backendUrl}/api/hospital`);
        setHospitals(response.data.$values); // Extract hospital data from $values
      } catch (error) {
        toast.error('Error fetching hospitals');
        console.error(error);
      }
    };

    fetchHospitals();
  }, [backendUrl]);

  useEffect(() => {
    // Fetch departments data based on selected hospital
    const fetchDepartments = async () => {
      if (hospitalId) {
        try {
          const response = await axios.get(`${backendUrl}/api/department/hospital/${hospitalId}`);
          setDepartments(response.data.$values); // Extract department data from $values
        } catch (error) {
          toast.error('Error fetching departments');
          console.error(error);
        }
      }
    };

    fetchDepartments();
  }, [hospitalId, backendUrl]);

  const onSubmitHandler = async (event) => {
    event.preventDefault();

    try {
      if (!docImg) {
        return toast.error('Image Not Selected');
      }

      const formData = new FormData();
      formData.append('ImageFile', docImg);
      formData.append('Name', name);
      formData.append('Email', email);
      formData.append('Password', password);
      formData.append('Experience', experience);
      formData.append('Fees', fees);
      formData.append('Specialization', speciality);
      formData.append('Degree', degree);
      formData.append('Phone', phone);
      formData.append('Address1', address1);
      formData.append('Address2', address2);
      formData.append('HospitalID', hospitalId);
      formData.append('DepartmentID', departmentId);
      formData.append('IsAvailable', 'true');

      const response = await axios.post(`${backendUrl}/api/Doctor/register`, formData, {
        headers: {
          'Content-Type': 'multipart/form-data',
          'Authorization' : `Bearer ${localStorage.getItem('aToken')}`
        },
      });

      if (response.status === 201) {
        toast.success('Doctor added successfully!');
        setDocImg(null);
        setName('');
        setEmail('');
        setPassword('');
        setExperience('1 Year');
        setFees('');
        setSpeciality('General physician');
        setDegree('');
        setPhone('');
        setAddress1('');
        setAddress2('');
        setHospitalId('');
        setDepartmentId('');
      }
    } catch (error) {
      console.error('Error adding doctor:', error);
      toast.error(error.response?.data?.message || 'An error occurred while adding the doctor');
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className='m-5 w-full'>
      <p className='mb-3 text-lg font-medium'>Add Doctor</p>
      <div className='bg-white px-8 py-8 border rounded w-full max-w-4xl max-h-[80vh] overflow-y-scroll'>
        
        {/* Image Upload */}
        <div className='flex items-center gap-4 mb-8 text-gray-500'>
          <label htmlFor="doc-img">
            <img
              className='w-16 bg-gray-100 rounded-full cursor-pointer'
              src={docImg ? URL.createObjectURL(docImg) : 'assets/upload_area'}
              alt="Doctor Profile"
            />
          </label>
          <input
            onChange={(e) => setDocImg(e.target.files[0])}
            type="file"
            id="doc-img"
            hidden
          />
          <p>Upload doctor picture</p>
        </div>

        {/* Doctor Information */}
        <div className='flex flex-col lg:flex-row items-start gap-10 text-gray-600'>
          
          {/* Left Section */}
          <div className='w-full lg:flex-1 flex flex-col gap-4'>
            <div className='flex-1 flex flex-col gap-1'>
              <p>Name</p>
              <input
                onChange={e => setName(e.target.value)}
                value={name}
                className='border rounded px-3 py-2'
                type="text"
                placeholder='Name'
                required
              />
            </div>

            <div className='flex-1 flex flex-col gap-1'>
              <p>Email</p>
              <input
                onChange={e => setEmail(e.target.value)}
                value={email}
                className='border rounded px-3 py-2'
                type="email"
                placeholder='Email'
                required
              />
            </div>

            <div className='flex-1 flex flex-col gap-1'>
              <p>Password</p>
              <input
                onChange={e => setPassword(e.target.value)}
                value={password}
                className='border rounded px-3 py-2'
                type="password"
                placeholder='Password'
                required
              />
            </div>

            <div className='flex-1 flex flex-col gap-1'>
              <p>Experience</p>
              <select
                onChange={e => setExperience(e.target.value)}
                value={experience}
                className='border rounded px-2 py-2'
              >
                {[...Array(10).keys()].map(i => (
                  <option key={i + 1} value={`${i + 1} Year`}>{`${i + 1} Year`}</option>
                ))}
              </select>
            </div>

            <div className='flex-1 flex flex-col gap-1'>
              <p>Fees</p>
              <input
                onChange={e => setFees(e.target.value)}
                value={fees}
                className='border rounded px-3 py-2'
                type="number"
                placeholder='Doctor fees'
                required
              />
            </div>
          </div>

          {/* Right Section */}
          <div className='w-full lg:flex-1 flex flex-col gap-4'>
            <div className='flex-1 flex flex-col gap-1'>
              <p>Speciality</p>
              <select
                onChange={e => setSpeciality(e.target.value)}
                value={speciality}
                className='border rounded px-2 py-2'
              >
                {["General physician", "Gynecologist", "Dermatologist", "Pediatricians", "Neurologist", "Gastroenterologist"]
                  .map(spec => <option key={spec} value={spec}>{spec}</option>)}
              </select>
            </div>

            <div className='flex-1 flex flex-col gap-1'>
              <p>Degree</p>
              <input
                onChange={e => setDegree(e.target.value)}
                value={degree}
                className='border rounded px-3 py-2'
                type="text"
                placeholder='Degree'
                required
              />
            </div>

            <div className='flex-1 flex flex-col gap-1'>
              <p>Phone</p>
              <input
                onChange={e => setPhone(e.target.value)}
                value={phone}
                className='border rounded px-3 py-2'
                type="text"
                placeholder='Phone number'
                required
              />
            </div>

            {/* Hospital Dropdown */}
            <div className='flex-1 flex flex-col gap-1'>
              <p>Hospital</p>
              <select
                onChange={e => setHospitalId(e.target.value)}
                value={hospitalId}
                className='border rounded px-2 py-2'
              >
                <option value="">Select Hospital</option>
                {hospitals.map(hospital => (
                  <option key={hospital.hospitalID} value={hospital.hospitalID}>
                    {hospital.name}
                  </option>
                ))}
              </select>
            </div>

            {/* Department Dropdown */}
            <div className='flex-1 flex flex-col gap-1'>
              <p>Department</p>
              <select
                onChange={e => setDepartmentId(e.target.value)}
                value={departmentId}
                className='border rounded px-2 py-2'
                disabled={!hospitalId}
              >
                <option value="">Select Department</option>
                {departments.map(department => (
                  <option key={department.departmentID} value={department.departmentID}>
                    {department.name}
                  </option>
                ))}
              </select>
            </div>
          </div>
        </div>

        <button type='submit' className='bg-primary px-10 py-3 mt-4 text-white rounded-full'>
          Add doctor
        </button>
      </div>
    </form>
  );
};

export default AddDoctor;
