import axios from 'axios';

const API_URL = 'https://relayer-api.horizenlabs.io/api/v1';

export const verifyProofWithRelayer = async (latestProof: any): Promise<string> => {
  console.log([
    latestProof?.proof.pubkeyHash, 
    latestProof?.proof.nullifier, 
    latestProof?.proof.timestamp, 
    latestProof?.proof.ageAbove18, 
    latestProof?.proof.gender, 
    latestProof?.proof.pincode, 
    latestProof?.proof.state, 
    latestProof?.proof.nullifierSeed, 
    latestProof?.proof.signalHash
  ]);

  const params = {
    "proofType": "groth16",
    "vkRegistered": true,
    "chainId": 845320009,
    "proofOptions": {
      "library": "snarkjs",
      "curve": "bn128"
    },
    "proofData": {
      "proof": latestProof?.proof.groth16Proof,
      "publicSignals": [
        latestProof?.proof.pubkeyHash, 
        latestProof?.proof.nullifier, 
        latestProof?.proof.timestamp, 
        latestProof?.proof.ageAbove18, 
        latestProof?.proof.gender, 
        latestProof?.proof.pincode, 
        latestProof?.proof.state, 
        latestProof?.proof.nullifierSeed, 
        latestProof?.proof.signalHash
      ],
      "vk": "0x0b692be7b498a34664f07464866c2948b3ba925657185e5f2323be452bfd6722"
    }
  };

  const requestResponse = await axios.post(
    `${API_URL}/submit-proof/${import.meta.env.VITE_API_KEY}`, 
    params
  );

  while (true) {
    const jobStatusResponse = await axios.get(
      `${API_URL}/job-status/${import.meta.env.VITE_API_KEY}/${requestResponse.data.jobId}`
    );
    
    if (jobStatusResponse.data.status === "Aggregated") {
      console.log("Job finalized successfully");
      console.log(jobStatusResponse.data);
      const txHash = `https://zkverify-testnet.subscan.io/extrinsic/${jobStatusResponse.data.txHash}`;
      return txHash;
    } else {
      console.log("Job status: ", jobStatusResponse.data.status);
      console.log("Waiting for job to finalize...");
      await new Promise(resolve => setTimeout(resolve, 5000)); // Wait for 5 seconds before checking again
    }
  }
}; 