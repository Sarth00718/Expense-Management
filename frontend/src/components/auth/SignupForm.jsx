import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, User, Building, ArrowRight } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';

const CURRENCIES = [
  { code: 'INR', name: 'Indian Rupee', symbol: '₹' },
  { code: 'USD', name: 'United States Dollar', symbol: '$' }
];

const SignupForm = () => {
  const navigate = useNavigate();
  const { signup } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: '',
    firstName: '',
    lastName: '',
    companyName: '',
    baseCurrency: 'INR'
  });
  const [errors, setErrors] = useState({});
  const [loading, setLoading] = useState(false);
  const [apiError, setApiError] = useState('');
  const [showPassword, setShowPassword] = useState(false);

  const handleChange = (e) => {
    const { name, value } = e.target;
    setFormData(prev => ({
      ...prev,
      [name]: value
    }));
    // Clear error for this field
    if (errors[name]) {
      setErrors(prev => ({
        ...prev,
        [name]: ''
      }));
    }
  };

  const validate = () => {
    const newErrors = {};

    if (!formData.email) {
      newErrors.email = 'Email is required';
    } else if (!/\S+@\S+\.\S+/.test(formData.email)) {
      newErrors.email = 'Email is invalid';
    }

    if (!formData.password) {
      newErrors.password = 'Password is required';
    } else if (formData.password.length < 6) {
      newErrors.password = 'Password must be at least 6 characters';
    }

    if (!formData.firstName) {
      newErrors.firstName = 'First name is required';
    }

    if (!formData.lastName) {
      newErrors.lastName = 'Last name is required';
    }

    if (!formData.companyName) {
      newErrors.companyName = 'Company name is required';
    }

    setErrors(newErrors);
    return Object.keys(newErrors).length === 0;
  };

  const handleSubmit = async (e) => {
    e.preventDefault();
    setApiError('');

    if (!validate()) {
      return;
    }

    setLoading(true);

    try {
      await signup(formData);
      navigate('/dashboard');
    } catch (error) {
      console.error('Signup error:', error);
      setApiError(error.message || error.response?.data?.error?.message || 'Signup failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary relative overflow-hidden flex items-center justify-center p-4 py-12">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[500px] h-[500px] bg-accent-secondary/20 rounded-full blur-[100px] animate-pulse-slow"></div>
        <div className="absolute -bottom-[20%] -right-[10%] w-[500px] h-[500px] bg-accent/20 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-success/10 rounded-full blur-[80px] animate-pulse-slow" style={{ animationDelay: '0.5s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-lg">
        {/* Logo Section */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-accent to-accent-secondary rounded-2xl mb-4 shadow-glow animate-float">
            <div className="text-4xl font-bold text-white">₹</div>
          </div>
          <h1 className="text-4xl font-bold mb-2">
            <span className="gradient-text">Expense</span>
            <span className="text-white"> Manager</span>
          </h1>
          <p className="text-text-secondary text-lg">Create your company account</p>
        </div>

        {/* Signup Card */}
        <div className="glass-effect rounded-3xl p-8 shadow-2xl animate-scale-in">
          <form onSubmit={handleSubmit} className="space-y-5">
            {apiError && (
              <div className="p-4 bg-error/10 border border-error/30 rounded-xl text-error text-sm">
                <div className="flex items-start gap-2">
                  <span className="text-lg">⚠️</span>
                  <p>{apiError}</p>
                </div>
              </div>
            )}

            {/* Personal Info */}
            <div className="grid grid-cols-2 gap-4">
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary w-5 h-5" />
                <Input
                  label="First Name"
                  type="text"
                  name="firstName"
                  value={formData.firstName}
                  onChange={handleChange}
                  error={errors.firstName}
                  placeholder="John"
                  required
                  className="pl-12"
                />
              </div>
              <div className="relative">
                <User className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary w-5 h-5" />
                <Input
                  label="Last Name"
                  type="text"
                  name="lastName"
                  value={formData.lastName}
                  onChange={handleChange}
                  error={errors.lastName}
                  placeholder="Doe"
                  required
                  className="pl-12"
                />
              </div>
            </div>

            <div className="relative">
              <Mail className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary w-5 h-5" />
              <Input
                label="Email"
                type="email"
                name="email"
                value={formData.email}
                onChange={handleChange}
                error={errors.email}
                placeholder="you@company.com"
                required
                className="pl-12"
              />
            </div>

            <div className="relative">
              <Lock className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary w-5 h-5" />
              <Input
                label="Password"
                type={showPassword ? "text" : "password"}
                name="password"
                value={formData.password}
                onChange={handleChange}
                error={errors.password}
                placeholder="••••••••"
                required
                rightIcon={showPassword ? <EyeOff size={20} /> : <Eye size={20} />}
                onRightIconClick={() => setShowPassword(!showPassword)}
                className="pl-12"
              />
            </div>

            <div className="relative">
              <Building className="absolute left-4 top-1/2 -translate-y-1/2 text-text-secondary w-5 h-5" />
              <Input
                label="Company Name"
                type="text"
                name="companyName"
                value={formData.companyName}
                onChange={handleChange}
                error={errors.companyName}
                placeholder="Acme Inc."
                required
                className="pl-12"
              />
            </div>

            <div>
              <label className="block text-text-primary text-sm font-medium mb-2">
                Base Currency
              </label>
              <select
                name="baseCurrency"
                value={formData.baseCurrency}
                onChange={handleChange}
                className="w-full px-4 py-3 bg-secondary border-2 border-secondary rounded-xl
                  text-text-primary focus:outline-none focus:border-accent focus:shadow-glow transition-all duration-300"
              >
                {CURRENCIES.map(currency => (
                  <option key={currency.code} value={currency.code}>
                    {currency.code} - {currency.name} ({currency.symbol})
                  </option>
                ))}
              </select>
              <p className="mt-2 text-xs text-text-secondary">
                Default currency for your company
              </p>
            </div>

            <Button
              type="submit"
              disabled={loading}
              fullWidth
              className="mt-6 py-4 text-lg font-semibold rounded-xl hover-glow group"
            >
              <div className="flex items-center justify-center gap-2">
                {loading ? (
                  <div className="w-5 h-5 border-2 border-white/30 border-t-white rounded-full animate-spin"></div>
                ) : (
                  <>
                    Create Account
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </Button>
          </form>
        </div>

        <div className="mt-8 text-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <p className="text-text-secondary">
            Already have an account?{' '}
            <button
              onClick={() => navigate('/login')}
              className="text-accent hover:text-accent-secondary font-semibold transition-colors"
            >
              Log in
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default SignupForm;
