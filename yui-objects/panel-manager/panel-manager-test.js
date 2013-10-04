YUI.add(
  'panel-manager-test',
  function (Y) {
    
    // Test mock-up
    var Panel = function () {
      this.attributes = {zIndex: 0};
      this.handlers = {};
      this.manager = {
        create: Y.bind(function (z_min) {
          if (!arguments.length) z_min = 0;
          m = new Y.RanRan.PanelManager(z_min);
          m.add(this);
          return m;
        }, this),
      };
      this.set('focused', false);
    };
  
    Panel.prototype = {
      set: function(attribute, value) {
        this.attributes[attribute] = value;
        this.fire(attribute + 'Change');
      },

      get: function(attribute) {
        return this.attributes[attribute];
      },

      focus: function () {
        this.set('focused', true);
      },

      blur: function () {
        this.set('focused', false);
      },

      after: function (name, callback) {
        var handler = this.handlers[name];
        if (!handler) handler = [];
        handler.push(callback);
        this.handlers[name] = handler;
      },

      fire: function (name) {
        var handler = this.handlers[name];
        if (handler) {
          for (var i = 0; i < handler.length; ++i) {
            handler[i]();
          };
        }
      },
    };

    var suite = new Y.Test.Suite({
      name: 'panel-manager'
    });

    suite.add(new Y.Test.Case({
      name: 'meta tests',
      testPanelCreation: function () {
        var p = new Panel();
        Y.Assert.isObject(p.manager);
        Y.Assert.isObject(p.attributes);
        Y.Assert.areSame(0, p.attributes.zIndex);
        p.set('zIndex', 43);
        Y.Assert.areSame(43, p.get('zIndex'));
        Y.Assert.isFalse(p.get('focused'));
        var flag1 = false;
        var flag2 = false;
        var flag3 = false;
        p.after('e1', function () {flag1 = true;});
        p.after('e1', function () {flag2 = true;});
        p.after('e2', function () {flag3 = true;});
        Y.Assert.areSame(2, p.handlers.e1.length);
        Y.Assert.areSame(1, p.handlers.e2.length);
        p.fire('e1');
        Y.Assert.isTrue(flag1);
        Y.Assert.isTrue(flag2);
        Y.Assert.isFalse(flag3);
        p.fire('e2');
        Y.Assert.isTrue(flag3);
        var flag4 = false;
        var flag5 = false;
        p.after('focusedChange', function () {
          if (p.get('focused')) flag4 = true;
        });
        p.after('focusedChange', function () {
          if (!p.get('focused')) flag5 = true;
        });
        p.focus();
        Y.Assert.isTrue(p.get('focused'));
        Y.Assert.isTrue(flag4);
        Y.Assert.isFalse(flag5);
        p.blur();
        Y.Assert.isFalse(p.get('focused'));
        Y.Assert.isTrue(flag5);
        var flag6 = false;
        p.after('attributeChange', function () {flag6 = true});
        p.set('attribute', null);
        Y.Assert.isTrue(flag6);
      },
    }));

    suite.add(new Y.Test.Case({
      name: 'panel-manager creation',
      testCreateWithNoArgument: function () {
        var manager = new Y.RanRan.PanelManager();
        Y.Assert.areSame(0, manager._next_panel_id);
        Y.Assert.isList(manager._layers);
        Y.Assert.isObjext(manager._panels);
        Y.Assert.isFalse(manager._focused);
        Y.Assert.areSame(0, manager._z_min);
      },
      testCreateWithNoArgument: function () {
        Y.Assert.areSame(3, (new Y.RanRan.PanelManager(3))._z_min);
      },
    }));

    suite.add(new Y.Test.Case({
      name: 'new panel id',
      testNewPanelId: function () {
        var manager = new Y.RanRan.PanelManager();
        Y.Assert.areSame(0, manager._get_new_panel_id());
        Y.Assert.areSame(1, manager._get_new_panel_id());
        Y.Assert.areSame(2, manager._get_new_panel_id());
      },
    }));

    suite.add(new Y.Test.Case({
      name: 'add panel',
      testAddPanel: function () {
        var panel = new Panel();
        var m = panel.manager;
        var manager = new Y.RanRan.PanelManager();
        manager.add(panel);
        Y.Assert.areSame(0, m._id, 'panel id should be 0');
        Y.Assert.areSame(0, m._layer, 'panel layer should be 0');
        Y.Assert.areSame(manager, m.manager, 'panel manager should be the manager that the panel was added to');
        Y.Assert.areSame(0, panel.get('zIndex'), 'panel zIndex should be 0');
        Y.Assert.areSame(1, manager._layers.length);
        Y.Assert.areSame(panel, manager._layers[0]);
        Y.Assert.areSame(panel, manager._panels[0]);
      },

      testAddPanelWithMinZIndex: function () {
        var panel = new Panel();
        var m = panel.manager;
        var manager = new Y.RanRan.PanelManager(4);
        manager.add(panel);
        Y.Assert.areSame(0, m._id, 'panel id should be 0');
        Y.Assert.areSame(0, m._layer, 'panel layer should be 0');
        Y.Assert.areSame(manager, m.manager, 'panel manager should be the manager that the panel was added to');
        Y.Assert.areSame(4, panel.get('zIndex'), 'panel zIndex should be 4');
      },

      testAddTwoPanels: function () {
        var p1 = new Panel();
        var p2 = new Panel();
        var m = new Y.RanRan.PanelManager(5);
        m.add(p1).add(p2);
        var m1 = p1.manager;
        var m2 = p2.manager;
        Y.Assert.areSame(m1.manager, m);
        Y.Assert.areSame(m2.manager, m);
        Y.Assert.areSame(m1._id, 0);
        Y.Assert.areSame(m2._id, 1);
        Y.Assert.areSame(5, p1.get('zIndex'));
        Y.Assert.areSame(6, p2.get('zIndex'));
        Y.Assert.areSame(0, m1._layer);
        Y.Assert.areSame(1, m2._layer);
        Y.Assert.areSame(2, m._layers.length);
        Y.Assert.areSame(p1, m._layers[0]);
        Y.Assert.areSame(p2, m._layers[1]);
        Y.Assert.areSame(p1, m._panels[0]);
        Y.Assert.areSame(p2, m._panels[1]);
      },
      
      testCreateAndAddWithManagerProxy: function () {
        var p1 = new Panel();
        var p2 = new Panel();
        p1.manager.create(5);
        var m1 = p1.manager;
        m1.add(p2);
        var m2 = p2.manager;
        Y.Assert.areSame(m1.manager, m2.manager);
        Y.Assert.areSame(m1._id, 0);
        Y.Assert.areSame(m2._id, 1);
        Y.Assert.areSame(5, p1.get('zIndex'));
        Y.Assert.areSame(6, p2.get('zIndex'));
        Y.Assert.areSame(0, m1._layer);
        Y.Assert.areSame(1, m2._layer);
        Y.Assert.areSame(2, m._layers.length);
        Y.Assert.areSame(p1, m._layers[0]);
        Y.Assert.areSame(p2, m._layers[1]);
        Y.Assert.areSame(p1, m._panels[0]);
        Y.Assert.areSame(p2, m._panels[1]);
      },

      testFocus: function () {
        var p1 = new Panel();
        var p2 = new Panel();
        function is_focused(is, is_not, details) {
          Y.Assert.isTrue(is.get('focused'), 'correct one is focused ' + details);
          Y.Assert.isFalse(is_not.get('focused'), 'correct one is not focused ' + details);
          Y.Assert.areSame(is, p1.manager.manager._focused, 'manager knows which one is focused ' + details);
        }
        function is_blurred(details) {
          Y.Assert.isFalse(p1.get('focused'), 'p1 not focused ' + details);
          Y.Assert.isFalse(p2.get('focused'), 'p2 not focused ' + details);
          Y.Assert.isFalse(p1.manager.manager._focused, 'manager knows that nothing is focused' + details);
        }
        p1.manager.create().add(p2);
        p1.set('focused', true);
        is_focused(p1, p2, 'after p1 is focused for first time');
        p1.set('focused', true);
        is_focused(p1, p2, 'after p1 refocused');
        p2.focus();
        is_focused(p2, p1, 'after p2 focused');
        p2.blur();
        is_blurred('after p2 blurred');
        p2.blur();
        is_blurred('after p2 reblurred');
        p1.focus();
        p1.manager.manager.blurAll();
        is_blurred('after blurAll called on manager');
        p2.focus();
        p2.manager.blurAll();
        is_blurred('after blurAll called on manager proxy');
      },

      testBringToFront: function () {
        var p1 = new Panel();
        var p2 = new Panel();
        var p3 = new Panel();
        var p4 = new Panel();
        p1.manager.create().add(p2).add(p3).add(p4);
        function correct_order(message, order) {
          var layers = p1.manager.manager._layers;
          Y.Assert.areSame(order.length, layers.length, 'correct number of layers ' + message);
          for (var i = 0; i < order.length; ++i) {
            Y.Assert.areSame(order[i], layers[i], 'match at layer ' + i + ' ' + message);
            Y.Assert.areSame(i, layers[i].get('zIndex'), 'zIndex is correct at layer ' + i + ' ' + message);
          }
        }
        correct_order('after creation', [p1, p2, p3, p4]);
        p1.manager.manager.bringToFront(p4);
        correct_order('after bringing front to front (which does nothing)', [p1, p2, p3, p4]);
        p1.manager.manager.bringToFront(p1);
        correct_order('after bringing back to front', [p2, p3, p4, p1]);
        p3.manager.bringToFront();
        correct_order('after bringing middle to front', [p2, p4, p1, p3]);
        p4.manager.frontFocus();
        correct_order('after frontFocus', [p2, p1, p3, p4]);
        Y.Assert.isTrue(p4.get('focused'), 'focused is true after frontFocus');
      },
    }));

    Y.Test.Runner.add(suite);
  },
  '0.1',
  {requires: [
    'panel-manager',
    'test',
  ]}
);
