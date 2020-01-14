// define accounts before running the test!

var SupplierSelection = artifacts.require('./SupplierSelection.sol');

contract('SupplierSelection', function(accounts) {
  var contract;

  it('initializes with three suppliers', function() {
    return SupplierSelection.deployed().then(function(res) {
      return res.supplierCount();
    }).then(function(count) {
      assert.equal(count, 3);
    });
  });

  it('initializes the suppliers with expected values', function() {
    return SupplierSelection.deployed().then(function(res) {
      contract = res;
      return contract.suppliers(1);
    }).then(function(supplier) {
      assert.equal(supplier[0], 1, 'contains the correct id');
      assert.equal(supplier[1], 'Supplier A', 'contains the correct name');
      assert.equal(supplier[2], 0, 'contains the correct votes count');
      return contract.suppliers(2);
    }).then(function(supplier) {
      assert.equal(supplier[0], 2, 'contains the correct id');
      assert.equal(supplier[1], 'Supplier B', 'contains the correct name');
      assert.equal(supplier[2], 0, 'contains the correct votes count');
      return contract.suppliers(3);
    }).then(function(supplier) {
      assert.equal(supplier[0], 3, 'contains the correct id');
      assert.equal(supplier[1], 'Supplier C', 'contains the correct name');
      assert.equal(supplier[2], 0, 'contains the correct votes count');
    });
  });

  it('allows a voter to cast a vote', function() {
    return SupplierSelection.deployed().then(function(res) {
      contract = res;
      supplierId = 1;
      return contract.vote(supplierId, { from: accounts[0] });
    }).then(function(receipt) {
      assert.equal(receipt.logs.length, 1, 'an event was triggered');
      assert.equal(receipt.logs[0].event, 'VoteCast', 'the event type is correct');
      assert.equal(receipt.logs[0].args._supplierId.toNumber(), supplierId, 'the supplier id is correct');
      return contract.voters(accounts[0]);
    }).then(function(voted) {
      assert(voted, 'the voter was marked as voted');
      return contract.suppliers(supplierId);
    }).then(function(supplier) {
      var voteCount = supplier[2];
      assert.equal(voteCount, 1, 'increments the vote count');
    })
  });

  it('throws an exception for invalid candiates', function() {
    return SupplierSelection.deployed().then(function(res) {
      contract = res;
      return contract.vote(99, { from: accounts[1] })
    }).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');
      return contract.suppliers(1);
    }).then(function(supplierA) {
      var voteCount = supplierA[2];
      assert.equal(voteCount, 1, 'supplier A did not receive any votes');
      return contract.suppliers(2);
    }).then(function(supplierB) {
      var voteCount = supplierB[2];
      assert.equal(voteCount, 0, 'supplier B did not receive any votes');
    });
  });

  it('throws an exception for double voting', function() {
    return SupplierSelection.deployed().then(function(res) {
      contract = res;
      supplierId = 2;
      contract.vote(supplierId, { from: accounts[1] });
      return contract.suppliers(supplierId);
    }).then(function(supplier) {
      var voteCount = supplier[2];
      assert.equal(voteCount, 1, 'accepts first vote');
      return contract.vote(supplierId, { from: accounts[1] });
    }).then(assert.fail).catch(function(error) {
      assert(error.message.indexOf('revert') >= 0, 'error message must contain revert');
      return contract.suppliers(1);
    }).then(function(supplierA) {
      var voteCount = supplierA[2];
      assert.equal(voteCount, 1, 'supplier A did not receive any votes');
      return contract.suppliers(2);
    }).then(function(supplierB) {
      var voteCount = supplierB[2];
      assert.equal(voteCount, 1, 'supplier B did not receive any votes');
    });
  });
});