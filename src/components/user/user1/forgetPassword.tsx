import { forgetPassword } from '@/store/redux/auth/forgetPasswordApi';
import React, { useState, useEffect } from 'react';
import { useNavigate, useLocation } from 'react-router-dom';

export  const ResetPassword: React.FC = () => {
  const [formData, setFormData] = useState({
    email: '',
    newPassword: '',
    confirmPassword: ''
  });
  const [errors, setErrors] = useState({
    email: '',
    newPassword: '',
    confirmPassword: '',
    general: ''
  });
  const [isSubmitted, setIsSubmitted] = useState(false);
  const [isLoading, setIsLoading] = useState(false);
  const [passwordVisible, setPasswordVisible] = useState({
    newPassword: false,
    confirmPassword: false
  });
  const navigate = useNavigate();

  const primaryColor = '#59CBE8';

  const handleChange = (e: React.ChangeEvent<HTMLInputElement>) => {
    const { name, value } = e.target;
    setFormData({
      ...formData,
      [name]: value
    });
    
    if (errors[name as keyof typeof errors]) {
      setErrors({
        ...errors,
        [name]: ''
      });
    }
  };

  const togglePasswordVisibility = (field: 'newPassword' | 'confirmPassword') => {
    setPasswordVisible({
      ...passwordVisible,
      [field]: !passwordVisible[field]
    });
  };

  const validateForm = () => {
    const newErrors = {
      email: '',
      newPassword: '',
      confirmPassword: '',
      general: ''
    };
    let isValid = true;

    const emailRegex = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
    if (!formData.email) {
      newErrors.email = 'Email is required';
      isValid = false;
    } else if (!emailRegex.test(formData.email)) {
      newErrors.email = 'Please enter a valid email address';
      isValid = false;
    }

    if (!formData.newPassword) {
      newErrors.newPassword = 'New password is required';
      isValid = false;
    } else if (formData.newPassword.length < 8) {
      newErrors.newPassword = 'Password must be at least 8 characters';
      isValid = false;
    }

    if (!formData.confirmPassword) {
      newErrors.confirmPassword = 'Please confirm your password';
      isValid = false;
    } else if (formData.newPassword !== formData.confirmPassword) {
      newErrors.confirmPassword = 'Passwords do not match';
      isValid = false;
    }

    setErrors(newErrors);
    return isValid;
  };

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    
    if (validateForm()) {
      try {
        setIsLoading(true);
        
        const response = await forgetPassword(formData.email, formData.newPassword);
        console.log('ibde entha avastha',response);
        
        if (response.success === true) {
          console.log('ullil kerille');
          setIsSubmitted(true);
          navigate('/login', { state: { passwordReset: true } });
        } else if (response.success === false) {
          setErrors({
            ...errors,
            general:  'Failed to reset password check ur email'
          });
        }
      } catch (err) {
        setErrors({
          ...errors,
          general: 'Something went wrong. Please try again.'
        });
      } finally {
        setIsLoading(false);
      }
    }
  };

  return (
    <div className="flex items-center justify-center min-h-screen bg-gray-50">
      <div className="w-full max-w-md p-8 space-y-6 bg-white rounded-lg shadow-lg">
        <div className="text-center">
          <div className="flex justify-center">
            <svg 
              className="w-12 h-12" 
              fill="none" 
              stroke="currentColor" 
              viewBox="0 0 24 24" 
              xmlns="http://www.w3.org/2000/svg"
              style={{ color: primaryColor }}
            >
              <path 
                strokeLinecap="round" 
                strokeLinejoin="round" 
                strokeWidth={2} 
                d="M9 12l2 2 4-4m5.618-4.016A11.955 11.955 0 0112 2.944a11.955 11.955 0 01-8.618 3.04A12.02 12.02 0 003 9c0 5.591 3.824 10.29 9 11.622 5.176-1.332 9-6.03 9-11.622 0-1.042-.133-2.052-.382-3.016z" 
              />
            </svg>
          </div>
          <h2 className="mt-4 text-3xl font-bold text-gray-900">Reset Password</h2>
          <p className="mt-2 text-sm text-gray-600">
            Enter your email and create a new password
          </p>
        </div>

        {!isSubmitted && (
          <form className="mt-6 space-y-4" onSubmit={handleSubmit}>
            {errors.general && (
              <div className="p-3 text-sm text-red-500 bg-red-50 rounded-md">
                {errors.general}
              </div>
            )}
            
            <div>
              <label htmlFor="email" className="block text-sm font-medium text-gray-700">
                Email Address
              </label>
              <div className="mt-1">
                <input
                  id="email"
                  name="email"
                  type="email"
                  autoComplete="email"
                  className={`w-full px-3 py-2 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${errors.email ? 'border-red-300' : 'border-gray-300'}`}
                  style={{ borderColor: errors.email ? 'red' : 'hsl(var(--border))', outlineColor: primaryColor }}
                  placeholder="your-email@hospital.com"
                  value={formData.email}
                  onChange={handleChange}
                />
                {errors.email && <p className="mt-1 text-sm text-red-600">{errors.email}</p>}
              </div>
            </div>

            <div>
              <label htmlFor="newPassword" className="block text-sm font-medium text-gray-700">
                New Password
              </label>
              <div className="relative mt-1">
                <input
                  id="newPassword"
                  name="newPassword"
                  type={passwordVisible.newPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className={`w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${errors.newPassword ? 'border-red-300' : 'border-gray-300'}`}
                  style={{ borderColor: errors.newPassword ? 'red' : 'hsl(var(--border))', outlineColor: primaryColor }}
                  placeholder="Enter new password"
                  value={formData.newPassword}
                  onChange={handleChange}
                />
                <button 
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"
                  onClick={() => togglePasswordVisibility('newPassword')}
                >
                  {passwordVisible.newPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
                {errors.newPassword && <p className="mt-1 text-sm text-red-600">{errors.newPassword}</p>}
              </div>
              <p className="mt-1 text-xs text-gray-500">Password must be at least 8 characters</p>
            </div>

            <div>
              <label htmlFor="confirmPassword" className="block text-sm font-medium text-gray-700">
                Confirm Password
              </label>
              <div className="relative mt-1">
                <input
                  id="confirmPassword"
                  name="confirmPassword"
                  type={passwordVisible.confirmPassword ? "text" : "password"}
                  autoComplete="new-password"
                  className={`w-full px-3 py-2 pr-10 border rounded-md shadow-sm focus:outline-none focus:ring-2 ${errors.confirmPassword ? 'border-red-300' : 'border-gray-300'}`}
                  style={{ borderColor: errors.confirmPassword ? 'red' : 'hsl(var(--border))', outlineColor: primaryColor }}
                  placeholder="Confirm your password"
                  value={formData.confirmPassword}
                  onChange={handleChange}
                />
                <button 
                  type="button"
                  className="absolute inset-y-0 right-0 flex items-center pr-3 text-gray-400"
                  onClick={() => togglePasswordVisibility('confirmPassword')}
                >
                  {passwordVisible.confirmPassword ? (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M13.875 18.825A10.05 10.05 0 0112 19c-4.478 0-8.268-2.943-9.543-7a9.97 9.97 0 011.563-3.029m5.858.908a3 3 0 114.243 4.243M9.878 9.878l4.242 4.242M9.88 9.88l-3.29-3.29m7.532 7.532l3.29 3.29M3 3l3.59 3.59m0 0A9.953 9.953 0 0112 5c4.478 0 8.268 2.943 9.543 7a10.025 10.025 0 01-4.132 5.411m0 0L21 21" />
                    </svg>
                  ) : (
                    <svg className="w-5 h-5" fill="none" stroke="currentColor" viewBox="0 0 24 24" xmlns="http://www.w3.org/2000/svg">
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M15 12a3 3 0 11-6 0 3 3 0 016 0z" />
                      <path strokeLinecap="round" strokeLinejoin="round" strokeWidth={2} d="M2.458 12C3.732 7.943 7.523 5 12 5c4.478 0 8.268 2.943 9.542 7-1.274 4.057-5.064 7-9.542 7-4.477 0-8.268-2.943-9.542-7z" />
                    </svg>
                  )}
                </button>
                {errors.confirmPassword && <p className="mt-1 text-sm text-red-600">{errors.confirmPassword}</p>}
              </div>
            </div>

            <div className="pt-4">
              <button
                type="submit"
                className="flex justify-center w-full px-4 py-2 text-sm font-medium text-white border border-transparent rounded-md shadow-sm focus:outline-none focus:ring-2 focus:ring-offset-2"
                style={{ backgroundColor: primaryColor }}
                disabled={isLoading}
              >
                {isLoading ? (
                  <svg className="w-5 h-5 animate-spin" xmlns="http://www.w3.org/2000/svg" fill="none" viewBox="0 0 24 24">
                    <circle className="opacity-25" cx="12" cy="12" r="10" stroke="currentColor" strokeWidth="4"></circle>
                    <path className="opacity-75" fill="currentColor" d="M4 12a8 8 0 018-8V0C5.373 0 0 5.373 0 12h4zm2 5.291A7.962 7.962 0 014 12H0c0 3.042 1.135 5.824 3 7.938l3-2.647z"></path>
                  </svg>
                ) : 'Reset Password'}
              </button>
            </div>
          </form>
        )}

        <div className="pt-2 text-center border-t border-gray-200">
          <a 
            href="#" 
            className="text-sm font-medium hover:text-blue-600"
            style={{ color: primaryColor }}
          >
            Need help? Contact Support
          </a>
        </div>
      </div>
    </div>
  );
};
