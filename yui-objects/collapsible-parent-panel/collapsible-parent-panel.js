YUI.add('collapsible-parent-panel', function (Y) {

  var COLLAPSIBLE_PARENT_PANEL = 'collapsibleparentpanel';
  var COLLAPSED_CLASSNAME = Y.ClassNameManager.getClassName(COLLAPSIBLE_PARENT_PANEL, 'collapsed');
  var COLLAPSE_BUTTON_CLASSNAME = Y.ClassNameManager.getClassName(COLLAPSIBLE_PARENT_PANEL, 'button', 'collapse');

  Y.namespace('RanRan');
  Y.RanRan.CollapsibleParentPanel = Y.Base.create('collapsibleparentpanel', Y.Panel, [Y.WidgetParent], {
    initializer: function () {
      this._addChildren();
    },

    render: function () {
      Y.Panel.prototype.render.call(this);
      // Borrow the css styling from the console buttons
      var button_sections = this.get('buttons');
      for (section_name in button_sections) {
        var button_list = button_sections[section_name];
        for (var i = button_list.length; i--;) {
          button_list[i].replaceClass('yui3-button', 'yui3-console-button');
        }
      }
    },

    bindUI: function () {
      this.plug(Y.Plugin.Drag);
      this.dd.addHandle('.yui3-widget-hd');
      this.dd.plug(Y.Plugin.DDConstrained, {constrain: true});
      this.plug(Y.Plugin.Resize);
      this.resize.on('resize:resize', Y.bind(this._resizeChildren, this));
      this.resize.set('defMinWidth', this.get('minWidth'));
      this.resize.set('autoHide', true);
      this.after('collapsedChange', Y.bind(this._afterCollapsedChange, this));
    },

    syncUI: function () {
      if (this.get('collapsed')) {
        this._afterCollapsedChange();
      };
    },

    _addChildren: function () {
      var parent = this;
      var children = this._getChildren();
      children.each(function (child) {
        parent.add({
          contentBox: child,
          render: true,
        });
      });
    },

    _getChildren: function () {return new Y.NodeList()},

    _resizeChildren: function () {},

    _afterCollapsedChange: function () {
      var boundingBox = this.get('boundingBox');
      if (this.get('collapsed')) {
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

    _toggle_collapsed: function() {
      this.set('collapsed', !this.get('collapsed'));
    },
    
  },
  {
    ATTRS: {
      minWidth: {
        value: 200,
      },
      expandedWidth: {
        value: 300,
      },
      width: {
        value: 300,
      },
      height: {
        value: 300,
      },
      collapsed: {
        value: false,
      },
		  buttons: {valueFn: function () {return [
		    {
			    name: 'collapse',
			    value: 'Collapse',
			    section: Y.WidgetStdMod.HEADER,
			    action: Y.bind(this._toggle_collapsed, this),
			    classNames: [COLLAPSE_BUTTON_CLASSNAME],
		    },
      ]}},
    },
  });
}, '0.1', {requires: [
  'panel',
  'console-css',
  'collapsible-parent-panel-css',
  'widget-parent',
  'dd-plugin',
  'dd-constrain',
  'resize-plugin',
]});
