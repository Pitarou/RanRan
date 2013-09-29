YUI.add('collapsible-parent-panel', function (Y) {
  Y.namespace('RanRan');
  Y.RanRan.CollapsibleParentPanel = Y.Base.create('collapsibleparentpanel', Y.Panel, [Y.WidgetParent], {
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
        this._afterCollapsedChanged();
      };
    },
    _resizeChildren: function () {},
    _afterCollapsedChanged: function () {
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
  'widget-child',
]});
