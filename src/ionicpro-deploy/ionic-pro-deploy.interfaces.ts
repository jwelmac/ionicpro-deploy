/**
 * Ionic Pro configuration
 * appId: Application id from Ionic Pro
 * channel: Deploy channel (case-sensitive)
 * host: API host (default - https://api.ionicjs.com)
 */
export interface IonicProConfig {
  appId: string;
  channel: string;
  host?: string;
}

/**
 * IonicDeploy global variable
 *
 * The plugin API for the live updates feature.
 */
export interface IonicDeploy {
  init: (config: IonicProConfig, success: Function, failure: Function) => void;
  check: (success: Function, failure: Function) => void;
  download: (success: Function, failure: Function) => void;
  extract: (success: Function, failure: Function) => void;
  redirect: (success: Function, failure: Function) => void;
  info: (success: Function, failure: Function) => void;
  getVersions: (success: Function, failure: Function) => void;
  deleteVersion: (version: string, success: Function, failure: Function) => void;
  parseUpdate: (jsonResponse: string | Object, success: Function, failure: Function) => void;
}

/**
 * Ionic Deploy Information
 */
export interface IonicDeployInfo {
  deploy_uuid: string;
  channel: string;
  binary_version: string;
}
