import React from 'react';
import { Send, Shield, Eye, Users, ArrowRight, Zap, Star, Award, Lock, CheckCircle } from 'lucide-react';

interface HomePageProps {
  onNavigate: (page: 'home' | 'send' | 'transactions' | 'profile') => void;
}

export const HomePage: React.FC<HomePageProps> = ({ onNavigate }) => {
  return (
    <div className="min-h-screen bg-black">
      {/* Hero Section */}
      <div className="relative overflow-hidden">
        <div className="absolute inset-0 bg-gradient-to-br from-red-900/20 via-transparent to-orange-900/10"></div>
        <div className="absolute top-1/4 left-1/4 w-96 h-96 bg-red-500/5 rounded-full blur-3xl"></div>
        <div className="absolute bottom-1/4 right-1/4 w-96 h-96 bg-orange-500/5 rounded-full blur-3xl"></div>
        
        <div className="relative max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 pt-20 pb-16">
          <div className="text-center space-y-8 animate-slide-up">
            <div className="max-w-4xl mx-auto space-y-6">
              <h1 className="text-5xl md:text-6xl text-sharp text-white leading-tight">
                Privacy-Preserving
                <span className="block text-transparent bg-gradient-to-r from-red-400 to-orange-400 bg-clip-text">
                  Money Transfers
                </span>
              </h1>
              <p className="text-xl text-neutral-300 max-w-2xl mx-auto leading-relaxed font-medium">
                Breakthrough blockchain-based money transfer system that enables 
                privacy-preserving, regulatory-compliant transactions in India using Anon Aadhaar.
              </p>
            </div>

            <div className="flex flex-wrap items-center justify-center gap-3 max-w-3xl mx-auto">
              {[
                { icon: Shield, text: 'Zero-Knowledge Proofs', color: 'from-blue-500/20 to-indigo-500/20 border-blue-500/30' },
                { icon: Eye, text: 'Anon Aadhaar Integration', color: 'from-green-500/20 to-emerald-500/20 border-green-500/30' },
                { icon: Lock, text: 'Regulatory Compliant', color: 'from-red-500/20 to-pink-500/20 border-red-500/30' },
                { icon: Zap, text: 'Instant Settlement', color: 'from-yellow-500/20 to-orange-500/20 border-yellow-500/30' }
              ].map((feature, index) => (
                <div
                  key={feature.text}
                  className={`flex items-center space-x-2 px-4 py-2 bg-gradient-to-r ${feature.color} rounded-full border backdrop-blur-sm animate-scale-in`}
                  style={{ animationDelay: `${index * 100}ms` }}
                >
                  <feature.icon className="w-4 h-4 text-white" />
                  <span className="text-white font-semibold text-sm">{feature.text}</span>
                </div>
              ))}
            </div>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-4 sm:space-y-0 sm:space-x-4">
              <button
                onClick={() => onNavigate('send')}
                className="relative inline-flex items-center space-x-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold py-4 px-8 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-sharp-light tracking-wide overflow-hidden group shadow-lg hover:shadow-xl hover:shadow-red-500/20 focus:outline-none"
              >
                <div className="absolute inset-0 rounded-xl p-[2px] bg-gradient-to-r from-red-400/30 via-orange-400/30 to-red-400/30 opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="w-full h-full bg-gradient-to-r from-red-600 to-orange-600 group-hover:from-red-500 group-hover:to-orange-500 rounded-[10px] transition-all duration-300"></div>
                </div>
                
                <div className="absolute inset-0 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300">
                  <div className="absolute inset-0 rounded-xl bg-gradient-to-r from-transparent via-white/20 to-transparent transform -skew-x-12 -translate-x-full group-hover:translate-x-full transition-transform duration-1000 ease-out"></div>
                </div>
                
                <div className="absolute inset-0 bg-gradient-to-r from-red-500/5 via-orange-500/5 to-red-500/5 rounded-xl opacity-0 group-hover:opacity-100 transition-opacity duration-300"></div>
                
                <Send className="w-5 h-5 relative z-10" />
                <span className="relative z-10">SEND MONEY</span>
              </button>
              
              <button
                onClick={() => onNavigate('profile')}
                className="inline-flex items-center space-x-2 bg-neutral-900 hover:bg-neutral-800 border border-red-900/30 hover:border-red-700 text-white font-semibold py-4 px-8 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-sharp-light tracking-wide"
              >
                <Shield className="w-5 h-5" />
                <span>VERIFY IDENTITY</span>
              </button>
            </div>
          </div>
        </div>
      </div>

      {/* How It Works */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12 animate-slide-up">
          <h2 className="text-3xl text-sharp text-white mb-4">How AnonPay Works</h2>
          <p className="text-neutral-400 font-medium max-w-2xl mx-auto">
            Three simple steps to private, compliant money transfers
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-3 gap-8">
          {[
            {
              step: '01',
              icon: Shield,
              title: 'Verify Identity',
              description: 'Prove your Indian residency using Anon Aadhaar without revealing personal details.',
              color: 'from-blue-900 to-indigo-900 border-blue-800'
            },
            {
              step: '02',
              icon: Send,
              title: 'Send Privately',
              description: 'Transfer money with complete privacy using zero-knowledge proofs and encryption.',
              color: 'from-red-900 to-pink-900 border-red-800'
            },
            {
              step: '03',
              icon: CheckCircle,
              title: 'Instant Settlement',
              description: 'Automatic compliance checks ensure regulatory approval with instant settlement.',
              color: 'from-green-900 to-emerald-900 border-green-800'
            }
          ].map((step, index) => (
            <div
              key={step.step}
              className={`bg-gradient-to-br ${step.color} rounded-2xl p-8 hover:scale-[1.02] transition-all duration-300 animate-slide-up relative overflow-hidden`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="absolute top-4 right-4 text-6xl font-black text-white/10">
                {step.step}
              </div>
              
              <div className="relative z-10">
                <div className="w-12 h-12 bg-white/20 rounded-xl flex items-center justify-center mb-6">
                  <step.icon className="w-6 h-6 text-white" />
                </div>
                
                <h3 className="text-xl font-bold text-white mb-4">{step.title}</h3>
                <p className="text-white/80 leading-relaxed font-medium">
                  {step.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* Features */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-16">
        <div className="text-center mb-12 animate-slide-up">
          <h2 className="text-3xl text-sharp text-white mb-4">Privacy-First Features</h2>
          <p className="text-neutral-400 font-medium max-w-2xl mx-auto">
            Advanced cryptographic technology meets regulatory compliance
          </p>
        </div>

        <div className="grid grid-cols-1 md:grid-cols-2 lg:grid-cols-4 gap-6">
          {[
            {
              icon: Shield,
              title: 'Zero-Knowledge Proofs',
              description: 'Prove compliance without revealing sensitive data',
              color: 'from-blue-900 to-indigo-900 border-blue-800',
              iconColor: 'text-blue-300'
            },
            {
              icon: Eye,
              title: 'Anon Aadhaar',
              description: 'Verify Indian identity without data exposure',
              color: 'from-green-900 to-emerald-900 border-green-800',
              iconColor: 'text-green-300'
            },
            {
              icon: Lock,
              title: 'End-to-End Encryption',
              description: 'All transactions are fully encrypted',
              color: 'from-red-900 to-pink-900 border-red-800',
              iconColor: 'text-red-300'
            },
            {
              icon: Zap,
              title: 'Instant Settlement',
              description: 'Real-time transfers with privacy guarantees',
              color: 'from-yellow-900 to-orange-900 border-yellow-800',
              iconColor: 'text-yellow-300'
            }
          ].map((feature, index) => (
            <div
              key={feature.title}
              className={`bg-gradient-to-br ${feature.color} rounded-2xl p-6 hover:scale-[1.02] transition-all duration-300 animate-slide-up`}
              style={{ animationDelay: `${index * 100}ms` }}
            >
              <div className="flex items-center justify-between mb-4">
                <feature.icon className={`w-8 h-8 ${feature.iconColor}`} />
              </div>
              <div>
                <h3 className="text-white font-bold text-lg mb-2">{feature.title}</h3>
                <p className={`${feature.iconColor} text-sm font-medium opacity-80`}>
                  {feature.description}
                </p>
              </div>
            </div>
          ))}
        </div>
      </div>

      {/* CTA Section */}
      <div className="max-w-6xl mx-auto px-4 sm:px-6 lg:px-8 py-12">
        <div className="bg-gradient-to-r from-neutral-950 to-neutral-900 border border-red-900/30 rounded-2xl p-8 text-center animate-slide-up">
          <div className="max-w-2xl mx-auto space-y-6">
            <div className="flex items-center justify-center space-x-4 mb-6">
              <div className="p-4 bg-gradient-to-br from-red-600 to-orange-600 rounded-2xl">
                <Shield className="w-8 h-8 text-white" />
              </div>
              <h2 className="text-3xl text-sharp text-white">Start Private Payments</h2>
            </div>
            
            <p className="text-xl text-neutral-300 leading-relaxed font-medium">
              Experience the future of private, compliant money transfers. 
              Connect your wallet and verify your identity to get started.
            </p>

            <div className="flex flex-col sm:flex-row items-center justify-center space-y-3 sm:space-y-0 sm:space-x-3">
              <button
                onClick={() => onNavigate('send')}
                className="relative inline-flex items-center space-x-2 bg-gradient-to-r from-red-600 to-orange-600 hover:from-red-500 hover:to-orange-500 text-white font-bold py-3 px-6 rounded-xl transition-all duration-300 hover:scale-[1.02] active:scale-[0.98] text-sharp-light tracking-wide overflow-hidden group shadow-lg hover:shadow-xl hover:shadow-red-500/20 focus:outline-none"
              >
                <Send className="w-4 h-4 relative z-10" />
                <span className="relative z-10">SEND MONEY</span>
              </button>
              
              <button
                onClick={() => onNavigate('profile')}
                className="inline-flex items-center space-x-2 bg-neutral-900 hover:bg-neutral-800 border border-red-900/30 hover:border-red-700 text-white font-semibold py-3 px-6 rounded-xl transition-all duration-200 hover:scale-[1.02] active:scale-[0.98] text-sharp-light tracking-wide"
              >
                <Shield className="w-4 h-4" />
                <span>VERIFY IDENTITY</span>
              </button>
            </div>

            <div className="flex items-center justify-center space-x-4 text-xs text-neutral-500">
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-red-400 rounded-full"></div>
                <span className="font-semibold tracking-wide">PRIVACY-PRESERVING</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-green-400 rounded-full"></div>
                <span className="font-semibold tracking-wide">REGULATORY COMPLIANT</span>
              </div>
              <div className="flex items-center space-x-2">
                <div className="w-1.5 h-1.5 bg-blue-400 rounded-full"></div>
                <span className="font-semibold tracking-wide">ZERO-KNOWLEDGE</span>
              </div>
            </div>
          </div>
        </div>
      </div>
    </div>
  );
};