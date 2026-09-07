import React, { useState } from 'react';
import { useNavigate } from 'react-router-dom';
import { FiShield, FiCheck, FiCopy } from 'react-icons/fi';
import api from '../services/api';
import toast from 'react-hot-toast';

export default function TwoFactorSetup() {
  const [qrCode, setQrCode] = useState('');
  const [secret, setSecret] = useState('');
  const [token, setToken] = useState('');
  const [step, setStep] = useState(1);
  const [loading, setLoading] = useState(false);
  const navigate = useNavigate();

  const setup2FA = async () => {
    setLoading(true);
    try {
      const response = await api.post('/2fa/setup');
      setQrCode(response.data.qrCode);
      setSecret(response.data.secret);
      setStep(2);
    } catch (error) {
      toast.error('Failed to setup 2FA');
    } finally {
      setLoading(false);
    }
  };

  const verify2FA = async () => {
    setLoading(true);
    try {
      const response = await api.post('/2fa/verify', { token });
      toast.success('2FA enabled successfully!');
      navigate('/dashboard');
    } catch (error) {
      toast.error('Invalid token');
    } finally {
      setLoading(false);
    }
  };

  const copySecret = () => {
    navigator.clipboard.writeText(secret);
    toast.success('Secret copied!');
  };

  return (
    <div className="min-h-screen bg-gradient-to-br from-blue-50 via-white to-blue-50 flex items-center justify-center p-4">
      <div className="max-w-md w-full bg-white rounded-2xl shadow-xl p-8">
        <div className="text-center mb-8">
          <div className="inline-flex items-center justify-center w-16 h-16 bg-blue-50 rounded-2xl mb-4">
            <FiShield className="w-8 h-8 text-blue-600" />
          </div>
          <h1 className="text-2xl font-bold text-gray-900">Two-Factor Authentication</h1>
          <p className="text-gray-600 mt-2">Add extra security to your account</p>
        </div>

        {step === 1 && (
          <div className="text-center">
            <p className="text-gray-600 mb-6">
              Two-factor authentication adds an extra layer of security to your account.
              You'll need to enter a code from your authenticator app when logging in.
            </p>
            <button
              onClick={setup2FA}
              disabled={loading}
              className="w-full px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
            >
              {loading ? 'Setting up...' : 'Setup 2FA'}
            </button>
          </div>
        )}

        {step === 2 && (
          <div>
            <div className="text-center mb-6">
              <p className="text-sm text-gray-600 mb-4">
                Scan this QR code with your authenticator app (Google Authenticator, Authy, etc.)
              </p>
              {qrCode && (
                <img
                  src={qrCode}
                  alt="QR Code"
                  className="mx-auto w-48 h-48 mb-4"
                />
              )}
              <div className="flex items-center justify-center gap-2">
                <p className="text-xs text-gray-500">Manual code:</p>
                <code className="text-xs bg-gray-100 px-2 py-1 rounded">{secret}</code>
                <button
                  onClick={copySecret}
                  className="p-1 hover:bg-gray-100 rounded"
                >
                  <FiCopy className="w-4 h-4 text-gray-500" />
                </button>
              </div>
            </div>

            <div className="space-y-4">
              <div>
                <label className="block text-sm font-medium text-gray-700 mb-2">
                  Enter 6-digit code
                </label>
                <input
                  type="text"
                  value={token}
                  onChange={(e) => setToken(e.target.value.replace(/[^0-9]/g, '').slice(0, 6))}
                  className="w-full px-4 py-3 text-center text-2xl tracking-widest border border-gray-300 rounded-lg focus:outline-none focus:ring-2 focus:ring-blue-500"
                  placeholder="000000"
                  maxLength="6"
                />
              </div>
              <button
                onClick={verify2FA}
                disabled={loading || token.length !== 6}
                className="w-full flex items-center justify-center gap-2 px-4 py-3 text-sm font-medium text-white bg-blue-600 rounded-lg hover:bg-blue-700 transition-colors disabled:opacity-50"
              >
                <FiCheck className="w-4 h-4" />
                {loading ? 'Verifying...' : 'Verify & Enable'}
              </button>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}
