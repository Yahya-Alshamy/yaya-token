const expectRevert = require("@openzeppelin/test-helpers/src/expectRevert");
const { assert } = require("chai");

const DappTokenSale = artifacts.require("DappTokenSale");
const DappToken = artifacts.require("DappToken");

contract("DappTokenSale", function (accounts) {
  let tokenPrice = 1000000000000000;
  let admin = accounts[0];
  let buyer = accounts[1];
  let tokensAvailable = 750000;
  beforeEach(async function () {
    tokenSale = await DappTokenSale.deployed();
    token = await DappToken.deployed();
  });

  it("initializes the contract with the correct values", async function () {
    address = await tokenSale.address;
    assert.notEqual(address, 0x0, "has contract address");
    assert.notEqual(
      await tokenSale.tokenContract(),
      0x0,
      "has a token contract address"
    );
    assert.equal(await tokenSale.tokenPrice(), tokenPrice);
  });
  it("facilitates token buying", async function () {
    numberOfTokens = 10;
    value = numberOfTokens * tokenPrice;
    await token.transfer(tokenSale.address, tokensAvailable, {
      from: admin,
    });
    receipt = await tokenSale.buyTokens(numberOfTokens, {
      from: buyer,
      value: value,
    });
    assert.equal((await tokenSale.tokensSold()).toNumber(), numberOfTokens);
    assert.equal(receipt.logs.length, 1, "triggers one event");
    assert.equal(receipt.logs[0].event, "Sell", "should be the sell event");
    assert.equal(receipt.logs[0].args._buyer, buyer, "logs the buyer account");
    assert.equal(
      receipt.logs[0].args._amount,
      numberOfTokens,
      "logs the number of tokens purchased"
    );
    assert.equal(
      (await tokenSale.tokensSold()).toNumber(),
      numberOfTokens,
      "increments the number of tokens sold"
    );
    assert.equal((await token.balanceOf(buyer)).toNumber(), numberOfTokens);
    assert.equal(
      (await token.balanceOf(tokenSale.address)).toNumber(),
      tokensAvailable - numberOfTokens
    );
    await expectRevert(
      tokenSale.buyTokens(numberOfTokens, { from: buyer, value: 1 }),
      "revert"
    );
    await expectRevert(
      tokenSale.buyTokens(800000, { from: buyer, value: value }),
      "revert"
    );
  });
  it("ends token sale", async function () {
    // try to end sale from account other than the admin
    await expectRevert(tokenSale.endSale({ from: buyer }), "revert");
    // end sale as admin
    receipt = await tokenSale.endSale({ from: admin });
    assert.equal(
      (await token.balanceOf(admin)).toNumber(),
      999990,
      "returns all unsold tokens to the admin"
    );

    balance = await token.balanceOf(tokenSale.address);
    assert.equal(balance.toNumber(), 0);
    // //check that token price is reset and self destruced was called

    // assert.equal(
    //   (await tokenSale.tokenPrice).toNumber(),
    //   0,
    //   "token price was reset"
    // );
  });
});
