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
  
  var unprivileged_function_definitions = {};
  var privileged_functions = {};
  // Define this at global scope to facilitate testing.
  functions = {};
  var eval_closure = undefined;
  var timeout_handles = [];

  function update_functions() {
    var closure = create_sandboxed_scope();
    functions = closure.functions;
    eval_closure = closure.eval;
  }

  function eval_and_return_results(code) {
    return eval_closure(code);
  }

  function add_timeout_handle(handle) {
    timeout_handles.push(handle);
  }

  function clear_timeout_handles () {
    postMessage({clear_timeout_handles: timeout_handles});
    timeout_handles = [];
  }


  var handler = {
    add_handlers: function () {
      function add_handler_handler(name, definition) {
        var code = 'handler["' + name + '"] = ' + definition;
        eval(code);
      }
      process_messages(this, add_handler_handler, arguments);
    },
  
    eval_and_assign_globals: function () {
      var handler = function (name, definition) {
        eval(name + " = " + definition);
      };
      process_messages(self, handler, arguments);
    },

    add_unprivileged_functions: function () {
      var handler = function (name, definition) {
        this[name] = definition;
        postMessage({function_added: {function_name: name, privileged: false}});
      };
      process_messages(unprivileged_function_definitions, handler, arguments);
      update_functions();
    },

    add_privileged_functions: function () {
      var handler = function (name, definition) {
        this[name] = eval('('+definition+')');
        postMessage({function_added: {function_name: name, privileged: true}});
      }
      process_messages(privileged_functions, handler, arguments);
      update_functions();
    },

    call_functions: function () {
      var handler = [
        {
          timeout_handle: add_timeout_handle,
        },
        {
          functions: 
            function () {
              process_messages(functions, self.functions, arguments);
            },
        },
      ];
      process_messages(this, handler, arguments);
      clear_timeout_handles();
    },
    
    eval: function () {
      var results = [];
      var handler = [
        {
          timeout_handle: add_timeout_handle,
        },
        {
          code: function (code) {
            var result = eval_and_return_results(code);
            results.push(result);
          },
        },
      ];
      process_messages(this, handler, arguments);
      clear_timeout_handles();
      postMessage({eval_results: results});
    },
  };

  function check_for_bad_messages(message_type) {
    if (!handler.hasOwnProperty(message_type)) {
      throw new TypeError("Y.RanRan.Worker: no message handler for: '" + message_type + "'");
    }
  }

  var last_message_type = 'initialization';

  var message_handling_pipeline = [
    function (message_type) {last_message_type = message_type},
    check_for_bad_messages,
    handler,
  ];
  
  function onmessage(event) {
    try {
      process_messages(this, message_handling_pipeline, event.data);
    } catch (e) {
      onexception(e);
    }
  };
  
  function callout(name, args) {
    var message_obj = {};
    if (args.toString() === "[object Arguments]") {
      args = arguments_to_array(args);
    }
    message_obj[name] = args;
    postMessage({respond: message_obj});
  };

  function onexception(e) {
    var exception_object = {};
    if (e.name) {
      exception_object.name = e.name;
    }
    if (e.message) {
      exception_object.message = e.message;
    }
    if (typeof(e) === 'string') {
      exception_object.message = e;
    }
    exception_object.message_type = last_message_type;
    clear_timeout_handles();
    postMessage({exception: exception_object});
  };

  var names_globally_visible_inside_worker = [
    'arguments_to_array',
    'unprivileged_function_definitions',
    'privileged_functions',
    'functions',
    'handler',
    'onmessage',
    'callout',
    'create_sandboxed_scope',
  ];

  var taboo_names = [
    'postMessage',
    'onmessage',
    'importScripts',
    'self',
    'arguments',
  ];
  
  // Create a scope in which the unprivileged functions
  // can only see what I want them to see.  Evaluate the definitions.
  // Return the functions.
  //
  // The script to eval should look something like this:
  //
  //   (function (
  //     privileged1, // these will be bound to the external definitions in the closure
  //     privileged2,
  //     unprivileged1, // these will be defined inside the closure
  //     unprivileged2,
  //     arguments_to_array, // these are left undefined
  //     unprivileged_function_definitions,
  //     privileged_functions,
  //     functions,
  //     ...,
  //     postMessage, // as are these
  //     onmessage,
  //     importScripts,
  //     self
  //   ) {
  //     privileged1 = this.privileged_functions.privileged1;
  //     privileged2 = this.privileged_functions.privileged2;
  //
  //     unprivileged1 = function (args) { ... definition of function 1 ...};
  //     unprivileged2 = function (args) { ... definition of function 2 ...};
  //     
  //     return {
  //       functions: {
  //         privileged1: privileged1,
  //         privileged2: privileged2,
  //         unprivileged1: unprivileged1,
  //         unprivileged2: unprivileged2,
  //       },
  //       eval: function () {
  //         return eval(arguments[0]);
  //       },
  //     };
  //   })();
  function create_sandboxed_scope() {
    var unprivileged_names = Object.keys(unprivileged_function_definitions);
    var privileged_names = Object.keys(privileged_functions);
    var banned_names = names_globally_visible_inside_worker.concat(taboo_names);
    var arg_list = privileged_names.concat(unprivileged_names).concat(banned_names);
    var arg_list = '  ' + arg_list.join(',\n  ') + '\n';
    var privileged_definitions = '';
    var unprivileged_definitions = '';
    var functions = '';   
    for (var i = 0; i < privileged_names.length; ++i) {
      var name = privileged_names[i];
      privileged_definitions += '  ' + name + ' = this.privileged_functions.' + name + ';\n';
      functions += '      ' + name + ': ' + name + ',\n';
    }
    for (var i = 0; i < privileged_names.length; ++i) {
      privileged_names[i] = '  privileged_functions.' + privileged_functions[i];
    }
    for (var i = 0; i < unprivileged_names.length; ++i) {
      var name = unprivileged_names[i];
      unprivileged_definitions += '  ' + name + ' = ' + unprivileged_function_definitions[name] + ';\n';
      functions += '      ' + name + ': ' + name + ',\n';
    };

    var code = 
      '(function (\n' + arg_list + ') {\n' +
      privileged_definitions + '\n' +
      unprivileged_definitions + '\n' +
      '  return {\n' +
      '    functions: {\n' +
      functions + '    },\n' +
      '    eval: function () {\n' +
      '      return eval(arguments[0]);\n' +
      '    },\n' +
      '  };\n' +
      '})();';
    return eval(code);
  }
  
  function make_worker_definitions_globally_visible() {
    var names = names_globally_visible_inside_worker;
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
    update_functions();
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
    //
    // If the function was defined like this:
    // 
    //   function isEven(x) {return x%2 === 0}
    //
    // then remove the 'isEven' bit from the string. 
    function convert_functions_to_strings(object) {
      if (typeof(object) === 'function') {
        return object.toString().replace(/^\s*function\s+\w+\s*\(/, 'function (');
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
        // Add a method to this.timeout_modifying that passes
        // the method in with timeout other than
        // the default timeout.
        //
        // Record the function, so it can be rebooted later.
        _add_functions: function (message_type, new_functions) {
          var stringified_functions = convert_functions_to_strings(new_functions);
          this._post_message_and_record_for_reboot(
            message_type,
            stringified_functions
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
          process_messages(this, register, new_functions);
        },

        add_functions: function () {
          var new_functions = arguments_to_array(arguments);
          this._add_functions('add_unprivileged_functions', new_functions);
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

        _timeout_message: function(timeout_period) {
          var sT = this.get('_mockSetTimeout') || setTimeout;
          var timeout_handler = this.get('customTimeoutHandler') ||
                                Y.bind(this._default_timeout_handler, this);
          var timeout_handle = sT(timeout_handler, timeout_period);
          this._timeout_handles[timeout_handle] = true;
          return {timeout_handle: timeout_handle};
        },

        _call_functions_with_timeout_period: function (functions, timeout_period) {
          var message_content = this._timeout_message(timeout_period);
          message_content.functions = functions;
          this._post_message('call_functions', message_content);
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
            this._add_functions('add_privileged_functions', message);
          }
          process_messages(this, register, arguments);
        },

        eval: function (code, timeout_period) {
          timeout_period = timeout_period || this.get('defaultTimeoutPeriod');
          var message_content = this._timeout_message(timeout_period);
          message_content.code = code;
          this._post_message('eval', message_content);
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
            eval_results: function (result) {
              this.fire('evalResult', {result: result});
            },
          },
          {
            respond: function () {
              process_messages(this, this._responders, arguments);
            },
          },
          {
            exception: function (e) {
              this.fire('exception', e);
            },
          },
          {
            function_added: function (e) {
              this.fire('functionAdded', e);
            }
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
          defaultTimeoutPeriod: {
            value: 100, // milliseconds
          },
          customTimeoutHandler: {
            value: false,
          },
          exceptionHandler: {
            valueFn: function () {return this._default_exception_handler},
          },
        },
      });
    }, '0.1', {requires: ['message-processor', 'base']});
  }
})();
