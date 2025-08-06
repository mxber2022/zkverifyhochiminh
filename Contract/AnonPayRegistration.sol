// SPDX-License-Identifier: Apache-2.0

pragma solidity 0.8.20;

interface IVerifyProofAggregation {
    function verifyProofAggregation(
        uint256 _domainId,
        uint256 _aggregationId,
        bytes32 _leaf,
        bytes32[] calldata _merklePath,
        uint256 _leafCount,
        uint256 _index
    ) external view returns (bool);
}

contract AnonPayRegistration {

    address public zkVerify; // zkVerify contract
    bytes32 public vkey; // vkey for our circuit

    bytes32 public constant PROVING_SYSTEM_ID = keccak256(abi.encodePacked("groth16"));
    bytes32 public constant VERSION_HASH = sha256(abi.encodePacked(""));

    mapping(address => bool) public registeredUsers;

    constructor(address _zkVerify, bytes32 _vkey) {
        zkVerify = _zkVerify;
        vkey = _vkey;
    }

    function _changeEndianess(uint256 input) internal pure returns (uint256 v) {
        v = input;
        // swap bytes
        v =
            ((v &
                0xFF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00) >>
                8) |
            ((v &
                0x00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF00FF) <<
                8);
        // swap 2-byte long pairs
        v =
            ((v &
                0xFFFF0000FFFF0000FFFF0000FFFF0000FFFF0000FFFF0000FFFF0000FFFF0000) >>
                16) |
            ((v &
                0x0000FFFF0000FFFF0000FFFF0000FFFF0000FFFF0000FFFF0000FFFF0000FFFF) <<
                16);
        // swap 4-byte long pairs
        v =
            ((v &
                0xFFFFFFFF00000000FFFFFFFF00000000FFFFFFFF00000000FFFFFFFF00000000) >>
                32) |
            ((v &
                0x00000000FFFFFFFF00000000FFFFFFFF00000000FFFFFFFF00000000FFFFFFFF) <<
                32);
        // swap 8-byte long pairs
        v =
            ((v &
                0xFFFFFFFFFFFFFFFF0000000000000000FFFFFFFFFFFFFFFF0000000000000000) >>
                64) |
            ((v &
                0x0000000000000000FFFFFFFFFFFFFFFF0000000000000000FFFFFFFFFFFFFFFF) <<
                64);
        // swap 16-byte long pairs
        v = (v >> 128) | (v << 128);
    }

    function checkHash(uint256[]  memory inputs, uint256 _aggregationId, uint256 _domainId, bytes32[] calldata _merklePath, uint256 _leafCount, uint256 _index) public {

        bytes32 inputs_hash = keccak256(abi.encodePacked(_changeEndianess(inputs[0]),_changeEndianess(inputs[1]),_changeEndianess(inputs[2]),_changeEndianess(inputs[3]),_changeEndianess(inputs[4]),_changeEndianess(inputs[5]),_changeEndianess(inputs[6]),_changeEndianess(inputs[7]),_changeEndianess(inputs[8])));

        bytes32 leaf = keccak256(abi.encodePacked(PROVING_SYSTEM_ID, vkey, VERSION_HASH, inputs_hash));

        require(IVerifyProofAggregation(zkVerify).verifyProofAggregation(_domainId, _aggregationId, leaf, _merklePath, _leafCount, _index ), "Invalid proof");

        // Register the user's wallet address upon valid proof
        registeredUsers[msg.sender] = true;
    }

    // Function to check if a user is registered
    function isUserRegistered(address user) public view returns (bool) {
        return registeredUsers[user];
    }
}
