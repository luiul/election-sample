pragma solidity ^0.5.10;

contract Election {
  // store candidate
  // read candidate
  string public candidate;

  // constructor for contract object
  constructor() public {
    candidate = 'Cadidate 1';
  }
}