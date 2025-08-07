contract AnonPayRegistration {
    // Mapping to track used proofs
    mapping(bytes32 => bool) public usedProofs;

    // ... rest of your contract code ...

    function checkHash(uint256[] memory inputs, uint256 _aggregationId, uint256 _domainId, bytes32[] calldata _merklePath, uint256 _leafCount, uint256 _index) public {
        // Calculate inputs hash
        bytes32 inputsHash = keccak256(abi.encodePacked(
            _changeEndianess(inputs[0]), _changeEndianess(inputs[1]),
            _changeEndianess(inputs[2]), _changeEndianess(inputs[3]),
            _changeEndianess(inputs[4]), _changeEndianess(inputs[5]),
            _changeEndianess(inputs[6]), _changeEndianess(inputs[7]),
            _changeEndianess(inputs[8])
        ));

        // Calculate proof leaf
        bytes32 leaf = keccak256(abi.encodePacked(
            PROVING_SYSTEM_ID, vkey, VERSION_HASH, inputsHash
        ));

        // Check if proof has already been used
        bytes32 proofId = keccak256(abi.encodePacked(leaf, _aggregationId, _domainId));
        require(!usedProofs[proofId], "Proof already used");

        // Verify proof with external contract
        require(IVerifyProofAggregation(zkVerify).verifyProofAggregation(_domainId, _aggregationId, leaf, _merklePath, _leafCount, _index), "Invalid proof");

        // Mark proof as used
        usedProofs[proofId] = true;

        // Register the user's wallet address upon valid proof
        registeredUsers[msg.sender] = true;
    }

    // Function to check if a proof has been used
    function isProofUsed(bytes32 proofId) public view returns (bool) {
        return usedProofs[proofId];
    }
}
