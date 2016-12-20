// Comment 1
import 'normalize.css';
// COmment 2
import * as ng from 'angular';

export function registerComponent1(appModule: ng.IModule) {
   appModule
         .component('myComponent', {
            controller: MyComponent,
            templateUrl: './sample-ts/my-component1.html'
         });
}

export function registerComponent2(appModule: ng.IModule) {
   appModule
         .component('myComponent2', {
            controller: MyComponent,
            template: `<inlined></inlined>`
         });
}


registerComponent1(null);
registerComponent2(null);

class MyComponent implements ng.IController {
  constructor() {

  }
}