YUI.add(
  'history-manager',
  function (Y) {
    Y.namespace('RanRan');
    Y.RanRan.HistoryManager = function () {
      var head = {text: false};
      head.next = head;
      head.previous = head;
      this.head = head;
      this._texts = {};
    };
    Y.RanRan.HistoryManager.prototype = {
      add: function (text) {
        var t = this._texts;
        var h = this.head;
        // Check whether we have seen this text before.
        var item = this._texts[text];
        if (item) {
          if (h.previous === item) {
            // We have seen it, and it's already at the
            // front of the list.  Nothing needs doing.
            return;
          }
          // We have seen it, but it's not at the front.
          // Remove it from the list, to be inserted
          // at the correct place.
          item.next.previous = item.previous;
          item.previous.next = item.next;
        } else {
          // We haven't seen it yet, so create it.
          item = {text: text};
          this._texts[text] = item;
        }
        // insert item at the front of the list
        var p = h.previous;
        item.previous = p;
        item.next = h;
        h.previous = item;
        p.next = item;
      },
    };
  },
  '0.1',
  {requires: []}
);
  
