(function() {
  YUI.add('worker-test', function (Y) {
    Y.use('test', 'worker', function (Y) {

      
      var worker_suite = new Y.Test.Suite({name: 'worker'});
    
      worker_suite.add(new Y.Test.Case({
        name: 'simulated worker',
        
        setUp: function () {
          this.worker = new Y.RanRan.Worker({simulated: true});
        },
        
        _should: {
          error: {
            testPostBadMessage: true,
          },
        },
        
        testCreate: function () {
          Y.Assert.isObject(this.worker, 'worker created');
          Y.Assert.isObject(functions, 'functions created');
          Y.Assert.isFunction(onmessage, 'simulated onmessage callback created');
          Y.Assert.isFunction(process_messages, 'process_messages created');
          Y.Assert.isFunction(postMessage, 'simulated postMessage created');
          Y.Assert.isFunction(handler.eval_and_assign_globals, 'eval_and_assign_globals created');
          Y.Assert.isFunction(handler.add_functions, 'add_functions created');
          Y.Assert.isFunction(handler.call_functions, 'call_functions created');
        },
        
        testArgumentsToArray: function () {
          Y.Assert.isFunction(arguments_to_array, 'arguments_to_array created');
          function a_t_a() {
            return arguments_to_array(arguments);
          };
          var zero_length = a_t_a();
          var one_two = a_t_a(1, 2);
          Y.Assert.isArray(zero_length, 'empty array created');
          Y.Assert.isArray(one_two, 'non-empty array created');
          Y.Assert.areSame(0, zero_length.length, 'empty array is of length 0');
          Y.Assert.areSame(2, one_two.length, 'populated array is of length 2');
          Y.Assert.areSame(1, one_two[0]), 'populated array first entry is 1';
          Y.Assert.areSame(2, one_two[1], 'populated array second entry is 2');
        },
        
        testEvalAndAssignGlobals: function () {
          this.worker.eval_and_assign_globals(
            {
              test_global1: '"data1"',
              test_global2: '"data2"',
            },
            {
              test_global3: '"data3"',
            }
          );
          Y.Assert.areSame(
            'data1',
            test_global1,
            'eval_and_assign_globals does its job once'
          );
          Y.Assert.areSame(
            'data2',
            test_global2,
            'eval_and_assign_globals does its job twice'
          );
          Y.Assert.areSame(
            'data3',
            test_global3,
            'eval_and_assign_globals does its job three times'
          );
        },
        
        testAddFunctions: function () {
          var worker = this.worker;
          worker.add_functions(
            {
              test_function1: '"data1"',
              test_function2: '"data2"',
            },
            {
              test_function2: '"data3"',
            }
          );
          Y.Assert.areSame(
            functions.test_function1[0],
            'data1',
            'add_functions does its job once'
          );
          Y.Assert.isNotUndefined(
            this.worker.functions.test_function1,
            'add_functions registers once'
          );
          Y.Assert.areSame(
            functions.test_function2[0],
            'data2',
            'add_functions does its job twice'
          );
          Y.Assert.isNotUndefined(
            this.worker.functions.test_function2,
            'add_functions registers twice'
          );
          Y.Assert.areSame(
            functions.test_function2[1],
            'data3',
            'add_functions does its job three times'
          );
        },
        
        testCallFunctions: function () {
          str = "";
          var worker = this.worker;
          worker.add_functions(
            {
              a: "function (s) {str += 'a1' + ' ' + s + ' '}",
              b: "function (s) {str += 'b' + ' ' + s + ' '}",
            },
            {
              a: "function (s) {str += 'a2' + ' ' + s + ' '}",
            }
          );
          this.worker.call_functions({a: 'c'}, {b: 'e'});
          Y.Assert.areSame('a1 c a2 c b e ', str, 'functions are called');
          worker.functions.a('f');
          Y.Assert.areSame(
            'a1 c a2 c b e a1 f a2 f ', 
            str, 
            'functions can be called through worker.functions'
          );
        },
        
        testPostBadMessage: function () {
          this.worker.post_message({bad_message: null});
        },
        
        testPostEmptyMessages: function () {
          this.worker.post_message({});
          this.worker.post_message([]);
          this.worker.post_message([{}]);
          Y.Assert.pass('posted three different flavors of empty message and nothing broke')
        },
        
        testPostEvalAndAssignGlobalsMessage: function () {
          this.worker.post_message({eval_and_assign_globals: {test_global_4: '"data4"'}});
          Y.Assert.areSame('data4', test_global_4, 'eval_and_assign_globals message succeeded');
        },
        
        testPostAddCallBacksMessage: function () {
          str = "";
          this.worker.post_message({add_functions: {d: "function (s)  {str += s;}"}});
          Y.Assert.isTrue(functions.hasOwnProperty('d'), 'add_functions message succeeded');
        },
        
        testPostCallFunctionsMessage: function () {
          str = "";
          this.worker.post_message({add_functions: {e: "function (s) {str += 'e'+s;}"}})
          this.worker.post_message({call_functions: {e: "f"}});
          Y.Assert.areSame('ef', str, 'call_functions message succeeded');
        },
        
        testAddHandlers: function () {
          var worker = this.worker;
          str = "";
          var t_h = function () {
            var args = arguments_to_array(arguments);
            for (var i = 0; i < args.length; ++i) {
              arg = args[i];
              str += args;
            }
          };
          worker.add_handlers({
            test_handler: t_h.toString()
          });
          Y.Assert.isNotUndefined(
            handler.test_handler,
            'add_handler has added a handler'
          );
           Y.Assert.isNotUndefined(
             worker.test_handler, 
             'add_handler has added a method to worker'
           );
           handler.test_handler('Hello');
           Y.Assert.areSame(
             'Hello',
             str,
             'add_handler creates functional handler'
           );
           worker.test_handler(', world!');
           Y.Assert.areSame(
             'Hello, world!',
             str,
             'add_handler adds functional method to worker'
           );
           worker.add_handlers({
             test_handler1: 'function () {return "one"}',
             test_handler2: 'function () {return "two"}'
           });
           Y.Assert.isNotUndefined(
             worker.test_handler1,
             'add_handler adds first of multiple methods to worker'
           );
           Y.Assert.areSame(
             'two',
             handler.test_handler2(),
             'add_handler adds second of multiple handlers correctly'
           );
        },
      }));
    
      Y.Test.Runner.add(worker_suite);
    });
  }, "0.1", {requires: ['worker', 'test']});
})();