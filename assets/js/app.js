(function () {
    'use strict';

    const thaiMonths = [
        'มกราคม', 'กุมภาพันธ์', 'มีนาคม', 'เมษายน', 'พฤษภาคม', 'มิถุนายน',
        'กรกฎาคม', 'สิงหาคม', 'กันยายน', 'ตุลาคม', 'พฤศจิกายน', 'ธันวาคม'
    ];
    const thaiWeekdays = ['อาทิตย์', 'จันทร์', 'อังคาร', 'พุธ', 'พฤหัสบดี', 'ศุกร์', 'เสาร์'];

    const rateMap = {
        car: 4,
        motorcycle: 2
    };

    const vehicleLabelMap = {
        car: 'รถยนต์',
        motorcycle: 'รถจักรยานยนต์'
    };

    const numberFormatter = new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 2
    });

    const moneyFormatter = new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: 2,
        maximumFractionDigits: 2
    });

    const integerFormatter = new Intl.NumberFormat('th-TH', {
        minimumFractionDigits: 0,
        maximumFractionDigits: 0
    });

    const durationElements = {
        form: document.getElementById('duration-form'),
        departDate: document.getElementById('depart-date'),
        arrivalDate: document.getElementById('arrival-date'),
        departHour: document.getElementById('depart-hour'),
        departMinute: document.getElementById('depart-minute'),
        arrivalHour: document.getElementById('arrival-hour'),
        arrivalMinute: document.getElementById('arrival-minute'),
        calcBtn: document.getElementById('duration-calc-btn'),
        resetBtn: document.getElementById('duration-reset-btn'),
        error: document.getElementById('duration-error'),
        status: document.getElementById('duration-status'),
        output: document.getElementById('duration-output'),
        departDisplay: document.getElementById('depart-display'),
        arrivalDisplay: document.getElementById('arrival-display'),
        departHelper: document.getElementById('depart-helper'),
        arrivalHelper: document.getElementById('arrival-helper')
    };

    const expenseElements = {
        form: document.getElementById('expense-form'),
        vehicleType: document.getElementById('vehicle-type'),
        distance: document.getElementById('distance-one-way'),
        calcBtn: document.getElementById('expense-calc-btn'),
        resetBtn: document.getElementById('expense-reset-btn'),
        error: document.getElementById('expense-error'),
        status: document.getElementById('expense-status'),
        payable: document.getElementById('payable-output'),
        roundTrip: document.getElementById('roundtrip-output'),
        vehicleDisplay: document.getElementById('vehicle-display'),
        distanceDisplay: document.getElementById('distance-display'),
        rateDisplay: document.getElementById('rate-display'),
        grossDisplay: document.getElementById('gross-display'),
        formulaDisplay: document.getElementById('formula-display')
    };

    function init() {
        populateTimeSelect(durationElements.departHour, 23, 'ชั่วโมง');
        populateTimeSelect(durationElements.arrivalHour, 23, 'ชั่วโมง');
        populateTimeSelect(durationElements.departMinute, 59, 'นาที');
        populateTimeSelect(durationElements.arrivalMinute, 59, 'นาที');

        bindDurationEvents();
        bindExpenseEvents();
        resetDurationResult();
        resetExpenseResult();
    }

    function populateTimeSelect(select, max, placeholder) {
        const existingPlaceholder = select.querySelector('option[value=""]');
        const start = existingPlaceholder ? 0 : -1;
        if (start === 0) {
            existingPlaceholder.textContent = placeholder;
        }
        for (let i = 0; i <= max; i += 1) {
            const option = document.createElement('option');
            const value = String(i).padStart(2, '0');
            option.value = value;
            option.textContent = value;
            select.appendChild(option);
        }
    }

    function bindDurationEvents() {
        durationElements.calcBtn.addEventListener('click', calculateDuration);
        durationElements.form.addEventListener('submit', function (event) {
            event.preventDefault();
            calculateDuration();
        });
        durationElements.form.addEventListener('reset', function () {
            window.setTimeout(function () {
                clearDurationError();
                resetDurationResult();
                updateDateHelpers();
            }, 0);
        });

        [durationElements.departDate, durationElements.arrivalDate].forEach(function (input) {
            input.addEventListener('change', updateDateHelpers);
        });
    }

    function bindExpenseEvents() {
        expenseElements.calcBtn.addEventListener('click', calculateExpense);
        expenseElements.form.addEventListener('submit', function (event) {
            event.preventDefault();
            calculateExpense();
        });
        expenseElements.form.addEventListener('reset', function () {
            window.setTimeout(function () {
                clearExpenseError();
                resetExpenseResult();
            }, 0);
        });
    }

    function calculateDuration() {
        clearDurationError();

        const departData = getDateTimeData(
            durationElements.departDate.value,
            durationElements.departHour.value,
            durationElements.departMinute.value
        );
        const arrivalData = getDateTimeData(
            durationElements.arrivalDate.value,
            durationElements.arrivalHour.value,
            durationElements.arrivalMinute.value
        );

        if (!departData.complete || !arrivalData.complete) {
            showDurationError('กรุณาเลือกวันและเวลาให้ครบถ้วน');
            return;
        }

        if (!departData.valid || !arrivalData.valid) {
            showDurationError('ข้อมูลวันหรือเวลาไม่ถูกต้อง');
            return;
        }

        if (arrivalData.date.getTime() < departData.date.getTime()) {
            showDurationError('วันเวลาถึงที่พักต้องไม่น้อยกว่าวันเวลาออกเดินทาง');
            return;
        }

        const diffMs = arrivalData.date.getTime() - departData.date.getTime();
        const totalMinutes = Math.floor(diffMs / 60000);
        const days = Math.floor(totalMinutes / 1440);
        const hours = Math.floor((totalMinutes % 1440) / 60);
        const minutes = totalMinutes % 60;

        durationElements.output.textContent = days + ' วัน ' + hours + ' ชั่วโมง ' + minutes + ' นาที';
        durationElements.departDisplay.textContent = departData.display;
        durationElements.arrivalDisplay.textContent = arrivalData.display;
        durationElements.status.textContent = 'คำนวณแล้ว';
    }

    function calculateExpense() {
        clearExpenseError();

        const vehicleType = expenseElements.vehicleType.value;
        const distance = Number.parseFloat(expenseElements.distance.value);

        if (!vehicleType || !Object.prototype.hasOwnProperty.call(rateMap, vehicleType)) {
            showExpenseError('กรุณาเลือกประเภทรถ');
            return;
        }

        if (!Number.isFinite(distance) || distance <= 0) {
            showExpenseError('กรุณากรอกระยะทางขาเดียวเป็นตัวเลขที่มากกว่า 0');
            return;
        }

        const rate = rateMap[vehicleType];
        const roundTripDistance = distance * 2;
        const grossAmount = roundTripDistance * rate;
        const payableAmount = Math.floor(grossAmount);

        expenseElements.payable.textContent = integerFormatter.format(payableAmount) + ' บาท';
        expenseElements.roundTrip.textContent = numberFormatter.format(roundTripDistance) + ' กม.';
        expenseElements.vehicleDisplay.textContent = vehicleLabelMap[vehicleType];
        expenseElements.distanceDisplay.textContent = numberFormatter.format(distance) + ' กม.';
        expenseElements.rateDisplay.textContent = integerFormatter.format(rate) + ' บาท/กม.';
        expenseElements.grossDisplay.textContent = moneyFormatter.format(grossAmount) + ' บาท';
        expenseElements.formulaDisplay.textContent =
            '(' + numberFormatter.format(distance) + ' × 2) × ' + integerFormatter.format(rate) +
            ' = ' + moneyFormatter.format(grossAmount) + ' บาท → ปัดเศษลง = ' +
            integerFormatter.format(payableAmount) + ' บาท';
        expenseElements.status.textContent = 'คำนวณแล้ว';
    }

    function getDateTimeData(dateValue, hourValue, minuteValue) {
        const complete = !!(dateValue && hourValue !== '' && minuteValue !== '');
        if (!complete) {
            return { complete: false, valid: false, date: null, display: '-' };
        }

        const date = new Date(dateValue + 'T' + hourValue + ':' + minuteValue + ':00');
        if (!(date instanceof Date) || Number.isNaN(date.getTime())) {
            return { complete: true, valid: false, date: null, display: '-' };
        }

        return {
            complete: true,
            valid: true,
            date: date,
            display: formatThaiDateTime(date)
        };
    }

    function formatThaiDateTime(date) {
        const dayName = thaiWeekdays[date.getDay()];
        const day = date.getDate();
        const monthName = thaiMonths[date.getMonth()];
        const thaiYear = date.getFullYear() + 543;
        const hours = String(date.getHours()).padStart(2, '0');
        const minutes = String(date.getMinutes()).padStart(2, '0');
        return 'วัน' + dayName + 'ที่ ' + day + ' ' + monthName + ' ' + thaiYear + ' เวลา ' + hours + ':' + minutes + ' น.';
    }

    function formatThaiDateOnly(dateValue) {
        if (!dateValue) {
            return '-';
        }
        const date = new Date(dateValue + 'T00:00:00');
        if (Number.isNaN(date.getTime())) {
            return '-';
        }
        const dayName = thaiWeekdays[date.getDay()];
        const day = date.getDate();
        const monthName = thaiMonths[date.getMonth()];
        const thaiYear = date.getFullYear() + 543;
        return 'วัน' + dayName + 'ที่ ' + day + ' ' + monthName + ' ' + thaiYear;
    }

    function updateDateHelpers() {
        durationElements.departHelper.textContent = formatThaiDateOnly(durationElements.departDate.value);
        durationElements.arrivalHelper.textContent = formatThaiDateOnly(durationElements.arrivalDate.value);
    }

    function resetDurationResult() {
        durationElements.output.textContent = '-';
        durationElements.departDisplay.textContent = '-';
        durationElements.arrivalDisplay.textContent = '-';
        durationElements.status.textContent = 'พร้อมคำนวณ';
        updateDateHelpers();
    }

    function resetExpenseResult() {
        expenseElements.payable.textContent = '-';
        expenseElements.roundTrip.textContent = '-';
        expenseElements.vehicleDisplay.textContent = '-';
        expenseElements.distanceDisplay.textContent = '-';
        expenseElements.rateDisplay.textContent = '-';
        expenseElements.grossDisplay.textContent = '-';
        expenseElements.formulaDisplay.textContent = '-';
        expenseElements.status.textContent = 'พร้อมคำนวณ';
    }

    function showDurationError(message) {
        durationElements.error.textContent = message;
        durationElements.status.textContent = 'ข้อมูลไม่ครบ';
    }

    function clearDurationError() {
        durationElements.error.textContent = '';
    }

    function showExpenseError(message) {
        expenseElements.error.textContent = message;
        expenseElements.status.textContent = 'ข้อมูลไม่ครบ';
    }

    function clearExpenseError() {
        expenseElements.error.textContent = '';
    }

    init();
})();
