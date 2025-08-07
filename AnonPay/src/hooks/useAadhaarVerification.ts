import { useState, useEffect } from 'react';
import { useAnonAadhaar } from '@anon-aadhaar/react';

export const useAadhaarVerification = () => {
  const [anonAadhaar] = useAnonAadhaar();
  const [isVerified, setIsVerified] = useState(false);
  const [verificationTx, setVerificationTx] = useState('');

  useEffect(() => {
    if (anonAadhaar.status === "logged-in") {
      console.log('Aadhaar status:', anonAadhaar.status);
      // In a real app, you might check verification status from your backend
      // For now, we'll use local state
    }
  }, [anonAadhaar]);

  const handleVerificationComplete = (txHash: string) => {
    setIsVerified(true);
    setVerificationTx(txHash);
    // In a real app, you might update user status in your backend
  };

  return {
    isVerified,
    verificationTx,
    handleVerificationComplete,
    anonAadhaarStatus: anonAadhaar.status
  };
}; 