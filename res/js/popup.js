angular.module('popupApp', ['ngSanitize']).controller('PopupController', ['$scope', function($scope) {
  var storage = window.iMarkStorage;

  var selectElementText = function(el, win) {
    win = win || window;
    var doc = win.document, sel, range;
    if (win.getSelection && doc.createRange) {
      sel = win.getSelection();
      range = doc.createRange();
      range.selectNodeContents(el);
      sel.removeAllRanges();
      sel.addRange(range);
    } else if (doc.body.createTextRange) {
      range = doc.body.createTextRange();
      range.moveToElementText(el);
      range.select();
    }
  };

  var selectExportInnerText = function() {
    setTimeout(function() {
      selectElementText(document.getElementById("export-section"));
    }, 200);
  };

  $scope.searchText = '';
  $scope.exporting = false;

  $scope.remove = function(mark) {
    if (!mark.id) $scope.markList.shift();

    storage.remove(mark.id, function(result) {
      var markList = $scope.markList;
      for (var i = 0; i < markList.length; i++) {
        if (markList[i].id === mark.id) {
          markList.splice(i, 1);
          $scope.$apply();

          selectExportInnerText();
          return;
        }
      }
    });
  };

  $scope.highlight = function(source) {
    var searchText = $scope.searchText;
    if (!searchText) return source;

    return source.replace(new RegExp(searchText, 'gi'), function(value) {
      return '<em>' + value + '</em>';
    });
  };

  $scope.toggleExport = function() {
    $scope.exporting = !$scope.exporting;

    if ($scope.exporting) {
      selectExportInnerText();
    }
  };

  $scope.onMouseOver = function(mark) {
    if (!mark.id) return;

    mark.hovering = true;
  };

  $scope.onMouseLeave = function(mark) {
    mark.hovering = false;
  };

  storage.get(function(marks) {
    if (!marks.length) {
      marks.push({
        markText: 'go to mark something',
        noteText: 'take some notes for your mark'
      });
    }
    $scope.markList = marks;
    $scope.$apply();
  });

}]);
