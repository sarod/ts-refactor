import "normalize.css";
// COmment 2
import * as ng from "angular";
import * as template from "./my-component2.html";

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
			template: template
		});
}


export function registerComponent3(appModule: ng.IModule) {
	appModule
		.component('myComponent', {
			templateUrl: './sample-ts/my-component3.html'
		});
}

registerComponent1(null);
registerComponent2(null);

class MyComponent implements ng.IController {
	public constructor(private $mdDialog: ng.material.IDialogService) {
	}

	show() {
		this.$mdDialog.show(
			{
				controller: DialogController,
				controllerAs: '$ctrl',
				templateUrl: './sample-ts/popup-dialog.html',
				clickOutsideToClose: true,
				fullscreen: true
			});
	}
}

class DialogController {

}
