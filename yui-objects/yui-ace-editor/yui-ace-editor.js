YUI.add('yui-ace-editor', function(Y) {

    var ACE_EDITOR = 'aceEditor';

    // Functions to parse data-ace-name='...' attributes from the
    // src node.
    var get_text_value = function (srcNode, value_name) {
      var value = srcNode.one('.'+Y.RanRan.AceEditor.INPUT_CLASS).getAttribute('data-ace-' +value_name);
      return value ? value : null;
    };

    // Returns null for null, undefined, 'false', '0', '00.00', and so on.
    // Returns true for anything else.
    var get_boolean_value = function (srcNode, value_name) {
      var value = get_text_value(srcNode, value_name);
      if (!value) return null;
      return value ? value.toLowerCase() !== 'false' && parseFloat(value) !== 0
                   : null;
    };
    
    var get_numeric_value = function (srcNode, value_name) {
      var value = parseFloat(get_text_value(srcNode, value_name));
      return isNaN(value) ? null : value;
    };

    Y.RanRan.AceEditor = Y.Base.create('aceEditor', Y.Widget, [Y.RanRan.CollapsibleChild], {
      initializer: function() {
        this._dontFireOnEditorChange = false;
      },

      destructor : function() {
      },

      renderUI : function() {
			   var contentBox = this.get('contentBox');
			   this._aceNode = contentBox.one('.'+Y.RanRan.AceEditor.INPUT_CLASS);
			   if (!this._aceNode) {
			     this._aceNode = Y.Node.create(Y.Lang.sub(Y.RanRan.AceEditor.EDITOR_NODE_TEMPLATE, {value: this.get('initialValue')}));
			     this._aceNode.addClass(Y.RanRan.AceEditor.INPUT_CLASS);
			     contentBox.append(this._aceNode);
			   }
			   this._editor = ace.edit(this._aceNode.getDOMNode());
			   this._session = this._editor.getSession();
			   this._renderer = this._editor.renderer;
			   this._session.setUseWrapMode(true);
			   this._editor.setShowPrintMargin(false);
			   this._session.setUseSoftTabs(true);
		    },

      bindUI : function() {
        Y.RanRan.CollapsibleChild.prototype.bindUI.apply(this, arguments);
        this.after('themeChange', Y.bind(this._setEditorTheme, this));
        this.after('modeChange', Y.bind(this._setEditorMode, this));
        this.after('readOnlyChange', Y.bind(function () {
          this._setReadOnlyStatus();
          this._renderer.updateFull();
        }, this));
        this.after('fontSizeChange', Y.bind(this._setEditorFontSize, this));
        this.after('flexboxChange', Y.bind(this._afterFlexboxChange, this));
        this.after('showGutterChange', Y.bind(this._afterShowGutterChange, this));
        this._editor.on('change', Y.bind(this._onEditorChange, this));
      },

      syncUI : function() {
        Y.RanRan.CollapsibleChild.prototype.syncUI.apply(this, arguments);
        this._setEditorMode();
        this._setEditorFontSize();
        this._setReadOnlyStatus();
        this._afterFlexboxChange();
        this._afterShowGutterChange();
        this._initializeCommands();
      },


      focus: function () {
        this._editor.focus();
      },

      suppressEditedEvent: function (suppress) {
        this._dontFireOnEditorChange = suppress;
        return this;
      },

      // typical command
      //
      // {
      //   name: 'dostuff',
      //   bindKey: {
      //     win: 'Ctrl-X',
      //     mac: 'Command-X',
      //   }, 
      //   exec: function () {do_it();},
      // }
      addCommand: function (command) {
        this._editor.commands.addCommand(command);
      },

      _initializeCommands: function () {
        var commands = this.get('commands');
        for (var i = 0; i < commands.length; ++i) {
          this.addCommand(commands[i]);
        }
      },

      _setEditorTheme : function() {
        var theme = this.get('theme');
        if (!theme) {
          theme = this.get('readOnly') ? Y.RanRan.AceEditor.DEFAULT_READ_ONLY_THEME 
                                       : Y.RanRan.AceEditor.DEFAULT_EDITABLE_THEME;
        }
        this._editor.setTheme('ace/theme/' + theme);
      },

      _setReadOnlyStatus : function () {
        var readOnly = this.get('readOnly');
        this._editor.setReadOnly(readOnly);
        this._editor.setHighlightActiveLine(!readOnly);
        this._setEditorTheme();
        if (readOnly) {
          this._renderer.hideCursor();
        } else {
          this._renderer.showCursor();
        }
        var classNameSuffixes = {true: 'readOnly', false: 'editable'};
        var oldClass = this.getClassName(classNameSuffixes[!readOnly]);
        var newClass = this.getClassName(classNameSuffixes[readOnly]);
        this.get('contentBox').ancestor().replaceClass(oldClass, newClass);
        this._setScreenRows(true);
      },

      _setEditorMode : function () {
        this._session.setMode('ace/mode/' + this.get('mode'));
      },

      _setEditorFontSize: function () {
        this._editor.setFontSize(this.get('fontSize'));
        this._setScreenRows();
      },

      _setScreenRows: function(first_time) {
        if (!this.get('flexbox')) {
          var rows = this._session.getScreenLength();
          if (first_time || this._screenRows !== rows) {
            this.get('contentBox').setStyle('height', rows+'em');
            this._screenRows = rows;
            this.doResize();
          }
        }
      },
	  
      _onEditorChange: function () {
        if (!this.get('flexbox')) {
          this._setScreenRows();
        }
        if (!this._dontFireOnEditorChange) {
          this.fire('edited');
        }
      },

      _afterFlexboxChange: function () {
        if (!this.get('flexbox')) {
          this._setScreenRows();
        }
      },

      _afterShowGutterChange: function () {
        this._renderer.setShowGutter(this.get('showGutter'));
        this._renderer.updateFull();
      },

		  getValue : function() {
        return this._editor.getValue();
	    },

	    setValue : function(new_value) {
	      this._editor.setValue(new_value);
        return this;
	    },

	    revert : function() {
	      this.setValue(this.get('initialValue'));
        return this;
	    },

      clearSelection: function () {
        this._editor.clearSelection();
        return this;
      },

	    _doResize : function() {
	      this._editor.resize();
	      this._setScreenRows();
		  },

    }, {
      HTML_PARSER: {
        initialValue: function (srcNode) {
          return srcNode.get('text');
        },
        readOnly: function (srcNode) {
          return get_boolean_value(srcNode, 'read-only');
        },
        theme: function(srcNode) {
          return get_text_value(srcNode, 'theme');
        },
        mode: function(srcNode) {
          return get_text_value(srcNode, 'mode');
        },
        fontSize: function(srcNode) {
          return get_numeric_value(srcNode, 'font-size');
        },
        flexbox: function(srcNode) {
          return get_boolean_value(srcNode, 'flexbox');
        },
        showGutter: function (srcNode) {
          return get_boolean_value(srcNode, 'show-gutter');
        },
      },

      NAME: ACE_EDITOR,
      INPUT_CLASS: Y.ClassNameManager.getClassName(ACE_EDITOR, 'value'),
      EDITOR_NODE_TEMPLATE: '<div>{value}</div>',
      DEFAULT_READ_ONLY_THEME: 'dawn',
      DEFAULT_EDITABLE_THEME: 'chrome',

      // The attribute configuration for the widget.
      // This defines the core user facing state of the widget
      ATTRS: {
        initialValue : {value: 'default content',},
        readOnly: {value: false,},
        theme: {value: null,},
        mode: {value: 'javascript',},
        fontSize: {value: 12,},
        flexbox: {value: false,},
        showGutter: {value: false},
        commands: {value: []},
      },
    }
  );

}, '0.1', {requires:[
  'widget',
  'ace-editor-noconflict',
  'yui-ace-editor-css',
  'collapsible-child',
]});
