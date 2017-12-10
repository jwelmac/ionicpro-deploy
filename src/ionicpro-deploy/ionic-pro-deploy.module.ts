import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { ModuleWithProviders } from '@angular/core/src/metadata/ng_module';
import { IonicProConfig } from './ionic-pro-deploy.interfaces';
import { IonicProDeployService } from './ionic-pro-deploy.service';

@NgModule({
  imports: [
    CommonModule
  ],
  declarations: []
})
export class IonicProDeployModule {
  static forRoot(config: IonicProConfig = null): ModuleWithProviders {
    return {
      ngModule: IonicProDeployModule,
      providers: [
        {provide: IonicProDeployService, useValue: new IonicProDeployService(config)}
      ]
    };
  }
}
