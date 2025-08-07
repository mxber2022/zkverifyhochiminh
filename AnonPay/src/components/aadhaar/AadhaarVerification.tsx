import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, ExternalLink, AlertCircle } from 'lucide-react';
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

  // Anon Aadhaar hooks
  const [anonAadhaar] = useAnonAadhaar();
  const [, latestProof] = useProver();
  
  // Debug logging
  console.log('AadhaarVerification Debug:', {
    anonAadhaarStatus: anonAadhaar.status,
    hasLatestProof: !!latestProof,
    useTestAadhaar,
    isVerified,
    latestProof: latestProof
  });

  useEffect(() => {
    if (anonAadhaar.status === "logged-in") {
      console.log("User logged in with Anon Aadhaar");
    }
  }, [anonAadhaar]);

  const switchAadhaar = () => {
    const newMode = !useTestAadhaar;
    console.log('Switching Aadhaar mode to:', newMode ? 'TEST' : 'REAL');
    setUseTestAadhaar(newMode);
  };

  const handleVerifyProof = async () => {
    if (!latestProof) {
      alert('Please generate an Anon Aadhaar proof first');
      return;
    }

    setIsVerifying(true);
    try {
      const txHash = await verifyProofWithRelayer(latestProof);
      setVerificationTx(txHash);
      onVerificationComplete(txHash);
    } catch (error) {
      console.error('Verification failed:', error);
      alert('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  if (isVerified) {
    return (
      <div className="bg-gradient-to-r from-green-950 to-emerald-950 border border-green-800 rounded-xl p-6">
        <div className="flex items-center space-x-3 mb-4">
          <CheckCircle className="w-6 h-6 text-green-400" />
          <div>
            <h4 className="text-white font-bold">Identity Verified</h4>
            <p className="text-green-300 text-sm">Your Aadhaar identity has been verified</p>
          </div>
        </div>
        {verificationTx && (
          <div className="p-3 bg-green-900/20 rounded-xl border border-green-800">
            <a 
              href={verificationTx}
              target="_blank"
              rel="noopener noreferrer"
              className="text-green-400 hover:text-green-300 text-sm font-semibold flex items-center space-x-2"
            >
              <ExternalLink className="w-4 h-4" />
              <span>View Verification Transaction</span>
            </a>
          </div>
        )}
      </div>
    );
  }

  return (
    <div className="bg-gradient-to-r from-blue-950 to-indigo-950 border border-blue-800 rounded-xl p-6">
      <div className="flex items-center space-x-3 mb-4">
        <Shield className="w-6 h-6 text-blue-400" />
        <div>
          <h4 className="text-white font-bold">Anon Aadhaar Verification</h4>
          <p className="text-blue-300 text-sm">Prove Indian residency without revealing personal data</p>
        </div>
      </div>
      
      <div className="space-y-4">
        <p className="text-blue-300 text-sm leading-relaxed">
          Verify your Indian identity using Anon Aadhaar to enable private, compliant transactions. 
          Your personal information remains completely private through zero-knowledge proofs.
        </p>
        
        {/* Aadhaar Mode Toggle */}
        <div className="flex items-center space-x-4 p-3 bg-blue-900/30 rounded-xl">
          <span className="text-blue-200 text-sm">
            {useTestAadhaar ? 'Test Mode' : 'Real Mode'}
          </span>
          <button
            onClick={switchAadhaar}
            className="px-3 py-1 bg-blue-800 text-blue-200 rounded-lg text-sm hover:bg-blue-700 transition-colors"
          >
            Switch to {useTestAadhaar ? 'Real' : 'Test'}
          </button>
          <div className="text-xs text-blue-300">
            Current: {useTestAadhaar ? 'TEST' : 'REAL'}
          </div>
        </div>

        {/* Main Login Section */}
        <div className="text-center p-4 bg-blue-900/20 rounded-xl border border-blue-800">
          <p className="text-blue-200 text-sm mb-3">
            {useTestAadhaar 
              ? 'You\'re using the test Aadhaar mode'
              : 'You\'re using the real Aadhaar mode'
            }
          </p>
          
          {/* Anon Aadhaar Login Button */}
          <LogInWithAnonAadhaar nullifierSeed={1234} />
          
          <p className="text-blue-300 text-xs mt-3">
            {useTestAadhaar 
              ? 'Click above to generate a test proof'
              : 'Click above to generate a real Aadhaar proof'
            }
          </p>
        </div>

        {/* Status Display */}
        <div className="p-3 bg-blue-900/20 rounded-xl border border-blue-800">
          <div className="flex items-center justify-between mb-2">
            <span className="text-blue-200 text-sm font-medium">Current Status:</span>
            <span className={`text-xs px-2 py-1 rounded ${
              anonAadhaar.status === "logged-in" 
                ? "bg-green-900 text-green-300" 
                : "bg-yellow-900 text-yellow-300"
            }`}>
              {anonAadhaar.status === "logged-in" ? "LOGGED IN" : "NOT LOGGED IN"}
            </span>
          </div>
          <div className="text-xs text-blue-300 space-y-1">
            <div>Mode: <span className="text-blue-200">{useTestAadhaar ? 'TEST' : 'REAL'}</span></div>
            <div>Proof: <span className="text-blue-200">{latestProof ? 'GENERATED' : 'NOT GENERATED'}</span></div>
            <div>Status: <span className="text-blue-200">{anonAadhaar.status}</span></div>
          </div>
        </div>

        {/* Proof Display Section - Only show when logged in and proof exists */}
        {anonAadhaar.status === "logged-in" && latestProof && (
          <div className="space-y-4 p-4 bg-green-900/20 rounded-xl border border-green-800">
            {/* Proof Status Messages */}
            <div className="space-y-2 text-center">
              <p className="text-green-400 font-semibold">✅ Proof is valid</p>
              <p className="text-green-200">Got your Aadhaar Identity Proof</p>
              <p className="text-white font-bold">Welcome anon!</p>
            </div>
            
            {/* Proof Display */}
            <div className="flex items-center justify-center">
              <AnonAadhaarProof code={JSON.stringify(latestProof, null, 2)} />
            </div>
            
            {/* Verify Button */}
            <button
              onClick={handleVerifyProof}
              disabled={isVerifying}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:from-neutral-800 disabled:to-neutral-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed"
            >
              {isVerifying ? 'Verifying on Blockchain...' : 'Verify Proof'}
            </button>
            
            {/* Transaction Link */}
            {verificationTx && (
              <div className="text-center">
                <a 
                  href={verificationTx}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="text-green-400 hover:text-green-300 text-sm font-semibold flex items-center justify-center space-x-2"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>Click here to check your transaction</span>
                </a>
              </div>
            )}
          </div>
        )}

        {/* Show login prompt if not logged in */}
        {anonAadhaar.status !== "logged-in" && (
          <div className="p-4 bg-yellow-900/20 rounded-xl border border-yellow-800">
            <div className="text-center space-y-2">
              <AlertCircle className="w-6 h-6 text-yellow-400 mx-auto" />
              <p className="text-yellow-200 font-medium">Action Required</p>
              <p className="text-yellow-300 text-sm">
                Click the "Log In with Anon Aadhaar" button above to generate your proof
              </p>
            </div>
          </div>
        )}
      </div>
    </div>
  );
}; 