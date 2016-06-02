$(document).ready(function() {

	var storage = window.iMarkStorage;

	var getCoordsOfSelection = function() {
		var coords = {};

		var range = window.getSelection().getRangeAt(0);
		range.collapse(false);

		var dummy = document.createElement("span");
		range.insertNode(dummy);

		var rect = dummy.getBoundingClientRect();

		coords.x = rect.left;
		coords.y = rect.top;

		dummy.parentNode.removeChild(dummy);

		return coords;
	};

	var clearAllStatus = function() {
		$('#imark-edit-window').attr('data-mark-id', '');
		$('#imark-edit-window-mark').val('');
		$('#imark-edit-window-note').val('');
		$('#imark-edit-window-status').text('');
	};

	var openEditWindow = function(markText) {
		var coords = getCoordsOfSelection();
		$('#imark-edit-window').css({
			left: coords.x - 60,
			top: coords.y + 20
		}).addClass('imark-open');

		$('#imark-edit-window-mark').val(markText);
		$('#imark-edit-window-note').focus();
	};

	var closeEditWindow = function() {
		clearTimeout(savingTimer);
		clearAllStatus();
		$('#imark-edit-window').removeClass('imark-open');
	};

	var saveCurrentMark = function(callback) {
		var markText = $('#imark-edit-window-mark').val().trim();
		var noteText = $('#imark-edit-window-note').val().trim();

		if (!markText && !noteText) {
			discardCurrentMark(callback);
			return;
		}

		var mark = {
			markText: markText,
			noteText: noteText
		};

		var id = $('#imark-edit-window').attr('data-mark-id');
		if (id) {
			mark.id = parseInt(id);
			storage.update(mark, function(result) {
				console.log('update:', result);
				$('#imark-edit-window-status').text('Saved');
				callback && callback();
			});
		} else {
			storage.save(mark, function(result) {
				console.log('save:', result);
				$('#imark-edit-window').attr('data-mark-id', result.insertId);
				$('#imark-edit-window-status').text('Saved');
				callback && callback();
			});
		}

	};

	var discardCurrentMark = function(callback) {
		var id = $('#imark-edit-window').attr('data-mark-id');

		if (!id) {
			callback && callback();
			return;
		}

		storage.remove(parseInt(id), function(result) {
			console.log('discard:', result);
			callback && callback();
		});

	};

	var initContentPage = function() {
		//all elements use unique id to avoid breaking styles in some web pages
		var markWindow = '<div id="imark-edit-window">'
									 + '	<div id="imark-edit-window-header">'
									 + '		<span id="imark-edit-window-title">New Mark</span>'
									 + '		<span id="imark-edit-window-close">×</span>'
									 + '	</div>'
									 + '	<div id="imark-edit-window-body">'
									 + '		<textarea id="imark-edit-window-mark" placeholder="my mark"></textarea>'
									 + '		<textarea id="imark-edit-window-note" placeholder="my note"></textarea>'
									 + '	</div>'
									 + '	<div id="imark-edit-window-footer">'
									 + '		<span id="imark-edit-window-done">Done</span>'
									 + '		<span id="imark-edit-window-discard">Discard</span>'
									 + '		<span id="imark-edit-window-status"></span>'
									 + '	</div>'
									 + '</div>';

		$('body').append(markWindow);

		$('#imark-edit-window-close').click(function() {
			closeEditWindow();
		});

		$('#imark-edit-window-done').click(function() {
			saveCurrentMark(function() {
				closeEditWindow();
			});
		});

		$('#imark-edit-window-discard').click(function() {
			discardCurrentMark(function() {
				closeEditWindow();
			});
		});
	};

	initContentPage();

	var savingTimer;

	var delay = function(func, waitTime) {
		return function() {
			clearTimeout(savingTimer);
			savingTimer = setTimeout(function() {
				func();
			}, waitTime);
		}
	};

	var keyupAction = function(e) {
		var ids = ['imark-edit-window-mark', 'imark-edit-window-note'];
		if (ids.indexOf(e.target.id) > -1) {
			delay(saveCurrentMark, 5000)();
		}

		//Esc key
		if (e.keyCode === 27) closeEditWindow();
	};

	$(document).keydown(function() {
		$('#imark-edit-window-status').text('');
	});

	$(document).keyup(keyupAction);

	var dragging = false;
	var clientX = 0;
	var clientY = 0;

	$(document).mousedown(function(e) {
		var target = e.target;
		var headerId = 'imark-edit-window-header';
		if (target.id === headerId || target.parentNode.id === headerId) {
			dragging = true;
			clientX = e.clientX;
			clientY = e.clientY;
		}
	});

	$(document).mousemove(function(e) {
		if (dragging) {
			var x = e.clientX;
			var y = e.clientY;
			var gapX = x - clientX;
			var gapY = y - clientY;

			clientX = x;
			clientY = y;

			var editWindow = $('#imark-edit-window');
			var left = parseInt(editWindow.css('left'));
			var top = parseInt(editWindow.css('top'));

			editWindow.css({
				left: left + gapX,
				top: top + gapY
			});
		}
	});

	$(document).mouseup(function(e) {
		dragging = false;
	});

	chrome.runtime.onMessage.addListener(function(message, sender, sendResponse) {
		openEditWindow(message.selectionText);
  });

	chrome.storage.onChanged.addListener(function(changes, areaName){
	  var sync = changes.sync;
		var oldValue = sync.oldValue;
		var newValue = sync.newValue;

		if (!oldValue.marks || !newValue.marks) return;

		//if data has been removed from popup, we discard current mark
		var hasRemovedData = newValue.marks.length < oldValue.marks.length;
		var currentId = parseInt($('#imark-edit-window').attr('data-mark-id'));
		if (hasRemovedData) {
			var marks = newValue.marks;
			for (var i = marks; i < marks.length; i++) {
				if (marks[i].id === currentId) {
					discardCurrentMark(function() {
						closeEditWindow();
					});
					break;
				}
			}
		}
	});

});
