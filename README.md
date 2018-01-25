# Ionic Pro Deploy [![Build Status](https://travis-ci.org/jwelmac/ionicpro-deploy.svg?branch=master)](https://travis-ci.org/jwelmac/ionicpro-deploy) [![Maintainability](https://api.codeclimate.com/v1/badges/def77cc2f502b821b0e0/maintainability)](https://codeclimate.com/github/jwelmac/ionicpro-deploy/maintainability) [![Test Coverage](https://api.codeclimate.com/v1/badges/def77cc2f502b821b0e0/test_coverage)](https://codeclimate.com/github/jwelmac/ionicpro-deploy/test_coverage)

Access the Ionic Pro Deploy API using Promises and/or Observable based methods.

## Usage

### Installation

1. Ensure you have the Ionic Pro Plugin installed see their [Setup Docs](https://ionicframework.com/docs/pro/deploy/setup/#installation)

2. Install this module by running the following command:
`npm i --save ionicpro-deploy`

3. Import `IonicProDeployModule` in the `@NgModule` where it is to be used.  

```ts

import { IonicProDeployModule } from 'ionicpro-deploy';

@NgModule({
  ...
  imports: [
    ...
    IonicProDeployModule.forRoot()
  ]
})
```

Optionally, an [IonicProConfig](src/ionic-pro-deploy.interfaces.ts) object can be passed to use a different app configuration than that provided during installation of the plugin.
```ts

imports: [
  ...
  IonicProDeployModule.forRoot({
    channel: 'Development'
  })
]
```

4. Inject `IonicProDeployService` as a dependency in the constructor of the object in which it will be used.

```ts
  @Component({
    ...
  })
  export class MyAwesomePage {

    constructor(private proDeploy: IonicProDeployService) {
      ...
    }
  } 
```

### Usage
The following methods are available for use from the injected provider.

### init(config) 

Initialize the deploy plugin

**Parameters**

**config**: `IonicProConfig`
-  App configuration



### check() 

Check for updates from specified channel

**Returns**: `Promise<(boolean|string)>`
- Resolves with `boolean`:
  - `true`
    - if updates are available and compatible with the current binary version
  - `false`
    - if updates are available but incompatible with the current binary version
    - or currently unable to check for updates
- Rejects with error message `string` 
  - if update information is not available


### download() 

Download an available and compatible update

**Returns**: `Observable<number>`
- Emits the download percentage
- completes when download complete


### extract() 

Extract a downloaded archive

**Returns**: `Observable<number>`
- Emits the extract percentage
- completes when download complete


### redirect() 

Redirect to the latest version of the app on this device



### info() 

Retrieve information about the current installed build



### getVersions() 

List downloaded versions on this device



### deleteVersion(version) 

Delete a downloaded version on this device

**Parameters**

**version**: `string`
- UUID of the deploy version downloaded to device

