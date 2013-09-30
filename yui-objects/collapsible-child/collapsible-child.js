YUI.add('collapsible-child', function (Y) {
  Y.namespace('RanRan');
  Y.RanRan.CollapsibleChild = Y.Base.create('collapsiblechild', Y.Widget, [Y.WidgetChild], {
    doResize: function () {
      if (this._doResize) {
        this._doResize();
      }
    },
    }, {
    }
  );
}, '0.1', {requires: ['widget', 'widget-child', 'collapsible-child-css']});
