import { Injectable } from '@angular/core';
import { IonicDeploy, IonicProConfig, IonicDeployInfo } from './ionic-pro-deploy.interfaces';
import { Observable } from 'rxjs/Observable';
import { checkDeploy } from './ionic-pro-deploy.decorators';

declare const IonicCordova;

@Injectable()
export class IonicProDeployService {
  private _updatePresent = null;
  get updatePresent() {
    return this._updatePresent;
  }
  downloadAvailable = false;
  extractComplete = false;
  currentInfo: IonicDeployInfo;
  _versions: Set<string> = new Set();
  get versions(): string[] {
    return Array.from(this._versions);
  }
  get deploy(): IonicDeploy {
    return typeof IonicCordova !== 'undefined' && IonicCordova.deploy || null;
  }

  constructor(config: IonicProConfig = null) {
    /* istanbul ignore next */
    if (config) {
      this.init(config).catch(/* istanbul ignore next */err => console.error(err));
    }
  }

  /**
   * Initialize the deploy plugin
   * @param {IonicProConfig} config App configuration
   */
  @checkDeploy()
  init(config: IonicProConfig): Promise<any> {
    return new Promise((resolve, reject) => {
      this.deploy.init(config, resolve, reject);
    }).then(/* istanbul ignore next */async () => {
      this.currentInfo = await this.info();
    });
  }

  /**
   * Check for updates from specified channel
   * @return {Promise<boolean | string>}
   * @fulfil {boolean}
   *   - `true` if updates are available and compatible with the current binary version
   *   - `false`
   *     - if updates are available but incompatible with the current binary version
   *     - or currently unable to check for updates
   * @reject {string} - if update information is not available
   */
  @checkDeploy()
  check(): Promise<boolean | string> {
    return new Promise((resolve, reject) => {
      this.deploy.check(resolve, reject);
    })
    .then(/* istanbul ignore next */(res: string) => {
      const success = res === 'true';
      this._updatePresent = !!success;
      return success;
    })
    .catch(/* istanbul ignore next */(rej: string) => {
      this._updatePresent = false;
      console.log(rej);
      return rej;
    });
  }

  /**
   * Download an available and compatible update
   * @return {Observable<number>} Emits the download percentage
   * - completes when download complete
   */
  @checkDeploy(true)
  update(autoReload: boolean = true): Observable<number> {
    const obs: Observable<number> = Observable.create((observer: any) => {
      this.observeProgress(observer, 'download', 'true', 'extractComplete', true);
    });
    obs.subscribe(null, null, async () => {
      if (autoReload) {
        await this.redirect();
      }
    });
    return obs;
  }

  /**
   * Download an available and compatible update
   * @return {Observable<number>} Emits the download percentage
   * - completes when download complete
   */
  @checkDeploy(true)
  download(): Observable<number> {
    return Observable.create((observer: any) => {
      this.observeProgress(observer, 'download', 'true', 'downloadAvailable', true);
    });
  }

  /**
   * Extract a downloaded archive
   * @return {Observable<number>} Emits the extract percentage
   * - completes when download complete
   */
  @checkDeploy(true)
  extract(): Observable<number> {
    return Observable.create((observer: any) => {
      if (!this.downloadAvailable) {
        observer.error('No download available');
      } else {
        this.observeProgress(observer, 'extract', 'true', 'extractComplete', true);
      }
    });
  }

  /**
   * Redirect to the latest version of the app on this device
   */
  @checkDeploy()
  redirect() {
    return new Promise((resolve, reject) => {
      if (this.extractComplete) {
        this.deploy.redirect(resolve, reject);
      } else {
        reject();
      }
    });
  }

  /**
   * Retrieve information about the current installed build
   * @fulfill {IonicDeployInfo} - information about the current running version for this device
   */
  @checkDeploy()
  info(): Promise<IonicDeployInfo> {
    return new Promise((resolve, reject) => {
      this.deploy.info(resolve, reject);
    }).then(/* istanbul ignore next */(res: IonicDeployInfo) => {
      this.currentInfo = res;
      return res;
    });
  }

  /**
   * List downloaded versions on this device
   * @fulfill {string[]} - The UUIDs of the versions previously downloaded on the device
   *
   * - Limited to the number of versions indicated while installing the plugin
   */
  @checkDeploy()
  getVersions(): Promise<string[] | string> {
    return new Promise((resolve, reject) => {
      this.deploy.getVersions(resolve, reject);
    }).then(/* istanbul ignore next */(res: string[]) => {
      this._versions = new Set(res);
      return res;
    });
  }

  /**
   * Delete a downloaded version on this device
   * @param {string} version UUID of the deploy version downloaded to device
   */
  @checkDeploy()
  deleteVersion(version: string): Promise<string> {
    return new Promise((resolve, reject) => {
      this.deploy.deleteVersion(version, resolve, reject);
    }).then(/* istanbul ignore next */() => {
      this._versions.delete(version);
      return version;
    });
  }

  /**
   * Observe the progress of a method returning multiple values
   * and return values in an observable stream
   * @param {any} observer Observer to stream events with
   * @param {string} deployMethod The IonicDeploy API method to execute
   * @param {string} doneString String to indicate process completed successfully
   * @param {string} successProp Class property to set when process completed successfully
   * @param {any} successValue Value to set class property to when process completed successfully
   */
  private observeProgress(observer: any, deployMethod: string, doneString: string, successProp: string, successValue: any) {
    const done = () => this[successProp] = successValue;
    const success = this.getProgressSuccessCallback(observer, doneString, done);
    const error = (err: string) => observer.error(err);
    this.deploy[deployMethod](success, error);
  }

  /**
   * Create a success callback for a function that will return:
   *   - an integer showing progress over time or
   *   - a string indicating process complete
   * @param observer Observer to return updates to subscribers
   * @param completionString String to indicate process complete
   * @param completeCallback Callback to run when process complete
   */
  private getProgressSuccessCallback(observer: any, completionString: string, completeCallback: Function) {
      return (res: string) => {
        switch (typeof res) {
          case 'string':
            if (res === completionString) {
              completeCallback();
              observer.complete();
            } else {
              observer.error(res);
            }
            break;
          // Return progress percentage
          case 'number':
            observer.next(+res);
            break;
        }
      };
  }

}
