import React, { useState, useContext } from 'react';
import { useNavigate, Link } from 'react-router-dom';
import { AuthContext } from '../context/AuthContext';
import { motion } from 'framer-motion';
import { Mail, Lock, User, Facebook, Twitter, Chrome } from 'lucide-react';

const Register = () => {
  const [name, setName] = useState('');
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [error, setError] = useState('');
  const { register, login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    try {
      await register(name, email, password);
      await login(email, password); // Auto login
      navigate('/dashboard');
    } catch (err) {
      setError(err.response?.data?.message || 'Registration failed');
    }
  };

  return (
    <div className="flex items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-100 p-4">
      <motion.div 
        initial={{ opacity: 0, y: 20 }}
        animate={{ opacity: 1, y: 0 }}
        transition={{ duration: 0.5 }}
        className="flex flex-col md:flex-row w-full max-w-3xl min-h-[550px] bg-white rounded-3xl overflow-hidden shadow-2xl"
      >
        {/* Left Side - Welcome Graphic */}
        <div className="md:w-1/2 p-10 flex flex-col items-center justify-center relative overflow-hidden" style={{ background: 'linear-gradient(135deg, #1d69a6 0%, #00b4d8 100%)' }}>
          <div className="absolute top-0 right-0 w-64 h-64 bg-white opacity-10 rounded-full blur-3xl translate-x-1/2 -translate-y-1/2"></div>
          <div className="absolute bottom-0 left-0 w-64 h-64 bg-cyan-300 opacity-20 rounded-full blur-3xl -translate-x-1/2 translate-y-1/2"></div>
          
          <div className="relative z-10 flex flex-col items-center w-full pr-16 -ml-8">
            <div className="relative w-72 h-72 mb-8">
               <div className="absolute inset-x-0 bottom-0 h-32 bg-white/20 rounded-t-full"></div>
               {/* HD Illustration */}
               <img src="/job_search.png" alt="Join Us" className="w-full h-full object-contain drop-shadow-lg opacity-90" />
            </div>

            <h2 className="text-4xl font-bold text-white tracking-wider text-center">JOIN US</h2>
            <p className="text-cyan-100 mt-2 text-center">Start analyzing your resumes today</p>
          </div>
          
          {/* Decorative curve overlaying the split */}
          <div className="hidden md:block absolute top-0 -right-16 w-32 h-full bg-white" style={{ borderRadius: '50% 0 0 50%' }}></div>
        </div>

        {/* Right Side - Register Form */}
        <div className="md:w-1/2 p-10 lg:p-14 bg-white flex flex-col justify-center items-center relative z-10">
          <div className="w-full max-w-xs">
            <h2 className="text-3xl font-bold text-[#002b5e] text-center mb-6">REGISTER</h2>

            {error && <div className="bg-red-50 text-red-500 p-3 rounded-md mb-6 text-sm text-center border border-red-200">{error}</div>}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none" style={{ paddingLeft: '1.25rem' }}>
                <User className="h-6 w-6 text-gray-400" />
              </div>
              <input 
                type="text" 
                value={name} 
                onChange={(e) => setName(e.target.value)} 
                required 
                placeholder="Full Name" 
                className="w-full pr-4 py-4 bg-gray-200 border-none rounded-lg text-gray-700 focus:ring-2 focus:ring-[#002b5e] focus:bg-white transition-colors h-14"
                style={{ paddingLeft: '3.5rem' }}
              />
            </div>

            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none" style={{ paddingLeft: '1.25rem' }}>
                <Mail className="h-6 w-6 text-gray-400" />
              </div>
              <input 
                type="email" 
                value={email} 
                onChange={(e) => setEmail(e.target.value)} 
                required 
                placeholder="Email Address" 
                className="w-full pr-4 py-4 bg-gray-200 border-none rounded-lg text-gray-700 focus:ring-2 focus:ring-[#002b5e] focus:bg-white transition-colors h-14"
                style={{ paddingLeft: '3.5rem' }}
              />
            </div>
            
            <div className="relative">
              <div className="absolute inset-y-0 left-0 flex items-center pointer-events-none" style={{ paddingLeft: '1.25rem' }}>
                <Lock className="h-6 w-6 text-gray-400" />
              </div>
              <input 
                type="password" 
                value={password} 
                onChange={(e) => setPassword(e.target.value)} 
                required 
                placeholder="Password" 
                className="w-full pr-4 py-4 bg-gray-200 border-none rounded-lg text-gray-700 focus:ring-2 focus:ring-[#002b5e] focus:bg-white transition-colors h-14"
                style={{ paddingLeft: '3.5rem' }}
              />
            </div>

            <button type="submit" className="w-full py-4 bg-[#002b5e] hover:bg-[#001f44] text-white font-bold rounded-lg shadow-md transition-all duration-200 uppercase tracking-widest mt-2 h-14">
              Create Account
            </button>
          </form>

          <p className="text-center mt-8 text-sm text-gray-600">
            Already have an account? <Link to="/login" className="text-gray-800 font-semibold hover:underline">Log In</Link>
          </p>
          </div>
        </div>
      </motion.div>
    </div>
  );
};

export default Register;
