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
      if (expect instanceof Array) {
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
      init: function () {
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
    
    // Now we can check whether two objects are the same,
    // so we can check whether Y.RanRan.process_messages
    // is behaving itself.

    var process_messages_suite = new Y.Test.Suite({
      name: 'process messages',
    });
    
    process_messages_suite.add(find_difference_test);

    process_messages_suite.add(new Y.Test.Case({
      name: 'normalize_to_list',
      'empty list': function() {
        var normalized = Y.RanRan.normalize_to_list([]);
        Y.Assert.isArray(
          normalized,
          'normalize_to_list([]) should return an array'
        );
        Y.Assert.areSame(
          0,
          normalized.length,
          'normalize_to_list([]) should return an empty array'
        );
      },

      'non list argument': function() {
        var normalized = Y.RanRan.normalize_to_list('foo');
        Y.Assert.isArray(
          normalized,
          'normalize_to_list("foo") should return an array'
        );
        Y.Assert.areSame(
          1,
          normalized.length,
          'normalize_to_list("foo") should return an array of length 1'
        );
        Y.Assert.areSame(
          'foo',
          normalized[0],
          'normalize_to_list("foo") should return ["foo"]'
        );
      },

      'arguments object argument': function() {
        var args = (function () {return arguments})(1, 2, 3)
        var normalized = Y.RanRan.normalize_to_list(args);
        Y.Assert.isArray(
          normalized,
          'normalize_to_list(arguments_object) should return an array'
        );
        Y.Assert.areSame(
          3,
          normalized.length,
          'normalize_to_list(arguments_object) returns an array of the correct size'
        );
        Y.Assert.areSame(
          1,
          normalized[0],
          'normalize_to_list(arguments_object) returns an array with the first member the same as the first member of the arguments object'
        );
        Y.Assert.areSame(
          3,
          normalized[2],
          'normalize_to_list(arguments_object) returns an array with the last member the same as the last member of the arguments object'
        );
      },

      'ist argument': function() {
        var arr = [1, 2, 3];
        var normalized = Y.RanRan.normalize_to_list(arr);
        Y.Assert.isArray(
          normalized,
          'normalize_to_list([1, 2, 3]) should return an array'
        );
        Y.Assert.areSame(
          3,
          normalized.length,
          'normalize_to_list([1, 2, 3] returns an array of length 3'
        );
        Y.Assert.areSame(
          1,
          normalized[0],
          'the first element of normalize_to_list([1, 2, 3]) is 1'
        );
        Y.Assert.areSame(
          3,
          normalized[2],
          'the last element of normalize_to_list([1, 2, 3]) is 2'
        );
      },
    }));

    process_messages_suite.add(new Y.Test.Case({
      name: 'normalize_handler_function_to_closure',
      'string message': function() {
        var closure = Y.RanRan.normalize_handler_function_to_closure(this, function(name, data) {
          Y.Assert.areSame('name', name, 'name passed to closure when it is called with one argument');
          Y.Assert.isUndefined(data, 'no data passed to closure when it is called with one argument')
        });
        closure('name');
      },
      'message with data': function() {
        var closure = Y.RanRan.normalize_handler_function_to_closure(this, function(name, data) {
          Y.Assert.areSame('name', name, 'name passed to closure when it is called with two arguments');
          Y.Assert.areSame('data', data, 'data passed to closure when it is called with two arguments');
        });
        closure('name', 'data');
      },
      'message context': function() {
        var context = {foo: 'bar'};
        var closure = Y.RanRan.normalize_handler_function_to_closure(context, function(name, data) {
          Y.Assert.areSame('bar', this.foo, 'context passed to closure')
        });
        closure('name', 'data');
      },
    }));

    process_messages_suite.add(new Y.Test.Case({
      name: 'normalize_handler_object_to_closure',
      init: function() {
        this.closure = Y.RanRan.normalize_handler_object_to_closure(this, {
          message1: function(data) {
            Y.Assert.fail('wrong message called');
          },
          message2: function(data) {
            Y.Assert.isUndefined(data, 'no data should be passed');
            this.mock.message2();
          },
          message3: function(data) {
            Y.Assert.areSame('foo', data, 'message data passed to closure');
            this.mock.message3();
          },
          message4: [
            function(data) {
              Y.Assert.areSame('bar', data, 'message data passed to first in list of functions');
              this.mock.message4();
            },
            function(data) {
              Y.Assert.areSame('bar', data, 'message data passed to last in list of functions')
              this.mock.message4();
            },
          ],
        });
      },
      setUp: function() {
        this.mock = Y.Mock();
      },
      'string message': function() {
        Y.Mock.expect(this.mock, {
          method: 'message2',
          args: [],
        });
        this.closure('message2');
        Y.Mock.verify(this.mock);
      },
      'message with data': function() {
        Y.Mock.expect(this.mock, {
          method: 'message3',
          args: [],
        });
        this.closure('message3', 'foo');
        Y.Mock.verify(this.mock);
      },
      'message with data for list of functions': function() {
        Y.Mock.expect(this.mock, {
          method: 'message4',
          args: [],
          callCount: 2,
        });
        this.closure('message4', 'bar');
        Y.Mock.verify(this.mock);
      },
    }));

    process_messages_suite.add(new Y.Test.Case({
      name: 'inert callback',
      init: function() {
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
      name: 'gather_all_handled_message_names',
      'no messages': function() {
        var gathered = Y.RanRan.gather_all_handled_message_names([]);
        Y.Assert.isObject(gathered, 'returns an object');
        Y.Assert.areSame(0, Object.keys(gathered).length, 'object is empty');
      },
      'many messages': function() {
        var gathered = Y.RanRan.gather_all_handled_message_names([
          {},
          {'message1': null, 'message2': [null, null]}
        ]);
        Y.Assert.isObject(gathered, 'returns an object');
        Y.Assert.areSame(2, Object.keys(gathered).length, 'reports correct number of keys');
        Y.Assert.areSame(true, gathered.message1, 'reports object property key with non-list value');
        Y.Assert.areSame(true, gathered.message2, 'reports object property key with list value');
      },
      'function message': function() {
        var gathered = Y.RanRan.gather_all_handled_message_names([function() {}]);
        Y.Assert.areSame(false, gathered, 'returns false');
      },
      'function message among other messages': function() {
        var gathered = Y.RanRan.gather_all_handled_message_names([
          {},
          {'message1': null, 'message2': [null, null]},
          function() {},
        ]);
        Y.Assert.areSame(false, gathered, 'returns false');
      },
    }));

    process_messages_suite.add(new Y.Test.Case({
      name: 'check_for_missing_handlers',
      _should: {
        error: {
          'string message missing handler':
            new TypeError(
              "Y.RanRan.Worker: process_messages: no message handler for: 'missing message'"
            ),
          'object message missing handler':
            new TypeError(
              "Y.RanRan.Worker: process_messages: no message handler for: 'message2'"
            ),
          'mixed message missing handler':
            new TypeError(
              "Y.RanRan.Worker: process_messages: no message handler for: 'message2'"
            ),
        },
      },
      'no messages': function() {
        Y.RanRan.check_for_missing_handlers({'message': true}, []);
        Y.Assert.pass('passed');
      },
      'no messages function handler': function() {
        Y.RanRan.check_for_missing_handlers(false, []);
        Y.Assert.pass('passed')
      },
      'string message': function() {
        Y.RanRan.check_for_missing_handlers({'message': true}, ['message']);
        Y.Assert.pass('passed');
      },
      'string message missing handler': function() {
        Y.RanRan.check_for_missing_handlers({'message': true}, ['missing message']);
      },
      'string message function handler': function() {
        Y.RanRan.check_for_missing_handlers(false, ['message']);
        Y.Assert.pass('passed');
      },
      'object message': function() {
        var handlers = {'message1': true, 'message2': true, 'message3': true};
        var messages = [{'message1': 'data1', 'message2': 'data2'}];
        Y.RanRan.check_for_missing_handlers(handlers, messages);
        Y.Assert.pass('passed');
      },
      'object message missing handler': function() {
        var handlers = {'message1': true, 'message3': true};
        var messages = [{'message1': 'data1', 'message2': 'data2'}];
        Y.RanRan.check_for_missing_handlers(handlers, messages);
      },
      'object message function handler': function() {
        var handlers = false;
        var messages = [{'message1': 'data1', 'message2': 'data2'}];
        Y.RanRan.check_for_missing_handlers(handlers, messages);
        Y.Assert.pass('passed');
      },
      'mixed message': function() {
        var handlers = {'message1': true, 'message2': true, 'message3': true};
        var messages = ['message1', {'message2': 'data2', 'message3': 'data3'}];
        Y.RanRan.check_for_missing_handlers(handlers, messages);
        Y.Assert.pass('passed');
      },
      'mixed message missing handler': function() {
        var handlers = {'message1': true, 'message3': true};
        var messages = ['message1', {'message2': 'data2', 'message3': 'data3'}];
        Y.RanRan.check_for_missing_handlers(handlers, messages);
      },
      'mixed message function handler': function() {
        var handlers = false;
        var messages = ['message1', {'message2': 'data2', 'message3': 'data3'}];
        Y.RanRan.check_for_missing_handlers(handlers, messages);
        Y.Assert.pass('passed');
      },
    }));
    
    process_messages_suite.add(new Y.Test.Case({
      name: 'convert_handlers_to_closures',
      'empty list': function() {
        var closures = Y.RanRan.convert_handlers_to_closures(this, []);
        Y.Assert.isArray(closures, 'returns array');
        Y.Assert.areSame(0, closures.length, 'returned array is empty');
      },
      'populated list': function() {
        var handlers = [
          function(message, data) {
            this.accumulator += message + data;
          },
          {
            message1: function(data) {
              this.accumulator += 'message1: ' + data;
            },
            message2: function(data) {
              this.accumulator += 'message2: ' + data;
            },
          },
        ];
        this.accumulator = "";
        var closures = Y.RanRan.convert_handlers_to_closures(this, handlers);
        Y.Assert.isArray(closures, 'returns array');
        Y.Assert.areSame(2, closures.length, 'returned array is correct size');
        closures[0]('message', 'data'),
        Y.Assert.areSame(
          'messagedata',
          this.accumulator,
          'function handler is converted correctly, and context is passed'
        );
        closures[1]('message1', 'data'),
        Y.Assert.areSame(
          'messagedatamessage1: data',
          this.accumulator,
          'object handlers is converted correctly, and context is passed'
        );
      },
    }));

    process_messages_suite.add(new Y.Test.Case({
      name: 'accumulating callback',
      init: function () {
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
        function() {this.run(
          ['test', {another_test: 'message'}],
          {test: undefined, another_test: 'message'}
        );},
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
      init: function () {
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
        Y.Assert.areSame(
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
        Y.Assert.areSame(
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
    
    process_messages_suite.add(new Y.Test.Case({
      name: 'Arguments object messages and handlers',
      testArgumentMessage: function () {
        var str = "";
        function cb1(s) {
          str += s;
        }
        function cb2(s) {
          str += s.toUpperCase();
        }
        var arg1 = 'Hello, '
        var arg2 = 'world! '
        var expected = 'Hello, world! HELLO, WORLD! ';
        Y.RanRan.process_messages(this, [cb1, cb2], [arg1, arg2]);
        Y.Assert.areSame(
          expected,
          str,
          'metatest for processing the functions defined in testArgumentMessage'
        );
        str = "";
        (function () {
          var messages = arguments;
          (function () {
            handlers = arguments;
            Y.RanRan.process_messages(this, handlers, messages);
          })(cb1, cb2);
        })(arg1, arg2);
        Y.Assert.areSame(
          expected,
          str,
          'successfully processed sequences of messages and handlers supplied as Arguments objects'
        );
      },
    }));
    
    Y.Test.Runner.add(process_messages_suite);
  });
}, '0.1', {requires: ['message-processor', 'test']});
