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
          Y.Assert.isObject(callbacks, 'callbacks created');
          Y.Assert.isFunction(onmessage, 'simulated onmessage callback created');
          Y.Assert.isFunction(postMessage, 'simulated postMessage created');
          Y.Assert.isFunction(eval_and_assign_globals, 'eval_and_assign_globals created');
          Y.Assert.isFunction(add_callbacks, 'add_callbacks created');
          Y.Assert.isFunction(call_callbacks, 'call_callbacks created');
          Y.Assert.isFunction(process_messages, 'process_messages created');
        },
        
        testArgumentsToArray: function () {
          var definitions = this.worker.get('definitions');
          var arguments_to_array = definitions[0].arguments_to_array;
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
        
        testAddCallbacks: function () {
          this.worker.add_callbacks(
            {
              test_callback1: '"data1"',
              test_callback2: '"data2"',
            },
            {
              test_callback2: '"data3"',
            }
          );
          Y.Assert.areSame(
            callbacks.test_callback1[0],
            'data1',
            'add_callbacks does its job once'
          );
          Y.Assert.areSame(
            callbacks.test_callback2[0],
            'data2',
            'add_callbacks does its job twice'
          );
          Y.Assert.areSame(
            callbacks.test_callback2[1],
            'data3',
            'add_callbacks does its job three times'
          );
        },
        
        testCallCallbacks: function () {
          str = "";
          this.worker.add_callbacks(
            {
              a: "function (s) {str += 'a1' + ' ' + s + ' '}",
              b: "function (s) {str += 'b' + ' ' + s + ' '}",
            },
            {
              a: "function (s) {str += 'a2' + ' ' + s + ' '}",
            }
          );
          this.worker.call_callbacks({a: 'c'}, {b: 'e'});
          Y.Assert.areSame('a1 c a2 c b e ', str, 'callbacks are called');
        },
        
        testPostBadMessage: function () {
          this.worker.post_message({bad_message: null});
        },
        
        testPostEmtpyMessages: function () {
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
          this.worker.post_message({add_callbacks: {d: "function (s)  {str += s;}"}});
          Y.Assert.isTrue(callbacks.hasOwnProperty('d'), 'add_callbacks message succeeded');
        },
        
        testPostCallCallbacksMessage: function () {
          str = "";
          this.worker.post_message({add_callbacks: {e: "function (s) {str += 'e'+s;}"}})
          this.worker.post_message({call_callbacks: {e: "f"}});
          Y.Assert.areSame('ef', str, 'call_callbacks message succeeded');
        },
      }));
    
      Y.Test.Runner.add(worker_suite);
    });
  }, "0.1", {requires: ['worker', 'test']});
})();