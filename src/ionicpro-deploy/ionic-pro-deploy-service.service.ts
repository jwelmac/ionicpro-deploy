import { Injectable } from '@angular/core';
import { IonicDeploy, IonicProConfig } from './ionic-pro-deploy.interfaces';
import { Observable } from 'rxjs/Observable';

declare const IonicDeploy: IonicDeploy;

@Injectable()
export class IonicProDeployService {
  private _updatePresent = null;
  get updatePresent() {
    return this._updatePresent;
  }
  downloadAvailable = false;
  extractComplete = false;

  constructor() { }

  /**
   * Initialize the deploy plugin
   * @param {IonicProConfig} config App configuration
   */
  init(config: IonicProConfig): Promise<any> {
    return new Promise((resolve, reject) => {
      IonicDeploy.init(config, resolve, reject);
    });
  }

  /**
   * Check for updates from specified channel
   * @return {Promise<boolean | string>}
   * Resolves with:
   *   TRUE if updates are available and compatible with the current binary version
   *   FALSE
   *     if updates are available but incompatible with the current binary version
   *     or currently unable to check for updates
   * Rejects with an error message if update information is not available
   */
  check(): Promise<boolean | string> {
    return new Promise((resolve, reject) => {
      IonicDeploy.check(resolve, reject);
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
   * @return {Observable<number>} Emits the download percentage until complete
   */
  download(): Observable<number> {
    return Observable.create((observer: any) => {
      const success = this.getProgressSuccessCallback(observer, 'true', () => this.downloadAvailable = true);
      const error = (err: string) => observer.error(err);
      IonicDeploy.download(success, error);
    });
  }

  /**
   * Extract a downloaded archive
   */
  extract() {
    return Observable.create((observer: any) => {
      if (!this.downloadAvailable) {
        observer.error('No download available');
      } else {
        const success = this.getProgressSuccessCallback(observer, 'done', () => this.extractComplete = true);
        const error = (err: string) => observer.error(err);
        IonicDeploy.extract(success, error);
      }
    });
  }

  /**
   * Redirect to the latest installed deployment
   */
  redirect() {
    return new Promise((resolve, reject) => {
      if (this.extractComplete) {
        IonicDeploy.redirect(resolve, reject);
      } else {
        reject();
      }
    });
  }

  /**
   * Create a success callback for a function that will return
   * integer showing progress over time or
   * string indicating process complete
   * @param observer Observer to return updates to subscribers
   * @param completionString String to indicate process complete
   * @param completeCallback Callback to run when process complete
   */
  private getProgressSuccessCallback(observer: any, completionString: string, completeCallback?: Function) {
      return (res: string) => {
        switch (typeof res) {
          case 'string':
            if (res === completionString) {
              if (completeCallback != null) {
                completeCallback();
              }
              // Download complete or present on device
              observer.complete();
            } else {
              observer.error(res);
            }
            break;
          // Return download percentage
          case 'number':
            observer.next(+res);
            break;
        }
      };
  }

}
