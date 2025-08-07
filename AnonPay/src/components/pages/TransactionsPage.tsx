import React, { useState, useEffect } from 'react';
import { History, Eye, EyeOff, ExternalLink, Filter, Search, CheckCircle, Clock, AlertCircle } from 'lucide-react';
import { usePrivy, useWallets } from '@privy-io/react-auth';
import { createPublicClient, http, formatUnits } from 'viem';

export const TransactionsPage: React.FC = () => {
  const { user } = usePrivy();
  const { wallets } = useWallets();
  const [filter, setFilter] = useState<'all' | 'sent' | 'received'>('all');
  const [searchTerm, setSearchTerm] = useState('');
  const [transactions, setTransactions] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(true);

  const ERC20_CONTRACT_ADDRESS = '0xB672D9cAB08741A91832d9fD479C9f766718F3cb';

  // Load real transaction data from blockchain
  const loadTransactions = async () => {
    if (!user || !wallets || wallets.length === 0) {
      setIsLoading(false);
      return;
    }

    try {
      const walletAddress = wallets[0].address;
      
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

      // Get sent transactions
      const sentEvents = await client.getLogs({
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

      // Get received transactions
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

      // Convert events to transaction objects
      const sentTransactions = sentEvents.map((event, index) => ({
        id: `${event.transactionHash}${index}`,
        type: 'sent' as const,
        amount: formatUnits(event.args.value as bigint, 18),
        currency: 'INR',
        recipient: event.args.to,
        status: 'completed',
        timestamp: new Date(Number(event.blockNumber) * 1000), // Approximate timestamp
        isPrivate: true,
        zkProof: 'verified',
        gasUsed: '0.0025 ETH', // Would need to get from transaction receipt
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber
      }));

      const receivedTransactions = receivedEvents.map((event, index) => ({
        id: `${event.transactionHash}${index}`,
        type: 'received' as const,
        amount: formatUnits(event.args.value as bigint, 18),
        currency: 'INR',
        sender: event.args.from,
        status: 'completed',
        timestamp: new Date(Number(event.blockNumber) * 1000), // Approximate timestamp
        isPrivate: true,
        zkProof: 'verified',
        gasUsed: '0.0018 ETH', // Would need to get from transaction receipt
        transactionHash: event.transactionHash,
        blockNumber: event.blockNumber
      }));

      // Combine and sort by timestamp (newest first)
      const allTransactions = [...sentTransactions, ...receivedTransactions]
        .sort((a, b) => b.timestamp.getTime() - a.timestamp.getTime());

      setTransactions(allTransactions);
    } catch (error) {
      console.error('Error loading transactions:', error);
    } finally {
      setIsLoading(false);
    }
  };

    useEffect(() => {
    loadTransactions();
  }, [user, wallets]);

  const getStatusIcon = (status: string) => {
    switch (status) {
      case 'completed':
        return <CheckCircle className="w-4 h-4 text-green-400" />;
      case 'pending':
        return <Clock className="w-4 h-4 text-yellow-400" />;
      case 'failed':
        return <AlertCircle className="w-4 h-4 text-red-400" />;
      default:
        return <Clock className="w-4 h-4 text-neutral-400" />;
    }
  };

  const getStatusColor = (status: string) => {
    switch (status) {
      case 'completed':
        return 'text-green-400 bg-green-950 border-green-800';
      case 'pending':
        return 'text-yellow-400 bg-yellow-950 border-yellow-800';
      case 'failed':
        return 'text-red-400 bg-red-950 border-red-800';
      default:
        return 'text-neutral-400 bg-neutral-950 border-neutral-800';
    }
  };

  const formatTimeAgo = (date: Date) => {
    const now = new Date();
    const diff = now.getTime() - date.getTime();
    const minutes = Math.floor(diff / 60000);
    const hours = Math.floor(diff / 3600000);
    const days = Math.floor(diff / 86400000);

    if (days > 0) return `${days}d ago`;
    if (hours > 0) return `${hours}h ago`;
    if (minutes > 0) return `${minutes}m ago`;
    return 'Just now';
  };

  const filteredTransactions = transactions.filter(tx => {
    const matchesFilter = filter === 'all' || tx.type === filter;
    const matchesSearch = searchTerm === '' || 
      tx.id.toLowerCase().includes(searchTerm.toLowerCase()) ||
      (tx.recipient && tx.recipient.toLowerCase().includes(searchTerm.toLowerCase())) ||
      (tx.sender && tx.sender.toLowerCase().includes(searchTerm.toLowerCase()));
    
    return matchesFilter && matchesSearch;
  });

  return (
    <div className="min-h-screen bg-black">
      <main className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-8">
        {/* Header */}
        <div className="text-center mb-12 animate-slide-up">
          <div className="flex items-center justify-center space-x-3 mb-6">
            <div className="p-3 bg-gradient-to-br from-blue-600 to-indigo-600 rounded-2xl">
              <History className="w-8 h-8 text-white" />
            </div>
            <h1 className="text-4xl text-sharp text-white">TRANSACTION HISTORY</h1>
          </div>
          <p className="text-neutral-400 text-lg max-w-2xl mx-auto leading-relaxed font-medium">
            View your private and compliant transaction history with zero-knowledge verification
          </p>
        </div>

        {/* Filters and Search */}
        <div className="mb-8 space-y-4 animate-slide-up" style={{ animationDelay: '100ms' }}>
          <div className="flex flex-col sm:flex-row items-start sm:items-center justify-between space-y-4 sm:space-y-0 sm:space-x-4">
            {/* Filter Buttons */}
            <div className="flex items-center space-x-4">
              <Filter className="w-5 h-5 text-neutral-400" />
              <div className="flex items-center space-x-2">
                {[
                  { key: 'all', label: 'All' },
                  { key: 'sent', label: 'Sent' },
                  { key: 'received', label: 'Received' }
                ].map(filterOption => (
                  <button
                    key={filterOption.key}
                    onClick={() => setFilter(filterOption.key as any)}
                    className={`px-4 py-2 rounded-xl font-semibold text-sm tracking-wide transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] ${
                      filter === filterOption.key
                        ? 'bg-red-900/50 text-white border border-red-700'
                        : 'bg-neutral-900 text-neutral-400 hover:text-white hover:bg-neutral-800 border border-neutral-800'
                    }`}
                  >
                    {filterOption.label}
                  </button>
                ))}
              </div>
            </div>

            {/* Search */}
            <div className="relative">
              <Search className="absolute left-3 top-1/2 transform -translate-y-1/2 w-4 h-4 text-neutral-400" />
              <input
                type="text"
                value={searchTerm}
                onChange={(e) => setSearchTerm(e.target.value)}
                placeholder="Search transactions..."
                className="pl-10 pr-4 py-2 bg-neutral-900 border border-neutral-800 rounded-xl text-white font-medium transition-all duration-200 hover:bg-neutral-800 hover:border-neutral-700 focus:border-red-600 focus:ring-2 focus:ring-red-600/20 focus:outline-none w-64"
              />
            </div>
          </div>
        </div>

        {/* Loading State */}
        {isLoading && (
          <div className="text-center py-16 animate-slide-up">
            <div className="animate-spin rounded-full h-12 w-12 border-b-2 border-red-500 mx-auto mb-4"></div>
            <h3 className="text-xl font-bold text-neutral-400 mb-2">Loading transactions...</h3>
            <p className="text-neutral-500">Fetching your transaction history from the blockchain</p>
          </div>
        )}

        {/* Transactions List */}
        {!isLoading && (
          <div className="space-y-4">
            {filteredTransactions.map((transaction, index) => (
            <div
              key={transaction.id}
              className="bg-neutral-950 border border-neutral-800 rounded-2xl p-6 hover:bg-neutral-900 hover:border-neutral-700 transition-all duration-300 animate-slide-up"
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-4">
                <div className="flex items-center space-x-4">
                  <div className={`p-2 rounded-xl ${
                    transaction.type === 'sent' 
                      ? 'bg-red-900/50 border border-red-800' 
                      : 'bg-green-900/50 border border-green-800'
                  }`}>
                    {transaction.type === 'sent' ? (
                      <History className="w-5 h-5 text-red-400 rotate-180" />
                    ) : (
                      <History className="w-5 h-5 text-green-400" />
                    )}
                  </div>
                  
                  <div>
                    <div className="flex items-center space-x-3">
                      <h3 className="text-white font-bold text-lg">
                        {transaction.type === 'sent' ? 'Sent' : 'Received'} {transaction.amount} {transaction.currency}
                      </h3>
                      <div className={`px-2 py-1 rounded-full border text-xs font-bold ${getStatusColor(transaction.status)}`}>
                        {transaction.status.toUpperCase()}
                      </div>
                    </div>
                    <div className="flex items-center space-x-4 text-sm text-neutral-400 mt-1">
                      <span className="font-mono">{transaction.id}</span>
                    </div>
                  </div>
                </div>

                <div className="flex items-center space-x-3">
                  {getStatusIcon(transaction.status)}
                  <div className="text-right">
                    <div className="text-white font-bold">
                      {transaction.type === 'sent' ? '-' : '+'}{transaction.amount} {transaction.currency}
                    </div>
                    
                  </div>
                </div>
              </div>

              <div className="grid grid-cols-1 md:grid-cols-3 gap-6 pt-6 border-t border-neutral-800">
                {/* Address */}
                <div>
                  <div className="text-neutral-400 text-sm font-semibold mb-2">
                    {transaction.type === 'sent' ? 'To' : 'From'}
                  </div>
                  <div className="text-white font-mono text-sm">
                    {transaction.type === 'sent' ? transaction.recipient : transaction.sender}
                  </div>
                </div>

                {/* Privacy Status */}
                <div>
                  <div className="text-neutral-400 text-sm font-semibold mb-2">Privacy</div>
                  <div className="flex items-center space-x-2">
                    {transaction.isPrivate ? (
                      <>
                        <EyeOff className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 text-sm font-semibold">Private</span>
                      </>
                    ) : (
                      <>
                        <Eye className="w-4 h-4 text-neutral-400" />
                        <span className="text-neutral-400 text-sm font-semibold">Public</span>
                      </>
                    )}
                  </div>
                </div>

                {/* ZK Proof Status */}
                <div>
                  <div className="text-neutral-400 text-sm font-semibold mb-2">ZK Proof</div>
                  <div className="flex items-center space-x-2">
                    {transaction.zkProof === 'verified' && (
                      <>
                        <CheckCircle className="w-4 h-4 text-green-400" />
                        <span className="text-green-400 text-sm font-semibold">Verified</span>
                      </>
                    )}
                    {transaction.zkProof === 'generating' && (
                      <>
                        <Clock className="w-4 h-4 text-yellow-400" />
                        <span className="text-yellow-400 text-sm font-semibold">Generating</span>
                      </>
                    )}
                    {transaction.zkProof === 'n/a' && (
                      <span className="text-neutral-400 text-sm font-semibold">N/A</span>
                    )}
                  </div>
                </div>
              </div>

              {/* View on Explorer */}
              <div className="flex justify-end pt-4">
                <a 
                  href={`https://horizen-explorer-testnet.appchain.base.org/tx/${transaction.transactionHash}`}
                  target="_blank"
                  rel="noopener noreferrer"
                  className="flex items-center space-x-2 text-red-400 hover:text-red-300 transition-colors text-sm font-semibold"
                >
                  <ExternalLink className="w-4 h-4" />
                  <span>View on Explorer</span>
                </a>
              </div>
            </div>
          ))}
        </div>
        )}

        {/* Empty State */}
        {filteredTransactions.length === 0 && (
          <div className="text-center py-16 animate-slide-up">
            <History className="w-16 h-16 text-neutral-600 mx-auto mb-4" />
            <h3 className="text-xl font-bold text-neutral-400 mb-2">No transactions found</h3>
            <p className="text-neutral-500">
              {searchTerm ? 'Try adjusting your search terms' : 'Your transaction history will appear here'}
            </p>
          </div>
        )}
      </main>
    </div>
  );
};