<?php
$LIBRARY_BASE = "libraries/";

$YUI_CONFIG = "js/YUI_config.js";
$YUI = $LIBRARY_BASE . "yui/build/yui/yui.js";

function js_header() {
  header('Content-Type: text/javascript');
}