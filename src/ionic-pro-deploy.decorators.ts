
export function checkDeploy(target: Object, propertyKey: string, descriptor: TypedPropertyDescriptor<any>) {
  const originalMethod = descriptor.value;

  descriptor.value = function(...args: any[]) {
      if (this.deploy) {
        return originalMethod.apply(this, args);
      } else {
        console.warn('IonicCordova is not available. Ensure cordova-plugin-ionic is installed');
      }
  };

  return descriptor;
}
