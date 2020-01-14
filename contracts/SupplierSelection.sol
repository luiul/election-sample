pragma solidity ^0.5.10;

contract SupplierSelection {

  // structure of the supplier object
  struct Supplier {
    uint id;
    string name;
    uint voteCount;
  }

  // store the number of suppliers, because (a) in Solidity there is no way to get the size of a hash-table or (b) to be able to iterate over the elements of the hash-table
  uint public supplierCount;

  // store the different suppliers in hash-table
  mapping(uint => Supplier) public suppliers;

  // store addresses that have voted
  mapping(address => bool) public voters;

  // vote event
  event VoteCast(uint _supplierId);

  // we declare and define the suppliers at the creation of the contract. Afterwards, suppliers cannot be added, deleted or modified. Add to number of suppliers, instantiate a supplier object, and add it to the hash-table

  constructor() public {
    addSupplier('Supplier A');
    addSupplier('Supplier B');
    addSupplier('Supplier C');
  }

  function addSupplier(string memory _name) private {
    supplierCount ++;
    suppliers[supplierCount] = Supplier(supplierCount, _name, 0);
  }

  function vote(uint _supplierId) public {
    // require that voter address hasn't voted before
    require(!voters[msg.sender], 'Your address already casted a vote in this selection process');

    // require a valid supplier id as an argument
    require(_supplierId > 0 && _supplierId <= supplierCount, 'Choose a valid supplier');

    // record that address has voted
    voters[msg.sender] = true;

    // update supplier vote count
    suppliers[_supplierId].voteCount ++;

    //trigger vote event
    emit VoteCast(_supplierId);
  }
}