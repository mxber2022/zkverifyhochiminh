import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, ExternalLink } from 'lucide-react';
import {
  AnonAadhaarProof,
  LogInWithAnonAadhaar,
  useAnonAadhaar,
  useProver,
} from "@anon-aadhaar/react";
import { verifyProofWithRelayer } from '../../services/aadhaarService';

interface AadhaarVerificationProps {
  onVerificationComplete: (txHash: string) => void;
  isVerified: boolean;
  setUseTestAadhaar: (state: boolean) => void;
  useTestAadhaar: boolean;
}

export const AadhaarVerification: React.FC<AadhaarVerificationProps> = ({
  onVerificationComplete,
  isVerified,
  setUseTestAadhaar,
  useTestAadhaar
}) => {
  const [verificationTx, setVerificationTx] = useState('');
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('');

  // Anon Aadhaar hooks
  const [anonAadhaar] = useAnonAadhaar();
  const [, latestProof] = useProver();

  const handleVerifyProof = async () => {
    if (!latestProof) {
      alert('Please generate an Anon Aadhaar proof first');
      return;
    }

    setIsVerifying(true);
    setVerificationStatus('Submitting proof...');
    try {
      const txHash = await verifyProofWithRelayer(latestProof, setVerificationStatus);
      setVerificationTx(txHash);
      setVerificationStatus('Verification completed!');
      onVerificationComplete(txHash);
    } catch (error) {
      console.error('Verification failed:', error);
      setVerificationStatus('Verification failed');
      alert('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  if (isVerified) {
    return (
      <div className="bg-green-900/20 border border-green-800 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <CheckCircle className="w-6 h-6 text-green-400" />
          <div>
            <h4 className="text-white font-bold">Identity Verified</h4>
            <p className="text-green-300 text-sm">Your Aadhaar identity has been verified</p>
          </div>
        </div>
        {verificationTx && (
          <a 
            href={verificationTx}
            target="_blank"
            rel="noopener noreferrer"
            className="text-green-400 hover:text-green-300 text-sm font-semibold flex items-center space-x-2"
          >
            <ExternalLink className="w-4 h-4" />
            <span>View Verification Transaction</span>
          </a>
        )}
      </div>
    );
  }

  return (
    <div className="bg-blue-900/20 border border-blue-800 rounded-xl p-6 space-y-6">
      {/* Header */}
      <div className="flex items-center space-x-3">
        <Shield className="w-6 h-6 text-blue-400 flex-shrink-0" />
        <div>
          <h4 className="text-white font-bold">Anon Aadhaar Verification</h4>
          <p className="text-blue-300 text-sm">Prove Indian residency without revealing personal data</p>
        </div>
      </div>
      
      {/* Mode Toggle */}
      <div className="flex justify-center">
        <div className="bg-blue-900/30 rounded-full p-1 flex">
          <button
            onClick={() => setUseTestAadhaar(true)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              useTestAadhaar 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-blue-300 hover:text-blue-200'
            }`}
          >
            Test Mode
          </button>
          <button
            onClick={() => setUseTestAadhaar(false)}
            className={`px-4 py-2 rounded-full text-sm font-medium transition-all ${
              !useTestAadhaar 
                ? 'bg-blue-600 text-white shadow-sm' 
                : 'text-blue-300 hover:text-blue-200'
            }`}
          >
            Real Mode
          </button>
        </div>
      </div>

      {/* Login Section */}
      <div className="text-center space-y-3">
        <LogInWithAnonAadhaar nullifierSeed={1234} />
        <p className="text-blue-300 text-sm">
          {useTestAadhaar ? 'Generate test proof' : 'Generate real Aadhaar proof'}
        </p>
      </div>

      {/* Proof Display */}
      {anonAadhaar.status === "logged-in" && latestProof && (
        <div className="space-y-4 p-4 bg-green-900/20 rounded-lg border border-green-800">
          <div className="text-center space-y-2">
            <p className="text-green-400 font-semibold">✅ Proof Generated</p>
            <p className="text-green-200 text-sm">Your Aadhaar identity proof is ready</p>
          </div>
          
          <div className="flex justify-center">
            <AnonAadhaarProof code={JSON.stringify(latestProof, null, 2)} />
          </div>
          
          {verificationStatus && (
            <div className="text-center p-3 bg-blue-900/20 rounded-lg border border-blue-800">
              <p className="text-blue-200 text-sm font-medium">{verificationStatus}</p>
            </div>
          )}
          
          <button
            onClick={handleVerifyProof}
            disabled={isVerifying}
            className="w-full bg-green-600 hover:bg-green-500 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors"
          >
            {isVerifying ? 'Verifying...' : 'Verify on Blockchain'}
          </button>
          
          {verificationTx && (
            <div className="text-center">
              <a 
                href={verificationTx}
                target="_blank"
                rel="noopener noreferrer"
                className="text-green-400 hover:text-green-300 text-sm font-semibold flex items-center justify-center space-x-2"
              >
                <ExternalLink className="w-4 h-4" />
                <span>View Transaction</span>
              </a>
            </div>
          )}
        </div>
      )}

      {/* Status */}
      {anonAadhaar.status !== "logged-in" && (
        <div className="text-center p-4 bg-yellow-900/20 rounded-lg border border-yellow-800">
          <p className="text-yellow-200 text-sm">
            Click the login button above to generate your proof
          </p>
        </div>
      )}
    </div>
  );
}; 