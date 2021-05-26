const path = require("path");
const HDWalletProvider = require("@truffle/hdwallet-provider");
const mnemonic =
  "away original short few elbow cart expose you barely text soap direct";
module.exports = {
  // See <http://truffleframework.com/docs/advanced/configuration>
  // to customize your Truffle configuration!
  networks: {
    ropsten: {
      provider: function () {
        return new HDWalletProvider(
          mnemonic,
          "https://ropsten.infura.io/v3/0c80269dd2fc46f0a91a69cd5965d95d"
        );
      },
      network_id: "3",
    },
  },
};
