const TRANSPORT = {};
const CONTROLLER = {};
const REMOTE_CONTROLS = {};
const TRACK = {};
const DEVICE = {};

const POPUPS_ON = true;

function popup(message) {
    if (POPUPS_ON) {
        host.showPopupNotification(message);
    }
}


// Takes a SettableBooleanValue to toggle
// name is either a string or a function that returns a string
function toggleFunction(name, value) {

    let showPopup = false
    let onChangeFn= (newValue) => { showPopup&& popup(`${typeof name === 'function' ? name() : name} ${newValue ? "On" : "Off"}`); showPopup = false; };
    value.addValueObserver(onChangeFn);
    return (status, data1, data2) => {
        if (data2 !== 0) {
            showPopup = true;
            value.toggle();
        }
    }
}

// Takes a SettableEnumValue and cycles to the next one
// Uses the enum's definition to figure out how to cycle around
function enumCycleFunction(name, value) {

    const enumDefinition = value.enumDefinition();
    const valueCount = enumDefinition.getValueCount();

    let showPopup = false;
    let onChangeFn = (newValue) => { showPopup&& popup(`${name}: ${enumDefinition.valueDefinitionFor(newValue).getDisplayName()}`); showPopup = false; };

    value.addValueObserver(onChangeFn);

    return (status, data1, data2) => {
        if (data2 !== 0) {
            // let me know if there's a less convoluted way to do this..........
            const currentId = value.get();
            const valueDefinition = enumDefinition.valueDefinitionFor(currentId);
            const currentIndex = valueDefinition.getValueIndex();
            const nextIndex = (currentIndex + 1) % valueCount;
            const nextValue = enumDefinition.valueDefinitionAt(nextIndex);
            const nextId = nextValue.getId();

            showPopup = true;
            value.set(nextId);
        }
    }
}

TRANSPORT.PLAY = (bitwig) => {
    return (status, data1, data2) => {
        if (data2 !== 0) bitwig.transport.play(); popup("Play");
    }
}

TRANSPORT.STOP = (bitwig) => {
    return (status, data1, data2) => {
        if (data2 !== 0) bitwig.transport.stop(); popup("Stop");
    }
}

TRANSPORT.REC                   = (bitwig) => toggleFunction("Record", bitwig.transport.isArrangerRecordEnabled());
TRANSPORT.METRONOME             = (bitwig) => toggleFunction("Metronome", bitwig.transport.isMetronomeEnabled());
TRANSPORT.LOOP                  = (bitwig) => toggleFunction("Loop", bitwig.transport.isArrangerLoopEnabled());
TRANSPORT.OVERDUB               = (bitwig) => toggleFunction("Overdub", bitwig.transport.isArrangerOverdubEnabled());
TRANSPORT.AUTOMATION_WRITE      = (bitwig) => toggleFunction("Automation Write", bitwig.transport.isArrangerAutomationWriteEnabled());
TRANSPORT.PUNCH_IN              = (bitwig) => toggleFunction("Punch In", bitwig.transport.isPunchInEnabled());
TRANSPORT.PUNCH_OUT             = (bitwig) => toggleFunction("Punch Out", bitwig.transport.isPunchOutEnabled());
TRANSPORT.AUTOMATION_WRITE_MODE = (bitwig) => enumCycleFunction("Automation Write Mode", bitwig.transport.automationWriteMode());
TRANSPORT.PREROLL_MODE          = (bitwig) => enumCycleFunction("Pre Roll Length", bitwig.transport.preRoll());
TRANSPORT.PREROLL_METRONOME     = (bitwig) => toggleFunction("Pre Roll Metronome", bitwig.transport.isMetronomeAudibleDuringPreRoll());

TRANSPORT.TAP_TEMPO = (bitwig) => {

    // not sure right now how to add value observer to tempo().modulatedValue().getRaw()
    // will figure out when less sleepy
    let showPopup = false;
    let onChangeFn = (newValue) => { showPopup && popup(`${bitwig.transport.tempo().modulatedValue().getRaw().toFixed(2)}BPM`); showPopup = false; };
    bitwig.transport.tempo().modulatedValue().addValueObserver(onChangeFn);

    return (status, data1, data2) => {
        if (data2 !== 0) {
            showPopup = true;
            bitwig.transport.tapTempo()
        }
    }
}

TRANSPORT.SCROLL = (amount, doSnap, bitwig) => {
    return (status, data1, data2) => {
        if (data2 !== 0) {
            bitwig.transport.incPosition(amount, doSnap);
        }
    }
};

TRACK.NEXT = (bitwig) => {
    let showPopup = false;
    bitwig.track.name().addValueObserver((value) => { if(showPopup) popup(value); showPopup = false;});
    return (status, data1, data2) => {
        if (data2 !== 0) {
            showPopup = true;
            bitwig.track.selectNext();        
        }
    }
}

TRACK.PREV = (bitwig) => {
    let showPopup = false;
    bitwig.track.name().addValueObserver((value) => { showPopup && popup(value); showPopup = false;});
    return (status, data1, data2) => {
        if (data2 !== 0) {
            showPopup = true;
            bitwig.track.selectPrevious();        
        }
    }
}

TRACK.SELECT = (i, bitwig) => {
    let showPopup = false;
    bitwig.track.name().addValueObserver((value) => { showPopup && popup(value); showPopup = false;});
    return (status, data1, data2) => {
        showPopup = true;
        bitwig.track.selectChannel(bitwig.trackBank.getChannel(i));
    }
}

TRACK.VOLUME = (i, bitwig) => {
    const track = bitwig.trackBank.getChannel(i);
    track.getVolume().markInterested();
    return (status, data1, data2) => {
        track.getVolume().set(data2, 128);
    }
}

REMOTE_CONTROLS.MODULATE_CONTROL = (param_id, bitwig) => {
    bitwig.remoteControls.getParameter(param_id).markInterested();
    bitwig.remoteControls.getParameter(param_id).setIndication(true);
    return (status, data1, data2) => {
        bitwig.remoteControls.getParameter(param_id).set(data2, 128);
    }
}

REMOTE_CONTROLS.SELECT_PAGE = (page_index, bitwig) => {

    bitwig.remoteControls.pageNames().markInterested();
    bitwig.remoteControls.pageCount().markInterested();
    let showPopup = false;
    let onChangeFn = (newIndex) => { showPopup && popup(bitwig.remoteControls.pageNames().get()[newIndex]); showPopup = false; }
    bitwig.remoteControls.selectedPageIndex().addValueObserver(onChangeFn);

    return (status, data1, data2) => {
        if (page_index > bitwig.remoteControls.pageCount()) {
            popup(`Page ${page_index} not available`);
        }
        else {
            showPopup = true;
            bitwig.remoteControls.selectedPageIndex().set(page_index);
        }
    }
}

DEVICE.NEXT = (bitwig) => {
    const device = bitwig.device
    device.isRemoteControlsSectionVisible().markInterested()

    let showPopup = false;
    const changeFn = () => { showPopup && popup(device.name().get()); showPopup = false }
    device.position().addValueObserver(changeFn)

    return (status, data1, data2) => {
        if (data2 !== 0) {
            showPopup = true
            device.isRemoteControlsSectionVisible().set(false)
            device.selectNext()
            device.isRemoteControlsSectionVisible().set(true)
        }
    }
}

DEVICE.PREV = (bitwig) => {
    const device = bitwig.device
    device.isRemoteControlsSectionVisible().markInterested()

    let showPopup = false;
    const changeFn = () => { showPopup && popup(device.name().get()); showPopup = false }
    device.position().addValueObserver(changeFn)

    return (status, data1, data2) => {
        if (data2 !== 0) {
            showPopup = true
            device.isRemoteControlsSectionVisible().set(false)
            device.selectPrevious()
            device.isRemoteControlsSectionVisible().set(true)
        }
    }
}

DEVICE.TOGGLE_ENABLED = (bitwig) => {
    bitwig.device.name().markInterested()
    bitwig.track.name().markInterested()
    return toggleFunction(() => `${bitwig.track.name().get()}: ${bitwig.device.name().get()}`, bitwig.device.isEnabled());
}

UNMAPPED = () => { popup("Unmapped") }

