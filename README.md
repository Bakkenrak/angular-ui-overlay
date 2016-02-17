# angular-ui-overlay

An AngularJS module providing a directive to flexibly overlay page elements.

## Setup
* Include the ui-overlay-any.js or ui-overlay-any.min.js script.
* Load uiOverlayAny as a module dependency: `angular.module("myApp", ['uiOverlay'])`;

## Usage
Directive spreads an overlay over the element marked by an `ui-overlay="..."` attribute or over its children.

Expects an object as parameter:
`{ active: boolean, [ children: array ]}`

* active: Required expression that evaluates to true (show overlay) or false (hide overlay). *You may use this to dynamically show and hide the overlay!*
* children: Optional array containing the index numbers of the children of the ui-overlay element that are used (min/max) to determine the dimensions of the overlay.
 * If the array is not present, the ui-overlay element itself will be overlayed.
 + If the array is empty, all child nodes will be used to determine the overlay's dimensions.

A direct child node (preferably div) needs to be present carrying an `overlay-container` attribute.
This is used as the overlay container. To display further elements on the overlay, simply fill the `overlay-container` element

###Example:
    <div ui-overlay="{ active: showOverlayExpression, children: [2, 3]}">
        <div overlay-container> ... </div>
        <div> ... </div>
        <div> ... will be used to determine the overlay's dimensions ... </div>
        <div> ... will be used to determine the overlay's dimensions ... </div>
        <div> ... </div>
    </div>