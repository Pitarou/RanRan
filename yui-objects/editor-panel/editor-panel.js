YUI.add('editor-panel', function (Y) {
  var EDITORPANEL = 'editorpanel';
  var DEFAULT_MIN_WIDTH = Y.RanRan.Config.DEFAULT_MIN_WIDTH;
  var DEFAULT_WIDTH = Y.RanRan.Config.DEFAULT_WIDTH;
  var INITIAL_HEIGHT = Y.RanRan.Config.DEFAULT_INITIAL_HEIGHT;
  
  Y.RanRan.EditorPanel = Y.Base.create(EDITORPANEL, Y.RanRan.CollapsibleParentPanel, [], {
  
    bindUI: function() {
      Y.RanRan.CollapsibleParentPanel.prototype.bindUI.call(this);
      this.after('compiledChange', Y.bind(this._after_compiledChange, this));
      var me = this;
      this.each(function (child) {
        child.after('edited', Y.bind(me._afterChildEdited, me));
      });
      this.on('edited', Y.bind(this._onEdited, this));
      this.after('compilableChange', Y.bind(this._afterCompilableChange, this));
      this.each(Y.bind(
        function (child) {
          child.on('changeAnnotation', Y.bind(this._on_changeAnnotation, this, child));
        },
        this
      ));
    },

    syncUI: function () {
      Y.RanRan.CollapsibleParentPanel.prototype.syncUI.apply(this, arguments);
      var focused;
      this.each(Y.bind(function (child) {
        if (child.get('focused')) {
          this.set('focusedElement', child);
        }
      }, this));
      this._on_changeAnnotation();
    },
    
    _getChildrenFromMarkup: function () {
      return this.get('contentBox').all('.yui3-widget-bd .yui3-aceEditor');
    },

    _getCodeBlocks: function () {
      var blocks = [];
      this.each(function (child) {blocks.push(child.getValue())});
      return blocks;
    },
     
    _getCode: function() {
      return this._getCodeBlocks().join('\n');
    },
     
    _compile: function() {
      var code = this._getCode();
      var worker = this.get('worker');
      if (worker) {
        var function_definition = {};
        function_definition[this.get('title')] = code;
        worker.add_functions(function_definition);
      } else {
        try {
          var compiled = eval(code);
        } catch (e) {
          Y.log(e, 'warn', 'compile');
          return;
        }
        this._compiled = compiled;
      }
	   this.set('compiled', true);
    },
    
    _run: function() {
      try {
        this._compiled();
      } catch (e) {
        Y.log(e, 'error', 'run');
      }
    },
    
	_after_compiledChange: function() {
    this._set_compile_button_active_status();
	},
	
	_afterChildEdited : function() {
	  this.fire('edited');
	},
    
	_onEdited : function () {
	  this.set('compiled', false);
	},

  _get_annotations_of_editable_sections: function () {
    var annotations = [];
    this.each(function (child) {
      if (!child.get('readOnly')) {
        annotations = annotations.concat(child._session.getAnnotations());
      }
    });
    return annotations;
  },

  _on_changeAnnotation: function () {
    var annotations = this._get_annotations_of_editable_sections();
    var error = false;
    for (var i = 0; i < annotations.length; ++i) {
      if (annotations[i].type === 'error') {
        error = true;
        break;
      }
    }
    this.set('compilable', !error);
  },

  _set_compile_button_active_status: function () {
    var button = this.getButton('compile');
    button.set('disabled', this.get('compiled') || !this.get('compilable'));
  },
      
  _afterCompilableChange: function () {
    this._set_compile_button_active_status();
  },

  }, {
    // static properties
    ATTRS : {
	    compiled: false,
      compilable: true,
      worker: false,
      defaultChildType: {value: Y.RanRan.AceEditor,},
      functionName: {value: 'run',},
		  buttons: {valueFn: function () {return [
		    {
			    name: 'collapse',
			    value: 'Collapse',
			    section: Y.WidgetStdMod.HEADER,
			    action: Y.bind(this._toggle_collapsed, this),
			    classNames: [Y.RanRan.CollapsibleParentPanel.COLLAPSE_BUTTON_CLASSNAME],
		    },
		    {
			  name: 'compile',
		      value: 'Compile',
		      section: Y.WidgetStdMod.FOOTER,
		      action: Y.bind(this._compile, this),
		      classNames: [],
		    },
		    {
			  name: 'run',
		      value: 'Run',
		      section: Y.WidgetStdMod.FOOTER,
		      action: Y.bind(this._run, this),
		      classNames: [],
			  disabled: true,
		    },
		  ]},
      },
    },  
  });
}, '0.1', {requires: [
	'yui-ace-editor', 
	'collapsible-parent-panel',
  'editor-panel-css',
]});
