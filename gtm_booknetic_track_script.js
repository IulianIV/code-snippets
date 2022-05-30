function() {
    var staffSelected = document.querySelector('div[class="booknetic_hidden"][data-step-id="staff"]>div[class~="booknetic_card_selected"]');

    try {
        setStaff = staffSelected.getAttribute('data-id');
    } catch (err) {
        setStaff = '';
    }

    var serviceSelected = document.querySelector('div[class="booknetic_hidden"][data-step-id="service"]>div[class~="booknetic_service_card_selected"]');

    try {
        setService = serviceSelected.getAttribute('data-id');
    } catch (err) {
        setService = '';
    }

    var daySelected = document.querySelector('div[class="booknetic_calendar_rows"]>div[class~="booknetic_calendar_selected_day"]');

    try {
        setDay = daySelected.getAttribute('data-date');
    } catch (err) {
        setDay = '';
    }

    var timeSelected = document.querySelector('div[class~="booknetic_times_list"]>div[class~="booknetic_selected_time"]');

    try {
        setTime = timeSelected.getAttribute('data-time') + '-' + timeSelected.getAttribute('data-endtime');
    } catch (err) {
        setTime = '';
    }

    var getActiveStep = document.querySelector('div[class~="booknetic_active_step"]>span[class="booknetic_badge"]');

    var currentStep = getActiveStep.textContent;

    window.onclick = function(e) {
        clicked_class = e.srcElement.className;
        clicked_text = e.srcElement.textContent;
    }

}

function sendStep() {
    layer_data = {
        'event': 'options_selection',
        'appointment_step': currentStep,
        'appointment_data': {
            'selectedStaff': setStaff,
            'selectedService': setService,
            'selectedDay': setDay,
            'selectedTime': setTime
        }
    }

    window.dataLayer.push(layer_data);

}

if (clicked_class == "booknetic_btn_secondary booknetic_prev_step" || clicked_class == "booknetic_btn_secondary booknetic_next_step") {

    return sendStep();

}

function sendAppointment() {
    layer_data = {
        'event': 'book_appointment',
        'appointment_step': currentStep,
        'appointment_data': {
            'selectedStaff': setStaff,
            'selectedService': setService,
            'selectedDay': setDay,
            'selectedTime': setTime
        }
    }

    window.dataLayer.push(layer_data);

}

if (clicked_text == "CONFIRMAȚI REZERVAREA") {

    return sendAppointment();

}



<
script >
    (function() {

        if ({
                { Click Classes }
            } == "booknetic_btn_secondary booknetic_prev_step" || {
                { Click Classes }
            } == "booknetic_btn_secondary booknetic_next_step") {

            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                'event': 'options_selection',
                'appointment_step': {
                    { Get Step }
                },
                'appointment_data': {
                    'selectedStaff': {
                        { Get Staff }
                    },
                    'selectedService': {
                        { Get Service }
                    },
                    'selectedDay': {
                        { Get Day }
                    },
                    'selectedTime': {
                        { Get Time }
                    }
                }
            });
        }

        if ({
                { Click Text }
            } == "CONFIRMAȚI REZERVAREA") {

            window.dataLayer = window.dataLayer || [];
            window.dataLayer.push({
                'event': 'book_appointment',
                'appointment_step': {
                    { Get Step }
                },
                'appointment_data': {
                    'selectedStaff': {
                        { Get Staff }
                    },
                    'selectedService': {
                        { Get Service }
                    },
                    'selectedDay': {
                        { Get Day }
                    },
                    'selectedTime': {
                        { Get Time }
                    }
                }
            });

        }

    }) <
    /script>