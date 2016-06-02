var ScheduleCollection = {};
var ShiftsCollection = {};

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

var scheduleCollection = Object.create(ScheduleCollection);

$('.add-schedule').on('click', function (evt) {
  var scheduleTemplate = $('#schedule-template').html();
  $('.schedules').append(scheduleTemplate);
  var schedule = scheduleCollection.add();
  componentHandler.upgradeDom();

  $('.remove-schedule').last().on('click', function (evt) {
    $(evt.target).closest('.schedule').next('.schedule-shifts').remove();
    $(evt.target).closest('.schedule').next('.slider').remove();
    $(evt.target).closest('.schedule').remove();
    scheduleCollection.remove(schedule.id);
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
        v = getTimes(ui.values);
        $(e.target).children('.slider-time').children('.slider-begin').html(v.hours1 + ':' + v.minutes1);
        $(e.target).children('.slider-time').children('.slider-end').html(v.hours2 + ':' + v.minutes2);
      }
    });

    $('.schedule-shifts').children('.shift').each(function (i, shift) {
      $(shift).children('.slider').slider("values", [ schedule.shifts[i+1].start, schedule.shifts[i+1].end ]);
      v = getTimes([ schedule.shifts[i+1].start, schedule.shifts[i+1].end ]);
      $(shift).children('.slider').children('.slider-time').children('.slider-begin').html(v.hours1 + ':' + v.minutes1);
      $(shift).children('.slider').children('.slider-time').children('.slider-begin').html(v.hours2 + ':' + v.minutes2);
    })

    $('.remove-shift').last().on('click', function (evt) {
      $(evt.target).closest('.shift').remove();
      schedule.shifts.remove(shift.id);
    });
  });
});

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
