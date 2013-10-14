YUI.add(
  'repl-panel',
  function (Y) {
    Y.namespace('RanRan');
    var REPL_PANEL = 'replpanel';
    var REPL_LINE_CLASS = Y.ClassNameManager.getClassName(REPL_PANEL, 'repl');
    var REPL_INPUT_CLASS = Y.ClassNameManager.getClassName(REPL_PANEL, 'repl', 'input');
    var REPL_RESPONSE_CLASS = Y.ClassNameManager.getClassName(REPL_PANEL, 'repl', 'response');
    var REPL_OK_CLASS = Y.ClassNameManager.getClassName(REPL_PANEL, 'repl', 'response', 'ok');
    var REPL_ERROR_CLASS = Y.ClassNameManager.getClassName(REPL_PANEL, 'repl', 'response', 'error');
    var REPL_UNDEFINED_CLASS = Y.ClassNameManager.getClassName(REPL_PANEL, 'repl', 'response', 'undefined');
    var REPL_TIMEOUT_CLASS = Y.ClassNameManager.getClassName(REPL_PANEL, 'repl', 'response', 'timeout');
    
    Y.RanRan.REPLPanel = Y.Base.create(REPL_PANEL, Y.RanRan.CollapsibleParentPanel, [], {
      initializer: function () {
        this._history = new Y.RanRan.HistoryManager();
        this._editor = new Y.RanRan.AceEditor(this._get_editor_configuration());
        this._set_evaluator_continuations();
      },

      bindUI: function () {
        Y.RanRan.CollapsibleParentPanel.prototype.bindUI.apply(this, arguments);
        this._editor.on('edited', Y.bind(this._on_editor_edited, this));
        this.after('workerChange', Y.bind(this._after_workerChange, this));
      },

      syncUI: function () {
        Y.RanRan.CollapsibleParentPanel.prototype.syncUI.apply(this, arguments);
        this._after_workerChange();
        this.addWidgetChild(this._editor);
        this._newline();
      },
      
      _get_editor_configuration: function () {
        return {
          initialValue: '',
          commands: [
            {
              name: 'eval',
              bindKey: {mac: 'Enter', win: 'Enter'},
              exec: Y.bind(this._eval, this),
            },
            {
              name: 'history_backwards',
              bindKey: {mac: 'Up|Ctrl-P', win: 'Up'},
              exec: Y.bind(this._history_backwards, this),
            },
            {
              name: 'history_forwards',
              bindKey: {mac: 'Down|Ctrl-N', win: 'Down'},
              exec: Y.bind(this._history_forwards, this),
            },
          ],
        }
      },

      _history_to_current: function () {
        this._history_item = this._history.head;
      },

      _sync_editor: function () {
        var text = this._history_item.text;
        if (text === false) {
          text = this._current;
        }
        this._editor.suppressChangedEvent()
                    .setValue(text)
                    .clearSelection();
      },

      _newline: function () {
        var editor = this._editor;
        this._history_to_current();
        this._current = '';
        this._sync_editor();
        this.addWidgetChild(editor); // pushes it to the bottom
        this.scrollToBottom();
        this.set('focusedElement', editor);
      },

      _clear: function () {
        this.get('contentBox')
            .all('.' + REPL_LINE_CLASS)
            .each(function (node) {node.remove();});
        this._newline();
      },

      _set_default_evaluator: function () {
        this._evaluator = function (line) {
          try {
            var result = eval(line);
            if (result === undefined) {
              this._evaluator_continuations['undefined']();
            } else {
              this._evaluator_continuations['result'](result);
            }
          } catch (e) {
            this._evaluator_continuations['error'](e);
          }
        }
      },

      _set_worker_evaluator: function () {
        var worker = this.get('worker');
        worker.on(
          'worker:timeout',
          this._evaluator_continuations['timeout']
        );
        worker.set(
          'exceptionHandler',
          this._evaluator_continuations['error']
        );
        var result_handler = Y.bind(
          function (e) {
            var result = e.result;
            if (result === undefined) {
              this._evaluator_continuations['undefined']();
            } else {
              var continuation = this._evaluator_continuations['result'];
              continuation(result);
            }
          },
          this
        );
        worker.on('worker:evalResult', result_handler);
        this._evaluator = function (line) {
          worker.eval(line);
        }
      },

      _add_repl_line: function (classes, content) {
        var node = Y.Node.create('<div>');
        node.addClass(REPL_LINE_CLASS);
        for (var i = 0; i < classes.length; ++i) {
          node.addClass(classes[i]);
        };
        node.appendChild(content);
        this.addDOMContent(node);
        this._newline();
      },

      _set_evaluator_continuations: function () {
        this._evaluator_continuations = {
          'result': Y.bind(
            function (result) {
              this._add_repl_line(
                [REPL_RESPONSE_CLASS, REPL_OK_CLASS],
                Y.Escape.html(result)
              );
            },
            this
          ),
          'error': Y.bind(
            function (e) {
              this._add_repl_line(
                [REPL_RESPONSE_CLASS, REPL_ERROR_CLASS],
                Y.Escape.html(e.message)
              );
            },
            this
          ),
          'undefined': Y.bind(
            function () {
              this._add_repl_line(
                [REPL_RESPONSE_CLASS, REPL_UNDEFINED_CLASS],
                'ok'
              );
            },
            this
          ),
          'timeout': Y.bind(
            function () {
              this._add_repl_line(
                [REPL_RESPONSE_CLASS, REPL_TIMEOUT_CLASS],
                'timed out &mdash; ' +
                'had to reset, so any changes you made here have been forgotten'
              );
            },
            this
          ),
        };
      },

      _set_evaluator: function () {
        if (this.get('worker')) {
          this._set_worker_evaluator();
        } else {
          this._set_default_evaluator();
        }
      },
      
      _eval: function () {
        var editor = this._editor;
        var line = editor.getValue().trim();
        var worker = this.get('worker');
        if (line) {
          this._history.add(line);
          this._add_repl_line([REPL_INPUT_CLASS], Y.Escape.html(line));
          this._evaluator(line);
        }
      },

      _history_forwards: function () {
        var item = this._history_item;
        if (item.text === false) {
          return;
        }
        this._history_item = item.next;
        this._sync_editor();
      },

      _history_backwards: function () {
        var item = this._history_item.previous;
        if (item.text === false) {
          return;
        }
        this._history_item = item;
        this._sync_editor()
      },

      _on_editor_edited: function () {
        this._history_to_current();
        this._current = this._editor.getValue();
      },

      _after_workerChange: function () {
        this._set_evaluator();
      },

    }, {
      ATTRS: {
        worker: {
          value: false,
        },
        buttons: {
          valueFn: function () {return [
            {
              name: 'collapse',
              value: 'Collapse',
              section: Y.WidgetStdMod.HEADER,
              action: Y.bind(this._toggle_collapsed, this),
              classNames: [Y.RanRan.CollapsibleParentPanel.COLLAPSE_BUTTON_CLASSNAME],
            },
            {
              name: 'clear',
              value: 'Clear',
              section: Y.WidgetStdMod.FOOTER,
              action: Y.bind(this._clear, this),
              classNames: [],
            },
          ]},
        },
      },
    })
  },
  '0.1',
  {requires: [
    'collapsible-parent-panel',
    'yui-ace-editor',
    'history-manager',
    'escape',
  ]}
);
