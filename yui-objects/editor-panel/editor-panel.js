YUI.add('editor-panel', function (Y) {
  var EDITORPANEL = 'editorpanel';
  var DEFAULT_MIN_WIDTH = Y.RanRan.Config.DEFAULT_MIN_WIDTH;
  var DEFAULT_WIDTH = Y.RanRan.Config.DEFAULT_WIDTH;
  var INITIAL_HEIGHT = Y.RanRan.Config.DEFAULT_INITIAL_HEIGHT;
  var COLLAPSE_BUTTON_CLASSNAME = Y.ClassNameManager.getClassName(EDITORPANEL, 'button', 'collapse');
  
  Y.RanRan.EditorPanel = Y.Base.create(EDITORPANEL, Y.RanRan.CollapsibleParentPanel, [], {
  
    bindUI: function() {
      Y.RanRan.CollapsibleParentPanel.prototype.bindUI.call(this);
      this.after('compiledChange', Y.bind(this._after_compiledChange, this));
      var parent = this;
      this.each(function (child) {
        child.after('edited', Y.bind(parent._afterChildEdited, parent));
      });
      this.on('edited', Y.bind(this._onEdited, this));
    },
    
    _getChildren: function () {
      return this.get('contentBox').all('.yui3-widget-bd .yui3-aceEditor');
    },
     
    _resizeChildren: function() {
      this.each(function(child) {
        if (child.name === 'aceEditor') child.doResize();
      });
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
      try {
        var compiled = eval(code);
      } catch (e) {
        Y.log(e, 'warn', 'compile');
        return;
      }
       this._compiled = compiled;
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
      defaultChildType: {value: Y.RanRan.AceEditor,},
		  buttons: {valueFn: function () {return [
		    {
			    name: 'collapse',
			    value: 'Collapse',
			    section: Y.WidgetStdMod.HEADER,
			    action: Y.bind(this._toggle_collapsed, this),
			    classNames: [COLLAPSE_BUTTON_CLASSNAME],
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
		  ]},},
    },  
  });
}, '0.1', {requires: [
	'yui-ace-editor', 
	'collapsible-parent-panel',
  'editor-panel-css',
]});
