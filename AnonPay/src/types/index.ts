// AnonPay Types
export interface User {
  id: string;
  walletAddress: string;
  isVerified: boolean;
  anonAadhaarProof?: string;
  createdAt: Date;
  lastActiveAt: Date;
}

export interface Transaction {
  id: string;
  fromAddress: string;
  toAddress: string;
  amount: string; // Encrypted amount
  currency: string;
  status: 'pending' | 'completed' | 'failed';
  zkProof: string;
  complianceCheck: boolean;
  timestamp: Date;
  gasUsed?: string;
  transactionHash?: string;
}

export interface PaymentRequest {
  recipientAddress: string;
  amount: string;
  currency: string;
  message?: string;
  isPrivate: boolean;
}

export interface ComplianceStatus {
  kycVerified: boolean;
  amlCheck: boolean;
  riskScore: number;
  lastUpdated: Date;
  regulatoryFlags: string[];
}

export interface ZKProof {
  proof: string;
  publicSignals: string[];
  verificationKey: string;
  circuit: string;
}

export interface AnonAadhaarCredential {
  nullifierSeed: string;
  nullifier: string;
  timestamp: string;
  signal: string;
  ageAbove18: boolean;
  gender: string;
  state: string;
  pincode: string;
  proof: ZKProof;
}