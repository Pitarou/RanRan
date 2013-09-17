
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
//   new Y.RanRan.Worker({workerDefinitionPath: 'path/to/this/file/worker.js'})
//
////////////////////////////////////


// The following lines are run only when the code
// is executed in a worker context.

if (typeof(window) === 'undefined' && typeof(global) === 'undefined') {

  // Absolute bare minimum needed to initialise a bootstrapping worker

  onmessage = function (event) {eval(event.data);};

} else {

// The rest of the code is run in the context that created
// the worker.

  (function () {

    var WORKER = 'worker';
    var WORKER_GROUP_NAME = WORKER;
    var WORKER_MODULE_NAME = WORKER;

    function get_path_for_this_file() {
      var group = YUI_config.groups[WORKER_GROUP_NAME];
      var base = group.base;
      var path = group.modules[WORKER_MODULE_NAME].path;
      return base + path;
    }
    
    function arguments_to_array(arg_list) {
      return Array.prototype.slice.call(arg_list);
    }
    
    YUI.add(WORKER, function (Y) {
      Y.namespace('RanRan');
      Y.RanRan.Worker = Y.Base.create(WORKER, Y.Base, [], {
        initializer: function () {
          if (this.get('simulated')) {
            this._create_simulated_worker();
          } else {
            this._create_worker();
          }
          this._add_definitions();
        },

        destructor: function () {
          this._worker.terminate();
        },
        
        
        // I'll be wanting to get rid of this soon.
        post_message: function () {
          this._post_message.apply(this, arguments);
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
        
        add_callbacks: function () {
          this.post('add_callbacks', arguments);
        },
        call_callbacks: function () {
          this.post('call_callbacks', arguments);
        },
        eval_and_assign_globals: function () {
          this.post('eval_and_assign_globals', arguments);
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
          this._worker = {
            postMessage: function (data) {
              onmessage({data: data});
            },
            addEventListener: function (event, listener) {
              if (event === "message") {
                this.onmessage = listener;
              }
            },
            terminate: function() {
            },
          };          
          var worker = this._worker;
          postMessage = function (data) {
            worker.onmessage(data);
          };
          
          // Same definition as given in the worker's
          // context at the top of this file.
          onmessage = function (event) {
            var data = event.data;
            try {
              eval(data);
            } catch (e) {
              console.log(e);
              console.log('when evaluating:', data);
            }
          };
        },
        
        _add_definitions: function () {
          var handler = function (name, definition) {
            this._worker.postMessage(name + ' = ' + definition);
          };
          var definitions = this.get('definitions');
          Y.RanRan.process_messages(this, handler, definitions);
        },
      }, {
        ATTRS: {

          workerDefinitionPath: {
            value: get_path_for_this_file(),
          },
          
          simulated: {value: false},

          definitions: {value:
            [
              {
                process_messages: Y.RanRan.process_messages,

                arguments_to_array: arguments_to_array,

                callbacks: '{}',
                
                handlers: '{}',

              },
            
              {
                eval_and_assign_globals: function () {
                  var definitions = arguments_to_array(arguments);
                  var handler = function (name, definition) {
                    eval(name + " = " + definition);
                  };
                  process_messages(self, handler, definitions);
                },
            
                add_callbacks: function () {
                  var definitions = arguments_to_array(arguments);
                  var handler = function (name, definition) {
                    var new_callback = eval('('+definition+')');
                    if (!this.hasOwnProperty(name)) {
                      this[name] = [];
                    }
                    this[name].push(new_callback);
                  };
                  process_messages(self.callbacks, handler, definitions);
                },

                call_callbacks: function () {
                  var messages = arguments_to_array(arguments);
                  process_messages(self.callbacks, self.callbacks, messages);
                },

                handler: '{\n'+
                  'eval_and_assign_globals: eval_and_assign_globals, '+
                  'add_callbacks: add_callbacks, '+
                  'call_callbacks: call_callbacks, '+
                '}',
              },
              {
                onmessage: function (event) {
                  var message = event.data;
                  process_messages(this, handler, message);
                },
              },
            ],
          },
        },
      });
    }, '0.1', {requires: ['message-processor', 'base']});
  })();
}
