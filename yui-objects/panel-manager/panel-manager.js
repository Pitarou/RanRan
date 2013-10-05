YUI.add(
  'panel-manager',
  function (Y) {
    Y.namespace('RanRan');
    var PANEL_MANAGER = 'panelmanager';
    var CLASSNAME = Y.ClassNameManager.getClassName(PANEL_MANAGER);

    Y.RanRan.PanelManager = function (bottom_zIndex) {
      this._next_panel_id = 0;
      this._panels = {};
      this._layers = [];
      this._z_min = arguments.length ? bottom_zIndex : 0;
      this._focused_panel = false;
    };

    Y.RanRan.PanelManager.prototype = {
      add: function (panel) {
        var id = this._get_new_panel_id();
        var layers = this._layers;
        layers.push(panel);
        panel.manager._id = id;
        panel.manager.manager = this;
        panel.manager._layer = this._layers.length - 1;
        panel.manager.add = Y.bind(this.add, this);
        panel.manager.blurAll = Y.bind(this.blurAll, this);
        panel.manager.bringToFront = Y.bind(this.bringToFront, this, panel);
        panel.manager.frontFocus = Y.bind(this.frontFocus, this, panel);
        this._panels[id] = panel;
        this._sync_zIndex_with_layer(panel);
        panel.after('focusedChange', Y.bind(this._after_panel_focusedChange, this, panel));
        this._after_panel_focusedChange(panel);
        return this;
      },

      _sync_zIndex_with_layer: function (panel) {
        panel.set('zIndex', panel.manager._layer + this._z_min);
      },

      _get_new_panel_id: function () {
        return this._next_panel_id++;
      },

      _after_panel_focusedChange: function(panel) {
        var focused = panel.get('focused');
        if (focused) {
          this._afterFocus(panel);
        } else {
          this._afterBlur(panel);
        }
      },

      _afterFocus: function (panel) {
        var focused_panel = this._focused_panel;
        if (focused_panel === panel) {
          // already focused, so do nothing
          return;
        }
        this._focused_panel = panel; 
        this._blur_all_panels_except_focused_panel();
      },


      focus: function (panel) {
        panel.set('focused', true);
        // the _afterFocus method will be triggered by
        // the panel's blurChange callback
      },

      _afterBlur: function (panel) {
        var focused_panel = this._focused_panel;
        if (focused_panel !== panel) {
          // already blurred, so do nothing
          return;
        }
        this._focused_panel = false;
      },

      blur: function (panel) {
        panel.set('focused', false);
        // the _afterBlur method will be triggered by
        // the panel's focusedChange callback
      },

      _blur_all_panels_except_focused_panel: function() {
        var focused_panel = this._focused_panel;
        var panels = this._layers;
        for (var i = 0; i < panels.length; ++i) {
          var panel = panels[i];
          if (panel !== focused_panel) {
            panel.blur();
          }
        }
      },

      blurAll: function () {
        this._focused_panel = false;
        this._blur_all_panels_except_focused_panel();
      },

      bringToFront: function (panel) {
        var layers = this._layers;
        var old_layer = panel.manager._layer;
        var new_layer = layers.length - 1;
        if (old_layer === new_layer) {
          // already at front, so nothing to do
          return;
        }
        layers.splice(old_layer, 1);
        layers.push(panel);
        for (var i = old_layer; i <= new_layer; ++i) {
          var panel = layers[i];
          panel.manager._layer = i;
          this._sync_zIndex_with_layer(panel);
        }
      },

      frontFocus: function (panel) {
        this.focus(panel);
        this.bringToFront(panel);
      },
    };
  },
  '0.1',
  {requires: []}
);
