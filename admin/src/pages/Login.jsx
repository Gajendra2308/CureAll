import React, { useState, useContext } from 'react';
import axios from 'axios';
import { toast } from 'react-toastify';
import { AppContext } from '../context/AppContext';
import { DoctorContext } from '../context/DoctorContext';
import { AdminContext } from '../context/AdminContext';
import { Navigate, useNavigate } from 'react-router-dom';

const Login = () => {
  const [state, setState] = useState('Admin');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const { setDToken } = useContext(DoctorContext);
  const { setAToken } = useContext(AdminContext);
  const { backendUrl } = useContext(AppContext);
  const Navigate = useNavigate();

  const onSubmitHandler = async (event) => {
    event.preventDefault();
    
    try {
      const response = await axios.post(`${backendUrl}/api/Auth/login`, {
        email,
        password,
        role: state.toLowerCase(), 
        
      });
      
      const { token } = response.data;
      
      if (state === 'Admin') {
        setAToken(token);
        localStorage.setItem('aToken', token);
        toast.success('Admin login successful!');
      } else {
        setDToken(token);
        localStorage.setItem('dToken', token);
        toast.success('Doctor login successful!');
      }
    } catch (error) {
      toast.error(error.response?.data?.message || 'Login failed. Please try again.');
    }
  };

  return (
    <form onSubmit={onSubmitHandler} className="min-h-[80vh] flex items-center">
      <div className="flex flex-col gap-3 m-auto items-start p-8 min-w-[340px] sm:min-w-96 border rounded-xl text-[#5E5E5E] text-sm shadow-lg">
        <p className="text-2xl font-semibold m-auto">
          <span className="text-primary">{state}</span> Login
        </p>
        <div className="w-full">
          <p>Email</p>
          <input
            onChange={(e) => setEmail(e.target.value)}
            value={email}
            className="border border-[#DADADA] rounded w-full p-2 mt-1"
            type="email"
            required
          />
        </div>
        <div className="w-full">
          <p>Password</p>
          <input
            onChange={(e) => setPassword(e.target.value)}
            value={password}
            className="border border-[#DADADA] rounded w-full p-2 mt-1"
            type="password"
            required
          />
        </div>
        <button className="bg-primary text-white w-full py-2 rounded-md text-base">Login</button>
        {state === 'Admin' ? (
          <p>
            Doctor Login?{' '}
            <span onClick={() => setState('Doctor')} className="text-primary underline cursor-pointer">
              Click here
            </span>
          </p>
        ) : (
          <p>
          Admin Login?{' '}
          <span
            onClick={() => {
              setState('Admin');
              Navigate('/admin-dashboard');
            }}
            className="text-primary underline cursor-pointer"
          >
            Click here
          </span>
        </p>
        )}
      </div>
    </form>
  );
};

export default Login;
