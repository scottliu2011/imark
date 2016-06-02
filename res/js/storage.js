window.iMarkStorage = {
  get: function(callback) {
    chrome.storage.sync.get('sync', function(result) {
      callback && callback(result.sync.marks);
    });
  },
  save: function(mark, callback) {
    chrome.storage.sync.get('sync', function(result) {
      result.sync.config.id++;
      mark.id = result.sync.config.id;
      result.sync.marks.unshift(mark);

      chrome.storage.sync.set({sync: result.sync}, function() {
        callback && callback({insertId: result.sync.config.id});
      });
    });
  },
  update: function(mark, callback) {
    chrome.storage.sync.get('sync', function(result) {

      var marks = result.sync.marks;
      var current;

      for (var i = 0; i < marks.length; i++) {
        current = marks[i]
        if (current.id === mark.id) {
          current.markText = mark.markText;
          current.noteText = mark.noteText;
          break;
        }
      }

      chrome.storage.sync.set({sync: result.sync}, function() {
        callback && callback(current);
      });
    });
  },
  remove: function(id, callback) {
    chrome.storage.sync.get('sync', function(result) {

      var marks = result.sync.marks;
      var removedMark;

      for (var i = 0; i < marks.length; i++) {
        var current = marks[i];
        if (current.id === id) {
          removedMark = current;
          marks.splice(i, 1);
          break;
        }
      }

      chrome.storage.sync.set({sync: result.sync}, function() {
        callback && callback(current);
      });
    });
  }
}
