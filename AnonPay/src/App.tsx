import React, { useState, useEffect } from 'react';
import { PrivyProvider } from '@privy-io/react-auth';
import { Header } from './components/layout/Header';
import { Footer } from './components/layout/Footer';
import { HomePage } from './components/pages/HomePage';
import { SendMoneyPage } from './components/pages/SendMoneyPage';
import { TransactionsPage } from './components/pages/TransactionsPage';
import { ProfilePage } from './components/pages/ProfilePage';
import {defineChain} from 'viem';
import { AnonAadhaarProvider } from "@anon-aadhaar/react";

type Page = 'home' | 'send' | 'transactions' | 'profile';

const horizonTestnet = defineChain({
  id: 845320009, // Replace this with your chain's ID
  name: 'horizonTestnet',
  network: 'horizonTestnet',
  nativeCurrency: {
    decimals: 18, // Replace this with the number of decimals for your chain's native token
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
});

function App() {
  const [currentPage, setCurrentPage] = useState<Page>('home');
  const [useTestAadhaar, setUseTestAadhaar] = useState<boolean>(false);
  const [ready, setReady] = useState<boolean>(false);
  const handleNavigate = (page: Page) => {
    setCurrentPage(page);
  };

  useEffect(() => {
    setReady(true);
  }, []);

  return (
    <>
    {ready ? (
        <AnonAadhaarProvider
          _useTestAadhaar={useTestAadhaar}
          _appName="Anon Aadhaar"
        >
    <PrivyProvider
      appId="cm6qt4wko001l64rpni0xtoo6" // Replace with your actual Privy app ID
      config={{
        appearance: {
          theme: 'dark',
          accentColor: '#dc2626',
        },
        embeddedWallets: {
          createOnLogin: 'users-without-wallets',
        },
        supportedChains: [horizonTestnet],
      }}
    >
      <div className="min-h-screen bg-black flex flex-col">
        <Header currentPage={currentPage} onNavigate={handleNavigate} />
        
        {currentPage === 'home' && (
          <HomePage onNavigate={handleNavigate} />
        )}
        
        {currentPage === 'send' && (
          <SendMoneyPage />
        )}
        
        {currentPage === 'transactions' && (
          <TransactionsPage />
        )}
        
        {currentPage === 'profile' && (
          <ProfilePage 
            setUseTestAadhaar={setUseTestAadhaar}
            useTestAadhaar={useTestAadhaar}
          />
        )}
        
        <Footer />
      </div>
    </PrivyProvider>
    </AnonAadhaarProvider>
      ) : null}
    </>
  );
}

export default App;