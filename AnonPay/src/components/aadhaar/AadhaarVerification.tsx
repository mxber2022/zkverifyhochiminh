import React, { useState, useEffect } from 'react';
import { Shield, CheckCircle, ExternalLink, Wallet, AlertCircle } from 'lucide-react';
import {
  AnonAadhaarProof,
  LogInWithAnonAadhaar,
  useAnonAadhaar,
  useProver,
} from "@anon-aadhaar/react";
import { verifyProofWithRelayer } from '../../services/aadhaarService';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { useSendTransaction } from '@privy-io/react-auth';
import { encodeFunctionData, parseEther, createPublicClient, http } from 'viem';

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
  const [isLoadingStatus, setIsLoadingStatus] = useState(true);
  const [notification, setNotification] = useState<{
    type: 'success' | 'error' | 'info';
    message: string;
    show: boolean;
  }>({ type: 'info', message: '', show: false });

  // Privy hooks
  const { user } = usePrivy();
  const { wallets } = useWallets();
  const { sendTransaction } = useSendTransaction();
  const walletAddress = wallets?.[0]?.address;
  // Contract details
  const CONTRACT_ADDRESS = '0x964D28b5cC79af30210AC59AAd93a80E140Bd0cd';
  
  // Viem client for reading contract
  const publicClient = createPublicClient({
    chain: {
      id: 845320009,
      name: 'Horizon Testnet',
      network: 'horizon-testnet',
      nativeCurrency: {
        decimals: 18,
        name: 'ETH',
        symbol: 'ETH',
      },
      rpcUrls: {
        default: { http: ['https://rpc.horizon-testnet.com'] },
        public: { http: ['https://rpc.horizon-testnet.com'] },
      },
    },
    transport: http()
  });

  // Anon Aadhaar hooks
  const [anonAadhaar] = useAnonAadhaar();
  const [, latestProof] = useProver();

  // Check verification status from contract
  const checkVerificationStatus = async () => {
    if (!walletAddress) {
      setIsLoadingStatus(false);
      return;
    }
    
    try {
      const isVerified = await publicClient.readContract({
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: [{
          name: 'registeredUsers',
          type: 'function',
          inputs: [{ name: 'user', type: 'address' }],
          outputs: [{ name: '', type: 'bool' }],
          stateMutability: 'view'
        }],
        functionName: 'registeredUsers',
        args: [walletAddress as `0x${string}`]
      });
      
      if (isVerified) {
        setWalletLinked(true);
        onVerificationComplete('Already verified');
      }
    } catch (error) {
      console.error('Error checking verification status:', error);
    } finally {
      setIsLoadingStatus(false);
    }
  };

  // Check status when wallet is connected
  useEffect(() => {
    if (walletAddress) {
      checkVerificationStatus();
    } else {
      setIsLoadingStatus(false);
    }
  }, [walletAddress]);

  const handleVerifyProof = async () => {
    if (!latestProof) {
      setNotification({
        type: 'error',
        message: 'Please generate an Anon Aadhaar proof first',
        show: true
      });
      setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 5000);
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
      setNotification({
        type: 'error',
        message: 'Verification failed. Please try again.',
        show: true
      });
      setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 5000);
    } finally {
      setIsVerifying(false);
    }
  };

  const handleLinkWallet = async () => {
    if (!wallets || wallets.length === 0) {
      setNotification({
        type: 'error',
        message: 'Please connect your wallet first',
        show: true
      });
      setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 5000);
      return;
    }

    if (!aggregationDetails) {
      setNotification({
        type: 'error',
        message: 'No aggregation details available. Please verify your proof first.',
        show: true
      });
      setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 5000);
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
      setNotification({
        type: 'success',
        message: 'Wallet linked successfully!',
        show: true
      });
      setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 5000);
    } catch (error) {
      console.error('Wallet linking failed:', error);
      setNotification({
        type: 'error',
        message: 'Failed to link wallet. Please try again.',
        show: true
      });
      setTimeout(() => setNotification(prev => ({ ...prev, show: false })), 5000);
    } finally {
      setIsLinkingWallet(false);
    }
  };

  // Show loading state while checking verification status
  if (isLoadingStatus) {
    return (
      <div className="bg-blue-900/20 border border-blue-800 rounded-xl p-6">
        <div className="flex items-center justify-center space-x-3">
          <div className="w-6 h-6 border-2 border-blue-400 border-t-transparent rounded-full animate-spin"></div>
          <div>
            <h4 className="text-white font-bold">Loading Verification Status</h4>
            <p className="text-blue-300 text-sm">Checking your verification status...</p>
          </div>
        </div>
      </div>
    );
  }

  if (isVerified || walletLinked) {
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
    <div className="bg-gradient-to-br from-neutral-950 to-neutral-900 border border-neutral-800 rounded-2xl p-8 space-y-8">
      {/* Notification Toast */}
      {notification.show && (
        <div className={`fixed top-4 right-4 z-50 p-4 rounded-xl border shadow-lg animate-slide-in-right ${
          notification.type === 'success' 
            ? 'bg-green-950 border-green-800 text-green-200'
            : notification.type === 'error'
              ? 'bg-red-950 border-red-800 text-red-200'
              : 'bg-blue-950 border-blue-800 text-blue-200'
        }`}>
          <div className="flex items-center space-x-3">
            {notification.type === 'success' && (
              <CheckCircle className="w-5 h-5 text-green-400 flex-shrink-0" />
            )}
            {notification.type === 'error' && (
              <AlertCircle className="w-5 h-5 text-red-400 flex-shrink-0" />
            )}
            {notification.type === 'info' && (
              <Shield className="w-5 h-5 text-blue-400 flex-shrink-0" />
            )}
            <span className="font-medium">{notification.message}</span>
            <button
              onClick={() => setNotification(prev => ({ ...prev, show: false }))}
              className="ml-2 text-neutral-400 hover:text-white transition-colors"
            >
              ×
            </button>
          </div>
        </div>
      )}

      {/* Header */}
      <div className="flex items-center space-x-4">
        <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl">
          <Shield className="w-6 h-6 text-white flex-shrink-0" />
        </div>
        <div>
          <h4 className="text-2xl text-sharp text-white">Anon Aadhaar Verification</h4>
          <p className="text-neutral-400 text-sm font-medium">Prove Indian residency without revealing personal data</p>
        </div>
      </div>
      
      {/* Mode Toggle */}
      <div className="flex justify-center animate-slide-up" style={{ animationDelay: '100ms' }}>
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-1.5 flex">
          <button
            onClick={() => setUseTestAadhaar(true)}
            className={`px-6 py-3 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 ${
              useTestAadhaar 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-[1.02]' 
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800 hover:scale-[1.01]'
            }`}
          >
            TEST MODE
          </button>
          <button
            onClick={() => setUseTestAadhaar(false)}
            className={`px-6 py-3 rounded-xl text-sm font-bold tracking-wide transition-all duration-300 ${
              !useTestAadhaar 
                ? 'bg-gradient-to-r from-blue-600 to-indigo-600 text-white shadow-lg transform scale-[1.02]' 
                : 'text-neutral-400 hover:text-white hover:bg-neutral-800 hover:scale-[1.01]'
            }`}
          >
            REAL MODE
          </button>
        </div>
      </div>

      {/* Login Section */}
      <div className="text-center space-y-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
        <div className="bg-neutral-900 border border-neutral-800 rounded-2xl p-6">
          <div className="mb-4">
            <h5 className="text-white font-bold text-lg mb-2">Identity Verification Required</h5>
            <p className="text-neutral-400 text-sm font-medium leading-relaxed">
              {useTestAadhaar 
                ? 'Generate a test proof to explore the platform features' 
                : 'Generate your real Aadhaar proof to start making compliant transfers'
              }
            </p>
          </div>
          
          <LogInWithAnonAadhaar nullifierSeed={1234} />
          
          <div className="mt-4 p-4 bg-gradient-to-r from-blue-950/50 to-indigo-950/50 border border-blue-800/30 rounded-xl">
            <div className="flex items-center space-x-3 mb-2">
              <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
              <span className="text-blue-300 font-semibold text-sm">
                {useTestAadhaar ? 'Test Mode Active' : 'Real Mode Active'}
              </span>
            </div>
            <p className="text-blue-200 text-xs leading-relaxed">
              {useTestAadhaar 
                ? 'Using test credentials for demonstration purposes. No real Aadhaar data required.' 
                : 'Your real Aadhaar data will be processed securely with zero-knowledge proofs.'
              }
            </p>
          </div>
        </div>
      </div>

      {/* Proof Display */}
      {anonAadhaar.status === "logged-in" && latestProof && (
        <div className="space-y-6 p-6 bg-gradient-to-br from-green-950/50 to-emerald-950/50 rounded-2xl border border-green-800 animate-scale-in">
          <div className="text-center space-y-4">
            <div className="flex items-center justify-center space-x-3">
              <div className="p-2 bg-green-600 rounded-xl">
                <CheckCircle className="w-6 h-6 text-white" />
              </div>
              <div>
                <p className="text-green-400 font-bold text-lg">Proof Generated Successfully!</p>
                <p className="text-green-200 text-sm font-medium">Your Aadhaar identity proof is ready for verification</p>
              </div>
            </div>
          </div>
          
          <div className="bg-neutral-900/50 border border-green-800/30 rounded-xl p-4">
            <AnonAadhaarProof code={JSON.stringify(latestProof, null, 2)} />
          </div>
          
          {verificationStatus && (
            <div className="text-center p-4 bg-gradient-to-r from-blue-950/50 to-indigo-950/50 rounded-xl border border-blue-800/30">
              <div className="flex items-center justify-center space-x-2 mb-2">
                <div className="w-2 h-2 bg-blue-400 rounded-full animate-pulse"></div>
                <p className="text-blue-200 font-semibold text-sm">Verification Status</p>
              </div>
              <div className="flex items-center justify-center space-x-4">
                <p className="text-blue-300 text-sm font-medium">{verificationStatus}</p>
                {verificationTx && verificationStatus === 'Verification completed!' && (
                  <a 
                    href={verificationTx}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-1 text-blue-400 hover:text-blue-300 text-sm font-bold transition-colors"
                  >
                    <ExternalLink className="w-3 h-3" />
                    <span>View Transaction</span>
                  </a>
                )}
              </div>
            </div>
          )}
          
          {/* Only show verify button if not yet verified */}
          {!verificationTx && (
            <button
              onClick={handleVerifyProof}
              disabled={isVerifying}
              className="w-full bg-gradient-to-r from-green-600 to-emerald-600 hover:from-green-500 hover:to-emerald-500 disabled:from-neutral-800 disabled:to-neutral-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2 shadow-lg hover:shadow-green-500/20"
            >
              {isVerifying ? (
                <>
                  <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                  <span>VERIFYING ON BLOCKCHAIN...</span>
                </>
              ) : (
                <>
                  <Shield className="w-5 h-5" />
                  <span>VERIFY ON BLOCKCHAIN</span>
                </>
              )}
            </button>
          )}

          {/* Wallet Linking Section */}
          {verificationTx && !walletLinked && (
            <div className="space-y-4 p-6 bg-gradient-to-br from-purple-950/50 to-pink-950/50 rounded-2xl border border-purple-800">
              <div className="text-center space-y-3">
                <div className="flex items-center justify-center space-x-3">
                  <div className="p-2 bg-purple-600 rounded-xl">
                    <Wallet className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-purple-200 font-bold text-lg">Link Your Wallet</p>
                    <p className="text-purple-300 text-sm font-medium">Connect your wallet to complete verification</p>
                  </div>
                </div>
              </div>
              
              <button
                onClick={handleLinkWallet}
                disabled={isLinkingWallet || !wallets || wallets.length === 0}
                className="w-full bg-gradient-to-r from-purple-600 to-pink-600 hover:from-purple-500 hover:to-pink-500 disabled:from-neutral-800 disabled:to-neutral-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2 shadow-lg hover:shadow-purple-500/20"
              >
                {isLinkingWallet ? (
                  <>
                    <div className="w-5 h-5 border-2 border-white border-t-transparent rounded-full animate-spin"></div>
                    <span>LINKING WALLET...</span>
                  </>
                ) : !wallets || wallets.length === 0 ? (
                  <>
                    <Wallet className="w-5 h-5" />
                    <span>CONNECT WALLET FIRST</span>
                  </>
                ) : (
                  <>
                    <Wallet className="w-5 h-5" />
                    <span>LINK WALLET</span>
                  </>
                )}
              </button>
            </div>
          )}

          {/* Wallet Linked Success */}
          {walletLinked && (
            <div className="p-6 bg-gradient-to-br from-green-950/50 to-emerald-950/50 rounded-2xl border border-green-800">
              <div className="text-center space-y-4">
                <div className="flex items-center justify-center space-x-3">
                  <div className="p-2 bg-green-600 rounded-xl">
                    <CheckCircle className="w-6 h-6 text-white" />
                  </div>
                  <div>
                    <p className="text-green-200 font-bold text-lg">Wallet Linked Successfully!</p>
                    <p className="text-green-300 text-sm font-medium">Your wallet is now verified and linked</p>
                  </div>
                </div>
                {linkTx && (
                  <a 
                    href={`https://zkverify-testnet.subscan.io/extrinsic/${linkTx}`}
                    target="_blank"
                    rel="noopener noreferrer"
                    className="inline-flex items-center space-x-2 text-green-400 hover:text-green-300 text-sm font-bold transition-colors"
                  >
                    <ExternalLink className="w-4 h-4" />
                    <span>View Link Transaction</span>
                  </a>
                )}
              </div>
            </div>
          )}
          
        </div>
      )}

      {/* Status */}
      {anonAadhaar.status !== "logged-in" && (
        <div className="text-center p-6 bg-gradient-to-r from-yellow-950/50 to-orange-950/50 rounded-2xl border border-yellow-800/30 animate-slide-up" style={{ animationDelay: '300ms' }}>
          <div className="flex items-center justify-center space-x-3 mb-3">
            <div className="w-2 h-2 bg-yellow-400 rounded-full animate-pulse"></div>
            <p className="text-yellow-200 font-semibold text-sm">Waiting for Verification</p>
          </div>
          <p className="text-yellow-300 text-sm font-medium leading-relaxed">
            Click the verification button above to generate your {useTestAadhaar ? 'test' : 'Aadhaar'} proof and start using AnonPay
          </p>
        </div>
      )}
    </div>
  );
}; 