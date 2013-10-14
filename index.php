<?php require_once('config.php'); ?>

<!DOCTYPE html>
<html>
  <head>
    <title>Javascript REPL and code editor using web workers</title>
  </head>
  <body class="yui3-skin-sam">
    <h1>Javascript REPL and code editor using web workers</h1>
    <h2>Next on my todo list:</h2>
	<ul>
    <li>Change worker to handle errors as an event, and add a mechanism so that different handlers can handle different errors (e.g. compilation, REPL, and 'runtime')</li>
    <li>Plug the code editor panel into the web worker</li>
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
	<div id="editor-panel" data-collapsibleparentpanel-title="Editor Panel">
		<div class="yui3-widget-hd"></div>
		<div class="yui3-widget-bd">
        <div class="yui3-aceEditor">
          <div class="yui3-aceEditor-value" data-ace-read-only="true">(function ()
  {</div>
        </div>
        <div class="yui3-aceEditor">
          <div class="yui3-aceEditor-value" data-ace-flexbox="true" data-ace-show-gutter="true" data-ace-focused="true">// Everybody's favourite esoteric language.
// Learn more at: http://en.wikipedia.org/wiki/Brainfuck

function bf(source, input) {
    var stack = [];
    var output = "";
    var input_index = 0; 
    var cells = [0];
    var c = 0;
    for (var i = 0; i < source.length; ++i) {
        var s = source[i];
        if (stack[0] === null) {
            switch (s) {
                case '[':
                    stack.unshift(null);
                    break;
                case ']':
                    stack.shift();
           }
        } else {
            switch (s) {
                case '+':
                    cells[c]++;
                    break;
                case '-':
                    cells[c]--;
                    break;
                case '>':
                    if (++c === cells.length) cells.push(0);
                    break;
                case '<':
                    if (c) c--;
                    else cells.unshift(0);
                    break;
                case '.':
                    output += String.fromCharCode(cells[c]);
                    break;
                case ',':
                    if (input_index < input.length) cells[c] = input.charCodeAt(input_index++);
                    break;
                case '[':
                    stack.unshift(cells[c] ? i : null);
                    break;
                case ']':
                    if (!stack.length) throw "unexpected ']'";
                    if (!cells[c]) stack.shift();
                    else i = stack[0];
            }
        }
    }
    if (stack.length) throw "missing ']'";
    return output;
}

console.log(bf('++++++++++[>+++++++>++++++++++>+++>+<<<<-]>++.>+.+++++++..+++.>++.<<+++++++++++++++.>.+++.------.--------.>+.>.[[-],.]', "This message brought to you by everybody's favourite esolang.")); </div>
        </div>
        <div class="yui3-aceEditor">
          <div class="yui3-aceEditor-value" data-ace-read-only="true">})</div>
        </div>
      </div>
		<div class="yui3-widget-ft"></div>
  </div>

  <script src="<?php echo $YUI_CONFIG; ?>" type="text/javascript"></script>

  <script src="<?php echo $YUI; ?>" type="text/javascript"></script>

    <script type="text/javascript">
    
     // For some weird reason, I can't just make a single '.use' call.  I have to stage the loading.
     YUI().use('ranran-base', 'console').use('node', 'dd-plugin', 'yui-ace-editor').use('editor-panel', 'worker', 'worker-test', 'message-processor-test', 'collapsible-parent-panel', 'history-manager', 'history-manager-test', 'repl-panel', 'panel-manager', 'panel-manager-test', function(Y) {

	     panel = new Y.RanRan.EditorPanel({
	       srcNode: '#editor-panel',
	       render: true,
	       collapsed: false,
         x: 400,
         y: 200,
	     });

       repl_panel = new Y.RanRan.REPLPanel({
         srcNode: '#collapsible-panel',
         render: true,
         collapsed: false,
         worker: new Y.RanRan.Worker(),
         y: 50,
       });

       repl_panel.manager.create().add(panel);

	     worker = new Y.RanRan.Worker();
       Y.use('test-console', function (Y) {
         new Y.Test.Console().render();
         //Y.Test.Runner.run();
         window.Y = Y;
       });
	  });
	</script>

  </body>
</html>
