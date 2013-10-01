YUI.add('collapsible-child', function (Y) {

  var COLLAPSIBLE_CHILD = 'collapsiblechild';
  var FLEXBOX_CLASSNAME = Y.ClassNameManager.getClassName(COLLAPSIBLE_CHILD, 'flexbox');

  Y.namespace('RanRan');
  Y.RanRan.CollapsibleChild = Y.Base.create(COLLAPSIBLE_CHILD, Y.Widget, [Y.WidgetChild], {
    bindUI: function () {
      this.after('flexboxChange', Y.bind(this._onFlexboxChange, this));
    },

    syncUI: function () {
      if (this.get('flexbox')) {
        this._onFlexboxChange();
      }
    },

    doResize: function () {
      if (this._doResize) {
        this._doResize();
      }
    },

    _onFlexboxChange: function () {
      var boundingBox = this.get('boundingBox');
      if (this.get('flexbox')) {
        boundingBox.addClass(FLEXBOX_CLASSNAME);
      } else {
        boundingBox.removeClass(FLEXBOX_CLASSNAME);
      }
    },
  }, {
    ATTRS: {
      flexbox: {
        value: false,
      },
    },
  });
}, '0.1', {requires: ['widget', 'widget-child', 'collapsible-child-css']});
