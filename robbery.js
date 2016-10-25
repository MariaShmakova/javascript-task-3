'use strict';

/**
 * Сделано задание на звездочку
 * Реализовано оба метода и tryLater
 */
exports.isStar = false;

/**
 * @param {Object} schedule – Расписание Банды
 * @param {Number} duration - Время на ограбление в минутах
 * @param {Object} workingHours – Время работы банка
 * @param {String} workingHours.from – Время открытия, например, "10:00+5"
 * @param {String} workingHours.to – Время закрытия, например, "18:00+5"
 * @returns {Object}
 */

var benchmarkWeekDays = {
     // 'Mon Oct 17 2016 00:00:01 GMT+0000',
    'ПН': {
        day: '17',
        month: 'Oct',
        year: '2016'
    },
    // 'Tue Oct 18 2016 00:00:01 GMT+0000',
    'ВТ': {
        day: '18',
        month: 'Oct',
        year: '2016'
    },
     // 'Wed Oct 19 2016 00:00:01 GMT+0000'
    'СР': {
        day: '19',
        month: 'Oct',
        year: '2016'
    }
};
var translateWeekDays = {
    'Mon': 'ПН',
    'Tue': 'ВТ',
    'Wed': 'СР',
    'Thu': 'ЧТ',
    'Fri': 'ПТ',
    'Sut': 'СБ',
    'Sun': 'ВС'
};
var timeZone;

function createDate(arrData) {
    var day = arrData[0];
    var hour = arrData[1];
    var min = arrData[2];
    var zone = arrData[3];
    var currentDay = benchmarkWeekDays[day];
    var currentDate = day + ' ' + currentDay.month + ' ' + currentDay.day + ' ';
    currentDate += currentDay.year + ' ' + hour + ':' + min + ':00 GMT+' + zone + '00';

    return currentDate;
}
function addingPropertiesFrom(period, newWeekDay, newHourInZone, newMinuteInZone) {
    period.fromDayInZone = newWeekDay;
    period.fromHourInZone = newHourInZone;
    period.fromMinuteInZone = newMinuteInZone;
}

function addingPropertiesTo(period, newWeekDay, newHourInZone, newMinuteInZone) {
    period.toDayInZone = newWeekDay;
    period.toHourInZone = newHourInZone;
    period.toMinuteInZone = newMinuteInZone;
}

function translateToOtherZone(arrForName, flagOfFromOrTo) {
    arrForName.forEach(function (period) {
        var re = /[\s,+,:]/;
        var arrData;
        if (flagOfFromOrTo === 'from') {
            arrData = period.from.split(re);
        } else {
            arrData = period.to.split(re);
        }
        var currentDate = createDate(arrData);
        var dateFromWithZone = new Date(currentDate);
        var newWeekDay = translateWeekDays[String(dateFromWithZone).substring(0, 3)];
        var arrNewData = String(dateFromWithZone).split(' ');
        var time = arrNewData[4].split(':');
        var newHourInZone = time[0];
        var newMinuteInZone = time[1];
        if (flagOfFromOrTo === 'from') {
            addingPropertiesFrom(period, newWeekDay, newHourInZone, newMinuteInZone);
        } else {
            addingPropertiesTo(period, newWeekDay, newHourInZone, newMinuteInZone);
        }
    });
}

function divisionEmployment(arrForName) {
    arrForName.forEach(function (period) {
        if (period.fromDayInZone !== period.toDayInZone) {
            var newEmpl = {
                from: period.from,
                to: period.to,
                fromDayInZone: period.toDayInZone,
                toDayInZone: period.toDayInZone,
                fromHourInZone: '00' - Number(timeZone),
                fromMinuteInZone: '00',
                toHourInZone: period.toHourInZone,
                toMinuteInZone: period.toMinuteInZone
            };
            arrForName.push(newEmpl);
            period.toDayInZone = period.fromDayInZone;
            period.toHourInZone = '23' - Number(timeZone);
            period.toMinuteInZone = '59';
        }
    });
}

function compareStartTime(period1, period2) {
    return period1.fromHourInZone - period2.fromHourInZone;
}

function employmentDays(arrForName) {
    var scheduleForMondey = { 'ПН': [] };
    var scheduleForTuesday = { 'ВТ': [] };
    var scheduleForWednesday = { 'СР': [] };
    arrForName.forEach(function (period) {
        switch (period.fromDayInZone) {
            case 'ПН':
                scheduleForMondey['ПН'].push(period);
                break;
            case 'ВТ':
                scheduleForTuesday['ВТ'].push(period);
                break;
            case 'СР':
                scheduleForWednesday['СР'].push(period);
                break;
            default:
        }
    });
    var forMon = scheduleForMondey['ПН'].sort(compareStartTime);
    var forTue = scheduleForTuesday['ВТ'].sort(compareStartTime);
    var forWed = scheduleForWednesday['СР'].sort(compareStartTime);

    return [forMon, forTue, forWed];
}

function prepareToFoundAndSearchMin(firstSegment, secondSegment, thirdSegment) {
    var firstLeftMinute = firstSegment.fromHourInZone * 60 + Number(firstSegment.fromMinuteInZone);
    var firstRightMinute = firstSegment.toHourInZone * 60 + Number(firstSegment.toMinuteInZone);
    var secLeftMinute = secondSegment.fromHourInZone * 60 + Number(secondSegment.fromMinuteInZone);
    var secRightMinute = secondSegment.toHourInZone * 60 + Number(secondSegment.toMinuteInZone);
    var thirdLeftMinute = thirdSegment.fromHourInZone * 60 + Number(thirdSegment.fromMinuteInZone);
    var thirdRightMinute = thirdSegment.toHourInZone * 60 + Number(thirdSegment.toMinuteInZone);

    var max = Math.max(firstLeftMinute, secLeftMinute, thirdLeftMinute);
    var min = Math.min(firstRightMinute, secRightMinute, thirdRightMinute);
    var condition1 = firstSegment.fromDayInZone !== secondSegment.fromDayInZone;
    var condition2 = firstSegment.fromDayInZone !== thirdSegment.fromDayInZone;
    var condition3 = secondSegment.fromDayInZone !== thirdSegment.fromDayInZone;
    if ((max > min) || condition1 || condition2 || condition3) {
        return -1;
    }

    return min;
}

function foundOverlap(firstSegment, secondSegment, thirdSegment) {

    var firstLeftMinute = firstSegment.fromHourInZone * 60 + Number(firstSegment.fromMinuteInZone);
    var secLeftMinute = secondSegment.fromHourInZone * 60 + Number(secondSegment.fromMinuteInZone);
    var thirdLeftMinute = thirdSegment.fromHourInZone * 60 + Number(thirdSegment.fromMinuteInZone);
    var max = Math.max(firstLeftMinute, secLeftMinute, thirdLeftMinute);
    var min = prepareToFoundAndSearchMin(firstSegment, secondSegment, thirdSegment);
    if (min === -1) {
        return 0;
    }

    var localDuration = min - max;
    var beginH;
    var beginM;
    switch (max) {
        case firstLeftMinute:
            beginH = firstSegment.fromHourInZone;
            beginM = firstSegment.fromMinuteInZone;
            break;
        case secLeftMinute:
            beginH = secondSegment.fromHourInZone;
            beginM = secondSegment.fromMinuteInZone;
            break;
        case thirdLeftMinute:
            beginH = thirdSegment.fromHourInZone;
            beginM = thirdSegment.fromMinuteInZone;
            break;
        default:
    }
    var answer = {
        weekDay: firstSegment.fromDayInZone,
        beginHour: beginH,
        beginMinute: beginM,
        duration: localDuration
    };

    return answer;

}
var firstAns = 0;
function run(needData, indexD, indexR, flagToFound) {
    var freeDanny = needData[0];
    var freeRusty = needData[1];
    var freeLinus = needData[2];
    var duration = needData[3];
    var answer = {};
    for (var indexL = 0; indexL < freeLinus.length; indexL++) {
        var result = foundOverlap(freeDanny[indexD], freeRusty[indexR], freeLinus[indexL]);
        if ((result.duration >= duration) && !flagToFound) {
            answer = result;
            flagToFound = true;
            firstAns++;

            return {
                maxFreePeriod: answer,
                flag: flagToFound
            };
        }
    }
    flagToFound = false;

    return {
        maxFreePeriod: answer,
        flag: flagToFound
    };
}

function closeHoursBank(workHoursWithZone) {
    var firstClose = {
        open: {
            hour: '00',
            minute: '00'
        },
        close: {
            hour: workHoursWithZone.from.hour,
            minute: workHoursWithZone.from.minute
        }
    };
    var secondClose = {
        open: {
            hour: workHoursWithZone.to.hour,
            minute: workHoursWithZone.to.minute
        },
        close: {
            hour: '23',
            minute: '59'
        }
    };
    var hoursClose = [];
    hoursClose.push(firstClose);
    hoursClose.push(secondClose);

    return hoursClose;
}

function createScheduleFreeTime(schedule, duration, workHoursWithZone) {
    var scheduleFreeTime = {
        Danny: [],
        Rusty: [],
        Linus: []
    };

    var bankClose = closeHoursBank(workHoursWithZone);
    for (var key in schedule) {
        if (schedule.hasOwnProperty(key)) {
            var name = schedule[key];
            translateToOtherZone(name, 'from');
            translateToOtherZone(name, 'to');
            divisionEmployment(name);
            var empDays = employmentDays(name);
            var freeTime = freeTimeForName(empDays, bankClose, workHoursWithZone);
            scheduleFreeTime[key] = freeTime;
        }
    }

    return scheduleFreeTime;
}

function freeTimeForName(empDays, bankClose, workHoursWithZone) {
    var arrFreeForName = [];
    empDays.forEach(function (arrForDay) {
        var countPeriod = arrForDay.length;
        if (countPeriod !== 0) {
            var firstWrite = {
                fromDayInZone: arrForDay[0].fromDayInZone,
                fromHourInZone: bankClose[0].close.hour,
                fromMinuteInZone: bankClose[0].close.minute,
                toDayInZone: arrForDay[0].toDayInZone,
                toHourInZone: arrForDay[0].fromHourInZone,
                toMinuteInZone: arrForDay[0].fromMinuteInZone
            };
            arrFreeForName.push(firstWrite);

            var lastWrite = {
                fromDayInZone: arrForDay[countPeriod - 1].fromDayInZone,
                fromHourInZone: arrForDay[countPeriod - 1].toHourInZone,
                fromMinuteInZone: arrForDay[countPeriod - 1].toMinuteInZone,
                toDayInZone: arrForDay[countPeriod - 1].toDayInZone,
                toHourInZone: bankClose[1].open.hour,
                toMinuteInZone: bankClose[1].open.minute
            };
            arrFreeForName.push(lastWrite);
            for (var i = 1; i < countPeriod; i++) {
                var middleWrite = {
                    fromDayInZone: arrForDay[i].fromDayInZone,
                    fromHourInZone: arrForDay[i - 1].toHourInZone,
                    fromMinuteInZone: arrForDay[i - 1].toMinuteInZone,
                    toDayInZone: arrForDay[i].toDayInZone,
                    toHourInZone: arrForDay[i].fromHourInZone,
                    toMinuteInZone: arrForDay[i].fromMinuteInZone
                };
                arrFreeForName.push(middleWrite);
            }
        } else {
            var write = {
                fromDayInZone: '',
                fromHourInZone: workHoursWithZone.from.hour,
                fromMinuteInZone: workHoursWithZone.from.minute,
                toDayInZone: '',
                toHourInZone: workHoursWithZone.to.hour,
                toMinuteInZone: workHoursWithZone.to.minute
            };
            arrFreeForName.push(write);
        }

    });

    return arrFreeForName;
}


function mainActionToFound(schedule, duration, workHoursWithZone) {
    var scheduleFreeTime = createScheduleFreeTime(schedule, duration, workHoursWithZone);
    var freeTimeDanny = scheduleFreeTime.Danny.sort(compareStartTime);
    var freeTimeRusty = scheduleFreeTime.Rusty.sort(compareStartTime);
    var freeTimeLinus = scheduleFreeTime.Linus.sort(compareStartTime);
    var needData = [freeTimeDanny, freeTimeRusty, freeTimeLinus, duration];
    var flagToFound = false;
    var maxPeriod = {};
    for (var indexD = 0; indexD < freeTimeDanny.length; indexD++) {
        for (var indexR = 0; indexR < freeTimeRusty.length; indexR++) {
            var foundRes = run(needData, indexD, indexR, flagToFound);
            maxPeriod = (foundRes.flag && firstAns === 1) ? foundRes.maxFreePeriod : maxPeriod;
            flagToFound = foundRes.flag;
        }
    }

    return maxPeriod;
}

exports.getAppropriateMoment = function (schedule, duration, workingHours) {
    var workFrom = workingHours.from;
    timeZone = workFrom.substring(6);
    var workTo = workingHours.to;
    var workHoursWithZone =
        {
            from:
            {
                hour: Number(workFrom.substring(0, 2)),
                minute: workFrom.substring(3, 5)
            },
            to:
            {
                hour: Number(workTo.substring(0, 2)),
                minute: workTo.substring(3, 5)
            }
        };

    var ansToExists = false;
    var maxFreePeriod = mainActionToFound(schedule, duration, workHoursWithZone);
    var t = Number(timeZone);
    var tempHour = Number(maxFreePeriod.beginHour);
    var checkToOneDay = (tempHour + t) >= 0;
    if ((maxFreePeriod.duration >= duration) && checkToOneDay) {
        ansToExists = true;
    }

    return {

        /**
         * Найдено ли время
         * @returns {Boolean}
         */
        exists: function () {
            return ansToExists;
        },

        /**
         * Возвращает отформатированную строку с часами для ограбления
         * Например,
         *   "Начинаем в %HH:%MM (%DD)" -> "Начинаем в 14:59 (СР)"
         * @param {String} template
         * @returns {String}
         */
        format: function (template) {
            var answHour;
            if (tempHour + t < 10) {
                answHour = '0' + String(tempHour + t - timeZone);
            } else {
                answHour = tempHour + t - timeZone;
            }
            if (ansToExists) {
                template = template.replace(/%HH/, answHour);
                template = template.replace(/%MM/, maxFreePeriod.beginMinute);
                template = template.replace(/%DD/, maxFreePeriod.weekDay);

                return template;
            }

            return '';
        },

        /**
         * Попробовать найти часы для ограбления позже [*]
         * @star
         * @returns {Boolean}
         */
        tryLater: function () {

            /*
            if ((ansToExists) && ((maxFreePeriod.duration - 30) >= duration)) {
                return true;
            } */

            return true;
        }
    };
};
