const ethSigUtil = require('eth-sig-util');
const Wallet = require('ethereumjs-wallet').default;
const { EIP712Domain } = require('../helpers/eip712');

const { expectEvent } = require('@openzeppelin/test-helpers');
const { expect } = require('chai');

const BaseRelayRecipientMock = artifacts.require('BaseRelayRecipientMock');
const MinimalForwarder = artifacts.require('MinimalForwarder');
const ContextMockCaller = artifacts.require('ContextMockCaller');

const { shouldBehaveLikeRegularContext } = require('../GSN/Context.behavior');

const name = 'MinimalForwarder';
const version = '0.0.1';

contract('BaseRelayRecipient', function (accounts) {
  beforeEach(async function () {
    this.forwarder = await MinimalForwarder.new();
    this.recipient = await BaseRelayRecipientMock.new(this.forwarder.address);

    this.domain = {
      name,
      version,
      chainId: await web3.eth.getChainId(),
      verifyingContract: this.forwarder.address,
    };
    this.types = {
      EIP712Domain,
      ForwardRequest: [
        { name: 'from', type: 'address' },
        { name: 'to', type: 'address' },
        { name: 'value', type: 'uint256' },
        { name: 'gas', type: 'uint256' },
        { name: 'nonce', type: 'uint256' },
        { name: 'data', type: 'bytes' },
      ],
    };
  });

  it('recognize trusted forwarder', async function () {
    expect(await this.recipient.isTrustedForwarder(this.forwarder.address));
  });

  context('when called directly', function () {
    beforeEach(async function () {
      this.context = this.recipient; // The Context behavior expects the contract in this.context
      this.caller = await ContextMockCaller.new();
    });

    shouldBehaveLikeRegularContext(...accounts);
  });

  context('when receiving a relayed call', function () {
    beforeEach(async function () {
      this.wallet = Wallet.generate();
      this.sender = web3.utils.toChecksumAddress(this.wallet.getAddressString());
      this.data = {
        types: this.types,
        domain: this.domain,
        primaryType: 'ForwardRequest',
      };
    });

    describe('msgSender', function () {
      it('returns the relayed transaction original sender', async function () {
        const data = this.recipient.contract.methods.msgSender().encodeABI();

        const req = {
          from: this.sender,
          to: this.recipient.address,
          value: '0',
          gas: '100000',
          nonce: (await this.forwarder.getNonce(this.sender)).toString(),
          data,
        };

        const sign = ethSigUtil.signTypedMessage(this.wallet.getPrivateKey(), { data: { ...this.data, message: req } });

        // rejected by lint :/
        // expect(await this.forwarder.verify(req, sign)).to.be.true;

        const { tx } = await this.forwarder.execute(req, sign);
        await expectEvent.inTransaction(tx, BaseRelayRecipientMock, 'Sender', { sender: this.sender });
      });
    });

    describe('msgData', function () {
      it('returns the relayed transaction original data', async function () {
        const integerValue = '42';
        const stringValue = 'OpenZeppelin';
        const data = this.recipient.contract.methods.msgData(integerValue, stringValue).encodeABI();

        const req = {
          from: this.sender,
          to: this.recipient.address,
          value: '0',
          gas: '100000',
          nonce: (await this.forwarder.getNonce(this.sender)).toString(),
          data,
        };

        const sign = ethSigUtil.signTypedMessage(this.wallet.getPrivateKey(), { data: { ...this.data, message: req } });

        // rejected by lint :/
        // expect(await this.forwarder.verify(req, sign)).to.be.true;

        const { tx } = await this.forwarder.execute(req, sign);
        await expectEvent.inTransaction(tx, BaseRelayRecipientMock, 'Data', { data, integerValue, stringValue });
      });
    });
  });
});
