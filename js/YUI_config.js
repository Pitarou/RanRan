(function () {

  // PRODUCTION overrides ADD_TESTS_BY_DEFAULT
  var PRODUCTION = false;
  var ADD_TESTS_BY_DEFAULT = false;

  // Create YUI_config.groups if it doesn't exist.

  if (typeof(YUI_config) === "undefined") YUI_config = {};
  if (typeof(YUI_config.groups) === "undefined") YUI_config.groups = {};

  // Import the Cloud9 Ace editor library.

  YUI_config.groups['ace-editor'] = {
    base: 'libraries/ace-builds-master/',
      modules: {
        'ace-editor-noconflict': {
          path: 'src-noconflict/ace.js',
      },
    },
  };

  // Helper functions to add RanRan's code
  // to YUI_config.
  //
  // They know that the code is organised as:
  //
  //   yui-objects/module-name/module-name.js
  //   yui-objects/module-name/module-name.css
  //
  // and that module-name.js requires module-name.css
  //
  // The modules are imported under the names
  // 'module-name' and 'module-name-css'
  // in the group 'module-name'

  function base_path(name) {
    return 'yui-objects/' + name + '/';
  }

  function js_name(name) {
    return name;
  }

  function js_path(name) {
    return name + '.js';
  }

  function css_name(name) {
    return name + '-css';
  }

  function css_path(name) {
    return name + '.css';
  }

  function test_name(name) {
    return name + '-test';
  }

  function test_path(name) {
    return name + '-test.js';
  }

  function add_js_module(obj, name, dependencies, css) {
    obj[js_name(name)] = {
      path: js_path(name),
      requires: css ? dependencies.concat([css_name(name)])
                    : dependencies,
    };
  }

  function add_css_module(obj, name) {
    obj[css_name(name)] = {
      path: css_path(name),
    type: 'css',
    };
  }

  function add_test_module(obj, name) {
    obj[test_name(name)] = {
      path: test_path(name),
      requires: [name],
    };    
  }

  function add_module_group(name, dependencies, css, tests) {
    if (typeof(dependencies) === "undefined") {
      dependencies = [];
      tests = [];
      css = true;
    } else if (typeof(css) === "undefined") {
      if (typeof(dependencies) === "boolean") {
        css = dependencies;
        dependencies = [];
      } else {
        css = true;
      }
    }
    
    if (PRODUCTION) {
      tests = false;
    } else if (typeof(tests) === "undefined") {
      tests = ADD_TESTS_BY_DEFAULT;
    }
    
    var modules = {};
    add_js_module(modules, name, dependencies, css);
    
    if (css) {
      add_css_module(modules, name);
    }
    if (tests) {
      add_test_module(modules, name);
    }
    YUI_config.groups[name] = {
      base: base_path(name),
      modules: modules,
    };
  }

  add_module_group('ranran-base');
  add_module_group('yui-ace-editor', [
    'widget',
    'ace-editor-noconflict',
    'collapsible-child',
  ])
  add_module_group('collapsible-child', [
    'widget',
    'widget-child',
  ])
  add_module_group('editor-panel', [
    'yui-ace-editor',
    'collapsible-parent-panel',
  ]);
  add_module_group('collapsible-parent-panel', [
    'panel',
    'console-css',
    'collapsible-parent-panel-css',
    'widget-parent',
    'dd-plugin',
    'dd-constrain',
    'resize-plugin',
    'escape',
    'managed-panel',
  ]);
  add_module_group('worker', ['message-processor', 'base'], false, true);
  add_module_group('message-processor', [], false, true);
  add_module_group('history-manager', [], false, true);
  add_module_group('repl-panel', [
    'yui-ace-editor',
    'collapsible-parent-panel',
    'history-manager',
    'escape',
  ]);
  add_module_group('managed-panel', ['widget-stack', 'panel-manager']);
  add_module_group('panel-manager', [], false, true);
})();
