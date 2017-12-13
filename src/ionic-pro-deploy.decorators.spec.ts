import {checkDeploy, IonicDeployNotAvailableError} from './ionic-pro-deploy.decorators';
import { Observable } from 'rxjs/Observable';

class Test {
  static result = 'Method call successful';
  deploy = true;

  @checkDeploy()
  promise() {
    return new Promise(resolve => resolve(Test.result));
  }

  @checkDeploy(false)
  promise2() {
    return new Promise(resolve => resolve(Test.result));
  }

  @checkDeploy(true)
  observable() {
    return new Observable(obs => {
      obs.next(Test.result);
      obs.complete();
    });
  }
}

// Setup variables
let test: Test;
function setupTest(deploy: boolean, method: string) {
  test = new Test();
  test.deploy = deploy;
  spyOn(console, 'warn');
  return test[method]();
}

describe('@checkDeploy', () => {
  it('returns warning message when deploy falsy', done => {
    const result: Promise<string> = setupTest(false, 'promise');
    result.catch(err => {
      expect(console.warn).toHaveBeenCalled();
      done();
    });
  });

  it('runs function when deploy truthy', done => {
    const result: Promise<string> = setupTest(true, 'promise');
    result.then(value => {
      expect(console.warn).not.toHaveBeenCalled();
      expect(value).toEqual(Test.result);
      done();
    });
  });

  describe('checkDeployfactory', () => {
    // Setup test failure
    function testFailure(method: string, isPromise: boolean, done: Function) {
      const result = setupTest(false, method);
      const errCheck = err => {
        expect(err).toEqual(IonicDeployNotAvailableError);
        done();
      };
      if (isPromise) {
        expect(result).toEqual(jasmine.any(Promise));
        result.catch(errCheck);
      } else {
        expect(result).toEqual(jasmine.any(Observable));
        result.subscribe(() => null, errCheck);
      }
    }

    describe('fails with Promise', () => {
      describe(' when @checkDeploy()', () => {
        it(' is called with no parameters', done => {
          testFailure('promise', true, done);
        });

        it(' is called with false', done => {
          testFailure('promise2', true, done);
        });
      });
    });

    describe('fails with Observable', () => {
      describe(' when @checkDeploy()', () => {
        it(' is called with true', done => {
          testFailure('observable', false, done);
        });
      });
    });
  });
});
