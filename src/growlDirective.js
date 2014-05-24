angular.module("angular-growl").directive("growl", ["$rootScope", function ($rootScope) {
	"use strict";

	return {
		restrict: 'A',
		template:   '<div class="growl">' +
					'	<div class="growl-item alert" ng-repeat="message in messages" ng-class="computeClasses(message)">' +
					'		<button type="button" class="close" ng-click="deleteMessage(message)">&times;</button>' +
					'       <div ng-switch="message.enableHtml">' +
					'           <div ng-switch-when="true" ng-bind-html="message.text"></div>' +
					'           <div ng-switch-default ng-bind="message.text"></div>' +
					'       </div>' +
					'	</div>' +
					'</div>',
		replace: false,
		scope: true,
		controller: ['$scope', '$timeout', 'growl', function ($scope, $timeout, growl) {
			var onlyUnique = growl.onlyUnique();

			$scope.messages = [];

			function addMessage(message) {
				$scope.messages.push(message);

				if (message.ttl && message.ttl !== -1) {
					$timeout(function () {
						$scope.deleteMessage(message);
					}, message.ttl);
				}
			}

			function compareMessages(a, b) {
				return a.text === b.text && a.severity === b.severity;
			}

			$rootScope.$on("growlMessage", function (event, message) {
				var found;
				if (onlyUnique) {
					angular.forEach($scope.messages, function(msg) {
						if (compareMessages(msg, message)) {
							found = true;
						}
					});

					if (!found) {
						addMessage(message);
					}
				} else {
					addMessage(message);
				}
			});

			$rootScope.$on('growlMessageDelete', function (event, message) {
				angular.forEach($scope.messages, function (msg) {
					if (compareMessages(message, msg)) {
						$scope.deleteMessage(msg);
					}
				});
			});

			$scope.deleteMessage = function (message) {
				var index = $scope.messages.indexOf(message);
				if (index > -1) {
					$scope.messages.splice(index, 1);
				}
			};

			$scope.computeClasses = function (message) {
				return {
					'alert-success': message.severity === "success",
					'alert-error': message.severity === "error", //bootstrap 2.3
					'alert-danger': message.severity === "error", //bootstrap 3
					'alert-info': message.severity === "info",
					'alert-warning': message.severity === "warn" //bootstrap 3, no effect in bs 2.3
				};
			};
		}]
	};
}]);
