YUI.add('editor-panel', function (Y) {
  Y.RanRan.ChildEditor = Y.Base.create('childEditor', Y.RanRan.AceEditor, [Y.WidgetChild], {
    // prototype properties
  }, {
    // static properties   
  });
  
  var EDITORPANEL = 'editorpanel';
  var DEFAULT_MIN_WIDTH = Y.RanRan.Config.DEFAULT_MIN_WIDTH;
  var DEFAULT_WIDTH = Y.RanRan.Config.DEFAULT_WIDTH;
  var INITIAL_HEIGHT = Y.RanRan.Config.DEFAULT_INITIAL_HEIGHT;
  var COLLAPSED_CLASSNAME = Y.ClassNameManager.getClassName(EDITORPANEL, 'collapsed');
  var COLLAPSE_BUTTON_CLASSNAME = Y.ClassNameManager.getClassName(EDITORPANEL, 'button', 'collapse');
  
  Y.RanRan.EditorPanel = Y.Base.create(EDITORPANEL, Y.Panel, [Y.WidgetParent], {
  
    initializer: function () {
	    if (!this.get('width')) {
        this.set('width', this.get('minWidth'));
      }
      this._addChildren();
    },
     
    syncUI: function () {
      if (this.get('collapsed')) {
        this._after_collapsedChange();
      }
    },
	 
    // Borrow the buttons styling from the Console widget.
    render: function() {
      Y.Panel.prototype.render.call(this);
      var button_sections = this.get('buttons');
      for (section_name in button_sections) {
        var button_list = button_sections[section_name];
      for (var i = button_list.length; i--;) {
       button_list[i].replaceClass('yui3-button', 'yui3-console-button');
      }
     }
    },
    
    bindUI: function() {
      this.plug(Y.Plugin.Drag);
      this.dd.addHandle('.yui3-widget-hd');
      this.dd.plug(Y.Plugin.DDConstrained, {constrain: true});
      this.plug(Y.Plugin.Resize);
      this.resize.on('resize:resize', Y.bind(this._resizeChildren, this));
      this.resize.set('defMinWidth', this.get('minWidth'));
      this.resize.set('autoHide', true);
      this.after('collapsedChange', Y.bind(this._after_collapsedChange, this));
      this.after('compiledChange', Y.bind(this._after_compiledChange, this));
      var parent = this;
      this.each(function (child) {
        child.after('edited', Y.bind(parent._afterChildEdited, parent));
       });
       this.on('edited', Y.bind(this._onEdited, this));
     },
    
     _addChildren: function() {
      var parent = this;
      var children = this.get('contentBox').all('.yui3-widget-bd .yui3-aceEditor');
      children.each(function (child) {
        parent.add({
          contentBox: child,
          render: true,
        });
      });
     },
     
     _resizeChildren: function() {
       this.each(function(child) {
         if (child.name === "childEditor") child.doResize();
       });
     },
     
     _getCode: function() {
       var code = "";
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
    
    _toggle_collapsed: function() {
      this.set('collapsed', !this.get('collapsed'));
    },
    
    _after_collapsedChange: function () {
      var collapsed = this.get('collapsed');
      var boundingBox = this.get('boundingBox');
      if (collapsed) {
        this.set('expandedWidth', boundingBox.get('offsetWidth'));
        boundingBox.set('offsetWidth', this.get('minWidth'));
        boundingBox.addClass(COLLAPSED_CLASSNAME);
        this.getButton('collapse').set('text', 'Expand');
      } else {
        boundingBox.removeClass(COLLAPSED_CLASSNAME);
        boundingBox.set('offsetWidth', this.get('expandedWidth'));
        this.getButton('collapse').set('text', 'Collapse');
        this._resizeChildren();
      }
      var height = this.getStdModNode(Y.WidgetStdMod.HEADER).get('offsetHeight') +
                   this.getStdModNode(Y.WidgetStdMod.BODY).get('offsetHeight') +
                   this.getStdModNode(Y.WidgetStdMod.FOOTER).get('offsetHeight');
      boundingBox.set('offsetHeight', height);
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
      height: {value: INITIAL_HEIGHT},
	  minWidth: {value: DEFAULT_MIN_WIDTH},
      defaultChildType: {value: Y.RanRan.ChildEditor,},
      collapsed: {value: false,},
		  buttons: {valueFn: function () {return [
		    {
			    name: 'collapse',
			    value: "Collapse",
			    section: Y.WidgetStdMod.HEADER,
			    action: Y.bind(this._toggle_collapsed, this),
			    classNames: [COLLAPSE_BUTTON_CLASSNAME],
		    },
		    {
			  name: 'compile',
		      value: "Compile",
		      section: Y.WidgetStdMod.FOOTER,
		      action: Y.bind(this._compile, this),
		      classNames: [],
		    },
		    {
			  name: 'run',
		      value: "Run",
		      section: Y.WidgetStdMod.FOOTER,
		      action: Y.bind(this._run, this),
		      classNames: [],
			  disabled: true,
		    },
		  ]},},
    },  
  });
}, '0.1', {requires: [
	'console-css',
	'yui-ace-editor', 
	'widget-parent', 
	'widget-child', 
	'panel', 
	'dd-plugin',
	'dd-constrain',
	'resize-plugin', 
	'editor-panel-css', 
	'ranran-base',
]});
