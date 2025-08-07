# AnonPay: KYC-Compliant Contract System with Anon Aadhaar & zkVerify

> **A blockchain-based system using Anon Aadhaar and zkVerify to ensure only verified users can transfer certified tokens and NFTs**

[![License: MIT](https://img.shields.io/badge/License-MIT-yellow.svg)](https://opensource.org/licenses/MIT)
[![Solidity](https://img.shields.io/badge/Solidity-0.8.0+-blue.svg)](https://soliditylang.org/)
[![Circom](https://img.shields.io/badge/Circom-2.1.4+-green.svg)](https://docs.circom.io/)

## Executive Summary

AnonPay is a **KYC-compliant contract system** that uses **Anon Aadhaar** and **zkVerify** to ensure only verified users can receive or transfer certified tokens and NFTs. The system leverages zero-knowledge proofs to verify Indian Aadhaar identity without revealing personal data, preventing unauthorized accounts from interacting with compliant assets.

### The Problem We Solve

**Current State**: Digital asset transfers lack proper KYC verification, creating:
- ❌ **Unauthorized Access**: Unverified users can interact with compliant assets
- ❌ **Compliance Gaps**: No systematic way to verify user identity for token transfers
- ❌ **Regulatory Risk**: Difficulty in meeting KYC/AML requirements for digital assets
- ❌ **Fraud Vulnerability**: No identity verification for sensitive token operations

**Our Solution**: A contract system using Anon Aadhaar and zkVerify that ensures only verified users can transfer certified tokens and NFTs while maintaining privacy.

## 🎯 Value Proposition

### For Users
- **🔐 Privacy-Preserving**: Verify Aadhaar identity without revealing personal data
- **✅ KYC Compliance**: Automatic verification through Anon Aadhaar and zkVerify
- **⚡ Instant Verification**: Real-time zero-knowledge proof verification
- **💰 Cost Effective**: Lower compliance costs for digital asset transfers

### For Businesses
- **📊 Regulatory Compliance**: Automated KYC/AML verification using Anon Aadhaar
- **🔒 Access Control**: Prevent unauthorized interactions with compliant assets
- **📈 Operational Efficiency**: Reduced compliance overhead with zkVerify
- **🌍 Privacy-First**: Zero-knowledge identity verification across platforms

### For Regulators
- **👁️ Full Oversight**: Complete audit trails with privacy-preserving verification
- **🛡️ Fraud Prevention**: Built-in Anon Aadhaar verification for sensitive operations
- **📋 Automated Reporting**: Real-time zkVerify compliance verification
- **🚀 Innovation Support**: Enables privacy-first digital asset innovation

## 🏗️ Technical Architecture

```
┌─────────────────────────────────────────────────────────────┐
│                    User Interface Layer                     │
├─────────────────────────────────────────────────────────────┤
│  React.js Frontend  │  Mobile App  │  API Gateway          │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                   Privacy Layer                            │
├─────────────────────────────────────────────────────────────┤
│  Anon Aadhaar  │  Zero-Knowledge Proofs  │  Selective Disclosure │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                  Blockchain Layer                          │
├─────────────────────────────────────────────────────────────┤
│  Smart Contracts  │  Token Transfers  │  Compliance Verification │
└─────────────────────────────────────────────────────────────┘
                                │
                                ▼
┌─────────────────────────────────────────────────────────────┐
│                  Regulatory Layer                          │
├─────────────────────────────────────────────────────────────┤
│  Audit Trails  │  Compliance Dashboard  │  Fraud Detection │
└─────────────────────────────────────────────────────────────┘
```

## 🔬 Core Technology

### Anon Aadhaar Integration
AnonPay uses **Anon Aadhaar** to verify Indian Aadhaar identity without revealing personal data. Users generate zero-knowledge proofs that prove they have a valid Aadhaar without exposing their actual Aadhaar number or personal information.

### zkVerify Integration
The system integrates with **zkVerify** for proof aggregation and verification on the blockchain. This ensures:
- **Privacy**: Personal data never leaves the user's device
- **Compliance**: Full KYC verification through zero-knowledge proofs
- **Scalability**: Efficient proof aggregation for high-volume operations

### Smart Contract System
```solidity
contract AnonPayVerification {
    mapping(address => bool) public registeredUsers;
    
    function checkHash(
        uint256[] memory inputs,
        uint256 _aggregationId,
        uint256 _domainId,
        bytes32[] calldata _merklePath,
        uint256 _leafCount,
        uint256 _index
    ) public {
        // Verify zkVerify proof aggregation
        require(IVerifyProofAggregation(zkVerify).verifyProofAggregation(
            _domainId, _aggregationId, leaf, _merklePath, _leafCount, _index
        ), "Invalid proof");
        
        // Register the user's wallet address upon valid proof
        registeredUsers[msg.sender] = true;
    }
}
```

## 🎯 Use Cases

### Token Transfers
- **Certified Tokens**: Only verified users can transfer compliant tokens
- **NFT Trading**: KYC-verified NFT marketplace operations
- **DeFi Protocols**: Access to regulated DeFi applications

### Compliance Applications
- **KYC Verification**: Privacy-preserving identity verification
- **AML Compliance**: Automated anti-money laundering checks
- **Regulatory Reporting**: Audit trails for compliance officers

## 🔐 Security & Compliance

### Privacy Features
- **Zero-Knowledge Proofs**: Personal data never revealed
- **Anon Aadhaar**: Privacy-preserving Aadhaar verification
- **zkVerify**: Secure proof aggregation and verification

### Compliance Features
- **KYC/AML**: Full compliance with Indian regulations
- **Audit Trails**: Complete verification history
- **Smart Contract**: Automated compliance enforcement

## 📈 Implementation Status

### Completed ✅
- [x] Anon Aadhaar integration
- [x] zkVerify proof aggregation
- [x] Smart contract development
- [x] Frontend interface
- [x] Wallet linking system

### In Progress 🔄
- [ ] Security audit
- [ ] Performance optimization
- [ ] Mobile application

## 🚀 Getting Started

### Prerequisites
- Node.js 18+
- npm or yarn
- MetaMask or compatible wallet
- Indian Aadhaar number (for real mode)

### Installation
```bash
# Clone the repository
git clone https://github.com/mxber2022/zkverifyhochiminh
cd zkverifyhochiminh

# Install dependencies
npm install

# Run development environment
npm run dev
```

### Usage
1. **Connect Wallet**: Connect your digital wallet
2. **Generate Proof**: Use Anon Aadhaar to generate zero-knowledge proof
3. **Verify on Blockchain**: Submit proof to zkVerify for aggregation
4. **Link Wallet**: Register your wallet address in the smart contract
5. **Transfer Tokens**: Now you can transfer certified tokens and NFTs

---

**AnonPay: KYC-Compliant Contract System with Anon Aadhaar & zkVerify**

*Built by MX - ZKVerify HoChiMinh Hackathon*

