var EVENT_TYPE_COUNTER = "counter";
var EVENT_NAME_BOOM = "BOOM!";
var CAP = 30;
var BOOM_DIGIT = 7;

function isCounterEvent(e) {
    return e.data != null && e.data.type === EVENT_TYPE_COUNTER;
}

var counterEvents = bp.EventSet("counters", isCounterEvent);

bp.registerBThread("counter-thread", function(){
    for (counter = 1; ; counter++) {
        // bp.log.info('counter value at: ' + counter);
        var nextCounterEvent = bp.Event("counter-event", {
            type: EVENT_TYPE_COUNTER,
            value: counter
        });
        var e = bp.sync({ request: nextCounterEvent, waitFor: bp.all });
        // bp.log.info('counter event sync: ' + e);
    }
});

bp.registerBThread("boom-sayer", function() {
    var syncOnDigit = BOOM_DIGIT - 1;
    while (true) {
        var counterEvent = bp.sync({ waitFor:counterEvents });
        var counterValue = counterEvent.data.value;

        if (counterValue % 10 === syncOnDigit || counterValue % BOOM_DIGIT === syncOnDigit) {
            bp.sync({
                request: bp.Event(EVENT_NAME_BOOM),
                block: counterEvents,
            });
        }
    }
});

bp.registerBThread("capper", function() {
    var countersAtCap = bp.EventSet("counting-cap", function(e) {
        return isCounterEvent(e) && e.data.value === CAP + 1
    });
    bp.sync({ block:countersAtCap });
});