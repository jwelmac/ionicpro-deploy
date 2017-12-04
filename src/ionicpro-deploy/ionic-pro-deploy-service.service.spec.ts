import { TestBed, inject } from '@angular/core/testing';

import { IonicProDeployService } from './ionic-pro-deploy-service.service';
import { IonicProConfig, IonicDeploy } from './ionic-pro-deploy.interfaces';
import { Observable } from 'rxjs/Observable';

// Setup global variable
window['IonicDeploy'] = {};
const deploy: IonicDeploy = window['IonicDeploy'];

// Send deploy result
const deployCallbacks = (success, failure = null) => {
  return (resolve, reject) => {
    success ? resolve(success) : reject(failure);
  };
};

describe('IonicProDeployService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      providers: [IonicProDeployService]
    });
  });

  it('should be created on injection', inject([IonicProDeployService], (service: IonicProDeployService) => {
    expect(service).toBeTruthy();
  }));

  describe('init function', () => {
    it('gets called with config',  inject([IonicProDeployService], (service: IonicProDeployService) => {
      deploy.init = (proConfig: IonicProConfig, success, failure) => null;
      spyOn(deploy, 'init');
      const config: IonicProConfig = {
        appId: 'abc134',
        channel: 'Master'
      };
      service.init(config);
      expect(deploy.init).toHaveBeenCalled();
    }));
  });

  describe('check function', () => {
    it('resolves to true when success called with true',  inject([IonicProDeployService], async (service: IonicProDeployService) => {
      deploy.check = deployCallbacks('true');
      spyOn(deploy, 'check');
      const result = await service.check();
      expect(deploy.check).toHaveBeenCalled();
      expect(result).toBeTruthy();
      expect(service.updatePresent).toBeTruthy();
    }));

    it('resolves to false when success called with false',  inject([IonicProDeployService], async (service: IonicProDeployService) => {
      deploy.check = deployCallbacks('false');
      spyOn(deploy, 'check');
      const result = await service.check();
      expect(deploy.check).toHaveBeenCalled();
      expect(result).toBeFalsy();
      expect(service.updatePresent).toBeFalsy();
    }));

    it('rejects when failure called',  inject([IonicProDeployService], async (service: IonicProDeployService) => {
      // Ensure value set to true
      service.updatePresent = true;
      expect(service.updatePresent).toBeTruthy();

      const error = 'No updates available';
      deploy.check = deployCallbacks(null, error);
      spyOn(deploy, 'check');
      service.check().catch(res => {
        expect(res).toEqual(error);
        expect(deploy.check).toHaveBeenCalled();
        expect(service.updatePresent).toBeFalsy();
      });
    }));
  });

  describe('download function', () => {
    it('should return an observable', inject([IonicProDeployService], (service: IonicProDeployService) => {
      deploy.download = deployCallbacks('true');
      const obs = service.download();
      expect(obs).toEqual(jasmine.any(Observable));
    }));

    describe('should report', () => {
      it('progress when number emitted', done => {
        // Setup download progress
        const progress: number[] = [];
        for (let i = 0; i <= 100; i += 10) {
          progress.push(i);
        }

        deploy.download = (success, error) => {
            for (const step of progress) {
              success(step);
            }
        };

        // Inject service and test
        inject([IonicProDeployService], (service: IonicProDeployService) => {
          let i = 0;
          service.download().subscribe(percent => {
            expect(percent).toEqual(progress[i]);
            if (++i === progress.length) {
              done();
            }
          });
        })();
      });

      it('complete when "true" emmitted', done => {
        deploy.download = deployCallbacks('true');
        inject([IonicProDeployService], (service: IonicProDeployService) => {
          const cb = () => null;
          expect(service.downloadAvailable).toBeFalsy();
          service.download().subscribe(cb, cb, () => {
            expect(service.downloadAvailable).toBeTruthy();
            done();
          });
        })();
      });
    });
  });
});
