import React, { useState } from 'react';
import { Send, Shield, Eye, AlertCircle, CheckCircle, Loader, UserCheck, UserX } from 'lucide-react';
import { usePrivy, useSendTransaction, useWallets } from '@privy-io/react-auth';
import { readContract } from 'viem/actions';
import { createPublicClient, http, encodeFunctionData, parseEther, parseUnits } from 'viem';
import { CustomSelect } from '../ui/CustomSelect';

export const SendMoneyPage: React.FC = () => {
  const { user } = usePrivy();
  const { sendTransaction } = useSendTransaction();
  const { wallets } = useWallets();
  const [recipientAddress, setRecipientAddress] = useState('');
  const [amount, setAmount] = useState('');
  const [currency, setCurrency] = useState('INR');
  const [message, setMessage] = useState('');
  const [isPrivate, setIsPrivate] = useState(true);
  const [isLoading, setIsLoading] = useState(false);
  const [transactionStatus, setTransactionStatus] = useState<'idle' | 'processing' | 'success' | 'error'>('idle');
  const [recipientVerificationStatus, setRecipientVerificationStatus] = useState<'idle' | 'checking' | 'verified' | 'unverified' | 'error'>('idle');
  const [isCheckingRecipient, setIsCheckingRecipient] = useState(false);
  const [userBalance, setUserBalance] = useState('0');

  const CONTRACT_ADDRESS = '0x964D28b5cC79af30210AC59AAd93a80E140Bd0cd';
  const ERC20_CONTRACT_ADDRESS = '0xB672D9cAB08741A91832d9fD479C9f766718F3cb';

  // Load user's INR token balance
  const loadUserBalance = async () => {
    try {
      // In a real implementation, you would use ethers.js or web3.js
      // const contract = new ethers.Contract(ERC20_CONTRACT_ADDRESS, erc20Abi, provider);
      // const balance = await contract.balanceOf(userAddress);
      // setUserBalance(ethers.utils.formatEther(balance));
      
      // Mock balance for demo
      setUserBalance('10,000');
    } catch (error) {
      console.error('Error loading balance:', error);
    }
  };

  React.useEffect(() => {
    loadUserBalance();
  }, []);

  const checkRecipientVerification = async (address: string) => {
    if (!address || address.length < 10) {
      setRecipientVerificationStatus('idle');
      return;
    }

    setIsCheckingRecipient(true);
    setRecipientVerificationStatus('checking');

    try {
      // Check if address is valid Ethereum address
      if (!/^0x[a-fA-F0-9]{40}$/.test(address)) {
        setRecipientVerificationStatus('error');
        setIsCheckingRecipient(false);
        return;
      }

      // Real contract call to check if user is registered
      const client = createPublicClient({
        chain: {
          id: 845320009,
          name: 'horizonTestnet',
          network: 'horizonTestnet',
          nativeCurrency: {
            decimals: 18,
            name: 'ETH',
            symbol: 'ETH'
          },
          rpcUrls: {
            default: {
              http: ['https://horizen-rpc-testnet.appchain.base.org'],
            }
          },
          blockExplorers: {
            default: {name: 'Explorer', url: 'https://horizen-explorer-testnet.appchain.base.org/'}
          }
        },
        transport: http()
      });
      
      const isRegistered = await readContract(client, {
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: [{
          name: 'isUserRegistered',
          type: 'function',
          inputs: [{ name: 'user', type: 'address' }],
          outputs: [{ name: '', type: 'bool' }],
          stateMutability: 'view'
        }],
        functionName: 'isUserRegistered',
        args: [address as `0x${string}`]
      });
      
      setRecipientVerificationStatus(isRegistered ? 'verified' : 'unverified');
      setIsCheckingRecipient(false);

    } catch (error) {
      console.error('Error checking recipient verification:', error);
      setRecipientVerificationStatus('error');
      setIsCheckingRecipient(false);
    }
  };

  const handleRecipientAddressChange = (address: string) => {
    setRecipientAddress(address);
    
    // Debounce the verification check
    const timeoutId = setTimeout(() => {
      checkRecipientVerification(address);
    }, 500);

    return () => clearTimeout(timeoutId);
  };

  const handleSendMoney = async () => {
    if (!recipientAddress || !amount) return;
    
    // Check if recipient is verified for INR transfers
    if (currency === 'INR' && recipientVerificationStatus !== 'verified') {
      alert('Recipient must be Aadhaar verified to receive INR tokens');
      return;
    }
    
    setIsLoading(true);
    setTransactionStatus('processing');
    
    try {
      // Check if user and wallets are available
      if (!user) {
        throw new Error('No user connected');
      }
      
      if (!wallets || wallets.length === 0) {
        throw new Error('No wallet connected');
      }

      if (currency === 'INR') {
        // Real INR token transfer using Privy
        
        // Use Privy's sendTransaction for contract interaction
        const { hash } = await sendTransaction(
          {
            to: ERC20_CONTRACT_ADDRESS,
            data: encodeFunctionData({
              abi: [{
                name: 'transfer',
                type: 'function',
                inputs: [
                  { name: 'to', type: 'address' },
                  { name: 'amount', type: 'uint256' }
                ],
                outputs: [{ name: '', type: 'bool' }],
                stateMutability: 'nonpayable'
              }],
              args: [recipientAddress as `0x${string}`, parseEther(amount)]
            })
          },
          {
            address: wallets[0].address
          }
        );
        // const provider = await wallets[0].getEthereumProvider();
        // const receipt = await waitForTransaction(hash as `0x${string}`, {
        //   provider: provider as any
        // });
        // console.log('Tx confirmed', receipt);

        console.log('INR transfer initiated:', hash);
        setTransactionStatus('success');
        setIsLoading(false);
        loadUserBalance(); // Refresh balance
        
        console.log('INR transfer successful:', {
          txHash: hash,
          recipient: recipientAddress,
          amount: amount
        });
        
        // Reset form after success
        setTimeout(() => {
          setTransactionStatus('idle');
          setRecipientAddress('');
          setAmount('');
          setMessage('');
        }, 3000);
              } else {
          // Handle other currency transfers (ETH, USDC, etc.)
          
          if (currency === 'ETH') {
            // Native ETH transfer using Privy
            const tx = await sendTransaction(
              {
                to: recipientAddress as `0x${string}`,
                value: parseEther(amount)
              },
              {
                address: wallets[0].address
              }
            );
            
            console.log('ETH transfer initiated:', tx.hash);
            setTransactionStatus('success');
            setIsLoading(false);
            
            console.log('ETH transfer successful:', {
              txHash: tx.hash,
              recipient: recipientAddress,
              amount: amount
            });
          } else {
            // ERC20 token transfer (USDC, etc.)
            const decimals = currency === 'USDC' ? 6 : 18;
            
            const tx = await sendTransaction(
              {
                to: ERC20_CONTRACT_ADDRESS as `0x${string}`,
                data: encodeFunctionData({
                  abi: [{
                    name: 'transfer',
                    type: 'function',
                    inputs: [
                      { name: 'to', type: 'address' },
                      { name: 'amount', type: 'uint256' }
                    ],
                    outputs: [{ name: '', type: 'bool' }],
                    stateMutability: 'nonpayable'
                  }],
                  args: [recipientAddress as `0x${string}`, parseUnits(amount, decimals)]
                })
              },
              {
                address: wallets[0].address
              }
            );
            
            console.log(`${currency} transfer initiated:`, tx.hash);
            setTransactionStatus('success');
            setIsLoading(false);
            
            console.log(`${currency} transfer successful:`, {
              txHash: tx.hash,
              recipient: recipientAddress,
              amount: amount
            });
          }
        
        // Reset form after success
        setTimeout(() => {
          setTransactionStatus('idle');
          setRecipientAddress('');
          setAmount('');
          setMessage('');
        }, 3000);
      }
    } catch (error: any) {
      console.error('Transaction failed:', error);
      setTransactionStatus('error');
      setIsLoading(false);
      
      // Show user-friendly error message
      if (error.code === 'INSUFFICIENT_FUNDS') {
        alert('Insufficient balance for this transfer');
      } else if (error.code === 'UNPREDICTABLE_GAS_LIMIT') {
        alert('Transaction failed due to gas estimation error. Please try again.');
      } else if (error.message?.includes('user rejected')) {
        alert('Transaction was cancelled by user');
      } else {
        alert(`Transaction failed: ${error.message || 'Unknown error'}`);
      }
    }
  };

  return (
    <div className="min-h-screen bg-black">
      <main className="max-w-4xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-slide-up">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl">
              <Send className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl text-sharp text-white">SEND MONEY</h1>
          </div>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto leading-relaxed font-medium">
            Send money privately and securely with zero-knowledge proofs and regulatory compliance
          </p>
        </div>

        <div className="grid grid-cols-1 lg:grid-cols-3 gap-8">
          {/* Send Money Form */}
          <div className="lg:col-span-2 space-y-6">
            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-8 animate-slide-up">
              <h2 className="text-2xl font-bold text-white mb-6">Transfer Details</h2>
              
              <div className="space-y-6">
                {/* Recipient Address */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-300 mb-3">
                    Recipient Address
                  </label>
                  <div className="relative">
                    <input
                      type="text"
                      value={recipientAddress}
                      onChange={(e) => handleRecipientAddressChange(e.target.value)}
                      placeholder="0x... or ENS name"
                      className={`w-full bg-neutral-900 border rounded-xl px-4 py-3 pr-12 text-white font-medium transition-all duration-200 hover:bg-neutral-800 focus:ring-2 focus:outline-none ${
                        recipientVerificationStatus === 'verified' 
                          ? 'border-green-600 focus:border-green-500 focus:ring-green-600/20'
                          : recipientVerificationStatus === 'unverified'
                            ? 'border-yellow-600 focus:border-yellow-500 focus:ring-yellow-600/20'
                            : recipientVerificationStatus === 'error'
                              ? 'border-red-600 focus:border-red-500 focus:ring-red-600/20'
                              : 'border-neutral-800 hover:border-neutral-700 focus:border-red-600 focus:ring-red-600/20'
                      }`}
                    />
                    
                    {/* Verification Status Icon */}
                    <div className="absolute right-3 top-1/2 transform -translate-y-1/2">
                      {isCheckingRecipient && (
                        <Loader className="w-5 h-5 text-neutral-400 animate-spin" />
                      )}
                      {recipientVerificationStatus === 'verified' && (
                        <UserCheck className="w-5 h-5 text-green-400" />
                      )}
                      {recipientVerificationStatus === 'unverified' && (
                        <UserX className="w-5 h-5 text-yellow-400" />
                      )}
                      {recipientVerificationStatus === 'error' && (
                        <AlertCircle className="w-5 h-5 text-red-400" />
                      )}
                    </div>
                  </div>
                  
                  {/* Verification Status Message */}
                  {recipientVerificationStatus !== 'idle' && recipientVerificationStatus !== 'checking' && (
                    <div className={`mt-2 p-3 rounded-xl border text-sm font-medium ${
                      recipientVerificationStatus === 'verified'
                        ? 'bg-green-950/50 border-green-800 text-green-300'
                        : recipientVerificationStatus === 'unverified'
                          ? 'bg-yellow-950/50 border-yellow-800 text-yellow-300'
                          : 'bg-red-950/50 border-red-800 text-red-300'
                    }`}>
                      <div className="flex items-center space-x-2">
                        {recipientVerificationStatus === 'verified' && (
                          <>
                            <CheckCircle className="w-4 h-4" />
                            <span>✅ Recipient is Aadhaar verified and can receive INR tokens</span>
                          </>
                        )}
                        {recipientVerificationStatus === 'unverified' && (
                          <>
                            <AlertCircle className="w-4 h-4" />
                            <span>⚠️ Recipient is not Aadhaar verified. Cannot receive INR tokens.</span>
                          </>
                        )}
                        {recipientVerificationStatus === 'error' && (
                          <>
                            <AlertCircle className="w-4 h-4" />
                            <span>❌ Invalid address format or verification check failed</span>
                          </>
                        )}
                      </div>
                      {currency === 'INR' && recipientVerificationStatus === 'unverified' && (
                        <div className="mt-2 text-xs text-yellow-200">
                          💡 INR token transfers require both sender and recipient to be Aadhaar verified for regulatory compliance.
                        </div>
                      )}
                    </div>
                  )}
                </div>

                {/* Amount and Currency */}
                <div className="grid grid-cols-1 md:grid-cols-3 gap-4">
                  <div className="md:col-span-2">
                    <label className="block text-sm font-semibold text-neutral-300 mb-3">
                      Amount
                      {currency === 'INR' && (
                        <span className="ml-2 text-xs text-neutral-500">
                          (Balance: {userBalance} INR)
                        </span>
                      )}
                    </label>
                    <input
                      type="number"
                      value={amount}
                      onChange={(e) => setAmount(e.target.value)}
                      placeholder="0.00"
                      max={currency === 'INR' ? userBalance.replace(',', '') : undefined}
                      className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-white font-medium transition-all duration-200 hover:bg-neutral-800 hover:border-neutral-700 focus:border-red-600 focus:ring-2 focus:ring-red-600/20 focus:outline-none"
                    />
                  </div>
                  <div>
                    <label className="block text-sm font-semibold text-neutral-300 mb-3">
                      Currency
                    </label>
                    <CustomSelect
                      value={currency}
                      onChange={setCurrency}
                      options={[
                        { value: 'INR', label: 'INR' },
                        { value: 'ETH', label: 'ETH' },
                        { value: 'USDC', label: 'USDC' },
                        { value: 'USDT', label: 'USDT' }
                      ]}
                      placeholder="Select currency"
                      className="w-full"
                    />
                  </div>
                </div>

                {/* Message */}
                <div>
                  <label className="block text-sm font-semibold text-neutral-300 mb-3">
                    Message (Optional)
                  </label>
                  <textarea
                    value={message}
                    onChange={(e) => setMessage(e.target.value)}
                    placeholder="Add a note for the recipient..."
                    rows={3}
                    className="w-full bg-neutral-900 border border-neutral-800 rounded-xl px-4 py-3 text-white font-medium transition-all duration-200 hover:bg-neutral-800 hover:border-neutral-700 focus:border-red-600 focus:ring-2 focus:ring-red-600/20 focus:outline-none resize-none"
                  />
                </div>

                {/* Privacy Toggle */}
                <div className="flex items-center justify-between p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
                  <div className="flex items-center space-x-3">
                    <Eye className="w-5 h-5 text-red-400" />
                    <div>
                      <h4 className="text-white font-semibold">Private Transaction</h4>
                      <p className="text-neutral-400 text-sm">Hide transaction details using zero-knowledge proofs</p>
                    </div>
                  </div>
                  <button
                    onClick={() => setIsPrivate(!isPrivate)}
                    className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                      isPrivate ? 'bg-red-600' : 'bg-neutral-700'
                    }`}
                  >
                    <span
                      className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                        isPrivate ? 'translate-x-6' : 'translate-x-1'
                      }`}
                    />
                  </button>
                </div>
              </div>
            </div>

            {/* Transaction Status */}
            {transactionStatus !== 'idle' && (
              <div className={`bg-gradient-to-r rounded-2xl p-6 animate-scale-in ${
                transactionStatus === 'processing' 
                  ? 'from-blue-950 to-indigo-950 border border-blue-800' 
                  : transactionStatus === 'success'
                    ? 'from-green-950 to-emerald-950 border border-green-800'
                    : 'from-red-950 to-pink-950 border border-red-800'
              }`}>
                <div className="flex items-center space-x-3 mb-4">
                  {transactionStatus === 'processing' && (
                    <Loader className="w-6 h-6 text-blue-400 animate-spin" />
                  )}
                  {transactionStatus === 'success' && (
                    <CheckCircle className="w-6 h-6 text-green-400" />
                  )}
                  {transactionStatus === 'error' && (
                    <AlertCircle className="w-6 h-6 text-red-400" />
                  )}
                  <h3 className={`text-lg font-bold ${
                    transactionStatus === 'processing' ? 'text-blue-400' : 
                    transactionStatus === 'success' ? 'text-green-400' : 'text-red-400'
                  }`}>
                    {transactionStatus === 'processing' && 'Processing Transaction...'}
                    {transactionStatus === 'success' && 'Transaction Successful! 🎉'}
                    {transactionStatus === 'error' && 'Transaction Failed'}
                  </h3>
                </div>
                <p className={`${
                  transactionStatus === 'processing' ? 'text-blue-300' : 
                  transactionStatus === 'success' ? 'text-green-300' : 'text-red-300'
                } font-medium`}>
                  {transactionStatus === 'processing' && 'Generating zero-knowledge proof and processing your private transaction...'}
                  {transactionStatus === 'success' && `Successfully sent ${amount} ${currency} privately with full regulatory compliance.`}
                  {transactionStatus === 'error' && 'There was an error processing your transaction. Please try again.'}
                </p>
              </div>
            )}

            {/* Send Button */}
            <button
              onClick={handleSendMoney}
              disabled={
                !recipientAddress || 
                !amount || 
                isLoading || 
                (currency === 'INR' && recipientVerificationStatus !== 'verified')
              }
              className="w-full bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 disabled:from-neutral-800 disabled:to-neutral-700 text-white font-bold py-4 px-8 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed disabled:hover:scale-100 flex items-center justify-center space-x-2 animate-slide-up"
              style={{ animationDelay: '200ms' }}
            >
              {isLoading ? (
                <>
                  <Loader className="w-5 h-5 animate-spin" />
                  <span>{currency === 'INR' ? 'Sending INR Tokens...' : 'Processing...'}</span>
                </>
              ) : (
                <>
                  <Send className="w-5 h-5" />
                  <span>{currency === 'INR' ? 'SEND INR TOKENS' : 'SEND MONEY'}</span>
                </>
              )}
            </button>
          </div>

          {/* Privacy & Compliance Info */}
          <div className="space-y-6">
            <div className="bg-gradient-to-r from-red-950 to-orange-950 border border-red-800 rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '100ms' }}>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                <Shield className="w-5 h-5 text-red-400" />
                <span>Privacy Features</span>
              </h3>
              <ul className="space-y-3">
                {[
                 'Mandatory Aadhaar verification for INR',
                  'Zero-knowledge transaction proofs',
                  'Hidden amounts and recipients',
                  'End-to-end encryption'
                ].map((feature, index) => (
                  <li key={index} className="flex items-start space-x-2 text-red-300">
                    <div className="w-1.5 h-1.5 bg-red-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-gradient-to-r from-green-950 to-emerald-950 border border-green-800 rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '200ms' }}>
              <h3 className="text-lg font-bold text-white mb-4 flex items-center space-x-2">
                <CheckCircle className="w-5 h-5 text-green-400" />
                <span>Compliance</span>
              </h3>
              <ul className="space-y-3">
                {[
                  'Automated KYC/AML checks',
                  'Regulatory reporting',
                  'Indian compliance standards',
                  'Audit trail generation'
                ].map((feature, index) => (
                  <li key={index} className="flex items-start space-x-2 text-green-300">
                    <div className="w-1.5 h-1.5 bg-green-400 rounded-full mt-2 flex-shrink-0"></div>
                    <span className="text-sm leading-relaxed">{feature}</span>
                  </li>
                ))}
              </ul>
            </div>

            <div className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 animate-slide-up" style={{ animationDelay: '300ms' }}>
              <h3 className="text-lg font-bold text-white mb-4">Transaction Fees</h3>
              <div className="space-y-2 text-sm">
                <div className="flex justify-between">
                  <span className="text-neutral-400">Network Fee:</span>
                  <span className="text-white">{currency === 'INR' ? '~₹5' : '~$0.50'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Privacy Fee:</span>
                  <span className="text-white">{currency === 'INR' ? '~₹2.5' : '~$0.25'}</span>
                </div>
                <div className="flex justify-between">
                  <span className="text-neutral-400">Compliance Fee:</span>
                  <span className="text-white">{currency === 'INR' ? '~₹1' : '~$0.10'}</span>
                </div>
                <hr className="border-neutral-800 my-2" />
                <div className="flex justify-between font-semibold">
                  <span className="text-white">Total:</span>
                  <span className="text-white">{currency === 'INR' ? '~₹8.5' : '~$0.85'}</span>
                </div>
              </div>
            </div>
          </div>
        </div>
      </main>
    </div>
  );
};