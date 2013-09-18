<?php
require_once('config.php');
?>

<!DOCTYPE html>
<html>
  <head>
    <title>Integrating Ace Editor into YUI3</title>
  </head>
  <body class="yui3-skin-sam">
    <h1>Integrating Ace Editor into YUI3</h1>
    <h2>Next steps</h2>
	<ul>
	  <li>Fix what happens when a windows is created in a collapsed state.</li>
	  <li>Fix the drag handles being the wrong size on creation.</li>
	  <li>Raise an appropriate signal so that when the <tt>EditorPanel</tt> and 
	      <tt>Console</tt> are expanded the position constraints are triggered.
		  (I've got a hack for the <tt>EditorPanel</tt>, but it's not exactly satisfactory,
		  and I'm not sure the same solution will work for the console.)</li>
	  <li>Integrate Web Workers</li>
	  <li>Improve Flexbox compatibility for older browsers</li>
	</ul>
    <div id="console"></div>
	<div id="editor-panel">
		<div class="yui3-widget-hd">Editor&nbsp;Panel</div>
		<div class="yui3-widget-bd">
		  <div class="yui3-aceEditor">
		    <div class="yui3-aceEditor-value" data-ace-read-only="true">(function ()
{</div>
		  </div>
		  <div class="yui3-aceEditor">
		    <div class="yui3-aceEditor-value">// Brainfuck: everybody's favourite esoteric language.
// Learn more at: http://en.wikipedia.org/wiki/Brainfuck

function brainfuck(source, input) {
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

console.log(brainfuck('++++++++++[>+++++++>++++++++++>+++>+<<<<-]>++.>+.+++++++..+++.>++.<<+++++++++++++++.>.+++.------.--------.>+.>.[[-],.]', "This message brought to you by Brainfuck 2."));
        
        </div>
		  <div class="yui3-aceEditor">
		    <div class="yui3-aceEditor-value" data-ace-read-only="true">})</div>
		  </div>
      </div>
		</div>
		<div class="yui3-widget-ft"></div>
    </div>

    <script src="<?php echo $YUI_CONFIG; ?>" type="text/javascript"></script>

    <script src="<?php echo $YUI; ?>" type="text/javascript"></script>

    <script type="text/javascript">
    
     // For some weird reason, I have to stage the loading in this sequence or ace-editor breaks.	 
     YUI().use('ranran-base', 'console').use('node', 'dd-plugin', 'yui-ace-editor').use('editor-panel', 'worker', 'worker-test', 'message-processor-test', function(Y) {
       cons = new Y.Console({
		     plugins: [Y.Plugin.Resize, Y.Plugin.Drag],
		     render: '#console',
	     });
       cons.dd.addHandle('.yui3-console-hd');
	     cons.dd.plug([Y.Plugin.DDConstrained], {constrain: true});
       cons.resize.set('autoHide', true);
	     cons.resize.set('defMinWidth', Y.RanRan.Config.DEFAULT_MIN_WIDTH);
	     cons._collapseExpandWidth = function() {
	       if (this.get('collapsed')) {
		       this.set('expandedWidth', this.get('width'));
		       this.set('width', this.resize.get('defMinWidth'));
		     } else {
		       this.set('width', this.get('expandedWidth'));
		     }
	     };
	     cons.after('collapsedChange', Y.bind(cons._collapseExpandWidth, cons));

	     panel = new Y.RanRan.EditorPanel({
	       srcNode: '#editor-panel',
	       render: true,
	       collapsed: true,
	     });
	     worker = new Y.RanRan.Worker({simulated: true});
       Y.use('test-console', function (Y) {
         new Y.Test.Console().render();
         Y.Test.Runner.run();
         window.Y = Y;
       });
	  });
	</script>

  </body>
</html>
