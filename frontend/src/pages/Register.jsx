import React, { useState, useContext } from "react";
import { useNavigate, Link } from "react-router-dom";
import { AuthContext } from "../context/AuthContext";
import { motion } from "framer-motion";
import { Mail, Lock, User, UserPlus } from "lucide-react";

const Register = () => {
  const [name, setName] = useState("");
  const [email, setEmail] = useState("");
  const [password, setPassword] = useState("");
  const [error, setError] = useState("");
  const [loading, setLoading] = useState(false);

  const { register, login } = useContext(AuthContext);
  const navigate = useNavigate();

  const handleSubmit = async (e) => {
    e.preventDefault();
    setError("");

    // Frontend validation
    if (name.trim().length < 2) {
      setError("Name must be at least 2 characters.");
      return;
    }
    if (password.length < 8) {
      setError("Password must be at least 8 characters.");
      return;
    }

    setLoading(true);
    try {
      // Step 1: Register
      await register(name, email, password);
      // Step 2: Auto-login after registration
      await login(email, password);
      navigate("/dashboard", { replace: true });
    } catch (err) {
      const msg =
        err?.response?.data?.message ||
        err?.message ||
        "Registration failed. Please try again.";
      setError(msg);
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="flex flex-col items-center justify-center min-h-[calc(100vh-4rem)] bg-gray-100 p-4">

      {/* HEADER */}
      <motion.div
        initial={{ opacity: 0, y: -20 }}
        animate={{ opacity: 1, y: 0 }}
        className="text-center mb-10"
      >
        <h1 className="text-4xl md:text-5xl font-extrabold bg-gradient-to-r from-[#1E3A8A] to-[#9333EA] bg-clip-text text-transparent tracking-tight mb-3">
          Create Account
        </h1>
        <p className="text-[#475569] text-base md:text-lg max-w-lg mx-auto leading-relaxed">
          Register and start analyzing resumes with AI-powered job matching.
        </p>
      </motion.div>

      <motion.div
        initial={{ opacity: 0, scale: 0.95 }}
        animate={{ opacity: 1, scale: 1 }}
        transition={{ duration: 0.4 }}
        className="flex flex-col md:flex-row w-full max-w-4xl min-h-[520px] bg-white rounded-[2rem] overflow-hidden shadow-xl"
      >

        {/* LEFT SIDE IMAGE */}
        <div className="md:w-1/2 flex flex-col items-center justify-center p-10">
          <img
            src="/login_image.png"
            alt="Resume Analyzer"
            className="w-full max-w-sm object-contain"
          />
        </div>

        {/* RIGHT SIDE REGISTER FORM */}
        <div className="md:w-1/2 p-10 lg:p-14 bg-gradient-to-br from-indigo-500 to-purple-600 flex flex-col justify-center items-center text-white">
          <div className="w-full max-w-xs">

            <h2 className="text-3xl font-bold text-center mb-8">Register</h2>

            {/* Error Alert */}
            {error && (
              <div className="bg-red-100 border border-red-300 text-red-700 px-4 py-3 rounded-lg mb-5 text-sm text-center">
                {error}
              </div>
            )}

            <form onSubmit={handleSubmit} className="flex flex-col gap-5 w-full">

              {/* NAME */}
              <div className="relative flex items-center">
                <User className="absolute text-gray-400" style={{ left: '1rem' }} size={20} />
                <input
                  type="text"
                  value={name}
                  onChange={(e) => setName(e.target.value)}
                  required
                  autoComplete="name"
                  placeholder="Full Name"
                  className="w-full h-12 pr-4 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/60 transition placeholder-gray-400 text-sm"
                  style={{ paddingLeft: '3rem' }}
                />
              </div>

              {/* EMAIL */}
              <div className="relative flex items-center">
                <Mail className="absolute text-gray-400" style={{ left: '1rem' }} size={20} />
                <input
                  type="email"
                  value={email}
                  onChange={(e) => setEmail(e.target.value)}
                  required
                  autoComplete="email"
                  placeholder="Email Address"
                  className="w-full h-12 pr-4 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/60 transition placeholder-gray-400 text-sm"
                  style={{ paddingLeft: '3rem' }}
                />
              </div>

              {/* PASSWORD */}
              <div className="relative flex items-center">
                <Lock className="absolute text-gray-400" style={{ left: '1rem' }} size={20} />
                <input
                  type="password"
                  value={password}
                  onChange={(e) => setPassword(e.target.value)}
                  required
                  autoComplete="new-password"
                  placeholder="Password (min 8 characters)"
                  className="w-full h-12 pr-4 bg-white text-gray-900 rounded-lg focus:outline-none focus:ring-2 focus:ring-white/60 transition placeholder-gray-400 text-sm"
                  style={{ paddingLeft: '3rem' }}
                />
              </div>

              <button
                type="submit"
                disabled={loading}
                className="w-full h-12 mt-2 bg-[#002b5e] hover:bg-[#001f44] text-white font-semibold rounded-lg shadow-md transition duration-200 flex items-center justify-center gap-2 disabled:opacity-60 disabled:cursor-not-allowed"
              >
                {loading ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white/30 border-t-white rounded-full animate-spin" />
                    Creating account...
                  </>
                ) : (
                  <>
                    <UserPlus size={18} /> Create Account
                  </>
                )}
              </button>

            </form>

            <p className="text-center mt-6 text-sm text-white/80">
              Already have an account?{" "}
              <Link to="/login" className="text-white font-bold hover:underline">
                Login
              </Link>
            </p>

          </div>
        </div>

      </motion.div>
    </div>
  );
};

export default Register;