import {checkDeploy} from './ionic-pro-deploy.decorators';

class Test {
  deploy = true;

  @checkDeploy
  method() {
    console.log('called Test method');
  }
}

function setupTest(deploy: boolean) {
  const test = new Test();
  test.deploy = deploy;
  spyOn(console, 'warn');
  spyOn(console, 'log');
  test.method();
}

describe('@checkDeploy', () => {
  it('returns warning message when deploy falsy', () => {
    setupTest(false);
    expect(console.warn).toHaveBeenCalled();
  });

  it('runs function when deploy truthy', () => {
    setupTest(true);
    expect(console.warn).not.toHaveBeenCalled();
    expect(console.log).toHaveBeenCalled();
  });
});
