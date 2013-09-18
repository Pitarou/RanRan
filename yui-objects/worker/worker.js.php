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
      var definitions = arguments;
      function add_handler_handler(name, definition) {
        var code = 'handler["' + name + '"] = ' + definition;
        eval(code);
      }
      process_messages(this, add_handler_handler, arguments);
    },
  
    eval_and_assign_globals: function () {
      var definitions = arguments;
      var handler = function (name, definition) {
        eval(name + " = " + definition);
      };
      process_messages(self, handler, definitions);
    },

    add_functions: function () {
     var definitions = arguments;
     var handler = function (name, definition) {
       var new_function = eval('('+definition+')');
       this[name] = new_function;
      };
      process_messages(self.functions, handler, definitions);
    },

    call_functions: function () {
     var messages = arguments;
     process_messages(self.functions, self.functions, messages);
    },
  };
  
  function onmessage(event) {
    var message = event.data;
    process_messages(this, handler, message);
  };
  
  function callback(name, args) {
    var message_obj = {};
    if (args.toString() === "[object Arguments]") {
      args = arguments_to_array(args);
    }
    message_obj[name] = args;
    postMessage({respond: message_obj});
  };
  
  var names_to_make_globally_visible = [
    'arguments_to_array',
    'functions',
    'handler',
    'onmessage',
    'callback'
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
          this._bind_onmessage();
          this.functions = {};
          this._responders = {};
        },

        destructor: function () {
          this._worker.terminate();
        },
        
        _post_message: function(name, caller_arguments) {
          var args = arguments_to_array(caller_arguments);
          var message = {};
          message[name] = args;
          this._worker.postMessage(message);
        },
        
        add_functions: function () {
          this._post_message('add_functions', arguments);
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
          process_messages(this, register, arguments);
        },
        call_functions: function () {
          this._post_message('call_functions', arguments);
        },
        eval_and_assign_globals: function () {
          this._post_message('eval_and_assign_globals', arguments);
        },
        add_handlers: function() {
          this._post_message('add_handlers', arguments);
          function register(name) {
            this[name] = function () {
              this._post_message(name, arguments);
            };
          }
          process_messages(this, register, arguments);
        },
        
        add_callback_functions: function() {
          function register(name, responder) {
            this._responders[name] = responder;
            var callback_definition =
              'function () {callback("' + name + '", arguments);}'
            ;
            var callbacks = {};
            callbacks[name] = callback_definition;
            this.add_functions(callbacks);
          }
          process_messages(this, register, arguments);
        },
        
        _create_worker: function () {
          var path = this.get('workerDefinitionPath');
          this._worker = new Worker(path);
        },
        
        _handler: {
          respond: function () {
            process_messages(this, this._responders, arguments);
          },
        },
        
        _onmessage: function(event) {
          var message = event.data;
          process_messages(this, this._handler, message);
        },
        
        _bind_onmessage: function () {
          this._worker.onmessage = Y.bind(this._onmessage, this);
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
                worker.onmessage = listener;
              }
            },
            terminate: function() {
            },
          };
          postMessage = function (data) {
            worker.onmessage({data: data});
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