import expectEvent from '../helpers/expectEvent';

const BigNumber = web3.BigNumber;

require('chai')
  .use(require('chai-bignumber')(BigNumber))
  .should();

export default function ([payer1, payer2, payee1, payee2]) {
  const amount = web3.toWei(42.0, 'ether');

  describe('as an escrow', function () {
    it('can accept a single deposit', async function () {
      await this.escrow.deposit(payee1, { from: payer1, value: amount });

      const balance = await web3.eth.getBalance(this.escrow.address);
      const deposit = await this.escrow.depositsOf(payee1);

      balance.should.be.bignumber.equal(amount);
      deposit.should.be.bignumber.equal(amount);
    });

    it('can accept an empty deposit', async function () {
      await this.escrow.deposit(payee1, { from: payer1, value: 0 });
    });

    it('emits a deposited event', async function () {
      const receipt = await this.escrow.deposit(payee1, { from: payer1, value: amount });

      const event = await expectEvent.inLogs(receipt.logs, 'Deposited', { payee: payee1 });
      event.args.weiAmount.should.be.bignumber.equal(amount);
    });

    it('can add multiple deposits on a single account', async function () {
      await this.escrow.deposit(payee1, { from: payer1, value: amount });
      await this.escrow.deposit(payee1, { from: payer2, value: amount * 2 });

      const balance = await web3.eth.getBalance(this.escrow.address);
      const deposit = await this.escrow.depositsOf(payee1);

      balance.should.be.bignumber.equal(amount * 3);
      deposit.should.be.bignumber.equal(amount * 3);
    });

    it('can track deposits to multiple accounts', async function () {
      await this.escrow.deposit(payee1, { from: payer1, value: amount });
      await this.escrow.deposit(payee2, { from: payer1, value: amount * 2 });

      const balance = await web3.eth.getBalance(this.escrow.address);
      const depositPayee1 = await this.escrow.depositsOf(payee1);
      const depositPayee2 = await this.escrow.depositsOf(payee2);

      balance.should.be.bignumber.equal(amount * 3);
      depositPayee1.should.be.bignumber.equal(amount);
      depositPayee2.should.be.bignumber.equal(amount * 2);
    });

    it('can withdraw payments from any account', async function () {
      const payeeInitialBalance = await web3.eth.getBalance(payee1);

      await this.escrow.deposit(payee1, { from: payer1, value: amount });
      await this.escrow.withdraw(payee1, { from: payer2 });

      const escrowBalance = await web3.eth.getBalance(this.escrow.address);
      const finalDeposit = await this.escrow.depositsOf(payee1);
      const payeeFinalBalance = await web3.eth.getBalance(payee1);

      escrowBalance.should.be.bignumber.equal(0);
      finalDeposit.should.be.bignumber.equal(0);
      payeeFinalBalance.sub(payeeInitialBalance).should.be.bignumber.equal(amount);
    });

    it('can do an empty withdrawal', async function () {
      await this.escrow.withdraw(payee1, { from: payer1 });
    });

    it('emits a withdrawn event', async function () {
      await this.escrow.deposit(payee1, { from: payer1, value: amount });
      const receipt = await this.escrow.withdraw(payee1, { from: payer2 });

      const event = await expectEvent.inLogs(receipt.logs, 'Withdrawn', { payee: payee1 });
      event.args.weiAmount.should.be.bignumber.equal(amount);
    });
  });
};
