import React, { useState, useEffect } from 'react';
import { useNavigate, useSearchParams } from 'react-router-dom';
import { ShieldCheck, RefreshCw } from 'lucide-react';
import { useAuthStore, useToastStore } from '../store/useSwiftStore';
import { apiClient } from '../api/apiClient';

export const Login: React.FC = () => {
  const navigate = useNavigate();
  const [searchParams] = useSearchParams();
  const redirect = searchParams.get('redirect') || 'dashboard';

  const { loginWithAuthData, isLoggedIn, user } = useAuthStore();
  const { addToast } = useToastStore();

  const [phone, setPhone] = useState('');
  const [otpSent, setOtpSent] = useState(false);
  const [userOtp, setUserOtp] = useState('');
  const [timer, setTimer] = useState(60);

  // Redirect if already logged in
  useEffect(() => {
    if (isLoggedIn && user) {
      if (user.role === 'ADMIN') {
        navigate('/admin');
      } else if (user.role === 'SELLER') {
        navigate('/seller/dashboard');
      } else {
        navigate(redirect === 'admin' || redirect === 'seller/dashboard' ? '/dashboard' : `/${redirect}`);
      }
    }
  }, [isLoggedIn, user, redirect, navigate]);

  // Resend Timer logic
  useEffect(() => {
    if (!otpSent || timer === 0) return;
    const count = setInterval(() => {
      setTimer(prev => prev - 1);
    }, 1000);
    return () => clearInterval(count);
  }, [otpSent, timer]);

  const handleSendOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (phone.length !== 10) {
      addToast('Please enter a valid 10-digit mobile number', 'error');
      return;
    }

    try {
      // Auto-register user if they do not exist
      try {
        await apiClient.post('/api/v1/auth/register', {
          phone: phone,
          name: 'Mahesh Kumar',
          email: `${phone}@swiftcart.com`,
          password: 'Password123'
        });
      } catch (err) {
        // User already exists, continue to login
      }

      await apiClient.post(`/api/v1/auth/send-otp?phone=${phone}`);
      setOtpSent(true);
      setTimer(60);
      addToast('Verification code sent successfully!', 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to send verification code. Please retry.', 'error');
    }
  };

  const handleVerifyOtp = async (e: React.FormEvent) => {
    e.preventDefault();
    if (userOtp.length !== 6) {
      addToast('OTP must be exactly 6 digits', 'error');
      return;
    }

    try {
      const authData = await apiClient.post('/api/v1/auth/verify-otp', {
        phone: phone,
        otp: userOtp
      });
      loginWithAuthData(authData);
      addToast('Log in successful! Welcome to SwiftCart.', 'success');
      
      if (authData.role === 'ADMIN') {
        navigate('/admin');
      } else if (authData.role === 'SELLER') {
        navigate('/seller/dashboard');
      } else {
        navigate(redirect === 'admin' || redirect === 'seller/dashboard' ? '/dashboard' : `/${redirect}`);
      }
    } catch (err: any) {
      addToast(err.message || 'Invalid verification code. Please verify and retry.', 'error');
    }
  };

  const handleResendOtp = async () => {
    if (timer > 0) return;
    try {
      await apiClient.post(`/api/v1/auth/send-otp?phone=${phone}`);
      setTimer(60);
      addToast('New verification code sent successfully!', 'success');
    } catch (err: any) {
      addToast(err.message || 'Failed to resend verification code.', 'error');
    }
  };

  const handleSocialLogin = (provider: 'google') => {
    const backendUrl = `http://localhost:8080/oauth2/authorize/${provider}`;
    const redirectUri = `http://localhost:5175/oauth2/callback`;
    window.location.href = `${backendUrl}?redirect_uri=${encodeURIComponent(redirectUri)}`;
  };

  return (
    <div className="max-w-md mx-auto px-4 py-16 pb-24 text-left">
      <div className="bg-white border border-gray-100 rounded-card p-8 shadow-card space-y-6">
        
        <div className="text-center space-y-2">
          <h2 className="font-heading font-extrabold text-2xl text-swift-dark">
            {otpSent ? 'Enter OTP Verification' : 'Welcome to SwiftCart'}
          </h2>
          <p className="text-xs text-swift-mid">
            {otpSent 
              ? `Verification code dispatched to +91 ${phone}` 
              : 'Sign in to access orders, saved items, and active coupons'
            }
          </p>
        </div>

        {!otpSent ? (
          <div>
            {/* Enter Mobile Phone Number */}
            <form onSubmit={handleSendOtp} className="space-y-4">
              <div>
                <label className="block text-xs font-bold text-swift-dark mb-1.5">Enter Mobile Number *</label>
                <div className="relative">
                  <span className="absolute left-3 top-1/2 -translate-y-1/2 text-sm text-swift-mid font-semibold">+91</span>
                  <input
                    type="tel"
                    maxLength={10}
                    placeholder="98765 43210"
                    value={phone}
                    onChange={(e) => setPhone(e.target.value.replace(/\D/g, ''))}
                    className="w-full pl-12 pr-4 py-2.5 border border-gray-200 rounded-button text-sm focus:border-swift-orange font-semibold font-mono tracking-wide"
                    required
                    autoFocus
                  />
                </div>
              </div>

              <p className="text-[10px] text-swift-mid leading-relaxed">
                By proceeding, you agree to SwiftCart’s Terms of Use and Privacy Policy. Standard carrier messaging charges may apply.
              </p>

              <button
                type="submit"
                className="w-full py-3 bg-swift-orange hover:bg-swift-orange-hover text-white rounded-button font-bold text-sm shadow-sm transition-all"
              >
                Request OTP code
              </button>
            </form>

            <div className="relative my-6 flex items-center justify-center">
              <div className="absolute inset-0 flex items-center">
                <div className="w-full border-t border-gray-100"></div>
              </div>
              <span className="relative bg-white px-3 text-[10px] text-swift-mid uppercase font-bold tracking-wider">Or continue with</span>
            </div>

            <div className="mt-4">
              <button
                type="button"
                onClick={() => handleSocialLogin('google')}
                className="w-full flex items-center justify-center gap-2 py-2.5 border border-gray-200 hover:bg-gray-50 rounded-button text-xs font-bold transition-all shadow-sm"
              >
                <img src="https://www.svgrepo.com/show/475656/google-color.svg" className="w-4 h-4" alt="Google" />
                <span>Continue with Google</span>
              </button>
            </div>

            <div className="text-center mt-6 pt-4 border-t border-gray-100">
              <p className="text-xs text-swift-mid">
                Want to sell on SwiftCart?{' '}
                <button
                  type="button"
                  onClick={() => navigate('/seller/register')}
                  className="text-swift-blue font-bold hover:underline"
                >
                  Register as a Seller
                </button>
              </p>
            </div>
          </div>
        ) : (
          // Enter OTP Code
          <form onSubmit={handleVerifyOtp} className="space-y-5">
            <div>
              <label className="block text-xs font-bold text-swift-dark mb-1.5 text-center">Enter 6-digit OTP</label>
              <input
                type="text"
                maxLength={6}
                value={userOtp}
                onChange={(e) => setUserOtp(e.target.value.replace(/\D/g, ''))}
                placeholder="XXXXXX"
                className="w-40 mx-auto text-center px-4 py-2.5 border-2 border-gray-250 rounded-button text-lg focus:border-swift-orange font-bold font-mono tracking-widest block"
                required
                autoFocus
              />
            </div>

            <div className="flex justify-between items-center text-xs">
              {timer > 0 ? (
                <span className="text-swift-mid">Resend OTP in <span className="font-bold font-mono text-swift-dark">{timer}s</span></span>
              ) : (
                <button
                  type="button"
                  onClick={handleResendOtp}
                  className="text-swift-blue font-bold hover:underline flex items-center gap-1"
                >
                  <RefreshCw className="w-3.5 h-3.5" />
                  <span>Resend OTP Code</span>
                </button>
              )}
              
              <button
                type="button"
                onClick={() => setOtpSent(false)}
                className="text-swift-mid hover:underline"
              >
                Change Number
              </button>
            </div>

            <button
              type="submit"
              className="w-full py-3 bg-swift-blue hover:bg-swift-blue-dark text-white rounded-button font-bold text-sm shadow-sm transition-all mt-4"
            >
              Verify & Proceed
            </button>
          </form>
        )}

        {/* Security checks */}
        <div className="border-t border-gray-100 pt-4 flex justify-center items-center gap-1.5 text-[10px] text-swift-mid">
          <ShieldCheck className="w-4 h-4 text-swift-green" />
          <span>Secured phone authorization flow</span>
        </div>

      </div>
    </div>
  );
};
