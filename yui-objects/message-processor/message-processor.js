// Process a (collection of) messages with a (collection of) handlers.
//
//
// Argument: context
// =================
//
// The value that `this` should have when the handlers are called.
// If your handlers do not use `this` then you can just set it to `null`.
//
//
// Argument: handlers
// ==================
//
// Can be a function, an object, an array of functions and objects,
// or an Arguments object of functions and objects.
//
//
// Function handlers
// -----------------
//
// If the handler is a function, then the handler is called for every
// message in the following way.
//
//  * string "message":
//
//        handler("message_id")
//
//  * object message {message_id: message_data}:
//
//        handler("message_id", message_data}
//
//
// Object handlers
// ---------------
//
// If the handler is an object, then it must be of the form:
//
//     {
//         message_id_a: callback_a,
//         message_id_b: [callback_b1, callback_b2],
//     }
//
// For each message, the callback or Array of callbacks
// with matching message id is looked up.
//
// If the lookup returns a callback, that callback is called.
// If the lookup returns an array of callbacks,
// each callback is called in sequence.
//
// The way the callback is called depends on the message:
//
//  * string "message":
//
//        callback();
//
//  * object {message_id: message_data} (where data is **not** an array):
//
//        callback(message_data);
//
//  * object {message_id: [message_datum_1, message_datum2]}:
//
//        callback(message_datum_1, message_datum_2);
//
// Thus, if you want to pass an Array as a single argument to the callback,
// you have to wrap it in another Array:
//
//  * object {message_id: [[data_list_1, data_list_2]]}
//
//        callback([data_list_1, data_list_2]);
//
// Arrays of handlers or Arguments objects of handlers
// --------------------------------------------------
//
// An Array of handlers or an Arguments objects of handlers will be
// called in sequence.  For each handler, iterate through all
// the messages.
//
// Argument: messages
// ==================
//
// Can be a string, an object, or an array of strings and objects
// or an Arguments object of strings and objects.
//
//
// Object messages
// ---------------
//
// An object is treated as a collection of messages:
//
//     {message: message_data, another_message: more_message_data}
//
// The messages within the object can be handled in any order.
//
//
// String messages
// ---------------
//
// A string is treated as a message without any attached data.
//
//
// List of messages or Arguments object of messages
// ------------------------------------------------
//
// An Array or Arguments objects is treated as a sequence of messages
// to be handled in order.
// So, for example, if the message is:
//
//     ["message_id_1",
//      {message_id_2a: message_data_2a,
//       message_id_2b: message_data_2b},
//      {message_id_3: message_data_3}]
//
// message_id_1 will be handled first
// and message_id_3 will be handled last.
//
// message_id_2a and message_id_2b will be handled
// after message_id_1 and before message_id_3,
// but the ordering of message_id_2a and message_id_2b
// is not specified.
//
//
// Optional argument: ignore_missing_handlers
// ==========================================
//
// By default, process_messages assumes that
// you want every message to be handled at least once.
// If a message is not handled, it will raise an exception.
//
// If that is not the behaviour you want,
// set this flag to true.
//
//
// Sequencing
// ==========
//
// process_messages iterates though the sequence of handlers
//
// For each handler, it iterates through the sequence of messages and,
// when appropriate, calls processes the message with the handler.
//
// If the handler is an Array of callbacks then, for each time
// it processes a message with this handler, it iterates through
// the Array of callbacks and calls each callback with the message.
//
//
// Using class instances as handlers
// =================================
//
// You can use an instance of a class as a message handler.
// If you do this, be sure to set the context argument
// appropriately.
//
//
// Using class instances as messages
// =================================
//
// Only the properties directly define on that object will be used.
// In other words, the object's prototype is ignored.
// (This ensures that monkey-patching Object will
// not screw up your message handler.)
//
// Using class instances as messages is probably
// not a good idea, but if you must,
// you should consider cloning the object first.
//
//     function clone_object(object) {
//         var clone = {};
//         for (var property in object) {
//           clone[property] = object[property];
//         }
//         return clone;
//     }
//
//
// Examples
// ========
//
// Empty arguments
// ---------------
//
//     process_messages(this, [], [])
//
// does nothing
//
//     process_messages(this, [], 'message', true)
//
// does nothing
//
//     process_messages(this, [], 'message')
//
// throws an unhandled message exception
//
//
// Handler function, string message
// --------------------------------
//
//     process_messages(this, print, 'message');
//
// has same effect as:
//
//     print('message');
//
//
// Handler function, object messages
// ---------------------------------
//
//     process_messages(this, print, {a:1, b:[2, 3]});
//
// has same effect as:
//
//     print('a', 1); print('b', [2, 3]);
//
// or:
//
//     print('b', 1); print('a', [2, 3]);
//
// (the order is not defined for objects)
//
// Note that the Array [2, 3] is passed to the function unchanged.
// This is not the case for object handlers.
//
//
// Handler function, Array of messages
// -----------------------------------
//
//     process_messages(this, print, ['a', {b:1, c:2}, 'd']);
//
// has the same effect as:
//
//     print('a');
//     print('b', 1); print('c', 2); // or print('b', 1); print('c', 2);
//     print('d');
//
//
// Handler object (single callback), string message
// ------------------------------------------------
//
//     process_messages(this, {n: newline}, 'n');
//
// has the same effect as:
//
//     newline();
//
// 
// Handler object (single callback), object messages
// -------------------------------------------------
//
//     process_messages(
//         this,
//         {p: print, t: type}.
//         [{p: 1, t: [2]},
//          {p: [1]},
//          {p: [3, 4]},
//          {t: []},
//          {t: [[5]]}
//         ]
//     );
//
// has the same effect as:
//
//     print(1); type(2); // or type(2); print(1);
//     print(1);
//     print(3, 4);
//     type();
//     type(5);
//
// Note that the elements of the Array [3, 4]
// are passed to the callback as separate arguments.
// This is not the case for function handlers.
//
// Also note that:
//
//     {p: 1} and {p: [1]}
//
// are handled in the same way; that:
//
//     {t: []}
//
// results in a function call with no arguments;
// and that it is still possible to pass an Array as
// an argument like this:
//
//     {t: [[5]]}
//
//
// Handler object (Array of callbacks), string message
// --------------------------------------------------
//
//     process_messages(this, {a: [print, type]}, {a: 1});
//
// has the same effect as:
//
//     print(1);
//     type(1);
//
//
// Array of handlers, Array of messages, sequencing
// ------------------------------------------------
//
//     var accumulator = "";
//
//     var append = function (s) {accumulator += s.toLowerCase()};
//     var APPEND = function (s) {accumulator += s.toUpperCase()};
//
//     process_messages(this, [append, APPEND], ["a", "a", "b"])
//
// results in accumulator looking like this:
//
//     "aabAAB"
//
// Note that 'append' handled every message before APPEND did.
//
//
// Arguments objects
// -----------------
//
// Arguments objects are handled like Arrays.
// This example is the same as the preceding example,
// but uses Arguments objects instead of Arrays.
//
//     var accumulator = "";
//
//     var append = function (s) {accumulator += s.toLowerCase()};
//     var APPEND = function (s) {accumulator += s.toUpperCase()};
//
//     (function (handlers) {
//       (function (messages) {
//         process_messages(this, messages, handlers)
//       }) ([append, APPEND]);
//     })("a", "a", "b")
//
// results in accumulator looking like this:
//
//     "aabAAB"
//
//
// Array of handler objects (Arrays of callbacks), Array of messages, sequencing
// -----------------------------------------------------------------------------
//
//     var accumulator = "";
//
//     var append = {
//         ab: [function () {accumulator += 'a'},
//              function () {accumulator += 'b'}],
//         cd: [function () {accumulator += 'c'},
//              function () {accumulator += 'd'}]
//     };
//
//     var APPEND = {
//         ab: [function () {accumulator += 'A'},
//              function () {accumulator += 'B'}],
//         cd: [function () {accumulator += 'C'},
//              function () {accumulator += 'D'}]
//     };
//
//     process_messages(this, [append, APPEND], ['ab', 'cd']);
//
// results in the accumulator looking like this:
//
//     'abcdABCD'
//
// Class instances as handlers
// ---------------------------
//
//     function Prefixer(prefix) {
//         this.prefix = prefix;
//         this.method = function(s) {
//           this.print_with_prefix(s);
//         };
//     }
//
//     Prefixer.prototype.print_with_prefix = function (s) {
//         return print(this.prefix + s);
//     });
//
//     var hello_prefixer = new Prefixer('Hello, ');
//
//     process_messages(
//         hello_prefixer, 
//         hello_prefixer,
//         [{print_with_prefix: 'world!'},
//          {method: 'Dolly!'}]
//     );
//
// has the same effect as:
//
//     prefixer.print_with_prefix('world!');
//     prefixer.method('Dolly!');
//
// Note that hello_prefixer is passed as both the context and the handler.
// You will need this to call any methods that use "this".
// If you are using multiple class instances as handlers,
// you'll have to be creative.
//
//
// Class instances as messages
// ---------------------------
//
//     function Prefixer(prefix) {
//         this.prefix = prefix;
//         this.method = function (s) {
//           this.print_with_prefix(s);
//         };
//     }
//
//     Prefixer.prototype.print_with_prefix = function (s) {
//         return print(this.prefix + s);
//     });
//
//     var hello_prefixer = new Prefixer('Hello, ');
//
//     var handler = {
//         prefix: function () {print("prefix was called");},
//         method: function () {print("method was called");},
//         print_with_prefix: function () {print("print_with_prefix was called");}
//     };
//
//     process_messages(this, handler, hello_prefixer);
//
// has the same effect as:
//
//     print("prefix was called"); print("method was called");
//
// or:
//
//     print("method was called"); print("prefix was called");
//
// Notice that the "print_with_prefix" method is ignored.

(function () {
  function normalize_to_list(argument) {
    if (argument instanceof Array) {
      return argument;
    }
    if (typeof argument === "object" && 
        argument.constructor === Object &&
        !argument.hasOwnProperty(toString) &&
        argument.toString() === "[object Arguments]"
    ) {
      return Array.prototype.slice.call(argument);
    }
    return [argument];
  }

  function process_messages(context, handlers, messages, ignore_missing_handlers) {
    // Check for the commonest calling errors
    if (arguments.length < 3) {
      throw TypeError('Y.RanRan.Worker: process_messages: need context, messages and handlers');
    }
    if (messages === undefined) {
      throw TypeError('Y.RanRan.Worker: process_messages: messages is undefined');
    } else if (handlers === undefined) {
      throw TypeError('Y.RanRan.Worker: process_messages: handlers is undefined');
    }

    // normalise a handler object or function to a list of callbacks
    var handler_list = normalize_to_list(handlers);
    var callbacks = [];

    // accumulate a set of all handler_names, so that we can quickly check for
    // messages that cannot be handled
    var check_handler_names = ignore_missing_handlers ? false : {};
  
    for (var handler_index = 0; handler_index < handler_list.length; handler_index++) {
      var handler = handler_list[handler_index];
      // normalise the handler object or function to a callback
      var callback;
      // put the handler in a closure, so the generated
      // callbacks each point to a different version of handler
      (function (handler) {
        if (typeof(handler) === "function") {
          // there is no risk of unhandled callbacks
          check_handler_names = false;
          // we already have the function we need, so we just
          // need to make sure it's applied in the correct context
          // and handles plain strings appropriately
          callback = function (message_name, message_data) {
            if (arguments.length === 1) {
              handler.call(context, message_name);
            } else {
              handler.call(context, message_name, message_data);
            }
          };
        } else {
          // if we are checking for missing handlers
          // we need to add this handler's message_names
          // to the set
          if (check_handler_names) {
            for (var handler_name in handler) {
              check_handler_names[handler_name] = true;
            }
          }
          // the callback is a function that looks up the correct function(s)
          // in the handler object
          callback = function(message_name, message_data) {
            var handler_data = handler[message_name];
            if (typeof(handler_data) !== "undefined") {
              // normalise function(s) to a list, and iterate through the list
              var function_list = [].concat(handler_data);
              for (var function_list_index = 0; function_list_index < function_list.length; ++function_list_index) {
                handler_function = function_list[function_list_index];
                if (arguments.length === 1) {
                  handler_function.call(context)
                } else {
                  handler_function.apply(context, [].concat(message_data));
                }
              }
            }
          }
        }
      })(handler);
      callbacks.push(callback);
    }
        
    // normalise the messages to a list
    var message_list = normalize_to_list(messages);
  
    // check for any missing handlers
    if (check_handler_names) {
      var missing_handlers = false;
      function check_name(message_name) {
        if (!check_handler_names[message_name]) {
          if (!missing_handlers) {
            missing_handlers = {};
          }
          missing_handlers[message_name] = true;
        }
      }
      for (var i = 0; i < message_list.length; ++i) {
        var message = message_list[i];
        if (typeof(message) === "string") {
          check_name(message);
        } else {
          for (var message_name in message) {
            if (message.hasOwnProperty(message_name)) {
              check_name(message_name);
            }
          }
        }
      }
      if (missing_handlers) {
        error_message = "Y.RanRan.Worker: process_messages: no message handler for:"
        for (var message_name in missing_handlers) {
          if (missing_handlers.hasOwnProperty(message_name)) {
            error_message += " '"+message_name+"'";
          }
        }
        throw new TypeError(error_message);
      }
    }

    // process the messages with the callbacks  
    for (var callback_index = 0; callback_index < callbacks.length; ++callback_index) {
      var callback = callbacks[callback_index];
      for (var message_index = 0; message_index < message_list.length; ++message_index) {
        var message_object = message_list[message_index];
        if (typeof(message_object) === "string") {
          callback(message_object);
        } else {
          for (message_name in message_object) {
            // protection from monkey patched Object prototype
            if (message_object.hasOwnProperty(message_name)) {
              var message_data = message_object[message_name]
              callback(message_name, message_data);
            }
          }
        }
      }
    }
  }

  // If YUI is defined, add the function to YUI's RanRan namespace.
  // If it isn't, assume we are in a WebWorker, and
  // export it to the global namespace.
  if (typeof(YUI) !== 'undefined') {
    YUI.add('message-processor', function (Y) {
      Y.namespace("RanRan");
      Y.RanRan.process_messages = process_messages;
    });
  } else {
    self.process_messages = process_messages;
  }
})();
