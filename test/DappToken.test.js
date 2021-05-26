const {
  // BN,
  // constants,
  // expectEvent,
  expectRevert,
} = require("@openzeppelin/test-helpers");
const { assert } = require("chai");

const DappToken = artifacts.require("DappToken");

contract("DappToken", function (accounts) {
  beforeEach(async function () {
    token = await DappToken.deployed();
  });
  it("initializes the contract with the correct data", async function () {
    expect(await token.name()).equal("DApp Token");
    expect(await token.symbol()).equal("DAPP");
    expect(await token.standard()).equal("DApp Token v1.0");
  });
  it("sets the total supply upon deployement", async function () {
    assert.equal(
      (await token.totalSupply()).toNumber(),
      1000000,
      "sets the total supply"
    );
    assert.equal(
      (await token.balanceOf(accounts[0])).toNumber(),
      1000000,
      "it allocates the initial supply to the admin"
    );
  });
  it("transfers token ownership", async function () {
    await expectRevert(
      token.transfer.call(accounts[1], 1351631636363),
      "revert"
    );
  });
  it("transfer returns a boolean", async function () {
    let success = await token.transfer.call(accounts[1], 250000, {
      from: accounts[0],
    });
    assert.equal(success, true, "it returns true");
  });
  it("transfers values", async function () {
    let receipt = await token.transfer(accounts[1], 250000, {
      from: accounts[0],
    });
    assert.equal(
      (await token.balanceOf(accounts[1])).toNumber(),
      250000,
      "adds the amount"
    );
    assert.equal(
      (await token.balanceOf(accounts[0])).toNumber(),
      750000,
      "deducts the amount from the sender account"
    );
    assert.equal(await receipt.logs.length, 1, "triggers one event");
    assert.equal(
      receipt.logs[0].event,
      "Transfer",
      "should be a transfer event"
    );
    assert.equal(
      receipt.logs[0].args._from,
      accounts[0],
      "logs the accounts the tokens are transferred from"
    );
    assert.equal(
      receipt.logs[0].args._to,
      accounts[1],
      "logs the account the tokens are transferred to"
    );
    assert.equal(
      receipt.logs[0].args._value,
      250000,
      "logs the transfer amount"
    );
  });
  it("approves token for delegated transfer", async function () {
    // let success = await token.approve.call(accounts[1], 100);
    assert.equal(
      await token.approve.call(accounts[1], 100),
      true,
      "it returns true"
    );
    let receipt = await token.approve(accounts[1], 100, { from: accounts[0] });
    assert.equal(await receipt.logs.length, 1, "triggers one event");
    assert.equal(
      receipt.logs[0].event,
      "Approval",
      "should be an approval event"
    );
    assert.equal(
      receipt.logs[0].args._owner,
      accounts[0],
      "logs the accounts the tokens are authorized by"
    );
    assert.equal(
      receipt.logs[0].args._spender,
      accounts[1],
      "logs the account the tokens are authorized to"
    );
    assert.equal(receipt.logs[0].args._value, 100, "logs the approved amount");
    assert.equal(
      await token.allowance(accounts[0], accounts[1]),
      100,
      "store the allowance"
    );
  });
  it("handles the delegate transfer", async function () {
    fromAccount = accounts[2];
    toAccount = accounts[3];
    spendingAccount = accounts[4];
    await token.transfer(fromAccount, 100, { from: accounts[0] });
    // approve spendingAccount to spend 10 tokens from fromAccount
    await token.approve(spendingAccount, 10, { from: fromAccount });
    //try transferring a larger amount than the sender's balance
    await expectRevert(
      token.transferFrom(fromAccount, toAccount, 9999, {
        from: spendingAccount,
      }),
      "revert"
    );
    // try trasnferring something larger than approved amount
    await expectRevert(
      token.transferFrom(fromAccount, toAccount, 20, {
        from: spendingAccount,
      }),
      "revert"
    );
    assert.equal(
      await token.transferFrom.call(fromAccount, toAccount, 10, {
        from: spendingAccount,
      }),
      true
    );
    let receipt = await token.transferFrom(fromAccount, toAccount, 10, {
      from: spendingAccount,
    });
    assert.equal(receipt.logs.length, 1, "triggers one event");
    assert.equal(receipt.logs[0].event, "Transfer", "should be Transfer event");
    assert.equal(
      receipt.logs[0].args._from,
      fromAccount,
      "logs the form account"
    );
    assert.equal(
      receipt.logs[0].args._to,
      toAccount,
      "logs the account the tokens are transferred to"
    );
    assert.equal(receipt.logs[0].args._value, 10, "logs the transfer amount");
    assert.equal(
      (await token.balanceOf(fromAccount)).toNumber(),
      90,
      "deducts the amount from the sending account"
    );
    assert.equal(
      (await token.balanceOf(toAccount)).toNumber(),
      10,
      "adds the amount to the receiving account"
    );
    assert.equal(
      (await token.allowance(fromAccount, spendingAccount)).toNumber(),
      0,
      "deducts the amount from the allowance"
    );
  });
});
