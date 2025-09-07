import React, { useState, useEffect } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../context/AuthContext';

const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
const passwordRegex = /^(?=.*[a-z])(?=.*[A-Z])(?=.*\d)(?=.*[@$!%*?&])[A-Za-z\d@$!%*?&]{8,}$/;

const Login: React.FC = () => {
  const [isLogin, setIsLogin] = useState(true);
  const [email, setEmail] = useState('');
  const [password, setPassword] = useState('');
  const [name, setName] = useState('');
  const [formErrors, setFormErrors] = useState<{ name?: string; email?: string; password?: string }>({});

  const { state, login, signup } = useAuth();
  const navigate = useNavigate();

  useEffect(() => {
    if (state.isAuthenticated) navigate('/');
  }, [state.isAuthenticated, navigate]);

  const validateForm = () => {
    const errors: typeof formErrors = {};
    
    if (!isLogin && !name.trim()) {
      errors.name = 'Name is required';
    }
    
    if (!email) errors.email = 'Email is required';
    else if (!emailRegex.test(email)) errors.email = 'Enter a valid email address';
    
    if (!password) errors.password = 'Password is required';
    else if (!isLogin && !passwordRegex.test(password)) {
      errors.password = 'Password must contain at least 8 characters, including uppercase, lowercase, number, and special character';
    }
    
    setFormErrors(errors);
    return Object.keys(errors).length === 0;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!validateForm()) return;

    try {
      if (isLogin) {
        await login(email, password);
      } else {
        await signup(name, email, password);
      }
    } catch (err: any) {
      const backendError = err?.response?.data?.error || '';
      if (backendError.toLowerCase().includes('password')) {
        setFormErrors(prev => ({ ...prev, password: backendError }));
      } else if (backendError.toLowerCase().includes('email')) {
        setFormErrors(prev => ({ ...prev, email: backendError }));
      } else {
        setFormErrors(prev => ({ ...prev, password: backendError }));
      }
    }
  };

  const handleChange = (field: string, value: string) => {
    if (field === 'email') {
      setEmail(value);
      if (formErrors.email && emailRegex.test(value)) setFormErrors(prev => ({ ...prev, email: undefined }));
    } else if (field === 'password') {
      setPassword(value);
      if (formErrors.password && value.trim()) setFormErrors(prev => ({ ...prev, password: undefined }));
    } else if (field === 'name') {
      setName(value);
      if (formErrors.name && value.trim()) setFormErrors(prev => ({ ...prev, name: undefined }));
    }
  };

  const toggleMode = () => {
    setIsLogin(!isLogin);
    setEmail('');
    setPassword('');
    setName('');
    setFormErrors({});
  };

  const getInputClass = (error?: string) =>
    `w-full px-4 py-2 border rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-400 transition ${
      error ? 'border-red-500' : 'border-gray-300'
    }`;

  return (
    <div className="min-h-screen flex items-center justify-center bg-blue-50 p-6">
      <div className="w-full max-w-md bg-white rounded-2xl shadow-lg px-8 py-10">
        <div className="text-center mb-8">
          <h1 className="text-3xl font-bold text-gray-800 mb-1">{isLogin ? 'Login' : 'Sign Up'}</h1>
          <p className="text-gray-500">
            {isLogin ? 'Sign in to Astrape.AI' : 'Create your Astrape.AI account'}
          </p>
        </div>

        <form onSubmit={handleSubmit} className="space-y-5" noValidate>
          {!isLogin && (
            <div>
              <label htmlFor="name" className="block text-sm font-medium text-gray-700 mb-1">
                Full Name
              </label>
              <input
                id="name"
                type="text"
                value={name}
                onChange={e => handleChange('name', e.target.value)}
                className={getInputClass(formErrors.name)}
                placeholder="Your full name"
                disabled={state.loading}
                autoComplete="name"
              />
              {formErrors.name && <p className="text-red-500 text-sm mt-1">{formErrors.name}</p>}
            </div>
          )}

          <div>
            <label htmlFor="email" className="block text-sm font-medium text-gray-700 mb-1">
              Email
            </label>
            <input
              id="email"
              type="email"
              value={email}
              onChange={e => handleChange('email', e.target.value)}
              className={getInputClass(formErrors.email)}
              placeholder="Enter your email"
              disabled={state.loading}
              autoComplete="email"
            />
            {formErrors.email && <p className="text-red-500 text-sm mt-1">{formErrors.email}</p>}
          </div>

          <div>
            <label htmlFor="password" className="block text-sm font-medium text-gray-700 mb-1">
              Password
            </label>
            <input
              id="password"
              type="password"
              value={password}
              onChange={e => handleChange('password', e.target.value)}
              className={getInputClass(formErrors.password)}
              placeholder={isLogin ? 'Enter your password' : 'Create a strong password'}
              disabled={state.loading}
              autoComplete={isLogin ? 'current-password' : 'new-password'}
            />
            {formErrors.password && <p className="text-red-500 text-sm mt-1">{formErrors.password}</p>}
          </div>

          <div>
            <button
              type="submit"
              className="w-full py-3 bg-blue-600 hover:bg-blue-700 text-white font-semibold rounded-lg transition duration-200 disabled:opacity-50 disabled:cursor-not-allowed"
              disabled={state.loading}
            >
              {state.loading ? 'Please wait...' : isLogin ? 'Login' : 'Sign Up'}
            </button>
          </div>
        </form>

        <div className="mt-6 text-center">
          <button
            onClick={toggleMode}
            className="text-blue-600 hover:text-blue-800 font-medium transition"
            disabled={state.loading}
          >
            {isLogin ? "Don't have an account? Sign up" : "Already have an account? Login"}
          </button>
        </div>
      </div>
    </div>
  );
};

export default Login;