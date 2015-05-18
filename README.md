
webgl-sprite
=================

Project to help learn WebGL and other web APIs, Javascript ES6, and some simple game programming concepts.

* Minimalist, no dependency execise of WebGL (for 2D), Web Audio, and Gamepad APIs
* Uses WebGL to implement 2D sprites with the built in window.requestAnimationFrame
* Coded in ECMAScript 6; using node Babel for compilation and Browserify for Javascript module handling
* Some attempt to separate out common code in a library
* Takes advantage of ability to mix HTML UI elements with WebGL canvas without needing special WebGL implemented fonts or UI components
* "Sprite" sheets built and packed into a Texture2D from image files dynamically
* Some attempt to make work across browsers - no sound or gamepad in IE 11 though
* Will run on android (chrome) and ios (safari) but "mouse" input not implemented!

[2D Shooting game test](https://daorton.github.io/webgl-sprite/shooter/index.html)

[2D breakout game test](https://daorton.github.io/webgl-sprite/breakout/index.html)

To try with a gamepad, click the checkbox and press a button on the gamepad to notify the web page. The first joystick is used for moving and "A" button for shooting.

To build (Linux) use `make` (or `make -j`) with the default target. You will need node babel and browserify.