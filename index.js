(function() {
  'use strict';
  var app = {};
  var ScheduleCollection = {};
  var ShiftsCollection = {};
  var overlap = false;

//code for schedule and shift collections
  Object.defineProperty(ScheduleCollection, 'add', {
  	enumerable: false,
  	value: function () {
  		var id = null,
  			ids = _.keys(this);
  		if (ids.length === 0) {
  			id = 1;
  		} else {
  			id = parseInt(_.max(ids))+1;
  		}
      var schedule = {
        id: String(id),
        shifts: Object.create(ShiftsCollection)
      }
      this[String(id)] = schedule;
  		return schedule;
  	}
  });

  Object.defineProperty(ShiftsCollection, 'add', {
  	enumerable: false,
  	value: function () {
  		var id = null,
  			ids = _.keys(this);
  		if (ids.length === 0) {
  			id = 1;
  		} else {
  			id = parseInt(_.max(ids))+1;
  		}
      var shift = {
        id: String(id),
        start: 0,
        end: 1440
      }
      this[String(id)] = shift;
      var that = this;
      _.each(this, function (shift, i) {
        var width = 1440/_.keys(that).length;
        shift.start = 0 + ((Number(i)-1) * width);
        shift.end = Number(i) * width;
      });
  		return shift;
  	}
  });

  Object.defineProperty(ScheduleCollection, 'remove', {
  	enumerable: false,
  	value: function (id) {
  		delete this[id];
  	}
  });

  Object.defineProperty(ShiftsCollection, 'remove', {
  	enumerable: false,
  	value: function (id) {
  		delete this[id];
  	}
  });

  app.scheduleCollection = Object.create(ScheduleCollection);

//listeners for adding/removing schedules
  $('.add-schedule').on('click', function (evt) {
    var days = Days();
    var s = $('#schedule-template').html();
    var scheduleTemplate = _.template(s)({data: days});
    $('.schedules').append(scheduleTemplate);
    var schedule = app.scheduleCollection.add();
    componentHandler.upgradeDom();

    $('.remove-schedule').last().on('click', function (evt) {
      $(evt.target).closest('.schedule').next('.schedule-shifts').remove();
      $(evt.target).closest('.schedule').next('.slider').remove();
      $(evt.target).closest('.schedule').remove();
      app.scheduleCollection.remove(schedule.id);
    });

    $('.schedule-title-container').last().on('dblclick', function (evt) {
      $(evt.target).closest('.schedule-title').attr('contenteditable','true');
      $(evt.target).closest('.schedule-title').focus();
    });

    $('.schedule-title-container').last().focusout(function (evt) {
      $(evt.target).closest('.schedule-title').attr('contenteditable','false');
    });

    $('.dropdown').last().on('click', function (evt) {
      $(evt.target).parent().parent().next('.schedule-shifts')
        .toggleClass('shifts-active');
    });

    $('.add-shift').last().on('click', function (evt) {
      var slider = $('#shift-template').html();

      $(evt.target).closest('button').parent().append(slider);
      componentHandler.upgradeDom();

      var shift = schedule.shifts.add();

      $(".slider").last().slider({
        range: true,
        min: 0,
        max: 1440,
        step: 15,
        values: [shift.start, shift.end],
        slide: function (e, ui) {
          var v = getTimes(ui.values);
          shift.start = ui.values[0];
          shift.end = ui.values[1];
          $(e.target).children('.slider-time').children('.slider-begin').html(v.hours1 + ':' + v.minutes1);
          $(e.target).children('.slider-time').children('.slider-end').html(v.hours2 + ':' + v.minutes2);

          if (checkOverlap(schedule.shifts)) {
            $(e.target).children('.ui-slider-handle').css("background-color", "red");
            $(e.target).children('.ui-slider-range').css("background-color", "red");
            overlap = true;
          } else {
            $(e.target).children('.ui-slider-handle').css("background-color", "#03A9F4");
            $(e.target).children('.ui-slider-range').css("background-color", "#03A9F4");
            overlap = false;
          }
        }
       });

      $(evt.target).closest('.schedule-shifts').children('.shift').each(function (i, shift) {
        $(shift).children('.slider').slider("values", [ schedule.shifts[i+1].start, schedule.shifts[i+1].end ]);
        var v = getTimes([ schedule.shifts[i+1].start, schedule.shifts[i+1].end ]);
        $(shift).children('.slider').children('.slider-time').children('.slider-begin').html(v.hours1 + ':' + v.minutes1);
        $(shift).children('.slider').children('.slider-time').children('.slider-begin').html(v.hours2 + ':' + v.minutes2);
      });

      $('.remove-shift').last().on('click', function (evt) {
        $(evt.target).closest('.shift').remove();
        schedule.shifts.remove(shift.id);
      });
    });
  });

//Create initial schedule
  var days = Days();
  var s = $('#schedule-template').html();
  var scheduleTemplate = _.template(s)({data: days});
  $('.schedules').append(scheduleTemplate);
  var schedule = app.scheduleCollection.add();

  $('.remove-schedule').first().on('click', function (evt) {
    $(evt.target).closest('.schedule').next('.schedule-shifts').remove();
    $(evt.target).closest('.schedule').next('.slider').remove();
    $(evt.target).closest('.schedule').remove();
    app.scheduleCollection.remove(schedule.id);
  });

  $('.schedule-title-container').first().on('dblclick', function (evt) {
    evt.stopPropagation();
    $(evt.target).closest('.schedule-title').attr('contenteditable','true');
    $(evt.target).closest('.schedule-title').focus();
  });

  $('.schedule-title-container').first().focusout(function (evt) {
    $(evt.target).closest('.schedule-title').attr('contenteditable','false');
  });

  $('.dropdown').first().on('click', function (evt) {
    $(evt.target).parent().parent().next('.schedule-shifts')
      .toggleClass('shifts-active');
  });

  $('.add-shift').first().on('click', function (evt) {
    var slider = $('#shift-template').html();
    $(evt.target).closest('button').parent().append(slider);
    componentHandler.upgradeDom();
    var shift = schedule.shifts.add();

    $(evt.target).parent().parent().children('.shift').last().children('.slider').slider({
      range: true,
      min: 0,
      max: 1440,
      step: 15,
      values: [shift.start, shift.end],
      slide: function (e, ui) {
        var v = getTimes(ui.values);
        shift.start = ui.values[0];
        shift.end = ui.values[1];
        $(e.target).children('.slider-time').children('.slider-begin').html(v.hours1 + ':' + v.minutes1);
        $(e.target).children('.slider-time').children('.slider-end').html(v.hours2 + ':' + v.minutes2);

        if (checkOverlap(schedule.shifts)) {
          $(e.target).children('.ui-slider-handle').css("background-color", "red");
          $(e.target).children('.ui-slider-range').css("background-color", "red");
          overlap = true;
        } else {
          $(e.target).children('.ui-slider-handle').css("background-color", "#03A9F4");
          $(e.target).children('.ui-slider-range').css("background-color", "#03A9F4");
          overlap = false;
        }
      }
     });

    $('.schedule-shifts').first().children('.shift').each(function (i, shift) {
      $(shift).children('.slider').slider("values", [ schedule.shifts[i+1].start, schedule.shifts[i+1].end ]);
      var v = getTimes([ schedule.shifts[i+1].start, schedule.shifts[i+1].end ]);
      $(shift).children('.slider').children('.slider-time').children('.slider-begin').html(v.hours1 + ':' + v.minutes1);
      $(shift).children('.slider').children('.slider-time').children('.slider-begin').html(v.hours2 + ':' + v.minutes2);
    });

    $(evt.target).parent().parent().children('.shift').last().children('.remove-shift').on('click', function (evt) {
      $(evt.target).closest('.shift').remove();
      schedule.shifts.remove(shift.id);
    });
  });

//create days object for checkboxes
  function Days () {
    var days = {};
    var x = $('.schedule-shifts').length + 1;
    for (var i = 1; i < 8; i++) {
      var name;
      var fri = '';
      switch (i) {
        case 1:
          name = 'Mon';
          break;
        case 2:
          name = 'Tues';
          break;
        case 3:
          name = 'Wed';
          break;
        case 4:
          name = 'Thurs';
          break;
        case 5:
          name = 'Fri';
          fri = 'fri';
          break;
        case 6:
          name = 'Sat';
          break;
        case 7:
          name = 'Sun';
          break;
        default:
          // no default
      }
      days[i] = {
        name: name,
        id: i+(x*7),
        fri: fri
      };
    }
    return days;
  }

//check for overlapping slider times within a set of shifts
  function checkOverlap (shifts) {
    var width = 0;
    _.each(shifts, function (shift, i) {
      width += (shift.end-shift.start)
    });
    if (width > 1440) {
      return true;
    } else {
      return false;
    }
  }

//convert ui values to time for slider
  function getTimes (values) {
    var hours1 = Math.floor(values[0] / 60);
    var minutes1 = values[0] - (hours1 * 60);
    if (hours1.length == 1) hours1 = '0' + hours1;
    if (minutes1.length == 1) minutes1 = '0' + minutes1;
    if (minutes1 == 0) minutes1 = '00';
    if (hours1 >= 12) {
        if (hours1 == 12) {
            hours1 = hours1;
            minutes1 = minutes1 + " PM";
        } else {
            hours1 = hours1 - 12;
            minutes1 = minutes1 + " PM";
        }
    } else {
        hours1 = hours1;
        minutes1 = minutes1 + " AM";
    }
    if (hours1 == 0) {
        hours1 = 12;
        minutes1 = minutes1;
    }
    var hours2 = Math.floor(values[1] / 60);
    var minutes2 = values[1] - (hours2 * 60);
    if (hours2.length == 1) hours2 = '0' + hours2;
    if (minutes2.length == 1) minutes2 = '0' + minutes2;
    if (minutes2 == 0) minutes2 = '00';
    if (hours2 >= 12) {
        if (hours2 == 12) {
            hours2 = hours2;
            minutes2 = minutes2 + " PM";
        } else if (hours2 == 24) {
            hours2 = 11;
            minutes2 = "59 PM";
        } else {
            hours2 = hours2 - 12;
            minutes2 = minutes2 + " PM";
        }
    } else {
        hours2 = hours2;
        minutes2 = minutes2 + " AM";
    }
    return {
      hours1: hours1,
      minutes1: minutes1,
      hours2: hours2,
      minutes2: minutes2
    }
  }

//snack bar
  var snackbarContainer = document.querySelector('#save');
  var showToastButton = document.querySelector('.save');
  var message = '';
  showToastButton.addEventListener('click', function() {
    if (overlap) {
      message = 'Please Correct Overlapping Shifts'
    } else {
      message = 'Saved'
    }
    var data = {message: message,
      timeout: 2000
    };
    snackbarContainer.MaterialSnackbar.showSnackbar(data);
  });

}());
