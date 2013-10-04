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
      var timeout_handles = [];
      var handler = {
        timeout_handle: function (handle) {
          timeout_handles.push(handle);
        },
        functions: function () {
          process_messages(self.functions, self.functions, arguments);
        },
      };
      process_messages(this, handler, arguments);
      postMessage({clear_timeout_handles: timeout_handles});
    },
  };
  
  function onmessage(event) {
    var message = event.data;
    process_messages(this, handler, message);
  };
  
  function callout(name, args) {
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
    'callout'
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
    importScripts('../message-processor/message-processor.js');
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

    // deep copy an object, converting functions to strings
    // Arrays are copied elementwise
    // Objects' own properties are copied elementwise
    function convert_functions_to_strings(object) {
      if (typeof(object) === 'function') {
        return object.toString();
      } else if (object instanceof Array) {
        var length = object.length;
        var converted = new Array(length);
        for (var i = 0; i < length; ++i) {
          converted[i] = convert_functions_to_strings(object[i]);
        }
        return converted;
      } else if (object instanceof Object) {
        var converted = {};
        for (var name in object) {
          if (object.hasOwnProperty(name)) {
            converted[name] = convert_functions_to_strings(object[name]);
          }
        }
        return converted;
      }
      return object;
    }

    YUI.add(WORKER, function (Y) {
      var process_messages = Y.RanRan.process_messages;
      Y.namespace('RanRan');
      Y.RanRan.Worker = Y.Base.create(WORKER, Y.Base, [], {
        initializer: function () {
          this._create_worker();
          this._bind_onmessage();
          this.functions = {};
          this._timeout_modifying_functions = {};
          this._responders = {};
          this._timeout_handles = {};
          this._reboot_sequence = [];
        },

        destructor: function () {
          this._worker.terminate();
        },

        reboot: function () {
          this._worker.terminate();
          this._create_worker();
          this._bind_onmessage();
          var sequence = this._reboot_sequence;
          for (var i = 0; i < sequence.length; ++i) {
            var message = sequence[i];
            // there should be only one item in the object,
            // but we need its name
            for (var name in message) {
              if (message.hasOwnProperty(name)) {
                this._post_message(name, message[name]);
              }
            }
          }
        },

        _create_worker: function() {
          if (this.get('simulated')) {
            this._create_simulated_worker();
          } else {
            this._create_real_worker();
          }
        },

        
        _post_message_and_record_for_reboot: function(name, content) {
          this._post_message(name, content);
          var record = {};
          record[name] = content;
          this._reboot_sequence.push(record);
        },
        
        _post_message: function(name, content) {
          var message = {};
          message[name] = content;
          this._worker.postMessage(message);
        },
        
        // Inject a function into the Web Worker.
        //
        // Add a method to this.functions that passes
        // a message to the Web Worker to call that function.
        // 
        // Add a method to this.timeout_modifying that calls
        // passes the method in with timeout other than
        // the default timeout.
        //
        // Record the function, so it can be rebooted later.
        add_functions: function () {
          var args = arguments_to_array(arguments);
          var stringified_args = convert_functions_to_strings(args);
          this._post_message_and_record_for_reboot(
            'add_functions',
            stringified_args
          );
          var functions = this.functions;
          var timeout_modifying = this._timeout_modifying_functions;
          function register(name, definition) {
            if (!functions.hasOwnProperty(name)) {
              var me = this;
              functions[name] = function () {
                var message = {};
                var args = arguments_to_array(arguments);
                message[name] = args;
                me._call_functions.call(me, message);
              };
              timeout_modifying[name] = function () {
                var message = {};
                var args = arguments_to_array(arguments);
                message[name] = args;
                me._call_functions_with_timeout_period.call(
                  me,
                  message,
                  this.timeoutPeriod
                );
              };
            }
          }
          process_messages(this, register, arguments);
        },
        
        _call_functions: function () {
          args = arguments_to_array(arguments);
          this._call_functions_with_timeout_period(
            arguments_to_array(args),
            this.get('defaultTimeoutPeriod')
          );
        },
        _default_timeout_handler: function () {
          this.reboot();
          this.fire('timeout');
        },
        _call_functions_with_timeout_period: function (functions, timeout_period) {
          var sT = this.get('mockSetTimeout') || setTimeout;
          var timeout_handler = this.get('customTimeoutHandler') ||
                                Y.bind(this._default_timeout_handler, this);
          var timeout_handle = sT(timeout_handler, timeout_period);
          this._timeout_handles[timeout_handle] = true;
          this._post_message(
            'call_functions',
            {
              timeout_handle: timeout_handle,
              functions: functions,
            }
          );
        },
        with_timeout_period: function(timeoutPeriod) {
          function TimeoutPeriodModifier () {
            this.timeoutPeriod = timeoutPeriod;
          }
          TimeoutPeriodModifier.prototype = this._timeout_modifying_functions;
          return new TimeoutPeriodModifier();
        },
        eval_and_assign_globals: function () {
          this._post_message_and_record_for_reboot('eval_and_assign_globals', arguments_to_array(arguments));
        },
        add_handlers: function() {
          this._post_message_and_record_for_reboot('add_handlers', arguments_to_array(arguments));
          function register(name) {
            this[name] = function () {
              this._post_message(name, arguments_to_array(arguments));
            };
          }
          process_messages(this, register, arguments);
        },
        

        add_callout_functions: function() {
          function register(name, responder) {
            this._responders[name] = responder;
            var definition =
              'function () {callout("' + name + '", arguments);}';
            var message = {};
            message[name] = definition;
            this.add_functions(message);
          }
          process_messages(this, register, arguments);
        },
        
        _create_real_worker: function () {
          var path = this.get('workerDefinitionPath');
          this._worker = new Worker(path);
        },
        
        _handler: [
          {
            clear_timeout_handles: function () {
              for (var i = 0; i < arguments.length; ++i) {
                var handle = arguments[i];
                clearTimeout(handle);
                delete this._timeout_handles[handle];
              }
            },
          },
          {
            respond: function () {
              process_messages(this, this._responders, arguments);
            },
          },
        ],        
        _bind_onmessage: function () {
          this._worker.onmessage = Y.bind(this._onmessage, this);
        },
        _onmessage: function(event) {
          var message = event.data;
          process_messages(this, this._handler, message);
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
        NAME: WORKER,
        ATTRS: {
          workerDefinitionPath: {
            value: get_path_for_this_file(),
          },
          simulated: {
            value: false,
          },
          mockSetTimeout: {
            value: false,
          },
          defaultTimeoutPeriod: {
            value: 100, // milliseconds
          },
          customTimeoutHandler: {
            value: false,
          },
        },
      });
    }, '0.1', {requires: ['message-processor', 'base']});
  }
})();
