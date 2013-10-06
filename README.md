RanRan
======

alpha version

RanRan is a [YUI][] module that provides a JavaScript editor widget, and the means to run
the source code in a [web worker][] sandbox.

The editor itself is a YUI wrapper for the [Ace][] editor, but RanRan extends this
by presenting the editor in a YUI Panel which can be dragged, resized, and so on.
There is also a Read Eval Print Loop panel.

The editor and the Web Worker aren't quite integrated yet, but that's the next step.

This work will be presented as part of the final project for an MSc in
e-Learning Technology.

`index.php` is a rough "home page" that runs the test scripts. Other than that, it is pure Javascript.

[YUI]: http://yuilibrary.com/ "Yahoo! User Interface - a JavaScript and CSS library for building richly interactive web applications"

[Ace]: http://ace.c9.io/ "Ace - the high performance code editor for the Web"
       
[web worker]: http://en.wikipedia.org/wiki/Web_worker "A web worker is a Javascript script that runs in a separate background thread ..."
