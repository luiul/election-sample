
pragma solidity ^0.5.10;

contract Election {

  // model for candidate
  struct Candidate {
    uint id;
    string name;
    uint voteCount;
  }

  // count of the store candidates, because (1) in Solidity there is no way to get the size of a mapping or (2) iterate over it with a loop
  // any key we haven't set a value for returns the default value (in this case an empty candidate)
  uint public candidatesCount;

  // store in hash-table and get candidates by declaring it a public variable (automatic in Solidity)
  mapping(uint => Candidate) public candidates;

  // store addresses that have voted
  mapping(address => bool) public voters;

  // vote event
  event votedEvent (uint _candidateId);

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

  function vote (uint _candidateId) public {
    // require that voter address hasn't voted before
    require(!voters[msg.sender], 'You already casted a vote for this election');

    // require a valid candidate
    require(_candidateId > 0 && _candidateId <= candidatesCount, 'Choose a valid candidate');

    // record that voter has voted
    voters[msg.sender] = true;

    // require a valid candidate id
    // update candidate vote count
    candidates[_candidateId].voteCount ++;

    //trigger vote event
    emit votedEvent(_candidateId);
  }
}