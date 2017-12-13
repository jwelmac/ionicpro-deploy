import { Observable } from 'rxjs/Observable';


export function checkDeploy(isObservable: boolean = false) {
  return function checkDeployfactory(target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) {
    const originalMethod = descriptor.value;

    descriptor.value = function(...args: any[]) {
        if (this.deploy) {
          return originalMethod.apply(this, args);
        } else {
          const error = 'IonicCordova is not available.';
          console.warn(`${error} Ensure cordova-plugin-ionic is installed`);
          return isObservable ? Observable.create(obs => obs.error(error)) : Promise.reject(error);
        }
    };

    return descriptor;
  };
}
