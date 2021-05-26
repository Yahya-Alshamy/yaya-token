App = {
  web3Provider: null,
  contracts: {},
  account: "0x0",
  loading: false,
  tokenPrice: 1000000000000000,
  tokensSold: 0,
  tokensAvailable: 750000,

  init: function () {
    console.log("App initialized...");
    return App.initWeb3();
  },
  initWeb3: function () {
    if (typeof web3 !== "undefined") {
      // If a web3 instance is already provided by Meta Mask.
      App.web3Provider = web3.currentProvider;
      web3 = new Web3(web3.currentProvider);
    } else {
      // Specify default instance if no web3 instance provided
      App.web3Provider = new Web3.providers.HttpProvider(
        "https://ropsten.infura.io/v3/0c80269dd2fc46f0a91a69cd5965d95d"
      );
      web3 = new Web3(App.web3Provider);
    }
    return App.initContracts();
  },
  initContracts: function () {
    $.getJSON("DappTokenSale.json", function (dappTokenSale) {
      App.contracts.DappTokenSale = TruffleContract(dappTokenSale);
      App.contracts.DappTokenSale.setProvider(App.web3Provider);
      App.contracts.DappTokenSale.deployed().then(function (dappTokenSale) {
        console.log("DAPp token Sale address", dappTokenSale.address);
      });
    }).done(function () {
      $.getJSON("DappToken.json", function (dappToken) {
        App.contracts.DappToken = TruffleContract(dappToken);
        App.contracts.DappToken.setProvider(App.web3Provider);
        App.contracts.DappToken.deployed().then(function (dappToken) {
          console.log("DAPp token address", dappToken.address);
        });
        App.listenForEvents();
        return App.render();
      });
    });
  },

  // listen for events emitted from the contract
  listenForEvents: function () {
    App.contracts.DappTokenSale.deployed().then(function (instance) {
      instance
        .Sell(
          {},
          {
            fromBlock: 0,
            toblock: "latest",
          }
        )
        .watch(function (error, event) {
          console.log("event triggered", event);
          App.render();
        });
    });
  },

  render: function () {
    if (App.loading) {
      return;
    }
    App.loading = true;

    let loader = $("#loader");
    let content = $("#content");
    loader.show();
    content.hide();
    // load account data
    web3.eth.getCoinbase(function (err, account) {
      if (err === null) {
        App.account = account;
        $("#accountAddress").html("your Account: " + account);
      }
    });
    // load the token sale contract
    App.contracts.DappTokenSale.deployed()
      .then(function (instance) {
        tokenSale = instance;
        return tokenSale.tokenPrice();
      })
      .then(function (tokenPrice) {
        App.tokenPrice = tokenPrice;
        $(".token-price").html(
          web3.fromWei(App.tokenPrice, "ether").toNumber()
        );
        return tokenSale.tokensSold();
      })
      .then(function (tokensSold) {
        App.tokensSold = tokensSold.toNumber();
        $(".tokens-sold").html(App.tokensSold);
        $(".tokens-available").html(App.tokensAvailable);

        let progressPercent =
          (Math.ceil(App.tokensSold) / App.tokensAvailable) * 100;
        $("#progress").css("width", progressPercent + "%");
        // load token contract
        App.contracts.DappToken.deployed()
          .then(function (instance) {
            token = instance;
            return token.balanceOf(App.account);
          })
          .then(function (balance) {
            $(".dapp-balance").html(balance.toNumber());

            App.loading = false;
            loader.hide();
            content.show();
          });
      });
  },
  buyTokens: function () {
    $("#loader").show();
    $("#content").hide();
    let numberOfTokens = $("#numberOfTokens").val();
    App.contracts.DappTokenSale.deployed()
      .then(function (instance) {
        return instance.buyTokens(numberOfTokens, {
          from: App.account,
          value: numberOfTokens * App.tokenPrice,
          gas: 500000,
        });
      })
      .then(function (result) {
        console.log("Tokens bought ...");
        $("form").trigger("reset"); // reset number of tokens in form
        // wait for sell event to fire
      });
  },
};

$(function () {
  $(window).load(function () {
    App.init();
  });
});
