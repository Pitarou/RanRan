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
    },

    syncUI: function () {
      Y.RanRan.CollapsibleParentPanel.prototype.syncUI.apply(this, arguments);
      this.each(Y.bind(function (child) {
        if (child.get('focused')) {
          this.set('focusedElement', child);
        }
      }, this));
    },
    
    _getChildrenFromMarkup: function () {
      return this.get('contentBox').all('.yui3-widget-bd .yui3-aceEditor');
    },
     
    _getCode: function() {
      var code = '';
      this.each(function (child) {
        code += child.getValue()
      });
      return code;
    },
     
    _compile: function() {
      var code = this._getCode();
      var worker = this.get('worker');
      if (false) {
        
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
	  var compiled = this.get('compiled');
	  this.getButton('compile').set('disabled', compiled);
	  var run = this.getButton('run');
	  if (run) {
	    run.set('disabled', !compiled);
	  }
	},
	
	_afterChildEdited : function() {
	  this.fire('edited');
	},
    
	_onEdited : function () {
	  this.set('compiled', false);
	},
	
  }, {
    // static properties
    ATTRS : {
	    compiled: false,
      worker: false,
      defaultChildType: {value: Y.RanRan.AceEditor,},
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
