<?php
  // Sorry about this ...
  require("../../config.php");
  js_header();
  // I need it because the web worker needs to know the YUI path.
  // I'll try to fix it later ...
?>

/////////////////////////////////////
//
// IMPORTANT
//
// This module depends on being able
// to find the path to its own source code listing.
// 
// The function get_path_for_this_file() will look for
// the path in YUI_config.  If that isn't working for you,
// you must set the workerDefinitionPath
// attribute when you create the worker object, like this:
//
//   new Y.RanRan.Worker({workerDefinitionPath: 'path/to/this/file/worker.js.php'})
//
////////////////////////////////////


(function () {

  function arguments_to_array(arg_list) {
    return Array.prototype.slice.call(arg_list);
  }
  
  var functions = {};

  var handler = {
    add_handlers: function () {
      var definitions = arguments_to_array(arguments);
      function add_handler_handler(name, definition) {
        var code = 'handler["' + name + '"] = ' + definition;
        eval(code);
      }
      process_messages(this, add_handler_handler, definitions);
    },
  
    eval_and_assign_globals: function () {
      var definitions = arguments_to_array(arguments);
      var handler = function (name, definition) {
        eval(name + " = " + definition);
      };
      process_messages(self, handler, definitions);
    },

    add_functions: function () {
     var definitions = arguments_to_array(arguments);
     var handler = function (name, definition) {
       var new_function = eval('('+definition+')');
        if (!this.hasOwnProperty(name)) {
         this[name] = [];
       }
       this[name].push(new_function);
      };
      process_messages(self.functions, handler, definitions);
    },

    call_functions: function () {
     var messages = arguments_to_array(arguments);
     process_messages(self.functions, self.functions, messages);
    },
  };
  
  function onmessage(event) {
    var message = event.data;
    process_messages(this, handler, message);
  };
  
  var names_to_make_globally_visible = [
    'arguments_to_array',
    'functions',
    'handler',
    'onmessage',
  ];
  
  function make_worker_definitions_globally_visible() {
    var names = names_to_make_globally_visible;
    for (var i = 0; i < names.length; ++i) {
      var name = names[i];
      self[name] = eval(name);
    }
  }


  // The following lines are run only when the code
  // is executed in a worker context.

  if (typeof(window) === 'undefined' && typeof(global) === 'undefined') {

    importScripts('<?php echo $YUI_CONFIG; ?>', '<?php echo $YUI; ?>');
  
    YUI.use('message-processor', function (Y) {
      process_messages = Y.RanRan.process_messages;
    });
    
    make_worker_definitions_globally_visible();

  } else {

  // The rest of the code is run in the context that created
  // the worker.

    var WORKER = 'worker';
    var WORKER_GROUP_NAME = WORKER;
    var WORKER_MODULE_NAME = WORKER;

    function get_path_for_this_file() {
      var group = YUI_config.groups[WORKER_GROUP_NAME];
      var base = group.base;
      var path = group.modules[WORKER_MODULE_NAME].path;
      return base + path;
    }
    
    YUI.add(WORKER, function (Y) {
      var process_messages = Y.RanRan.process_messages;
      Y.namespace('RanRan');
      Y.RanRan.Worker = Y.Base.create(WORKER, Y.Base, [], {
        initializer: function () {
          var simulated = this.get('simulated');
          if (simulated) {
            this._create_simulated_worker();
          } else {
            this._create_worker();
          }
          this.functions = [];
        },

        destructor: function () {
          this._worker.terminate();
        },
        
        _register_handler: function(handler_name) {
          this[handler_name] = function () {
            this.post(name, arguments);
          }
        },
        
        _post_message: function (message) {
          this._worker.postMessage(message);
        },

        // temporary solution
        post: function(name, caller_arguments) {
          var args = arguments_to_array(caller_arguments);
          var message = {};
          message[name] = args;
          this._post_message(message);
        },
        
        add_functions: function () {
          this.post('add_functions', arguments);
          var functions = this.functions;
          function register(name) {
            if (!functions.hasOwnProperty(name)) {
              var me = this;
              functions[name] = function () {
                var message = {};
                var args = arguments_to_array(arguments);
                message[name] = args;
                me.call_functions.call(me, message);
              };
            }
          }
          var args = arguments_to_array(arguments);
          process_messages(this, register, args);
        },
        call_functions: function () {
          this.post('call_functions', arguments);
        },
        eval_and_assign_globals: function () {
          this.post('eval_and_assign_globals', arguments);
        },
        add_handlers: function() {
          this.post('add_handlers', arguments);
          function register(name) {
            this[name] = function () {
              this.post(name, arguments);
            };
          }
          var args = arguments_to_array(arguments);
          process_messages(this, register, args);
        },
        
        _create_worker: function () {
          var path = this.get('workerDefinitionPath');
          this._worker = new Worker(path);
          this._worker.onmessage = Y.Bind(this, this._onmessage);
        },
        
        _onmessage: function(event) {
          console.log("onmessage:", event.data);
        },
        
        // Create a simulated worker that runs
        // in the same thread.
        //
        // Intended for unit testing purposes
        _create_simulated_worker: function () {
          self['process_messages'] = process_messages;
          var worker = {
            postMessage: function (data) {
              onmessage({data: data});
            },
            addEventListener: function (event, listener) {
              if (event === "message") {
                onmessage = listener;
              }
            },
            terminate: function() {
            },
          };
          postMessage = function (data) {
            worker.onmessage(data);
          };
          make_worker_definitions_globally_visible();
          this._worker = worker;
        },
      }, {
        ATTRS: {
          workerDefinitionPath: {
            value: get_path_for_this_file(),
          },
          simulated: {
            value: false
          },
        },
      });
    }, '0.1', {requires: ['message-processor', 'base']});
  }
})();
