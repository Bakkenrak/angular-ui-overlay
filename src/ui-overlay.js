(function () {
  'use strict';
  var module = angular.module('uiOverlay', []);

  /**
   * Directive to spread an overlay over the element marked with ui-overlay="..." (or children thereof)
   * Expects an object as parameter:
   * { active: boolean, [ children: array ]}
   * active: Required expression that evaluates to true (show overlay) or false (hide overlay)
   * children: Optional array containing the index numbers of the children of the ui-overlay element that
   *           are used (min/max) to determine the dimensions of the overlay.
   *           If the array is not present, the ui-overlay element itself will be overlayed.
   *           If the array is empty, all child nodes will be used to determine the overlay's dimensions.
   *
   * A direct child node (preferably div) needs to be present carrying a overlay-container attribute.
   * This is used as the overlay container.
   *
   * Example:
   * <div ui-overlay="{ active: showOverlay, children: [2, 3]}">
   *   <div overlay-container> ... </div>
   *   <div> ... </div>
   *   <div> ... will be used to determine the overlay's dimensions ... </div>
   *   <div> ... will be used to determine the overlay's dimensions ... </div>
   * </div>
   */
  module.directive('uiOverlay', ['$timeout', function ($timeout) {
    /**
     * Helper method that determines the outmost (min/max) values of the dimensions of the elements in the given array
     */
    var calculateOuterDimensions = function (elements) {
      var rects = elements.map(function (element) {
        return {
          top: element.offsetTop,
          bottom: element.offsetTop + element.offsetHeight,
          left: element.offsetLeft,
          right: element.offsetLeft + element.offsetWidth
        };
      });

      return {
        top: Math.min.apply(Math, rects.map(function (r) {
          return r.top;
        })),
        bottom: Math.max.apply(Math, rects.map(function (r) {
          return r.bottom;
        })),
        left: Math.min.apply(Math, rects.map(function (r) {
          return r.left;
        })),
        right: Math.max.apply(Math, rects.map(function (r) {
          return r.right;
        }))
      };
    };

    return function (scope, element, attrs) {
      if (!attrs.uiOverlay) { // if no config is provided
        throw new Error('Please provide a value or expression for the ui-overlay directive.');
      }

      scope._uiOverlayAttr = attrs.uiOverlay; // save in scope

      var config = scope.$eval(attrs.uiOverlay);

      var childrenElements = [].slice.call(element.children()); // transform NamedNodeMap into array

      var overlayContainer;

      for(var i = 0; i < childrenElements.length; i++) {
        var child = childrenElements[i];
        for(var a = 0; a < child.attributes.length; a++) {
          if(child.attributes[a].name === 'overlay-container') {
            overlayContainer = angular.element(child);
            childrenElements.splice(i,1);
            break;
          }
        }
        if(overlayContainer !== undefined) break;
      }

      if (overlayContainer === undefined) {
        throw new Error('Please provide an element with an overlay-container attribute as a direct child of the ui-overlay element.');
      }

      var overlayElements = [];
      if (!config.children) { // for one block element
        overlayElements.push(element[0]);
      } else if (config.children.length === 0) { // for all children of the element
        overlayElements = childrenElements;
      } else { // only specific children of the element
        var allChildren = element.children();
        angular.forEach(config.children, function (idx) { // for each child index provided in the config
          overlayElements.push(allChildren[idx]); // push that child element into the array of elements to overlay
        });
      }

      /**
       * Updates the overlay-container's measurements to fit the outer dimensions of the element(s) to overlay
       */
      var updateOverlay = function () {
        var outerDimensions = calculateOuterDimensions(overlayElements);
        overlayContainer[0].style.top = outerDimensions.top + 'px';
        overlayContainer[0].style.left = outerDimensions.left + 'px';
        overlayContainer[0].style.width = (outerDimensions.right - outerDimensions.left) + 'px';
        overlayContainer[0].style.height = (outerDimensions.bottom - outerDimensions.top) + 'px';
      };

      $timeout(function () { // timeout to await the possible rendering of the browser scrollbar
        overlayContainer.css({ // set CSS of the overlay
          position: 'absolute', // needs absolute positioning to effectively overlay an element
          display: config.active ? 'table' : 'none' // display overlay only if configured as active
        });
        if (config.active) {
          updateOverlay(); // update overlay measurements
        }

        scope.$on('collapseEndGlobal', function () { // listen for collapseEnd event triggered by the collapseListener directive
          if (scope.$eval(scope._uiOverlayAttr).active) { // if the overlay is supposed to be active/shown
            updateOverlay();
          }
        });
      });

      angular.element(window).on('resize', function () { // adjust dimensions on window resizing
        updateOverlay();
      });

      scope.$watch(attrs.uiOverlay, function (newValue, oldValue) { // watch config value
        if (newValue && newValue.active) { // update measurements and display overlay if active === true
          $timeout(function () {
            updateOverlay();
            overlayContainer[0].style.display = overlayContainer.children().length > 0 ? 'table' : 'block';
          });
        } else {
          overlayContainer[0].style.display = 'none';
        }
      });
    };
  }]);
})();