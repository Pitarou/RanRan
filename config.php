<?php
$LIBRARY_BASE = "libraries/";

$YUI_CONFIG = "js/YUI_config.js.php";
$YUI = $LIBRARY_BASE . "yui/build/yui/yui.js";

$PRODUCTION = false;

function js_header() {
  header('Content-Type: text/javascript');
}