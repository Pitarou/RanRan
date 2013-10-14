YUI.add('collapsible-parent-panel', function (Y) {

  var COLLAPSIBLE_PARENT_PANEL = 'collapsibleparentpanel';
  var CLASSNAME = Y.ClassNameManager.getClassName(COLLAPSIBLE_PARENT_PANEL);
  var COLLAPSED_CLASSNAME = Y.ClassNameManager.getClassName(COLLAPSIBLE_PARENT_PANEL, 'collapsed');
  var COLLAPSE_BUTTON_CLASSNAME = Y.ClassNameManager.getClassName(COLLAPSIBLE_PARENT_PANEL, 'button', 'collapse');
  
  var TITLE_CLASSNAME = Y.ClassNameManager.getClassName(COLLAPSIBLE_PARENT_PANEL, 'title');
  var SCROLLBOX_CLASSNAME = Y.ClassNameManager.getClassName(COLLAPSIBLE_PARENT_PANEL, 'scrollbox');
  var BLURRED_CLASSNAME = Y.ClassNameManager.getClassName(COLLAPSIBLE_PARENT_PANEL, 'blurred');

  Y.namespace('RanRan');
  Y.RanRan.CollapsibleParentPanel = Y.Base.create(
    'collapsibleparentpanel',
    Y.Panel, 
    [
      Y.WidgetParent,
      Y.RanRan.ManagedPanel,
    ],
    {
      initializer: function () {
        this._addChildrenFromMarkup();
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
        this.after('titleChange', Y.bind(this._afterTitleChange, this));
        this.after('focusedChange', Y.bind(this._afterFocusedChange, this));
        this.after('focusedElementChange', Y.bind(this._afterFocusedElementChange, this));
        this.get('boundingBox').on('click', Y.bind(this._afterClick, this));
        var scrollbox = this.get('contentBox').one('.'+SCROLLBOX_CLASSNAME);
        var body = this.getStdModNode(Y.WidgetStdMod.BODY);
        this._contentNode = scrollbox ? scrollbox : body;
      },

      syncUI: function () {
        if (this.get('collapsed')) {
          this._afterCollapsedChange();
        };
        var titleNode = Y.Node.create('<span>title</span>');
        titleNode.addClass(TITLE_CLASSNAME);
        this.setStdModContent(Y.WidgetStdMod.HEADER, titleNode, Y.WidgetStdMod.BEFORE);
        this._titleNode = titleNode;
        this._afterTitleChange();
        this._afterFocusedChange();
      },

      // These two method only affect the MARKUP.  They do NOT affect the underlying
      // parent--child structure.  To do that, you must use panel's .add method
      addDOMContent: function (content) {
        this._contentNode.append(content);
      },
      clearDOMContent: function () {
        this._contentNode.empty();
      },
      addWidgetContent: function (widget) {
        if (!widget.get('render')) widget.render();
        this.addDOMContent(widget.get('boundingBox'));
      },

      addWidgetChild: function (child) {
        this.add(child);
        this.addWidgetContent(child);
      },

      setScrollTop: function (scrollTop) {
        this._contentNode.getDOMNode().scrollTop = scrollTop;
      },

      getScrollTop: function () {
        return this._contentNode.getDOMNode().scrollTop;
      },


      scrollToBottom: function () {
        this.setScrollTop(1000000000);
      },

      _addChildrenFromMarkup: function () {
        var me = this;
        var children = this._getChildrenFromMarkup();
        children.each(function (child) {
          me.add({
            contentBox: child,
            render: true,
          });
        });
      },

      _getChildrenFromMarkup: function () {return new Y.NodeList()},

      _resizeChildren: function() {
        this.each(function(child) {
          if (child.doResize) child.doResize();
        });
      },
       
      _afterCollapsedChange: function () {
        var boundingBox = this.get('boundingBox');
        var collapsed = this.get('collapsed');
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
        var header = this.getStdModNode(Y.WidgetStdMod.HEADER);
        var body = this.getStdModNode(Y.WidgetStdMod.BODY);
        var footer = this.getStdModNode(Y.WidgetStdMod.FOOTER);
        var height = header ? header.get('offsetHeight') : 0;
        height += body ? body.get('offsetHeight') : 0;
        height += footer ? footer.get('offsetHeight') : 0;
        boundingBox.set('offsetHeight', height);
        if (collapsed) {
          this.blur();
        } else {
          this.focus();
        }
      },

      _toggle_collapsed: function() {
        this.set('collapsed', !this.get('collapsed'));
      },

      _afterTitleChange: function() {
        this._titleNode.setHTML(this.get('title'));
      },

      _afterFocusedChange: function(e) {
        if (this.get('focused')) {
          this._afterFocus();
        } else {
          this._afterBlur();
        }
      },

      _afterFocusedElementChange: function (e) {
        if (this.get('focused')) {
          var prevVal = e.prevVal;
          var newVal = e.newVal;
          if (prevVal) {
            prevVal.blur();
          }
          if (newVal) {
            newVal.focus();
          }
        }
      },

      _afterFocus: function() {
        // I have to add the class AFTER I place the focus
        // on the focusedElement.  I've no idea why, but it seems
        // to fix a bug....
        var focusedElement = this.get('focusedElement');
        if (focusedElement) {
          focusedElement.focus();
        }
        var boundingBox = this.get('boundingBox');
        boundingBox.removeClass(BLURRED_CLASSNAME);
      },

      _afterBlur: function () {
        // I have to remove the class AFTER I remove the focus
        // from the focusedElement.  I've no idea why, but it seems
        // to fix a bug....
        var focusedElement = this.get('focusedElement');
        if (focusedElement) {
          focusedElement.blur();
        }
        var boundingBox = this.get('boundingBox');
        boundingBox.addClass(BLURRED_CLASSNAME);
      },

      _afterClick: function () {
        this.manager.bringToFront();
        if (!(this.get('collapsed'))) {
          this.focus();
        }
      },
      
    },
    {
      COLLAPSE_BUTTON_CLASSNAME: COLLAPSE_BUTTON_CLASSNAME,

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

        title: {
          value: 'New Window',
          setter: Y.bind(Y.Escape.html, Y.Escape),
        },

        focusedElement: {
          value: false,
        },
      },

      HTML_PARSER: {
        title: function (srcNode) {
           return srcNode.getAttribute('data-'+COLLAPSIBLE_PARENT_PANEL + '-title');
        },
      },
    }
  );
}, '0.1', {requires: [
  'panel',
  'console-css',
  'collapsible-parent-panel-css',
  'widget-parent',
  'dd-plugin',
  'dd-constrain',
  'resize-plugin',
  'escape',
  'managed-panel',
]});
