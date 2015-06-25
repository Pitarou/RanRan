<?php require_once('config.php'); ?>

<!DOCTYPE html>
<html>
  <head>
    <title>Javascript REPL and code editor using web workers</title>
    <link rel="shortcut icon" href="/panda-icon.png" />
  </head>
  <body class="yui3-skin-sam">
    <h1>Javascript REPL and code editor using web workers</h1>
    <h2>Next on my todo list:</h2>
	<ul>
    <li>Fix the REPL behaviour when the line extends to multiple lines.</li>
    <li>Make the editor do something sensible with events raised by the webworker when compiling</li>
    <li>Set <tt>this</tt> in the REPL</li>
    <li>Handle returning function values in REPL</li>
    <li>Create an overall manager for REPL and editors</li>
	  <li>Fix focus management</li>
	  <li>Improve Flexbox compatibility for older browsers</li>
	</ul>
  <div id="console"></div>
  <div id="collapsible-panel" data-collapsibleparentpanel-title="REPL">
    <div class="yui3-widget-bd">
      <div class="yui3-collapsibleparentpanel-scrollbox">
      </div>
    </div>
  </div>
	<div id="editor-panel" data-collapsibleparentpanel-title="hello_world">
		<div class="yui3-widget-hd"></div>
		<div class="yui3-widget-bd">
        <div class="yui3-aceEditor">
          <div class="yui3-aceEditor-value" data-ace-read-only="true">function hello_world() {</div>
        </div>
        <div class="yui3-aceEditor">
          <div class="yui3-aceEditor-value" data-ace-flexbox="true" data-ace-show-gutter="true" data-ace-focused="true">return (function () {
  return {
    result: arguments[0],
    then:
      (function (this_context) {
        function (expression, continuation) {
          return (function (expression, continuation) {
            return continuation(eval(expression), this)
          }).call(this_context, expression, continuation);
        }
      })(arguments[1]),
  };
})(eval('var x = 2'), {}).then(
  'x*=10; this.y=1',
  function () {
    return {
    result: arguments[0],
    then:
      (function (this_context) {
        function (expression, continuation) {
          return (function (expression, continuation) {return continuation(eval(expression), this)}).call(this_context, expression, continuation);
        }
      })(arguments[1]),
    };
  }
).then(
  'x+=3;',
  function () {
    return {
    result: arguments[0],
    then:
      (function (this_context) {
        function (expression, continuation) {
          return (function (expression, continuation) {
            return continuation(eval(expression), this)
          }).call(this_context, expression, continuation);
        }
      })(arguments[1]),

    };
  }
).then(
  'x*=10;var arr = []; for (var name in this) if (this.hasOwnProperty(name)) arr.push(name);arr.length;"" + x + " " + arr.toString() + " " + expression',
  function () {
    return {
    result: arguments[0],
    then:
      (function (this_context) {
        function (expression, continuation) {
          return (function (expression, continuation) {return continuation(eval(expression), this)}).call(this_context, expression, continuation);
        }
      })(arguments[1]),
    };
  }
).result;</div>
        </div>
        <div class="yui3-aceEditor">
          <div class="yui3-aceEditor-value" data-ace-read-only="true">}</div>
        </div>
      </div>
		<div class="yui3-widget-ft"></div>
	
  </div>

  <script src="<?php echo $YUI_CONFIG; ?>" type="text/javascript"></script>

  <script src="<?php echo $YUI; ?>" type="text/javascript"></script>

    <script type="text/javascript">
    
     // For some weird reason, I can't just make a single '.use' call.  I have to stage the loading.
     YUI({debug: <?php echo $PRODUCTION ? "false" : "true" ?>})
          .use('ranran-base', 'console')
          .use('node', 'dd-plugin', 'yui-ace-editor')
          .use('editor-panel', 'worker', 'worker-test', 'message-processor-test', 'collapsible-parent-panel', 'history-manager', 'history-manager-test', 'repl-panel', 'panel-manager', 'panel-manager-test', function(Y) {

       repl_panel = new Y.RanRan.REPLPanel({
         srcNode: '#collapsible-panel',
         render: true,
         collapsed: false,
         worker: new Y.RanRan.Worker(),
         y: 150,
       });

	     panel = new Y.RanRan.EditorPanel({
	       srcNode: '#editor-panel',
	       render: true,
	       collapsed: false,
         x: 400,
         y: 250,
         worker: repl_panel.get('worker'),
	     });
       
       repl_panel.get('worker').add_callout_functions({print: function () {console.log.apply(console, arguments)}});

       repl_panel.manager.create().add(panel);

	     worker = new Y.RanRan.Worker();
       Y.use('test-console', function (Y) {
         new Y.Test.Console().render();
         Y.Test.Runner.run();
         window.Y = Y;
       });
	  });
	</script>
  </body>
</html>
