const shouldFail = require('../shouldFail');

const BigNumber = web3.BigNumber;
const should = require('chai')
  .use(require('chai-bignumber')(BigNumber))
  .should();

const Failer = artifacts.require('Failer');

async function assertFailure (promise) {
  try {
    await promise;
  } catch (error) {
    return;
  }
  should.fail();
}

describe('shouldFail', function () {
  beforeEach(async function () {
    this.failer = await Failer.new();
  });

  describe('shouldFail', function () {
    it('throws if no failure occurs', async function () {
      await assertFailure(shouldFail(this.failer.dontFail()));
    });

    it('accepts a revert', async function () {
      await shouldFail(this.failer.failWithRevert());
    });

    it('accepts a throw', async function () {
      await shouldFail(this.failer.failWithThrow());
    });

    it('accepts an out of gas', async function () {
      await shouldFail(this.failer.failWithOutOfGas());
    });
  });

  describe('reverting', function () {
    it('throws if no failure occurs', async function () {
      await assertFailure(shouldFail.reverting(this.failer.dontFail()));
    });

    it('accepts a revert', async function () {
      await shouldFail.reverting(this.failer.failWithRevert());
    });

    it('throws with a throw', async function () {
      await assertFailure(shouldFail.reverting(this.failer.failWithThrow()));
    });

    it('throws with an outOfGas', async function () {
      await assertFailure(shouldFail.reverting(this.failer.failWithOutOfGas()));
    });
  });

  describe('throwing', function () {
    it('throws if no failure occurs', async function () {
      await assertFailure(shouldFail.throwing(this.failer.dontFail()));
    });

    it('accepts a throw', async function () {
      await shouldFail.throwing(this.failer.failWithThrow());
    });

    it('throws with a throw', async function () {
      await assertFailure(shouldFail.throwing(this.failer.failWithRevert()));
    });

    it('throws with an outOfGas', async function () {
      await assertFailure(shouldFail.throwing(this.failer.failWithOutOfGas()));
    });
  });

  describe('outOfGas', function () {
    it('throws if no failure occurs', async function () {
      await assertFailure(shouldFail.outOfGas(this.failer.dontFail()));
    });

    it('accepts an out of gas', async function () {
      await shouldFail.outOfGas(this.failer.failWithOutOfGas());
    });

    it('throws with a revert', async function () {
      await assertFailure(shouldFail.outOfGas(this.failer.failWithRevert()));
    });

    it('throws with a throw', async function () {
      await assertFailure(shouldFail.outOfGas(this.failer.failWithThrow()));
    });
  });
});
