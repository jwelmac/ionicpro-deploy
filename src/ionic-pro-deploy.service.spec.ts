import { TestBed, inject } from '@angular/core/testing';

import { IonicProDeployService } from './ionic-pro-deploy.service';
import { IonicProConfig, IonicDeploy, IonicDeployInfo } from './ionic-pro-deploy.interfaces';
import { Observable } from 'rxjs/Observable';
import { IonicProDeployModule } from './ionic-pro-deploy.module';

// Setup global variable
let deploy: IonicDeploy;
declare const IonicCordova;

// Send deploy result
const deployCallbacks = (success, failure = null) => {
  return (resolve, reject) => {
    success ? resolve(success) : reject(failure);
  };
};
const cb = () => null;


function setupProgress(func: string) {
  const progress: number[] = [];
  for (let i = 0; i <= 100; i += 10) {
    progress.push(i);
  }
  deploy[func] = (success, error) => {
    for (const step of progress) {
      success(step);
    }
  };
  return progress;
}

describe('IonicProDeployService', () => {
  beforeEach(() => {
    TestBed.configureTestingModule({
      imports: [IonicProDeployModule.forRoot()]
    });
    deploy = IonicCordova.deploy;
  });

  it('should be created on injection', inject([IonicProDeployService], (service: IonicProDeployService) => {
    expect(service).toBeTruthy();
  }));

  describe('init method', () => {
    const config: IonicProConfig = {
      appId: 'abc134',
      channel: 'Master'
    };

    describe('deploy API init method', () => {
      beforeEach(() => {
        deploy.init = (proConfig: IonicProConfig, success, failure) => null;
        spyOn(deploy, 'init');
      });

      describe('called', () => {
        it('with config',  inject([IonicProDeployService], (service: IonicProDeployService) => {
          service.init(config);
          expect(deploy.init).toHaveBeenCalledWith(config, jasmine.any(Function), jasmine.any(Function));
        }));

        it('when module forRoot called with config', () => {
          const moduleWithProviders = IonicProDeployModule.forRoot(config);
          expect(deploy.init).toHaveBeenCalled();
        });

        it('when object created with config', () => {
          const service = new IonicProDeployService(config);
          expect(deploy.init).toHaveBeenCalled();
        });
      });

      describe('not called', () => {
        it('when object created without config', () => {
          const service = new IonicProDeployService();
          expect(deploy.init).not.toHaveBeenCalled();
        });
      });
    });
  });

  describe('check method', () => {
    it('resolves to true when success called with true',  inject([IonicProDeployService], async (service: IonicProDeployService) => {
      deploy.check = deployCallbacks('true');
      expect(service.updatePresent).toBeNull();
      const result = await service.check();
      expect(result).toBeTruthy();
      expect(service.updatePresent).toBeTruthy();
    }));

    it('resolves to false when success called with false',  inject([IonicProDeployService], async (service: IonicProDeployService) => {
      deploy.check = deployCallbacks('false');
      expect(service.updatePresent).toBeNull();
      const result = await service.check();
      expect(result).toBeFalsy();
      expect(service.updatePresent).toEqual(false);
    }));

    it('rejects when failure called',  inject([IonicProDeployService], async (service: IonicProDeployService) => {
      const error = 'No updates available';
      deploy.check = deployCallbacks(null, error);
      spyOn(deploy, 'check');
      expect(service.updatePresent).toBeNull();
      service.check().catch(res => {
        expect(res).toEqual(error);
        expect(deploy.check).toHaveBeenCalled();
        expect(service.updatePresent).toEqual(false);
      });
    }));
  });

  describe('update method', () => {
    let service: IonicProDeployService;
    beforeEach(inject([IonicProDeployService], (_service: IonicProDeployService) => {
      service = _service;
      spyOn(service, 'download').and.returnValue(Observable.create(ob => ob.complete()));
      spyOn(service, 'extract').and.returnValue(Observable.create(ob => ob.complete()));
      spyOn(service, 'redirect').and.returnValue(Promise.resolve());
    }));
    it('should return an observable', () => {
      deploy.download = deployCallbacks('true');
      const obs = service.update();
      expect(obs).toEqual(jasmine.any(Observable));
    });

    it('should call download, extract and redirect', () => {
      deploy.download = deployCallbacks('true');
      const obs = service.update();
      expect(service.download).toHaveBeenCalled();
      expect(service.extract).toHaveBeenCalled();
      expect(service.redirect).toHaveBeenCalled();
    });

    // describe('should report', () => {
    //   const method = 'update';

      // it('progress when number emitted', done => {
      //   // Setup download progress
      //   const progress: number[] = setupProgress(method);

      //   // Inject service and test
      //   inject([IonicProDeployService], (service: IonicProDeployService) => {
      //     let i = 0;
      //     service[method]().subscribe(percent => {
      //       expect(percent).toEqual(progress[i]);
      //       if (++i === progress.length) {
      //         done();
      //       }
      //     });
      //   })();
      // });

      // it('complete when "true" emmitted', done => {
      //   deploy.download = deployCallbacks('true');
      //   inject([IonicProDeployService], (service: IonicProDeployService) => {
      //     expect(service.extractComplete).toBeFalsy();
      //     service[method]().subscribe(cb, cb, () => {
      //       expect(service.extractComplete).toBeTruthy();
      //       done();
      //     });
      //   })();
      // });

      // it('calls redirect when no parameter given', done => {
      //   deploy.download = deployCallbacks('true');
      //   inject([IonicProDeployService], (service: IonicProDeployService) => {
      //     spyOn(service, 'redirect');
      //     service[method]().subscribe(cb, cb, () => {
      //       expect(service.redirect).toHaveBeenCalled();
      //       done();
      //     });
      //   })();
      // });

      // it('does not call redirect when parameter is false', done => {
      //   deploy.download = deployCallbacks('true');
      //   inject([IonicProDeployService], (service: IonicProDeployService) => {
      //     spyOn(service, 'redirect');
      //     service[method](false).subscribe(cb, cb, () => {
      //       expect(service.redirect).not.toHaveBeenCalled();
      //       done();
      //     });
      //   })();
      // });

    //   it('handles errors appropriately', done => {
    //     const err = 'Error fetching download';
    //     deploy.download = deployCallbacks(null, err);
    //     inject([IonicProDeployService], (service: IonicProDeployService) => {
    //       service[method]().subscribe(cb, (error) => {
    //         expect(error).toEqual(err);
    //         done();
    //       });
    //     })();
    //   });

    //   it('throws errors if success not "true"', done => {
    //     const success = 'false';
    //     deploy.download = deployCallbacks(success);
    //     inject([IonicProDeployService], (service: IonicProDeployService) => {
    //       service[method]().subscribe(cb, (error) => {
    //         expect(error).toEqual(success);
    //         done();
    //       });
    //     })();
    //   });
    // });
  });

  describe('download method', () => {
    it('should return an observable', inject([IonicProDeployService], (service: IonicProDeployService) => {
      deploy.download = deployCallbacks('true');
      const obs = service.download();
      expect(obs).toEqual(jasmine.any(Observable));
    }));

    describe('should report', () => {
      it('progress when number emitted', done => {
        // Setup download progress
        const progress: number[] = setupProgress('download');

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
          expect(service.downloadAvailable).toBeFalsy();
          service.download().subscribe(cb, cb, () => {
            expect(service.downloadAvailable).toBeTruthy();
            done();
          });
        })();
      });

      it('handles errors appropriately', done => {
        const err = 'Error fetching download';
        deploy.download = deployCallbacks(null, err);
        inject([IonicProDeployService], (service: IonicProDeployService) => {
          service.download().subscribe(cb, (error) => {
            expect(error).toEqual(err);
            done();
          });
        })();
      });

      it('throws errors if success not "true"', done => {
        const success = 'false';
        deploy.download = deployCallbacks(success);
        inject([IonicProDeployService], (service: IonicProDeployService) => {
          service.download().subscribe(cb, (error) => {
            expect(error).toEqual(success);
            done();
          });
        })();
      });
    });
  });

  describe('extract method', () => {
    it('should return an observable', inject([IonicProDeployService], (service: IonicProDeployService) => {
      deploy.extract = deployCallbacks('true');
      const obs = service.extract();
      expect(obs).toEqual(jasmine.any(Observable));
    }));

    describe('should report', () => {
      it('progress when number emitted', done => {
        // Setup extract progress
        const progress: number[] = setupProgress('extract');

        // Inject service and test
        inject([IonicProDeployService], (service: IonicProDeployService) => {
          let i = 0;
          service.downloadAvailable = true;
          service.extract().subscribe(percent => {
            expect(percent).toEqual(progress[i]);
            if (++i === progress.length) {
              done();
            }
          });
        })();
      });

      it('complete when "true" emmitted', done => {
        deploy.extract = deployCallbacks('true');
        inject([IonicProDeployService], (service: IonicProDeployService) => {
          service.downloadAvailable = true;
          expect(service.extractComplete).toBeFalsy();
          service.extract().subscribe(cb, cb, () => {
            expect(service.extractComplete).toBeTruthy();
            done();
          });
        })();
      });

      it('handles errors appropriately', done => {
        const err = 'Error fetching extract';
        deploy.extract = deployCallbacks(null, err);
        inject([IonicProDeployService], (service: IonicProDeployService) => {
          service.downloadAvailable = true;
          service.extract().subscribe(cb, (error) => {
            expect(service.extractComplete).toBeFalsy();
            expect(error).toEqual(err);
            done();
          });
        })();
      });

      it('throws errors if no download available', done => {
        const errorMessage = 'No download available';
        deploy.extract = deployCallbacks('true');
        inject([IonicProDeployService], (service: IonicProDeployService) => {
          service.downloadAvailable = false;
          service.extract().subscribe(cb, (error) => {
            expect(service.extractComplete).toBeFalsy();
            expect(error).toEqual(errorMessage);
            done();
          });
        })();
      });

      it('throws errors if success not "true"', done => {
        const success = 'done';
        deploy.extract = deployCallbacks(success);
        inject([IonicProDeployService], (service: IonicProDeployService) => {
          service.downloadAvailable = true;
          service.extract().subscribe(cb, (error) => {
            expect(service.extractComplete).toBeFalsy();
            expect(error).toEqual(success);
            done();
          });
        })();
      });
    });
  });

  describe('redirect method', () => {
    it('resolves when extract complete', inject([IonicProDeployService], async (service: IonicProDeployService) => {
      deploy.redirect = deployCallbacks('true');
      service.extractComplete = true;
      await service.redirect();
    }));

    it('rejects when extract not complete', inject([IonicProDeployService], async (service: IonicProDeployService) => {
      deploy.redirect = deployCallbacks(null);
      spyOn(deploy, 'redirect');
      service.extractComplete = false;
      service.redirect().catch(err => {
        expect(deploy.redirect).not.toHaveBeenCalled();
      });
    }));

    it('rejects if error callback called', inject([IonicProDeployService], async (service: IonicProDeployService) => {
      const error = 'error';
      deploy.redirect = deployCallbacks(null, error);
      spyOn(deploy, 'redirect');
      service.extractComplete = true;
      service.redirect().catch(err => {
        expect(deploy.redirect).toHaveBeenCalled();
        expect(err).toEqual(error);
      });
    }));
  });

  describe('info method', () => {
    it('resolves with deploy info', inject([IonicProDeployService], async (service: IonicProDeployService) => {
      const deployInfo: IonicDeployInfo = {
        deploy_uuid: '12345',
        channel: 'Master',
        binary_version: '1.0.0'
      };
      deploy.info = deployCallbacks(deployInfo);
      const info = await service.info();
      expect(info).toEqual(deployInfo);
      expect(service.currentInfo).toEqual(deployInfo);
    }));

    it('rejects with error message', inject([IonicProDeployService], async (service: IonicProDeployService) => {
      const message = 'Unable to gather deploy info';
      deploy.info = deployCallbacks(null, message);
      service.info().catch(err => {
        expect(err).toEqual(message);
      });
    }));
  });

  describe('getVersions method', () => {
    it('resolves with array of uuids', inject([IonicProDeployService], async (service: IonicProDeployService) => {
      const uuids = [
        'abc1234',
        'def5678',
        'ghi91011'
      ];
      deploy.getVersions = deployCallbacks(uuids);
      const versions = await service.getVersions();
      expect(versions).toEqual(uuids);
      expect(service.versions).toEqual(uuids);
    }));

    it('rejects with error message', inject([IonicProDeployService], async (service: IonicProDeployService) => {
      const message = 'Error retrieveing versions';
      deploy.info = deployCallbacks(null, message);
      service.getVersions().catch(err => {
        expect(err).toEqual(message);
      });
    }));
  });

  describe('deleteVersion method', () => {
    let uuids, errMessage;
    beforeEach(() => {
      uuids = [
        'abc1234',
        'def5678',
        'ghi91011'
      ];
      errMessage = 'Error attempting to remove the version';
      deploy.deleteVersion = (version, success, failure) => {
        uuids.includes(version) ? success() : failure(errMessage);
      };
    });

    it('deletes a known uuid', inject([IonicProDeployService], async (service: IonicProDeployService) => {
      service._versions = new Set(uuids);
      const version = uuids[0];
      await service.deleteVersion(version);
      expect(service.versions).not.toEqual(jasmine.objectContaining([version]));
    }));

    it('rejects with unknown uuid', inject([IonicProDeployService], async (service: IonicProDeployService) => {
      const version = 'unknown';
      service._versions = uuids;
      service.deleteVersion(version).catch(err => {
        expect(err).toEqual(errMessage);
        expect(service.versions).toEqual(uuids);
      });
    }));
  });
});

