YUI.add(
  'managed-panel',
  function (Y) {

    var MANAGED_PANEL = 'managedpanel';
    var CLASSNAME = Y.ClassNameManager.getClassName(MANAGED_PANEL);

    Y.namespace('RanRan');

    Y.RanRan.ManagedPanel = Y.Base.create(
      MANAGED_PANEL,
      Y.WidgetStack,
      [],
      {
        initializer: function () {
          this.manager = {
            create: Y.bind(
              function (z_min) {
                if (!arguments.length) z_min = 0;
                m = new Y.RanRan.PanelManager(z_min);
                // m will add extra properties to this.manager
                // which turn this.manager into a kind of proxy
                // for the PanelManager
                m.add(this);
                return m;
              },
              this
            ),
          };
        },
      },
      {
      }
    );

  },
  '0.1',
  {requires: [
    'widget-stack',
    'panel-manager',
  ]}
);
