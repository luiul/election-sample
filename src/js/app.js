App = {
  web3Provider: null,
  contracts: {},
  account: '0x0',
  hasVoted: false,

  init: function() {
    return App.initWeb3();
  },

  initWeb3: function() {
    // TODO: refactor conditional
    if (typeof web3 !== 'undefined') {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider('http://localhost:7545');
      web3 = new Web3(App.web3Provider);
    }
    return App.initContract();
  },

  initContract: function() {
    $.getJSON("SupplierSelection.json", function(selection) {
      // Instantiate a new truffle contract from the artifact
      App.contracts.SupplierSelection = TruffleContract(selection);
      // Connect provider to interact with contract
      App.contracts.SupplierSelection.setProvider(App.web3Provider);

      App.listenForEvents();

      return App.render();
    });
  },

  // Listen for events emitted from the contract
  listenForEvents: function() {
    App.contracts.SupplierSelection.deployed().then(function(instance) {
      // Restart Chrome if you are unable to receive this event
      // This is a known issue with Metamask
      // https://github.com/MetaMask/metamask-extension/issues/2393
      instance.VoteCast({}, {
        fromBlock: 0,
        toBlock: 'latest'
      }).watch(function(error, event) {
        console.log("event triggered", event)
        // Reload when a new vote is recorded
        App.render();
      });
    });
  },

  render: function() {
    var selectionInstance;
    var loader = $("#loader");
    var content = $("#content");

    loader.show();
    content.hide();

    // Load account data
    web3.eth.getCoinbase(function(err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("Your Account: " + account);
      }
    });

    // Load contract data
    App.contracts.SupplierSelection.deployed().then(function(instance) {
      selectionInstance = instance;
      return selectionInstance.supplierCount();
    }).then(function(supplierCount) {
      var supplierResult = $("#supplierResult");
      supplierResult.empty();

      var supplierSelect = $('#supplierSelect');
      supplierSelect.empty();

      for (var i = 1; i <= supplierCount; i++) {
        selectionInstance.suppliers(i).then(function(supplier) {
          var id = supplier[0];
          var name = supplier[1];
          var voteCount = supplier[2];

          // Render supplier Result
          var supplierTemplate = "<tr><th>" + id + "</th><td>" + name + "</td><td>" + voteCount + "</td></tr>"
          supplierResult.append(supplierTemplate);

          // Render supplier ballot option
          var supplierOption = "<option value='" + id + "' >" + name + "</ option>"
          supplierSelect.append(supplierOption);
        });
      }
      return selectionInstance.voters(App.account);
    }).then(function(hasVoted) {
      // Do not allow a user to vote
      if(hasVoted) {
        $('form').hide();
      }
      loader.hide();
      content.show();
    }).catch(function(error) {
      console.warn(error);
    });
  },

  castVote: function() {
    var supplierId = $('#supplierSelect').val();
    App.contracts.SupplierSelection.deployed().then(function(instance) {
      return instance.vote(supplierId, { from: App.account });
    }).then(function(result) {
      // Wait for votes to update
      $("#content").hide();
      $("#loader").show();
    }).catch(function(err) {
      console.error(err);
    });
  }
};

$(function() {
  $(window).load(function() {
    App.init();
  });
});
