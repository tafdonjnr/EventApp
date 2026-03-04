import React, { useEffect, useState } from 'react';
import { useSearchParams, useNavigate } from 'react-router-dom';

export default function PaymentResult() {
  const [searchParams] = useSearchParams();
  const reference = searchParams.get('ref');
  const [status, setStatus] = useState('pending');
  const [error, setError] = useState('');
  const navigate = useNavigate();

  useEffect(() => {
    async function verify() {
      try {
        const res = await fetch(`/api/payments/verify/${reference}`);
        if (!res.ok) throw new Error('Verification failed');
        const data = await res.json();
        setStatus(data.status);
      } catch (err) {
        setError('Could not verify payment.');
        setStatus('failed');
      }
    }
    if (reference) verify();
  }, [reference]);

  return (
    <div className="min-h-[80vh] flex items-center justify-center px-4 py-12">
      <div className="card-standard max-w-lg w-full text-center">
        <h2 className="heading-2 mb-4">Payment Status</h2>
        {status === 'success' && (
          <div>
            <div className="body-text font-bold text-green-600 mb-4">Payment successful ✓</div>
            <p className="body-text small-text text-mutedText mb-6">Your ticket has been issued. Check your dashboard.</p>
            <button type="button" className="primary-btn" onClick={() => navigate('/attendee/dashboard')}>
              Go to Dashboard
            </button>
          </div>
        )}
        {status === 'failed' && (
          <div>
            <div className="body-text font-bold text-red-600 mb-4">Payment failed</div>
            <p className="body-text small-text text-mutedText mb-6">{error || 'Please try again.'}</p>
            <button type="button" className="primary-btn" onClick={() => navigate('/')}>
              Back to Home
            </button>
          </div>
        )}
        {status === 'pending' && (
          <p className="body-text small-text text-mutedText">Checking payment status...</p>
        )}
      </div>
    </div>
  );
}


