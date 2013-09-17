YUI.add("yui-ace-editor", function(Y) {

    var AceEditor = function (config) {
      AceEditor.superclass.constructor.apply(this, arguments);
    }
    AceEditor.NAME = "aceEditor";
	  AceEditor.INPUT_CLASS = Y.ClassNameManager.getClassName(AceEditor.NAME, "value");
	  AceEditor.EDITOR_NODE_TEMPLATE = "<div>{value}</div>";
	  AceEditor.DEFAULT_READ_ONLY_THEME = "dawn";
	  AceEditor.DEFAULT_EDITABLE_THEME = "monokai";

    /*
     * The attribute configuration for the widget. This defines the core user facing state of the widget
     */
    AceEditor.ATTRS = {
      initialValue : {value: "default content",},
      theme: {value: null,},
		  mode: {value: 'javascript',},
		  readOnly: {value: false,},
		  fontSize: {value: 12,},
    };
    
    
    // Returns false for null, undefined, "false", "0", "00.00", and so on.
    // Returns true for anything else.
    var get_boolean_value = function (srcNode, value_name) {
      var value = get_text_value(srcNode, value_name);
      if (!value) return null;
      return value ? value.toLowerCase() !== "false" && parseFloat(value) !== 0
                   : null
    };
    
    var get_text_value = function (srcNode, value_name) {
      var value = srcNode.one('.'+AceEditor.INPUT_CLASS).getAttribute('data-ace-' +value_name);
      return value ? value : null;
    };
    
    var get_numeric_value = function (srcNode, value_name) {
      var value = parseFloat(get_text_value(srcNode, value_name));
      return isNaN(value) ? null : value;
    };

    AceEditor.HTML_PARSER = {
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
    };

    /* MyWidget extends the base Widget class */
    Y.extend(AceEditor, Y.Widget, {
      initializer: function() {
            /*
             * initializer is part of the lifecycle introduced by
             * the Base class. It is invoked during construction,
             * and can be used to setup instance specific state or publish events which
             * require special configuration (if they don't need custom configuration,
             * events are published lazily only if there are subscribers).
             *
             * It does not need to invoke the superclass initializer.
             * init() will call initializer() for all classes in the hierarchy.
             */
      },

      destructor : function() {
            /*
             * destructor is part of the lifecycle introduced by
             * the Widget class. It is invoked during destruction,
             * and can be used to cleanup instance specific state.
             *
             * Anything under the boundingBox will be cleaned up by the Widget base class
             * We only need to clean up nodes/events attached outside of the bounding Box
             *
             * It does not need to invoke the superclass destructor.
             * destroy() will call initializer() for all classes in the hierarchy.
             */
      },

      renderUI : function() {
            /*
             * renderUI is part of the lifecycle introduced by the
             * Widget class. Widget's renderer method invokes:
             *
             *     renderUI()
             *     bindUI()
             *     syncUI()
             *
             * renderUI is intended to be used by the Widget subclass
             * to create or insert new elements into the DOM.
             */
			   var contentBox = this.get("contentBox");
			   this._aceNode = contentBox.one('.'+AceEditor.INPUT_CLASS);
			   if (!this._aceNode) {
			     this._aceNode = Y.Node.create(Y.Lang.sub(AceEditor.EDITOR_NODE_TEMPLATE, {value: this.get('initialValue')}));
			     this._aceNode.addClass(AceEditor.INPUT_CLASS);
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
        this.after('themeChange', Y.bind(this._setEditorTheme, this));
        this.after('modeChange', Y.bind(this._setEditorMode, this));
        this.after('readOnlyChange', Y.bind(function () {
          this._setReadOnlyStatus();
          this._renderer.updateFull();
        }, this));
        this.after('fontSizeChange', Y.bind(this._setEditorFontSize, this));
		this._editor.on('change', Y.bind(this._onEditorChange, this));
	  },

      syncUI : function() {
        this._setEditorMode();
        this._setEditorFontSize();
        this._setReadOnlyStatus();
      },
      _setEditorTheme : function() {
        var theme = this.get('theme');
        if (!theme) {
          theme = this.get('readOnly') ? AceEditor.DEFAULT_READ_ONLY_THEME 
                                       : AceEditor.DEFAULT_EDITABLE_THEME;
        }
        this._editor.setTheme('ace/theme/' + theme);
      },
      _setReadOnlyStatus : function () {
        var readOnly = this.get('readOnly');
        this._editor.setReadOnly(readOnly);
        this._editor.setHighlightActiveLine(!readOnly);
        this._setEditorTheme();
        this._renderer.setShowGutter(!readOnly);
        if (readOnly) {
          this._renderer.hideCursor();
        } else {
          this._renderer.showCursor();
        }
        var classNameSuffixes = {true: 'readOnly', false: 'editable'};
        var oldClass = this.getClassName(classNameSuffixes[!readOnly]);
        var newClass = this.getClassName(classNameSuffixes[readOnly]);
        this.get('contentBox').ancestor().replaceClass(oldClass, newClass);
        this._setScreenRows();
      },
      _setEditorMode : function () {
        this._session.setMode('ace/mode/' + this.get('mode'));
      },
      _setEditorFontSize: function () {
        this._editor.setFontSize(this.get('fontSize'));
        this._setScreenRows();
      },
      _setScreenRows: function() {
        if (this.get('readOnly')) {
          var rows = this._session.getScreenLength();
          this.get('contentBox').setStyle('height', rows+'em');
        }
      },
	  
	  _onEditorChange: function () {
		this.fire('edited');
	  },
		  getValue : function() {
        return this._editor.getValue();
	    },
	    setValue : function(new_value) {
	      this._editor.setValue(new_value);
	    },
	    revert : function() {
	      this.setValue(this.get('initialValue'));
	    },
	    doResize : function() {
	      this._editor.resize();
	      this._setScreenRows();
		  },
   });

   Y.namespace("RanRan").AceEditor = AceEditor;
}, "0.1", {requires:["widget", "ace-editor-noconflict", "yui-ace-editor-css"]});
