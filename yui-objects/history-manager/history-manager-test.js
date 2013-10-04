YUI.add(
   'history-manager-test',
   function (Y) {
     var suite = new Y.Test.Suite({
       name: 'history-manager',
     });
     suite.add(new Y.Test.Case({
       name: 'created correctly',
       setUp: function () {
         this.history = new Y.RanRan.HistoryManager();
       },
       testCreated: function () {
         Y.Assert.isNotUndefined(this.history);
         Y.Assert.isObject(this.history.head);
         Y.Assert.areSame(this.history.head, this.history.head.next);
         Y.Assert.areSame(this.history.head, this.history.head.previous);
         Y.Assert.isFalse(this.history.head.text);
         Y.Assert.isObject(this.history._texts);
       },
       testAdd: function () {
         this.history.add('x');
         Y.Assert.isNotUndefined(this.history._texts.x);
         Y.Assert.areSame(this.history.head.text, false);
         Y.Assert.areSame(this.history.head.previous, this.history._texts.x);
         Y.Assert.areSame(this.history.head.next, this.history._texts.x);
         Y.Assert.areSame(this.history._texts.x.next, this.history.head);
         Y.Assert.areSame(this.history._texts.x.previous, this.history.head);
         Y.Assert.areSame(this.history._texts.x.text, 'x');
       },
       testAddTwice: function () {
         this.history.add('x');
         this.history.add('x');
         Y.Assert.areSame(this.history.head.text, false);
         Y.Assert.areSame(this.history.head.previous, this.history._texts.x);
         Y.Assert.areSame(this.history.head.next, this.history._texts.x);
         Y.Assert.areSame(this.history._texts.x.next, this.history.head);
         Y.Assert.areSame(this.history._texts.x.previous, this.history.head);
         Y.Assert.areSame(this.history._texts.x.text, 'x');
       },
       testAddMany: function () {
         this.history.add('1');
         this.history.add('2');
         this.history.add('3');
         this.history.add('4');
         this.history.add('2');
         Y.Assert.areSame(this.history.head.text, false, 'head text is not false');
         var expected = ['2', '4', '3', '1'];
         var current = this.history.head;
         for (var i = 0; i < expected.length; ++i) {
           var text = expected[i];
           var item = this.history._texts[text];
           Y.Assert.isNotUndefined(item);
           Y.Assert.areSame(item.text, text, 'text of item in item table is not as it should be');
           Y.Assert.areSame(item.previous.next, item, 'item.previous.next not item');
           Y.Assert.areSame(item.next.previous, item, 'item.next.previous not item');
           Y.Assert.areSame(item.next, current, 'item.next not current');
           current = current.previous;
           Y.Assert.areSame(item, current, 'item not current');
         }
         Y.Assert.areSame(current.previous, this.history.head, 'current at last item, current.previous is not the same as history.head');
         Y.Assert.areSame(current, this.history.head.next, 'current at last item, history.head.next not same as current');
       },
     }));
     Y.Test.Runner.add(suite);
   },
   '0.1',
   {requires: ['history-manager', 'test']}
);
