import React, { useCallback, useContext, useEffect, useState } from 'react';
import { AppContext } from '../context/AppContext';
import axios from 'axios'; 
import { useNavigate } from 'react-router-dom';
import { toast } from 'react-toastify';
import 'react-toastify/dist/ReactToastify.css';

const Login = () => {
  const [state, setState] = useState('Sign In');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [firstName, setFirstName] = useState('');
  const [lastName, setLastName] = useState('');
  const [address, setAddress] = useState('');
  const [dateOfBirth, setDateOfBirth] = useState('');
  const [phone, setPhone] = useState('');
  const [gender, setGender] = useState('');
  const navigate = useNavigate();

  const { backendUrl } = useContext(AppContext);

  // Redirect if already logged in
  useEffect(() => {
    const token = localStorage.getItem('token');
    if (token) {
      navigate('/'); // Redirect to home or another protected page
    }
  }, [navigate]);

  const onSubmitHandler = useCallback(
    async (event) => {
      event.preventDefault();
  
      if (state === 'Sign Up') {
        // Sign up logic
        const patientData = { email, password, firstName, lastName, address, dateOfBirth, phone, gender };
  
        try {
          const response = await axios.post(`${backendUrl}/api/patient`, patientData, {
            headers: { 'Content-Type': 'application/json' },
          });
          console.log('Sign Up Successful:', response.data);
          toast.success('Sign Up Successful! You can now log in.');
          setState('Login'); // Switch to login state after successful sign-up
        } catch (error) {
          console.error('Sign Up Error:', error);
          if (error.response && error.response.status === 400) {
            const errorDetails = error.response.data?.$values;
            const duplicateUserError = errorDetails?.find(err => err.code === "DuplicateUserName");
            if (duplicateUserError) {
              toast.error(`Email '${email}' is already registered. Please use a different email.`);
            } else {
              toast.error('Error signing up. Please try again!');
            }
          } else {
            toast.error('An unexpected error occurred. Please try again!');
          }
        }
      } else {
        // Login logic
        const loginData = { email, password };
  
        try {
          const response = await axios.post(`${backendUrl}/api/auth/login`, loginData, {
            headers: { 'Content-Type': 'application/json' },
          });
  
          if (response.data.token) {
            localStorage.setItem('token', response.data.token);
            console.log('Token stored in localStorage');
            toast.success('Login Successful!');
            window.dispatchEvent(new Event("tokenChanged"));
            navigate('/'); // Redirect after successful login
          }
  
        } catch (error) {
          console.error('Login Error:', error);
          if (error.response && error.response.status === 401) {
            toast.error('Invalid username or password!');
          } else {
            toast.error('An error occurred. Please try again!');
          }
        }
      }
    },
    [email, password, firstName, lastName, address, dateOfBirth, phone, gender, backendUrl, state, navigate]
  );
  
  // Handle input changes
  const handleInputChange = useCallback((setter) => (e) => {
    setter(e.target.value);
  }, []);

  return (
    <form className="min-h-[80vh] flex items-center" onSubmit={onSubmitHandler}>
      <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-zinc-600 text-sm shadow-lg">
        <p className="text-2xl font-semibold">{state === 'Sign Up' ? 'Create Account' : 'Login'}</p>
        <p>Please {state === 'Sign Up' ? 'sign up' : 'log in'} to book an appointment</p>

        {state === 'Sign Up' ? (
          <>
            <p>First Name</p>
            <input className="border border-zinc-300 rounded w-full p-2 mt-1" type="text" onChange={handleInputChange(setFirstName)} value={firstName} required />
            <p>Last Name</p>
            <input className="border border-zinc-300 rounded w-full p-2 mt-1" type="text" onChange={handleInputChange(setLastName)} value={lastName} required />
            <p>Date of Birth</p>
            <input className="border border-zinc-300 rounded w-full p-2 mt-1" type="date" onChange={handleInputChange(setDateOfBirth)} value={dateOfBirth} required />
            <p>Phone</p>
            <input className="border border-zinc-300 rounded w-full p-2 mt-1" type="text" onChange={handleInputChange(setPhone)} value={phone} required />
            <p>Address</p>
            <input className="border border-zinc-300 rounded w-full p-2 mt-1" type="text" onChange={handleInputChange(setAddress)} value={address} required />
            <p>Gender</p>
            <div className="flex gap-4 mt-4">
              <label><input type="radio" name="gender" value="male" checked={gender === 'male'} onChange={handleInputChange(setGender)} required /> Male</label>
              <label><input type="radio" name="gender" value="female" checked={gender === 'female'} onChange={handleInputChange(setGender)} required /> Female</label>
              <label><input type="radio" name="gender" value="other" checked={gender === 'other'} onChange={handleInputChange(setGender)} required /> Other</label>
            </div>
          </>
        ) : null}

        <p>Email</p>
        <input className="border border-zinc-300 rounded w-full p-2 mt-1" type="email" onChange={handleInputChange(setEmail)} value={email} required />
        <p>Password</p>
        <input className="border border-zinc-300 rounded w-full p-2 mt-1" type="password" onChange={handleInputChange(setPassword)} value={password} required />

        <button className="bg-primary text-white w-full py-2 rounded-md text-base">
          {state === 'Sign Up' ? 'Create Account' : 'Login'}
        </button>

        {state === 'Sign Up' ? (
          <p>
            Already have an account?{' '}
            <span onClick={() => setState('Login')} className="text-primary underline cursor-pointer">
              Login here
            </span>
          </p>
        ) : (
          <p>
            Create a new account?{' '}
            <span onClick={() => setState('Sign Up')} className="text-primary underline cursor-pointer">
              Click here
            </span>
          </p>
        )}
      </div>
    </form>
  );
};

export default Login;
