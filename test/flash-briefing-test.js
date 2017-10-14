import test from 'ava';
import { handler as Skill } from '../build/flash-briefing';
import chai from 'chai';

const expect = chai.expect;

test.cb('Request', t => {
  Skill(null, null, (error, response) => {
    expect(error).to.be.null;
    expect(response.titleText).to.contain('Heute am Himmel');
    expect(response.mainText).to.be.a('string');
    t.end();
  });
});
