import { Observable } from 'rxjs/Observable';

export const IonicDeployNotAvailableError = 'IonicCordova is not available';
/**
 * Check if the Ionic Pro Plugin is installed before running a dependent function
 * When deploy is not available failure method for return type (Promise or Observable triggered)
 */
export function checkDeploy(isObservable: boolean = false) {
  return function checkDeployfactory(target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) {
    const originalMethod = descriptor.value;

    descriptor.value = function(...args: any[]) {
        if (this.deploy) {
          return originalMethod.apply(this, args);
        } else {
          // tslint:disable-next-line:max-line-length
          console.warn(`Tried calling IonicProDeployService.${propertyKey} but ${IonicDeployNotAvailableError}. Ensure cordova-plugin-ionic is installed or cordova is available.`);
          return isObservable ? Observable.create(obs => obs.error(IonicDeployNotAvailableError)) : Promise.reject(IonicDeployNotAvailableError);
        }
    };

    return descriptor;
  };
}
