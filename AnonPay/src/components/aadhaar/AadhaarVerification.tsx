import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, ExternalLink, Wallet } from 'lucide-react';
import {
  AnonAadhaarProof,
  LogInWithAnonAadhaar,
  useAnonAadhaar,
  useProver,
} from "@anon-aadhaar/react";
import { verifyProofWithRelayer } from '../../services/aadhaarService';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useSendTransaction } from '@privy-io/react-auth';
import { encodeFunctionData, parseEther } from 'viem';

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
  const [aggregationDetails, setAggregationDetails] = useState<any>(null);
  const [aggregationId, setAggregationId] = useState<number>(0);
  const [isVerifying, setIsVerifying] = useState(false);
  const [verificationStatus, setVerificationStatus] = useState('');
  const [isLinkingWallet, setIsLinkingWallet] = useState(false);
  const [walletLinked, setWalletLinked] = useState(false);
  const [linkTx, setLinkTx] = useState('');

  // Privy hooks
  const { user } = usePrivy();
  const { wallets } = useWallets();
  const { sendTransaction } = useSendTransaction();
  const walletAddress = wallets?.[0]?.address;
  // Contract details
  const CONTRACT_ADDRESS = '0x964D28b5cC79af30210AC59AAd93a80E140Bd0cd';

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
      const result = await verifyProofWithRelayer(latestProof, setVerificationStatus);
      setVerificationTx(result.txHash);
      setAggregationDetails(result.aggregationDetails);
      setAggregationId(result.aggregationId);
      setVerificationStatus('Verification completed!');
      onVerificationComplete(result.txHash);
    } catch (error) {
      console.error('Verification failed:', error);
      setVerificationStatus('Verification failed');
      alert('Verification failed. Please try again.');
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLinkWallet = async () => {
    if (!wallets || wallets.length === 0) {
      alert('Please connect your wallet first');
      return;
    }

    if (!aggregationDetails) {
      alert('No aggregation details available. Please verify your proof first.');
      return;
    }
    console.log("aggregationDetails", aggregationDetails);

    setIsLinkingWallet(true);
    try {
      // Extract proof data from the latest proof and convert to BigInt
      const inputs = [
        BigInt(latestProof?.proof.pubkeyHash || '0'),
        BigInt(latestProof?.proof.nullifier || '0'),
        BigInt(latestProof?.proof.timestamp || '0'),
        BigInt(latestProof?.proof.ageAbove18 || '0'),
        BigInt(latestProof?.proof.gender || '0'),
        BigInt(latestProof?.proof.pincode || '0'),
        BigInt(latestProof?.proof.state || '0'),
        BigInt(latestProof?.proof.nullifierSeed || '0'),
        BigInt(latestProof?.proof.signalHash || '0')
      ];

      // Use actual aggregation details from the relayer response
      const aggregationIdBigInt = BigInt(aggregationId || 0); // Use the aggregationId from state
      const domainId = BigInt(113); // Domain ID for this contract
      const merklePath = aggregationDetails.merkleProof as `0x${string}`[]; // Use the actual merkle proof array
      const leafCount = BigInt(aggregationDetails.numberOfLeaves || 1); // Extract numberOfLeaves from response
      const index = BigInt(aggregationDetails.leafIndex || 0); // Use actual leaf index

      const functionData = encodeFunctionData({
        abi: [{
          name: 'checkHash',
          type: 'function',
          inputs: [
            { name: 'inputs', type: 'uint256[]' },
            { name: '_aggregationId', type: 'uint256' },
            { name: '_domainId', type: 'uint256' },
            { name: '_merklePath', type: 'bytes32[]' },
            { name: '_leafCount', type: 'uint256' },
            { name: '_index', type: 'uint256' }
          ],
          outputs: [],
          stateMutability: 'nonpayable'
        }],
        args: [inputs, BigInt(aggregationId), domainId, merklePath, leafCount, index]
      });

      console.log('Smart contract function arguments:');
      console.log('inputs:', inputs);
      console.log('aggregationId:', BigInt(aggregationId).toString());
      console.log('domainId:', domainId.toString());
      console.log('merklePath:', merklePath);
      console.log('leafCount:', leafCount.toString());
      console.log('index:', index.toString());
      console.log('walletAddress:', walletAddress);
    
      const tx = await sendTransaction({
        to: CONTRACT_ADDRESS as `0x${string}`,
        data: functionData,
      },
      {
        address: walletAddress as `0x${string}`,
      }
    );

      setLinkTx(tx.hash);
      setWalletLinked(true);
      alert('Wallet linked successfully!');
    } catch (error) {
      console.error('Wallet linking failed:', error);
      alert('Failed to link wallet. Please try again.');
    } finally {
      setIsLinkingWallet(false);
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

          {/* Wallet Linking Section */}
          {verificationTx && !walletLinked && (
            <div className="space-y-3 p-4 bg-purple-900/20 rounded-lg border border-purple-800">
              <div className="text-center">
                <Wallet className="w-6 h-6 text-purple-400 mx-auto mb-2" />
                <p className="text-purple-200 font-semibold">Link Your Wallet</p>
                <p className="text-purple-300 text-sm">Connect your wallet to complete verification</p>
              </div>
              
              <button
                onClick={handleLinkWallet}
                disabled={isLinkingWallet || !wallets || wallets.length === 0}
                className="w-full bg-purple-600 hover:bg-purple-500 disabled:bg-gray-600 text-white font-bold py-3 px-6 rounded-lg transition-colors flex items-center justify-center space-x-2"
              >
                {isLinkingWallet ? (
                  <>
                    <div className="w-4 h-4 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>Linking Wallet...</span>
                  </>
                ) : !wallets || wallets.length === 0 ? (
                  <>
                    <Wallet className="w-4 h-4" />
                    <span>Connect Wallet First</span>
                  </>
                ) : (
                  <>
                    <Wallet className="w-4 h-4" />
                    <span>Link Wallet</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Wallet Linked Success */}
          {walletLinked && (
            <div className="p-4 bg-green-900/20 rounded-lg border border-green-800">
              <div className="text-center space-y-2">
                <CheckCircle className="w-6 h-6 text-green-400 mx-auto" />
                <p className="text-green-200 font-semibold">Wallet Linked Successfully!</p>
                <p className="text-green-300 text-sm">Your wallet is now verified and linked</p>
                {linkTx && (
                  <a 
                    href={`https://zkverify-testnet.subscan.io/extrinsic/${linkTx}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="text-green-400 hover:text-green-300 text-sm font-semibold flex items-center justify-center space-x-2"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>View Link Transaction</span>
                  </a>
                )}
              </div>
            </div>
          )}
          
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