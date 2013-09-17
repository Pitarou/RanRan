YUI.add('message-processor-test', function (Y) {
  Y.use('test', 'message-processor', function (Y) {
    // Check whether two objects or arrays of objects
    // are the same.
    //
    // Return false if they are the same, or some
    // kind of diagnostic message if they are not.
    function find_difference(expect, actual) {
      if (typeof(expect) !== typeof(actual)) {
        return 'type not as expected';
      }
      if (expect === actual ||
          // NaN is the special value that is never equal to anything
          (expect !== expect && actual !== actual)
          ) {
        return false;
      }
      if (expect === null) {
        return 'expected null';
      }
      if (actual === null) {
        return 'did not expect null';
      }
      if (typeof(expect) !== 'object') {
        return 'non-objects differ';
      }
      if (expect.constructor !== actual.constructor) {
        return 'expected and actual have different constructors';
      }
      if (expect.constructor === Array) {
        if (expect.length !== actual.length) {
          return 'array is of different length'
        }
        for (var i = expect.length; i--;) {
          var difference = find_difference(expect[i], actual[i]);
          if (difference) {
            return difference;
          }
        } 
        return false;
      } else if (expect.constructor === Object) {
        for (name in expect) {
          if (!actual.hasOwnProperty(name)) {
            return 'object does not have expected property';
          }
        }
        for (name in actual) {
          if (!expect.hasOwnProperty(name)) {
            return 'object has unexpected property';
          }
          var difference = find_difference(expect[name], actual[name]);
          if (difference) {
            return difference;
          }
        }
        return false;
      }
      return 'unexpected constructor type';
    }
    
    var find_difference_test = new Y.Test.Case({
      name: "meta test: check that 'find difference' can accurately detect differences in complex objects",
      setUp: function () {
        this.same = function(expect, actual) {
          if (find_difference(expect, actual)) {
            Y.Assert.fail('difference found where there should not be one');
          }
          Y.Assert.pass('no difference found');
        }
        this.different = function(expect, actual) {
          var difference = find_difference(expect, actual);
          if (difference) {
            Y.Assert.pass('difference found');
          } else {
            Y.Assert.fail('no difference found where it should be');
          }
        }
      },
      testSameNumbers: function() {this.same(1, 1);},
      testSameNaN: function() {this.same(NaN, NaN);},
      testSameString: function () {this.same('test', 'test');},
      testSameNull: function () {this.same(null, null);},
      testSameUndefined: function () {this.same(undefined, undefined);},
      testSameEmptyList: function () {this.same([],[]);},
      testSameEmptyObject: function () {this.same(({}),({}));},
      testSameMixedList: function () {this.same([1,'two', undefined, NaN, [5, {six: 7, eight: [9]}]],
                                                 [1,'two', undefined, NaN, [5, {six: 7, eight: [9]}]])},
      testDifferentNumberNumber: function () {this.different(0, 1);},
      testDifferentNumberString: function () {this.different(0, "0");},
      testDifferentNumberFalse: function () {this.different(0, false);},
      testDifferentNumberTrue: function () {this.different(0, true);},
      testDifferentNumberNaN: function () {this.different(0, NaN);},
      testDifferentNumberUndefined: function () {this.different(0, undefined);},
      testDifferentNumberNull: function () {this.different(0, null);},
      testDifferentNumberEmptyList: function () {this.different(0, []);},
      testDifferentNumberList: function () {this.different(0, [0]);},
      testDifferentNumberObject: function () {this.different(0, {0: 0});},
      
      testDifferentStringNumber: function () {this.different("0", 0);},
      testDifferentStringString: function () {this.different("0", "");},
      testDifferentStringFalse: function () {this.different("0", false);},
      testDifferentStringTrue: function () {this.different("0", true);},
      testDifferentStringNaN: function () {this.different("0", NaN);},
      testDifferentStringUndefined: function () {this.different("", undefined);},
      testDifferentStringNull: function () {this.different("", null);},
      testDifferentStringEmptyList: function () {this.different("", []);},
      testDifferentStringList: function () {this.different("test", ["test"]);},
      testDifferentStringObject: function () {this.different("0", {"0": "0"});},

      testDifferentFalseNumber: function () {this.different(false, 0);},
      testDifferentTrueNumber: function () {this.different(true, 1);},
      testDifferentFalseString: function () {this.different(false, "0");},
      testDifferentTrueString: function () {this.different(true, "1");},
      testDifferentFalseTrue: function () {this.different(false, true);},
      testDifferentTrueFalse: function () {this.different(true, false);},
      testDifferentFalseNaN: function () {this.different(false, NaN);},
      testDifferentTrueNaN: function () {this.different(true, NaN);},
      testDifferentFalseUndefined: function () {this.different(false, undefined);},
      testDifferentTrueUndefined: function () {this.different(true, undefined);},
      testDifferentFalseNull: function () {this.different(false, null);},
      testDifferentTrueNull: function () {this.different(true, null);},
      testDifferentFalseEmptyList: function () {this.different(false, []);},
      testDifferentTrueEmptyList: function () {this.different(true, []);},
      testDifferentFalseList: function () {this.different(false, [false]);},
      testDifferentTrueObject: function () {this.different(true, {true: true});},
      
      testDifferentNaNNumber: function () {this.different(NaN, 0);},
      testDifferentNaNString: function () {this.different(NaN, "");},
      testDifferentNaNTrue: function () {this.different(NaN, true);},
      testDifferentNaNFalse: function () {this.different(NaN, false);},
      testDifferentNaNUndefined: function () {this.different(NaN, undefined);},
      testDifferentNaNNull: function () {this.different(NaN, null);},
      testDifferentNaNEmptyList: function () {this.different(NaN, []);},
      testDifferentNaNList: function () {this.different(NaN, [NaN]);},
      testDifferentNaNObject: function () {this.different(NaN, {NaN: NaN});},

      testDifferentUndefinedNumber: function () {this.different(undefined, 0);},
      testDifferentUndefinedString: function () {this.different(undefined, "");},
      testDifferentUndefinedTrue: function () {this.different(undefined, true);},
      testDifferentUndefinedFalse: function () {this.different(undefined, false);},
      testDifferentUndefinedNaN: function () {this.different(undefined, NaN);},
      testDifferentUndefinedNull: function () {this.different(undefined, null);},
      testDifferentUndefinedEmptyList: function () {this.different(undefined, []);},
      testDifferentUndefinedList: function () {this.different(undefined, [undefined]);},
      testDifferentUndefinedObject: function () {this.different(undefined, {undefined: undefined});},

      testDifferentNullNumber: function () {this.different(null, 0);},
      testDifferentNullString: function () {this.different(null, "");},
      testDifferentNullTrue: function () {this.different(null, true);},
      testDifferentNullFalse: function () {this.different(null, false);},
      testDifferentNullNaN: function () {this.different(null, NaN);},
      testDifferentNullUndefined: function () {this.different(null, undefined);},
      testDifferentNullEmptyList: function () {this.different(null, []);},
      testDifferentNullList: function () {this.different(null, [null]);},
      testDifferentNullObject: function () {this.different(null, {null: null});},

      testDifferentEmptyListNumber: function () {this.different([], 0);},
      testDifferentEmptyListString: function () {this.different([], "");},
      testDifferentEmptyListTrue: function () {this.different([], true);},
      testDifferentEmptyListFalse: function () {this.different([], false);},
      testDifferentEmptyListNaN: function () {this.different([], NaN);},
      testDifferentEmptyListUndefined: function () {this.different([], undefined);},
      testDifferentEmptyListNull: function () {this.different([], null);},
      testDifferentEmptyListList: function () {this.different([], [[]]);},
      testDifferentEmptyListObject: function () {this.different([], {null: []});},

      testDifferentListNumber: function () {this.different([0], 0);},
      testDifferentListString: function () {this.different([""], "");},
      testDifferentListTrue: function () {this.different([true], true);},
      testDifferentListFalse: function () {this.different([false], false);},
      testDifferentListNaN: function () {this.different([NaN], NaN);},
      testDifferentListUndefined: function () {this.different([undefined], undefined);},
      testDifferentListNull: function () {this.different([null], null);},
      testDifferentListEmptyList: function () {this.different([[]], []);},
      testDifferentListObject: function () {this.different([{undefined:undefined}],{undefined:undefined});},

      testDifferentObjectNumber: function () {this.different({0:0}, 0);},
      testDifferentObjectString: function () {this.different({"":""}, "");},
      testDifferentObjectTrue: function () {this.different({true:true}, true);},
      testDifferentObjectFalse: function () {this.different({false:false}, false);},
      testDifferentObjectNaN: function () {this.different({NaN:NaN}, NaN);},
      testDifferentObjectUndefined: function () {this.different({undefined:undefined}, undefined);},
      testDifferentObjectNull: function () {this.different({null:null}, null);},
      testDifferentObjectEmptyList: function () {this.different({undefined:[]}, []);},
      
      testDifferentLongShortLists: function () {this.different([null,null,null],[null,null]);},
      testDifferentShortLongLists: function () {this.different([null,null],[null,null,null]);},

      testDifferentLargeSmallObjects: function () {this.different(
        {1:1,2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9,10:10,11:11,12:12,13:13,14:14,15:15},
        {1:1,2:2,3:3,4:4,5:5,6:6,7:7,8:8,    10:10,11:11,12:12,13:13,14:14,15:15}
      )},
      testDifferentSmallLargeObjects: function () {this.different(
        {1:1,2:2,3:3,4:4,5:5,6:6,7:7,8:8,    10:10,11:11,12:12,13:13,14:14,15:15},
        {1:1,2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9,10:10,11:11,12:12,13:13,14:14,15:15}
      )},
      
      testDifferentNested: function () {this.different(
        {1:{2:{3:[[[4]]]}}},
        {1:{2:{3:[[[5]]]}}}
      );},
      
      testDifferentLastInList: function () {this.different(
        [1,2,3,4,5,NaN],
        [1,2,3,4,5,6]
      );},
      
      testDifferentManyProperties: function () {this.different(
        {1:1,2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:9,  10:10,11:11,12:12,13:13,14:14,15:15},
        {1:1,2:2,3:3,4:4,5:5,6:6,7:7,8:8,9:NaN,10:10,11:11,12:12,13:13,14:14,15:15}
      )},
    });
    
    // So now we can check whether two objects are the same,
    // so we can check whether Y.RanRan.process_messages
    // is behaving itself.

    var process_messages_suite = new Y.Test.Suite({
      name: 'process messages',
    });
    
    process_messages_suite.add(find_difference_test);
    
    process_messages_suite.add(new Y.Test.Case({
      name: 'inert callback',
      setUp: function () {
        this.run = function (messages) {
          Y.RanRan.process_messages(this, function () {}, messages);
          Y.Assert.pass('nothing broke');
        }
      },
      'empty message list': function () {this.run([]);},
      'string message': function () {this.run('test message');},
      'object message with string content': function () {this.run({test: 'message'});},
      'object message with list content': function () {
        this.run({test: ['a', 'message']});
      },
      'object multiple message with string content': function () {
        this.run({test: 'message', another_test: 'message'});
      },
      'list of string messages': function () {this.run(['test', 'message']);},
      'list containing string messages and object messages with string content':
        function () {this.run(['test', {test: 'message'}]);},
      'mixed list': function () {this.run([
        'test', 
        {test: 'message'},
        {another: ['test', 'message'], yet_another: 'test'},
      ]);},
    }));
    
    process_messages_suite.add(new Y.Test.Case({
      name: 'accumulating callback',
      setUp: function () {
        this.run = function (input, expected) {
          var accumulator = {};
          Y.RanRan.process_messages(this, function (name, data) {
            accumulator[name] = data;
          }, input)
          var difference = find_difference(expected, accumulator);
          if (difference) {
            Y.Assert.fail(difference);
          }
          else {
            Y.Assert.pass('got expected result');
          }
        };
      },
      'empty message list': function () {this.run([], {})},
      'string message': function () {
        this.run('test message', {'test message': undefined})
      },
      'object message with string content': function () {this.run({test: 'message'}, {test: 'message'});},
      'object message with list content': function () {
        this.run({test: ['a', 'message']}, {test: ['a', 'message']})
      },
      'object multiple message with string content': function () {
        this.run({test: 'message'}, {test: 'message'});
      },
      'list of string messages': function () {
        this.run(['test', 'message'], {test: undefined, message: undefined});
      },
      'list containing string messages and object messages with object content':
        function () {this.run(['test', {another_test: 'message'}], {test: undefined, another_test: 'message'})},
      'mixed list': function () {this.run(
        ['test1', {test2: 'message2'}, {test3: ['message', 3], test4: 'message4'}],
        {test1: undefined, test2: 'message2', test3: ['message', 3], test4: 'message4'}
      );},
    }));
    
    process_messages_suite.add(new Y.Test.Case({
      name: 'handler table',
      setUp: function () {
        this.accumulators = {
        };
        var accumulators = this.accumulators;
        this.handlers = {
          increment: function () {
            accumulators.increment = 1 + (accumulators.increment|0);
          },
          increment_index: function (index) {
            var acc = accumulators.increment_index;
            if (!acc) {
              acc = {};
              accumulators.increment_index = acc;
            }
            acc[index] = 1 + (acc[index]|0);
          },
          store: function (field, value) {
            var acc=accumulators.store;
            if (!acc) {
              acc = {};
              accumulators.store = acc;
            }
            acc[field] = value;
          },
        };
        var handlers = this.handlers;
        this.run = function (input, expected, ignore_missing_handlers) {
          if (ignore_missing_handlers !== undefined) {
            Y.RanRan.process_messages(this, handlers, input, ignore_missing_handlers)
          } else {
            Y.RanRan.process_messages(this, handlers, input)
          }
          var difference = find_difference(expected, accumulators);
          if (difference) {
            Y.Assert.fail(difference);
          }
          else {
            Y.Assert.pass('got expected result');
          }
        };
      },
      _should: {
        error: {
          testExceptionOnMissingHandler: true,
          testExceptionOnUndefinedMessages: true,
        },
      },
      testMetaCheckHandlersWork: function () {
        this.handlers.increment();
        this.handlers.increment();
        this.handlers.increment_index(1);
        this.handlers.increment_index(2);
        this.handlers.increment_index(2);
        this.handlers.store(0,null);
        this.handlers.store(0,0);
        this.handlers.store(1,"one");
        Y.Assert.isFalse(find_difference({
          increment: 2,
          increment_index: {1:1, 2:2},
          store: {0:0, 1:"one"},
        }, this.accumulators));
      },
      testMetaCheckHandlersAreReset: function () {
        Y.Assert.isFalse(find_difference({}, this.accumulators));
      },
      testExceptionOnUndefinedMessages: function () {this.run(undefined, {})},
      testEmptyListOfMessages: function () {this.run([], {})},
      testString: function () {this.run("increment", {increment: 1})},
      testListOfStrings: function () {this.run(["increment", "increment"], {increment: 2})},
      testObjectEmptyArguments: function () {this.run({increment: []}, {increment:1});},
      testListOfObectEmptyArguments: function () {
        this.run([{increment: []}, {increment: []}, {increment: []}, {increment: []}], {increment: 4});
      },
      testObjectOneArgument: function () {this.run({increment_index:'i'}, {increment_index: {i: 1}});},
      testObjectOneArgmentList: function () {
        this.run({increment_index:['i']}, {increment_index: {i:1}});
      },
      'list of strings, objects with an empty arguments list, objects with one argument, and objects with a one argument list':
      function () {this.run(
        ['increment', {increment:[]}, {increment_index:'i'}, {increment_index:['i']}, 'increment'],
        {increment: 3, increment_index: {i: 2}}
      )},
      testTwoArguments: function () {this.run({store:['field','value']}, {store:{field:'value'}})},
      testTwoArgumentsSequenceing: function () {this.run(
        [{store:['i',1]},{store:['i',]},{store:['i',2]},{store:['i',3]},{store:['i',4]},{store:['i',5]},{store:['i',6]}],
        {store:{i:6}}
      )},
      testMultiObject: function () {this.run(
        {store:['i',1],increment:[],increment_index:'x'},
        {store:{i:1},increment:1,increment_index:{x:1}}
      )},
      testMultiObjectSequence: function () {this.run(
        [{store:['i',1],increment:[],increment_index:'x'},'increment',{store:['i',2],increment:[]}],
        {store:{i:2},increment:3,increment_index:{x:1}}
      )},
      testExceptionOnMissingHandler: function () {this.run('not a handler', {})},
      testSuppressExceptionOnMissingHandler: function () {this.run('not a handler', {}, true)},
    }));
    
    process_messages_suite.add(new Y.Test.Case({
      name: 'handler list',
      setUp: function () {
        this.accumulators = {};
        var accumulators = this.accumulators;
        this.increment_index = function (index) {
         accumulators[index] = (accumulators[index]|0) + 1;
        };
        this.store = function (key, value) {
          accumulators[key] = value;
        };
        this.increment = {
          go: function () {
            accumulators.counter = (accumulators.counter|0) + 1;
          },
        };
        this.decrement = {
          go: function () {
            accumulators.counter = (accumulators.counter|0) - 1;
          },
        };
        this.do_append = function(c) {
          accumulators.append = (accumulators.append || '') + c;
        };
        var do_append = this.do_append;
        this.append = {
          a: function () {do_append('a');},
          b: function () {do_append('b');},
        };
        this.APPEND = {
          a: function () {do_append('A');},
          b: function () {do_append('B');},
        };
        this.run = function (handlers, input, expected, ignore_missing_handlers) {
          if (ignore_missing_handlers !== undefined) {
            Y.RanRan.process_messages(this, handlers, input, ignore_missing_handlers)
          } else {
            Y.RanRan.process_messages(this, handlers, input)
          }
          var difference = find_difference(expected, accumulators);
          if (difference) {
            Y.Assert.fail(difference);
          }
          else {
            Y.Assert.pass('got expected result');
          }
        };
      },
      testMetaCheckHandlersWork: function () {
        this.increment.go();
        this.increment.go();
        this.increment.go();
        this.increment.go();
        this.increment.go();
        this.decrement.go();
        this.increment_index(1);
        this.increment_index(2);
        this.increment_index(2);
        this.store(0,0);
        this.store(0,1);
        this.store('key',0);
        this.store('another key', 1);
        this.append.a();
        this.append.a();
        this.append.b();
        this.APPEND.a();
        this.APPEND.b();
        Y.Assert.isFalse(find_difference({
          counter: 4,
          0: 1,
          1: 1,
          2: 2,
          key: 0,
          'another key': 1,
          append: "aabAB",
        }, this.accumulators));
      },
      _should: {
        error: {
          'throw an exception if there is one handler in the list and the message is not found':
            true,
          testUndefinedMessagesUndefinedHandlers: true,
          testUndefinedHandlers: true,
          testUndefinedInput: true,
          testEmptyListHandlers: true,
          'exception thrown when there are multiple handlers': true,
          testMixedHandlersMixedMessagesWithOneMissing: true,
        },
      },
      testMetaCheckHandlersAreReset: function () {
        Y.Assert.isFalse(find_difference({}, this.accumulators));
      },
      testUndefinedMessagesUndefinedHandlers: function () {this.run(undefined, undefined, {});},
      testUndefinedHandlers: function () {this.run(undefined, 'message', {});},
      testUndefinedInput: function () {this.run(this.increment_index, undefined, {});},
      testEmptyListHandlers: function () {this.run([], 'message', {});},
      testEmptyListInput: function () {this.run(this.increment_index, [], {});},
      testCallbackHandler: function () {this.run(this.increment_index, 'i', {i:1});},
      testCallbackHandlerMessageList: function () {
        this.run(this.increment_index, ['i', 'j', 'i'], {i:2, j:1});
      },
      testCallbackHandlerSingleListMessageList: function () {
        this.run([this.increment_index], ['i', 'j', 'i'], {i:2, j:1});
      },
      testCallbackHandlerListMessageList: function () {
        this.run([this.increment_index, this.increment_index], ['i', 'j', 'i'], {i:4, j:2});
      },
      testCallbackHandlerListMessageListSequencing: function () {this.run(
        [this.decrement, this.decrement, this.increment, this.decrement, this.decrement],
        ['go'],
        {counter: -3}
      )},
      testHandlerMessageSequencing: function () {this.run(
        [this.append, this.APPEND, this.append],
        ['a','a','a','b'],
        {append: 'aaabAAABaaab'}
        );
      },
      'throw an exception if there is one handler in the list and the message is not found':
        function () {this.run(
          [this.append],
          'not a handler',
          {}
      );},
      'suppress exception with ignore missing handlers argument':
        function () {this.run(
          [this.append],
          'not a handler',
          {},
          true
      );},
      'exception thrown when there are multiple handlers': function () {this.run(
        [this.append, this.append],
        'not a handler',
        {}
      );},
      testMixedHandlersMixedMessagesWithOneMissing: function () {this.run(
        [{a: function () {}, b: function () {}}, {b: function () {}, c: function (){}}],
        ['a', 'b', {a:[], b:[]}, {c:[], d:[]}, 'a'],
        {}
      );},
    }));

    process_messages_suite.add(new Y.Test.Case({
      name: 'using class instances as messages and handlers',
      setUp: function () {
        function TestClass() {
        }
        TestClass.prototype.method = function () {
          this.status = "method was called";
        };
        TestClass.status = "";
        
        this.object = new TestClass();
        this.object.property = "property";
      },
      _should: {
        error: {
          testMessagePrototypePropertiesIgnored: true,
        },
      },
      testMessageOwnPropertiesHandledPrototypePropertiesIgnored: function () {
        Y.RanRan.process_messages(
          this,
          {'property': function() {this.object.status = "property was called";}},
          this.object
        );
        Y.Assert.areEqual(
          this.object.status,
          "property was called",
          "own property is handled"
        );
      },
     testMessagePrototypePropertiesIgnored: function () {
        Y.RanRan.process_messages(
          this,
          {'method': function () {}},
          this.object
        );
      },
      testHandlerPrototypePropertyNotIgnored: function () {
        Y.RanRan.process_messages(this.object, this.object, 'method');
        Y.Assert.areEqual(
          this.object.status,
          'method was called',
          'prototype properties of handlers are called'
        );
      },
    }));
    
    process_messages_suite.add(new Y.Test.Case({
      name: 'handler with list of functions',
      setUp: function () {
        this.accumulators = {};
        var accumulators = this.accumulators;
        this.handler = {
          handle: [
            function () {accumulators.foo = 1},
            function () {accumulators.foo = 2},
            function () {accumulators.bar = 1},
          ],
        };
        function append(s) {
          return function () {
            accumulators.append = (accumulators.append||"") + s;
          }
        }
        this.append = {
          ab: [append('a'),append('b')],
          cd: [append('c'),append('d')],
        };
        this.APPEND = {
          ab: [append('A'),append('B')],
          cd: [append('C'),append('D')],
        };
        this.run = function (handlers, input, expected, ignore_missing_handlers) {
          if (ignore_missing_handlers !== undefined) {
            Y.RanRan.process_messages(this, handlers, input, ignore_missing_handlers)
          } else {
            Y.RanRan.process_messages(this, handlers, input)
          }
          var difference = find_difference(expected, accumulators);
          if (difference) {
            Y.Assert.fail(difference);
          }
          else {
            Y.Assert.pass('got expected result');
          }
        };
      },
      testMeta: function () {
        this.handler.handle[0]();
        this.handler.handle[1]();
        this.handler.handle[2]();
        this.append.ab[0]();
        this.append.ab[1]();
        this.append.cd[0]();
        this.append.cd[1]();
        this.APPEND.ab[0]();
        this.APPEND.ab[1]();
        this.APPEND.cd[0]();
        this.APPEND.cd[1]();
        var difference = find_difference({foo:2, bar:1, append:'abcdABCD'}, this.accumulators);
        if (difference) Y.Assert.fail(difference);
        else Y.Assert.pass('ok');
      },
      testEmptyFunctionList: function () {this.run({handle:[]}, 'handle', {})},
      testFunctionListSequence: function () {this.run(this.handler, 'handle', {foo:2,bar:1})},
      testGrandSequencingTest: function () {this.run(
        [this.append, this.APPEND],
        ['ab', 'cd'],
        {append: 'abcdABCD'}
      )},
    }));
    
    Y.Test.Runner.add(process_messages_suite);
  });
}, '0.1', {requires: ['message-processor', 'test']});
