
pragma solidity ^0.5.10;

contract Election {

  // model for candidate
  struct Candidate {
    uint id;
    string name;
    uint voteCount;
  }

  // store in hash-table and get candidates by declaring it a public variable (automatic in Solidity)
  mapping(uint => Candidate) public candidates;

  // count of the store candidates, because (1) in Solidity there is no way to get the size of a mapping or (2) iterate over it with a loop
  // any key we haven't set a value for returns the default value (in this case an empty candidate)
  uint public candidatesCount;

  // constructor for contract object
  constructor() public {
    addCandidate('Andy');
    addCandidate('Brenda');
    addCandidate('Charlie');
    addCandidate('Dylan');
    addCandidate('Elon');
  }

  // add one candidate to the count and add it to the hash table with the key given by the count and the value of an internal id, name and zero votes
  function addCandidate (string memory _name) private {
    candidatesCount ++;
    candidates[candidatesCount] = Candidate(candidatesCount, _name, 0);
  }
}