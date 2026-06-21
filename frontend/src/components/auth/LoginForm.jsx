import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { useAuth } from '../../context/AuthContext';
import { Eye, EyeOff, Mail, Lock, ArrowRight } from 'lucide-react';
import Input from '../common/Input';
import Button from '../common/Button';

const LoginForm = () => {
  const navigate = useNavigate();
  const { login } = useAuth();
  const [formData, setFormData] = useState({
    email: '',
    password: ''
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
      await login(formData);
      navigate('/dashboard');
    } catch (error) {
      setApiError(error.response?.data?.error?.message || 'Login failed. Please try again.');
    } finally {
      setLoading(false);
    }
  };

  return (
    <div className="min-h-screen bg-primary relative overflow-hidden flex items-center justify-center p-4">
      {/* Background Gradients */}
      <div className="absolute top-0 left-0 w-full h-full overflow-hidden pointer-events-none">
        <div className="absolute -top-[20%] -left-[10%] w-[500px] h-[500px] bg-accent/20 rounded-full blur-[100px] animate-pulse-slow"></div>
        <div className="absolute -bottom-[20%] -right-[10%] w-[500px] h-[500px] bg-accent-secondary/20 rounded-full blur-[100px] animate-pulse-slow" style={{ animationDelay: '1s' }}></div>
        <div className="absolute top-1/2 left-1/2 -translate-x-1/2 -translate-y-1/2 w-[300px] h-[300px] bg-success/10 rounded-full blur-[80px] animate-pulse-slow" style={{ animationDelay: '0.5s' }}></div>
      </div>

      <div className="relative z-10 w-full max-w-md">
        {/* Logo Section */}
        <div className="text-center mb-8 animate-fade-in">
          <div className="inline-flex items-center justify-center w-20 h-20 bg-gradient-to-br from-accent to-accent-secondary rounded-2xl mb-4 shadow-glow animate-float">
            <div className="text-4xl font-bold text-white">₹</div>
          </div>
          <h1 className="text-4xl font-bold mb-2">
            <span className="gradient-text">Expense</span>
            <span className="text-white"> Manager</span>
          </h1>
          <p className="text-text-secondary text-lg">Streamline your expense management</p>
        </div>

        {/* Login Card */}
        <div className="glass-effect rounded-3xl p-8 shadow-2xl animate-scale-in">
          <form onSubmit={handleSubmit} className="space-y-6">
            {apiError && (
              <div className="p-4 bg-error/10 border border-error/30 rounded-xl text-error text-sm animate-shake">
                <div className="flex items-start gap-2">
                  <span className="text-lg">⚠️</span>
                  <div>
                    <p>{apiError}</p>
                    {apiError.includes('Invalid credentials') && (
                      <p className="mt-2 text-xs">
                        Don't have an account?{' '}
                        <button 
                          type="button" 
                          onClick={() => navigate('/signup')} 
                          className="underline font-semibold hover:text-accent transition-colors"
                        >
                          Sign up here
                        </button>
                      </p>
                    )}
                  </div>
                </div>
              </div>
            )}

            <div className="space-y-4">
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
                    Log In
                    <ArrowRight className="w-5 h-5 group-hover:translate-x-1 transition-transform" />
                  </>
                )}
              </div>
            </Button>
          </form>
        </div>

        <div className="mt-8 text-center animate-fade-in" style={{ animationDelay: '0.2s' }}>
          <p className="text-text-secondary">
            Don't have an account?{' '}
            <button
              onClick={() => navigate('/signup')}
              className="text-accent hover:text-accent-secondary font-semibold transition-colors"
            >
              Create an account
            </button>
          </p>
        </div>
      </div>
    </div>
  );
};

export default LoginForm;
