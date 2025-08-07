import React, { useState, useEffect } from 'react';
import { User, Shield, CheckCircle, AlertCircle, Eye, Settings, Copy, ExternalLink } from 'lucide-react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { readContract } from 'viem/actions';
import { createPublicClient, http, formatEther, formatUnits } from 'viem';
import { CustomSelect } from '../ui/CustomSelect';

export const ProfilePage: React.FC = () => {
  const { user } = usePrivy();
  const { wallets } = useWallets();
  const [activeTab, setActiveTab] = useState<'identity' | 'privacy' | 'settings'>('identity');
  const [isVerified, setIsVerified] = useState(false);
  const [defaultCurrency, setDefaultCurrency] = useState('INR');
  const [transactionNotifications, setTransactionNotifications] = useState('all');
  const [userData, setUserData] = useState({
    walletAddress: '',
    isKycVerified: false,
    anonAadhaarStatus: 'not_verified' as 'not_verified' | 'pending' | 'verified',
    privacyScore: 0,
    transactionCount: 0,
    totalVolume: '₹0',
    joinedDate: new Date(),
    balance: '0',
    ethBalance: '0'
  });

  const CONTRACT_ADDRESS = '0x964D28b5cC79af30210AC59AAd93a80E140Bd0cd';
  const ERC20_CONTRACT_ADDRESS = '0xB672D9cAB08741A91832d9fD479C9f766718F3cb';

  // Load real user data from wallet and contract
  const loadUserData = async () => {
    if (!user || !wallets || wallets.length === 0) return;

    try {
      const walletAddress = wallets[0].address;
      
      // Create client for contract calls
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

      // Check KYC status from contract
      const isKycVerified = await readContract(client, {
        address: CONTRACT_ADDRESS as `0x${string}`,
        abi: [{
          name: 'isUserRegistered',
          type: 'function',
          inputs: [{ name: 'user', type: 'address' }],
          outputs: [{ name: '', type: 'bool' }],
          stateMutability: 'view'
        }],
        functionName: 'isUserRegistered',
        args: [walletAddress as `0x${string}`]
      });

      // Get INR token balance
      const inrBalance = await readContract(client, {
        address: ERC20_CONTRACT_ADDRESS as `0x${string}`,
        abi: [{
          name: 'balanceOf',
          type: 'function',
          inputs: [{ name: 'account', type: 'address' }],
          outputs: [{ name: '', type: 'uint256' }],
          stateMutability: 'view'
        }],
        functionName: 'balanceOf',
        args: [walletAddress as `0x${string}`]
      });

      // Get ETH balance for reference
      const ethBalance = await client.getBalance({ address: walletAddress as `0x${string}` });

      // Get INR token transaction count by checking transfer events
      const transferEvents = await client.getLogs({
        address: ERC20_CONTRACT_ADDRESS as `0x${string}`,
        event: {
          type: 'event',
          name: 'Transfer',
          inputs: [
            { type: 'address', name: 'from', indexed: true },
            { type: 'address', name: 'to', indexed: true },
            { type: 'uint256', name: 'value', indexed: false }
          ]
        },
        args: {
          from: walletAddress as `0x${string}`,
        },
        fromBlock: 'earliest',
        toBlock: 'latest'
      });

      const receivedEvents = await client.getLogs({
        address: ERC20_CONTRACT_ADDRESS as `0x${string}`,
        event: {
          type: 'event',
          name: 'Transfer',
          inputs: [
            { type: 'address', name: 'from', indexed: true },
            { type: 'address', name: 'to', indexed: true },
            { type: 'uint256', name: 'value', indexed: false }
          ]
        },
        args: {
          to: walletAddress as `0x${string}`,
        },
        fromBlock: 'earliest',
        toBlock: 'latest'
      });

      const inrTransactionCount = transferEvents.length + receivedEvents.length;

      setUserData({
        walletAddress,
        isKycVerified: isKycVerified as boolean,
        anonAadhaarStatus: isKycVerified ? 'verified' : 'not_verified',
        privacyScore: isKycVerified ? 95 : 45,
        transactionCount: inrTransactionCount, // INR token transaction count
        totalVolume: '₹0', // Would need to track this in contract
        joinedDate: new Date(), // Would need to track this in contract
        balance: formatUnits(inrBalance as bigint, 18), // INR tokens have 18 decimals
        ethBalance: formatEther(ethBalance)
      });

    } catch (error) {
      console.error('Error loading user data:', error);
    }
  };

  useEffect(() => {
    loadUserData();
  }, [user, wallets]);

  const handleVerifyIdentity = () => {
    // In a real app, this would trigger Anon Aadhaar verification
    setIsVerified(true);
    setTimeout(() => {
      userData.anonAadhaarStatus = 'verified';
      userData.isKycVerified = true;
    }, 2000);
  };

  const copyAddress = () => {
    navigator.clipboard.writeText(userData.walletAddress);
  };

  const formatAddress = (address: string) => {
    return `${address.slice(0, 6)}...${address.slice(-4)}`;
  };

  return (
    <div className="min-h-screen bg-black">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-slide-up">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl">
              <User className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl text-sharp text-white">PROFILE</h1>
          </div>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto leading-relaxed font-medium">
            Manage your identity verification, privacy settings, and account preferences
          </p>
        </div>

        {/* Profile Overview */}
        <div className="bg-gradient-to-r from-neutral-950 to-neutral-900 border border-purple-900/30 rounded-2xl p-8 mb-8 animate-slide-up">
          <div className="flex flex-col lg:flex-row items-start lg:items-center space-y-8 lg:space-y-0 lg:space-x-12">
            {/* Avatar and Basic Info */}
            <div className="flex items-center space-x-6 flex-1">
              <div className="relative flex-shrink-0">
                <div className="w-24 h-24 bg-gradient-to-br from-purple-600 to-pink-600 rounded-2xl flex items-center justify-center">
                  <User className="w-12 h-12 text-white" />
                </div>
                <div className={`absolute -bottom-2 -right-2 w-8 h-8 rounded-full flex items-center justify-center ${
                  userData.isKycVerified ? 'bg-green-600' : 'bg-red-600'
                }`}>
                  {userData.isKycVerified ? (
                    <CheckCircle className="w-4 h-4 text-white" />
                  ) : (
                    <AlertCircle className="w-4 h-4 text-white" />
                  )}
                </div>
              </div>
              
              <div className="flex-1 min-w-0">
                <div className="flex flex-col sm:flex-row sm:items-center space-y-2 sm:space-y-0 sm:space-x-4 mb-3">
                  <h1 className="text-2xl sm:text-3xl text-sharp text-white">Wallet Profile</h1>
                  <div className={`px-3 py-1 rounded-full text-xs font-bold w-fit ${
                    userData.isKycVerified 
                      ? 'bg-green-950 border border-green-800 text-green-400'
                      : 'bg-red-950 border border-red-800 text-red-400'
                  }`}>
                    {userData.isKycVerified ? 'VERIFIED' : 'UNVERIFIED'}
                  </div>
                </div>
                <div className="space-y-2">
                  <div className="flex items-center space-x-2 text-neutral-400">
                    <span className="font-mono text-sm">{formatAddress(userData.walletAddress)}</span>
                    <button
                      onClick={copyAddress}
                      className="p-1 hover:bg-neutral-800 rounded transition-colors"
                    >
                      <Copy className="w-3 h-3" />
                    </button>
                  </div>
                  <div className="text-neutral-400 text-sm">
                    Member since {userData.joinedDate.toLocaleDateString()}
                  </div>
                </div>
              </div>
            </div>

            {/* Quick Stats */}
            <div className="grid grid-cols-2 gap-6 lg:gap-8 flex-shrink-0">
              <div className="text-center bg-neutral-900/50 rounded-xl p-4 border border-neutral-800">
                <div className="text-2xl font-bold text-purple-400 mb-1">{userData.transactionCount}</div>
                <div className="text-neutral-400 text-xs font-semibold uppercase tracking-wide">Transactions</div>
              </div>
              <div className="text-center bg-neutral-900/50 rounded-xl p-4 border border-neutral-800">
                <div className="text-2xl font-bold text-green-400 mb-1">₹{parseFloat(userData.balance).toLocaleString()}</div>
                <div className="text-neutral-400 text-xs font-semibold uppercase tracking-wide">INR Token Balance</div>
              </div>
            </div>
          </div>
        </div>

        {/* Content Tabs */}
        <div className="bg-neutral-950 border border-purple-900/30 rounded-2xl overflow-hidden animate-slide-up" style={{ animationDelay: '200ms' }}>
          {/* Tab Navigation */}
          <div className="flex items-center space-x-1 bg-neutral-900 border-b border-purple-900/30 p-1">
            {[
              { key: 'identity', label: 'Identity Verification', icon: Shield },
              { key: 'privacy', label: 'Privacy Settings', icon: Eye },
              { key: 'settings', label: 'Account Settings', icon: Settings }
            ].map((tab) => {
              const TabIcon = tab.icon;
              return (
                <button
                  key={tab.key}
                  onClick={() => setActiveTab(tab.key as any)}
                  className={`flex-1 flex items-center justify-center space-x-2 px-4 py-3 rounded-xl font-semibold text-sm tracking-wide transition-all duration-300 ${
                    activeTab === tab.key
                      ? 'bg-purple-900/50 text-white shadow-lg'
                      : 'text-neutral-400 hover:text-white hover:bg-purple-900/20'
                  }`}
                >
                  <TabIcon className="w-4 h-4" />
                  <span>{tab.label}</span>
                </button>
              );
            })}
          </div>

          {/* Tab Content */}
          <div className="p-6">
            {activeTab === 'identity' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white mb-6">Identity Verification</h3>
                
                {/* Anon Aadhaar Verification */}
                <div className="bg-gradient-to-r from-blue-950 to-indigo-950 border border-blue-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div className="flex items-center space-x-3">
                      <Shield className="w-6 h-6 text-blue-400" />
                      <div>
                        <h4 className="text-white font-bold">Anon Aadhaar Verification</h4>
                        <p className="text-blue-300 text-sm">Prove Indian residency without revealing personal data</p>
                      </div>
                    </div>
                    <div className={`px-3 py-1 rounded-full text-xs font-bold ${
                      userData.anonAadhaarStatus === 'verified'
                        ? 'bg-green-950 border border-green-800 text-green-400'
                        : userData.anonAadhaarStatus === 'pending'
                          ? 'bg-yellow-950 border border-yellow-800 text-yellow-400'
                          : 'bg-red-950 border border-red-800 text-red-400'
                    }`}>
                      {userData.anonAadhaarStatus === 'verified' ? 'VERIFIED' :
                       userData.anonAadhaarStatus === 'pending' ? 'PENDING' : 'NOT VERIFIED'}
                    </div>
                  </div>
                  
                  {userData.anonAadhaarStatus === 'not_verified' && (
                    <div className="space-y-4">
                      <p className="text-blue-300 text-sm leading-relaxed">
                        Verify your Indian identity using Anon Aadhaar to enable private, compliant transactions. 
                        Your personal information remains completely private through zero-knowledge proofs.
                      </p>
                      <button
                        onClick={handleVerifyIdentity}
                        disabled={isVerified}
                        className="bg-gradient-to-r from-blue-600 to-indigo-600 hover:from-blue-500 hover:to-indigo-500 disabled:from-neutral-800 disabled:to-neutral-700 text-white font-bold py-3 px-6 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] disabled:cursor-not-allowed"
                      >
                        {isVerified ? 'Verifying...' : 'Verify with Anon Aadhaar'}
                      </button>
                    </div>
                  )}
                  
                  {userData.anonAadhaarStatus === 'verified' && (
                    <div className="space-y-3">
                      <div className="flex items-center space-x-2 text-green-400">
                        <CheckCircle className="w-4 h-4" />
                        <span className="font-semibold">Identity verified successfully</span>
                      </div>
                      <p className="text-green-300 text-sm">
                        Your Indian residency has been verified using zero-knowledge proofs. 
                        You can now send and receive private, compliant payments.
                      </p>
                    </div>
                  )}
                </div>

                {/* KYC Status */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                  <h4 className="text-white font-bold mb-4">KYC Compliance Status</h4>
                  <div className="grid grid-cols-1 md:grid-cols-2 gap-4">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Identity Verification:</span>
                      <div className="flex items-center space-x-2">
                        {userData.isKycVerified ? (
                          <>
                            <CheckCircle className="w-4 h-4 text-green-400" />
                            <span className="text-green-400 font-semibold">Complete</span>
                          </>
                        ) : (
                          <>
                            <AlertCircle className="w-4 h-4 text-red-400" />
                            <span className="text-red-400 font-semibold">Pending</span>
                          </>
                        )}
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">AML Check:</span>
                      <div className="flex items-center space-x-2">
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 font-semibold">Passed</span>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            )}

            {activeTab === 'privacy' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white mb-6">Privacy Settings</h3>
                
                {/* Privacy Score */}
                <div className="bg-gradient-to-r from-green-950 to-emerald-950 border border-green-800 rounded-xl p-6">
                  <div className="flex items-center justify-between mb-4">
                    <div>
                      <h4 className="text-white font-bold">Privacy Score</h4>
                      <p className="text-green-300 text-sm">Your overall privacy protection level</p>
                    </div>
                    <div className="text-3xl font-bold text-green-400">{userData.privacyScore}%</div>
                  </div>
                  <div className="w-full bg-green-900 rounded-full h-2">
                    <div 
                      className="bg-gradient-to-r from-green-400 to-emerald-400 h-2 rounded-full transition-all duration-500"
                      style={{ width: `${userData.privacyScore}%` }}
                    />
                  </div>
                </div>

                {/* Privacy Settings */}
                <div className="space-y-4">
                  {[
                    {
                      title: 'Default Private Transactions',
                      description: 'Use zero-knowledge proofs for all transactions by default',
                      enabled: true
                    },
                    {
                      title: 'Hide Transaction Amounts',
                      description: 'Encrypt transaction amounts in your history',
                      enabled: true
                    },
                    {
                      title: 'Anonymous Analytics',
                      description: 'Allow anonymous usage analytics to improve the platform',
                      enabled: false
                    }
                  ].map((setting, index) => (
                    <div key={index} className="flex items-center justify-between p-4 bg-neutral-900 border border-neutral-800 rounded-xl">
                      <div>
                        <h5 className="text-white font-semibold">{setting.title}</h5>
                        <p className="text-neutral-400 text-sm">{setting.description}</p>
                      </div>
                      <button
                        className={`relative inline-flex h-6 w-11 items-center rounded-full transition-colors ${
                          setting.enabled ? 'bg-green-600' : 'bg-neutral-700'
                        }`}
                      >
                        <span
                          className={`inline-block h-4 w-4 transform rounded-full bg-white transition-transform ${
                            setting.enabled ? 'translate-x-6' : 'translate-x-1'
                          }`}
                        />
                      </button>
                    </div>
                  ))}
                </div>
              </div>
            )}

            {activeTab === 'settings' && (
              <div className="space-y-6">
                <h3 className="text-xl font-bold text-white mb-6">Account Settings</h3>
                
                {/* Wallet Information */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                  <h4 className="text-white font-bold mb-4">Wallet Information</h4>
                  <div className="space-y-3">
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Wallet Address:</span>
                      <div className="flex items-center space-x-2">
                        <span className="text-white font-mono text-sm">{formatAddress(userData.walletAddress)}</span>
                        <button
                          onClick={copyAddress}
                          className="p-1 hover:bg-neutral-800 rounded transition-colors"
                        >
                          <Copy className="w-4 h-4 text-neutral-400" />
                        </button>
                        <button className="p-1 hover:bg-neutral-800 rounded transition-colors">
                          <ExternalLink className="w-4 h-4 text-neutral-400" />
                        </button>
                      </div>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">Network:</span>
                      <span className="text-white">Horizon Testnet</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">INR Token Balance:</span>
                      <span className="text-white">₹{parseFloat(userData.balance).toLocaleString()}</span>
                    </div>
                    <div className="flex items-center justify-between">
                      <span className="text-neutral-400">ETH Balance:</span>
                      <span className="text-white">{userData.ethBalance} ETH</span>
                    </div>
                  </div>
                </div>

                {/* Preferences */}
                <div className="bg-neutral-900 border border-neutral-800 rounded-xl p-6">
                  <h4 className="text-white font-bold mb-4">Preferences</h4>
                  <div className="space-y-4">
                    <div>
                      <label className="block text-sm font-semibold text-neutral-300 mb-2">
                        Default Currency
                      </label>
                      <CustomSelect
                        value={defaultCurrency}
                        onChange={setDefaultCurrency}
                        options={[
                          { value: 'INR', label: 'Indian Rupee (INR)' },
                          { value: 'USD', label: 'US Dollar (USD)' },
                          { value: 'ETH', label: 'Ethereum (ETH)' }
                        ]}
                        placeholder="Select default currency"
                        className="w-full"
                      />
                    </div>
                    <div>
                      <label className="block text-sm font-semibold text-neutral-300 mb-2">
                        Transaction Notifications
                      </label>
                      <CustomSelect
                        value={transactionNotifications}
                        onChange={setTransactionNotifications}
                        options={[
                          { value: 'all', label: 'All Transactions' },
                          { value: 'large', label: 'Large Amounts Only' },
                          { value: 'none', label: 'None' }
                        ]}
                        placeholder="Select notification preference"
                        className="w-full"
                      />
                    </div>
                  </div>
                </div>
              </div>
            )}
          </div>
        </div>
      </main>
    </div>
  );
};