(function() {
  YUI.add('worker-test', function (Y) {
    Y.use('test', 'worker', function (Y) {

      
      var worker_suite = new Y.Test.Suite({name: 'worker'});
    
      worker_suite.add(new Y.Test.Case({
        name: 'simulated worker',
        
        setUp: function () {
          this.worker = new Y.RanRan.Worker({simulated: true});
          this.real_worker = new Y.RanRan.Worker();
        },
        
        testCreate: function () {
          Y.Assert.isObject(this.worker, 'worker created');
          Y.Assert.isObject(this.real_worker, 'real worker created');
          Y.Assert.isObject(functions, 'simulated functions created');
          Y.Assert.isFunction(onmessage, 'simulated onmessage callback created');
          Y.Assert.isFunction(process_messages, 'process_messages created');
          Y.Assert.isFunction(arguments_to_array, 'simulated arguments_to_array created');
          Y.Assert.isFunction(postMessage, 'simulated postMessage created');
          Y.Assert.isFunction(handler.eval_and_assign_globals, 'eval_and_assign_globals created');
          Y.Assert.isFunction(handler.add_unprivileged_functions, 'add_unprivileged_functions created');
          Y.Assert.isFunction(handler.add_privileged_functions, 'add_privileged_functions created');
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

        testRealEvalAndAssignGlobals: function () {
          this.real_worker.eval_and_assign_globals(
            {
              test_global: '"data"',
            }
          );
          Y.Assert.pass('real eavl_and_assign_globals didn\'t crash');
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
            'data1',
            functions.test_function1,
            'add_functions does its job once'
          );
          Y.Assert.isNotUndefined(
            this.worker.functions.test_function1,
            'add_functions registers once'
          );
          Y.Assert.areSame(
            'data3',
            functions.test_function2,
            'add_functions does its job twice'
          );
          Y.Assert.isNotUndefined(
            this.worker.functions.test_function2,
            'add_functions registers twice'
          );
        },
        
        testCallFunctions: function () {
          // global
          __str = "";
          var worker = this.worker;
          function real_function() {
            __str = "For real!";
          }
          worker.add_functions(
            {
              a: "function (s) {__str += 'a1' + ' ' + s + ' '}",
              b: "function (s) {__str += 'b' + ' ' + s + ' '}",
            },
            {
              a: "function (s) {__str += 'a2' + ' ' + s + ' '}",
            },
            {
              real_function: real_function,
            }
          );
          worker._call_functions({a: 'c'}, {b: 'e'});
          Y.Assert.areSame(
            'a2 c b e ',
             __str,
            'functions are called'
          );
          worker.functions.a('f');
          Y.Assert.areSame(
            'a2 c b e a2 f ', 
            __str, 
            'functions can be called through worker.functions'
          );
          worker._call_functions('real_function');
          Y.Assert.areSame(
            'For real!',
            __str,
            'function objects (rather than just strings) can be passed to \n'+
            'add_function and call_function can be called with just a string'
          );
          delete __str
        },
        
        testPostBadMessage: function () {
          var worker = this.worker;
          worker.after('worker:exception', function (e) {
            Y.Assert.areSame('bad_message', e.message_type);
          });
          this.worker._post_message('bad_message', []);
        },

        testPostBadMessageRealWorker: function () {
          var worker = this.real_worker;
          var test = this;
          worker.after('worker:exception', function (e) {
            test.resume(function () {
              Y.Assert.areSame('bad_message', e.message_type);
            });
          });
          worker._post_message('bad_message', []);
          test.wait(200);
        },
        
        testPostEvalAndAssignGlobalsMessage: function () {
          this.worker.eval_and_assign_globals({test_global_4: '"data4"'});
          Y.Assert.areSame('data4', test_global_4, 'eval_and_assign_globals message succeeded');
        },
        
        testPostAddFunctionsMessage: function () {
          // global
          __str = "";
          this.worker.add_functions({d: "function (s)  {__str += s;}"});
          Y.Assert.isTrue(functions.hasOwnProperty('d'), 'add_functions message succeeded');
          delete __str;
        },
        
        testPostCallFunctionsMessage: function () {
          // global
          __str = "";
          this.worker.add_functions({e: "function (s) {__str += 'e'+s;}"})
          this.worker._call_functions({e: "f"});
          Y.Assert.areSame('ef', __str, 'call_functions message succeeded');
          delete __str;
        },
        
        testAddHandlers: function () {
          var worker = this.worker;
          // global variable
          __str = "";
          var t_h = function () {
            var args = arguments_to_array(arguments);
            for (var i = 0; i < args.length; ++i) {
              arg = args[i];
              __str += args;
            }
          };
          worker.add_handlers({
            test_handler: t_h
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
             __str,
             'add_handler creates functional handler'
           );
           worker.test_handler(', world!');
           Y.Assert.areSame(
             'Hello, world!',
             __str,
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
           delete __str;
        },
        
        testAddCalloutFunctions: function () {
          var worker = this.worker;
          // Notice that this str is only visible
          // in local scope.
          var str = "";
          (function () {
            var str = "";
            var test_callout1 = function (s) {
              str += s;
            };
            var test_callout2 = function () {
              str += " test_callout2";
            }
            var test_callout3 = function (a, b, c) {
              str = a + b + c;
            }
            worker.add_callout_functions({
              test_callout1: test_callout1,
              test_callout2: test_callout2,
            }, {
              test_callout3: test_callout3,
            });
            Y.Assert.isNotUndefined(
              functions.test_callout1,
              'first callout added to worker'
            );
            Y.Assert.isNotUndefined(
              worker._responders.test_callout2,
              'second callout added to worker._responders'
            );
            worker.functions.test_callout1('foo');
            Y.Assert.areSame(
              'foo',
              str,
              'callout was called with one argument'
            );
            worker.functions.test_callout2();
            Y.Assert.areSame(
              'foo test_callout2',
              str,
              'callout was called with no arguments'
            );
            worker.functions.test_callout3("Hello, ", "world", "!");
            Y.Assert.areSame(
              "Hello, world!",
              str,
              'callout was called with three arguments'
            );
          })();
          Y.Assert.areSame(
            "",
            str,
            'global str wasn\'t touched'
          );
        },

        testFunctionsCallCalloutsRoundTrip: function () {
          var worker = this.worker;
          var str = "";
          var echo = function (arg) {str += arg;};
          var shout = function (arg) {echo(arg);};
          worker.add_callout_functions({echo: echo});
          worker.add_functions({shout: shout});
          worker.functions.shout(21);
          Y.Assert.areSame('21', str, 'function callout roundtrip with simulate worker succeeded');
        },

        testFunctionsCalloutsAlternativeSyntax: function () {
          var worker = this.worker;
          var str = '';
          function echo(arg) {str += arg;};
          function shout(arg) {echo(arg);};
          worker.add_callout_functions({echo: echo});
          worker.add_functions({shout: shout});
          worker.functions.shout(49);
          Y.Assert.areSame('49', str, 'function callout roundtrip with sumulated worker using alternative syntax for function definition');
        },
        
        testRealFunctionsCallCalloutsRoundTrip: function() {
          var worker = this.real_worker;
          var str = "";
          var shout = function (arg) {echo(arg);};
          var test = this;
          var echo = function (arg) {
            str += arg;
            test.resume(function () {
              Y.Assert.areSame('21', str, 'function callout roundtrip with real worker succeeded');
            });
          };
          worker.add_callout_functions({echo: echo});
          worker.add_functions({shout: shout});
          worker.functions.shout(21);
          this.wait(200);
        },
        
        testAddFunctionsAddsTimeoutModifyingFunction: function() {
          var worker = this.worker;
          worker.add_functions({foo: function () {}});
          Y.Assert.isNotUndefined(
            worker._timeout_modifying_functions.foo,
            'function added to worker._timeout_modifying_functions'
          );
        },
        
        testFunctionGetTimeoutModifiers: function() {
          var worker = this.worker;
          var tm1 = worker.with_timeout_period(42);
          worker.add_functions({inert: function () {}});
          var tm2 = worker.with_timeout_period(54);
          Y.Assert.isNotUndefined(tm1, 'first timeout modifier created');
          Y.Assert.isNotUndefined(tm1.inert, 'function added after timeout modifier created is accessible through timeout modifier');
          Y.Assert.isNotUndefined(tm2, 'second timeout modifier created');
          Y.Assert.isNotUndefined(tm1.inert, 'function added before timeout modifier created is accessible through timeout modifier');
          Y.Assert.areNotSame(tm1, tm2, 'timeout modifiers are distinct');
          Y.Assert.areSame(42, tm1.timeoutPeriod, 'first timeout modifier has correct timeout');
          Y.Assert.areSame(54, tm2.timeoutPeriod, 'second timeout modifier has correct timeout');
        },
        
        testPeriodPassedToSetTimeout: function () {
          var worker = this.worker;
          var defaultTimeoutPeriod = worker.get('defaultTimeoutPeriod');
          var modifiedTimeoutPeriod = 42;
          var rememberedTimeoutPeriod = null;
          var timeoutIDCounter = 14728; // random
          var mockSetTimeout = function (ignored, timeoutPeriod) {
            rememberedTimeoutPeriod = timeoutPeriod;
            return ++timeoutIDCounter;
          };
          worker.set('_mockSetTimeout', mockSetTimeout);
          worker.add_functions({inert: function () {}});
          worker.with_timeout_period(42).inert();
          Y.Assert.areSame(42, rememberedTimeoutPeriod, 'with_timeout_period sets timeout appropriately');
          worker.functions.inert();
          Y.Assert.areSame(100, rememberedTimeoutPeriod, 'functions retains default timeout period');
          worker.set('_mockSetTimeout', false);
        },

        testCustomTimeoutHandlerCalledOnTimeout: function () {
          var worker = this.real_worker;
          var test = this;
          var str = 'not modified';
          worker.add_functions({times_out: function () {while(1);}});
          worker.set('customTimeoutHandler', function () {
            test.resume(function () {
              // It is the timeout handler's responsibility
              // to terminate the worker.
              worker.destructor();
              Y.Assert.pass('timeout handler called');
            });
          }); 
          worker.functions.times_out();
          test.wait(200);
        },

        testDefaultTimeoutHandlerCalledOnTimeout: function () {
          var worker = this.real_worker;
          var test = this;
          worker.add_functions({times_out: function () {while(1);}});
          worker.on('worker:timeout', function () {
            test.resume(function () {
              Y.Assert.pass('default timeout handler called on timeout');
            });
          });
          worker.functions.times_out();
          test.wait(200);
        },

        testRealWorkerRebootFunctionsAndCallbacks: function () {
          var worker = this.real_worker;
          var _w = worker._worker;
          var test = this;
          worker.add_functions({foo: function () {}});
          worker.add_functions({foo: function () {foo_callout()}});
          worker.add_functions({bar: function () {bar_callout()}});
          worker.add_callout_functions({foo_callout: function () {
            test.resume(function () {
              Y.Assert.pass('set up worker for test');
              worker.reboot();
              Y.Assert.areNotSame(_w, worker._worker, 'new worker created after reboot');
              worker.functions.bar() 
              test.wait(200);
            });
          }});
          worker.add_callout_functions({bar_callout: function () {
            test.resume(function () {
              Y.Assert.pass('called functions after reboot');
            });
          }});
          worker.functions.foo();
          test.wait(200);
        },

        testEvalRuns: function () {
          var worker = this.worker;
          __str = ''; // global
          worker.eval('__str = "passed"');
          Y.Assert.areEqual('passed', __str, 'eval in simulated worker');
          delete __str;
        },

        testRealEvalTimesOut: function () {
          var worker = this.real_worker;
          var test = this;
          worker.on('worker:timeout', function () {
            test.resume(function () {
              Y.Assert.pass('eval timed out');
            });
          });
          worker.eval('while(1);');
          test.wait(200);
        },

        testEvalReturnsResult: function () {
          var worker = this.worker;
          var result;
          worker.on('evalResult', function (e) {
            result = e.result;
          });
          worker.eval('10 * 10');
          Y.Assert.areSame(100, result, 'simulated worker evals and returns result');
        },

        testRealEvalReturnsResult: function () {
          var worker = this.real_worker;
          var test = this;
          worker.on('evalResult', function (e) {
            var result = e.result;
            test.resume(function () {
              Y.Assert.areEqual(
                2,
                result,
                'eval evaluates its result and passes it out in a message'
              );
            });
          });
          worker.eval('1 + 1;');
          test.wait(200);
        },

        testRealEvalWorksWithFunctionsAndCallouts: function () {
          var worker = this.real_worker;
          var test = this;
          worker.add_callout_functions({
            test_callout: function (result) {
              test.resume(function () {
                Y.Assert.areSame(42, result, 'eval calls a function which calls a callout');
              });
            },
          });
          worker.add_functions({double: function (x) {return x*2;}});
          worker.eval('test_callout(double(21))');
          test.wait(200);
        },
      }));
    
      Y.Test.Runner.add(worker_suite);
    });
  }, "0.1", {requires: ['worker', 'test']});
})();
