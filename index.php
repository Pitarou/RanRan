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
    <li>Add a REPL panel</li>
	  <li>Integrate Web Workers</li>
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
          <div class="yui3-aceEditor-value" data-ace-flexbox="true" data-ace-show-gutter="true">// Everybody's favourite esoteric language.
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
    
     // For some weird reason, I have to stage the loading in this sequence or ace-editor breaks.	 
     YUI().use('ranran-base', 'console').use('node', 'dd-plugin', 'yui-ace-editor').use('editor-panel', 'worker', 'worker-test', 'message-processor-test', 'collapsible-parent-panel', function(Y) {

	     panel = new Y.RanRan.EditorPanel({
	       srcNode: '#editor-panel',
	       render: true,
	       collapsed: true,
	     });

       repl_panel = new Y.RanRan.CollapsibleParentPanel({
         srcNode: '#collapsible-panel',
         render: true,
         collapsed: false,
       });

       repl_panel.current = '';
       repl_panel.history = [];
       repl_panel.history_place = 0;
       
       repl_panel.newLine = function(editor) {
         repl_panel.addWidgetChild(editor);
         repl_panel.scrollToBottom();
         editor.focus();
       };
       
       repl_panel.eval = function() {
         var editor = this.item(0);
         var value = editor.getValue().trim();
         if (value) {
           var result = eval(value);
           this.remove(0);
           this.addDOMContent(Y.Escape.html(value) + '</br>');
           this.addDOMContent(Y.Escape.html(result) + '</br>');
           if (this.history_place === this.history.length) {
             this.history.push(this.current);
           }
           this.current = '';
           this.history_place = this.history.length;
           editor.suppressEditedEvent(true)
                 .revert()
                 .suppressEditedEvent(false);
           this.newLine(editor);
         }
       };

       repl_panel.recall_history = function (place) {
         var editor = this.item(0);
         history = this.history;
         place = this.history_place;
         var new_value = place === history.length ? this.current : history[place];
         editor.suppressEditedEvent(true)
               .setValue(new_value)
               .suppressEditedEvent(false)
               .clearSelection();
       };

       repl_panel.history_forwards = function () {
         var new_history_place = this.history_place + 1;
         if (new_history_place <= this.history.length) {
           this.history_place = new_history_place;
           this.recall_history();
         }
       }

       repl_panel.history_back = function () {
         if (this.history_place) {
           this.history_place--;
           this.recall_history();
         }
       };

       var eval_command = {
         name: 'eval',
         bindKey: {mac: 'Enter', win: 'Enter'},
         exec: function () {repl_panel.eval();},
       };
       
       var history_back_command = {
         name: 'history_back',
         bindKey: {mac: 'Up|Ctrl-P', win: 'Up'},
         exec: function () {repl_panel.history_back()},
       };

       var history_forwards_command = {
        name: 'history_forward',
        bindKey: {mac: 'Down|Ctrl-N', win: 'Down'},
        exec: function () {repl_panel.history_forwards()},
       };

       var editor_config = {
         initialValue: '',
         commands: [history_back_command, history_forwards_command, eval_command],
        };

        var repl_editor = new Y.RanRan.AceEditor(editor_config);

        repl_editor.on('edited', function () {
          repl_panel.history_place = repl_panel.history.length;
          repl_panel.current = repl_editor.getValue();
        });

       repl_panel.newLine(repl_editor);

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
