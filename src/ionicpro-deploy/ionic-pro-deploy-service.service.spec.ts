import { TestBed, inject } from '@angular/core/testing';

import { IonicProDeployService } from './ionic-pro-deploy-service.service';
import { IonicProConfig, IonicDeploy } from './ionic-pro-deploy.interfaces';

// Setup global variable
window['IonicDeploy'] = {};
const deploy: IonicDeploy = window['IonicDeploy'];

// Send deploy result
const deployCallbacks = (success = null, failure = null) => {
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
});
