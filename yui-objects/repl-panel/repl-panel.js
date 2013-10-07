YUI.add(
  'repl-panel',
  function (Y) {
    Y.namespace('RanRan');
    var REPL_PANEL = 'replpanel';
    
    Y.RanRan.REPLPanel = Y.Base.create(REPL_PANEL, Y.RanRan.CollapsibleParentPanel, [], {
      initializer: function () {
        this._history = new Y.RanRan.HistoryManager();
        this._editor = new Y.RanRan.AceEditor(this._get_editor_configuration());      
      },

      bindUI: function () {
        Y.RanRan.CollapsibleParentPanel.prototype.bindUI.apply(this, arguments);
        this._editor.on('edited', Y.bind(this._on_editor_edited, this));
      },

      syncUI: function () {
        Y.RanRan.CollapsibleParentPanel.prototype.syncUI.apply(this, arguments);
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
        this.addWidgetChild(editor);
        this._current = '';
        this._sync_editor();
        this.scrollToBottom();
        this.set('focusedElement', editor);
      },

      // temporary hack, for testing purposes only!
      _eval: function () {
        var editor = this._editor;
        var value = editor.getValue().trim();
        if (value) {
          var result = eval(value);
          this.remove(editor);
          this.addDOMContent(value + '<br/>');
          if (result !== undefined) {
            this.addDOMContent(result + '<br/>');
          }
          this._history.add(value);
          this._newline();
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

    }, {
    })
  },
  '0.1',
  {requires: [
    'collapsible-parent-panel',
    'yui-ace-editor',
    'history-manager',
  ]}
);
