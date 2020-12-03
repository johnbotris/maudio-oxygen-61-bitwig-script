loadAPI(11);

load("functions.js");
load("midiMap.js");

host.defineController("M-Audio", "Oxygen 61", "0.1", "46e015b5-8b0a-4e60-9c81-aa6edf09560c");
host.defineMidiPorts(1, 0);

if (host.platformIsLinux()) {
    host.addDeviceNameBasedDiscoveryPair(["Oxygen 61 MIDI 1"], []);
}

function init() {

    const NUM_REMOTE_CONTROL_PARAMS = 8; // 8 per page?

    const notificationSettings = host.getNotificationSettings();
    notificationSettings.getUserNotificationsEnabled().set(true);

    const application = host.createApplication();
    const transport = host.createTransport();
    const track = host.createCursorTrack(2, 0);
    const trackBank = host.createMainTrackBank(9, 0, 0);
    trackBank.followCursorTrack(track);
    const device = host.createEditorCursorDevice();
    const remoteControls = device.createCursorRemoteControlsPage(NUM_REMOTE_CONTROL_PARAMS);
    const midiIn = host.getMidiInPort(0);
    const noteInput = midiIn.createNoteInput("All Channels", ["8?????", "9?????", "E?????", "B?40??"])

    noteInput.setShouldConsumeEvents(true);
    noteInput.noteLatch().isEnabled().markInterested()


    let functionMap = new Map();

    midiIn.setMidiCallback((status, data1, data2) => {

        // Special case for program change selector
        if ((status & 0xF0) === 0xC0) {
            // TODO cycle through devices when the program change buttons are pressed? need to keep track of the value of the last program change button. what to do when it's the first press? maybe nothing?

        }
        else {
            const id = (status << 16) | (data1 << 8);
            if (functionMap[id]) {
                const fn = functionMap[id];
                fn(status, data1, data2);
            }
        }

        println(`(${((status << 16) | (data1 << 8) | data2).toString(16)}) status: ${status}, data1: ${data1}, data2: ${data2}`)
    });

    const bitwig = {
        host,
        application,
        transport,
        track,
        trackBank,
        device,
        remoteControls,
        noteInput
    }

    /* Transport */
    functionMap[MAPPINGS.P1.C27] = TRANSPORT.LOOP(bitwig);
    functionMap[MAPPINGS.P1.C28] = TRANSPORT.STOP(bitwig);
    functionMap[MAPPINGS.P1.C29] = TRANSPORT.PLAY(bitwig);
    functionMap[MAPPINGS.P1.C30] = TRANSPORT.REC(bitwig);

    /* Knobs */
    functionMap[MAPPINGS.P1.C10] = REMOTE_CONTROLS.MODULATE_CONTROL(0, bitwig);
    functionMap[MAPPINGS.P1.C11] = REMOTE_CONTROLS.MODULATE_CONTROL(1, bitwig);
    functionMap[MAPPINGS.P1.C12] = REMOTE_CONTROLS.MODULATE_CONTROL(2, bitwig);
    functionMap[MAPPINGS.P1.C13] = REMOTE_CONTROLS.MODULATE_CONTROL(3, bitwig);
    functionMap[MAPPINGS.P1.C14] = REMOTE_CONTROLS.MODULATE_CONTROL(4, bitwig);
    functionMap[MAPPINGS.P1.C15] = REMOTE_CONTROLS.MODULATE_CONTROL(5, bitwig);
    functionMap[MAPPINGS.P1.C16] = REMOTE_CONTROLS.MODULATE_CONTROL(6, bitwig);
    functionMap[MAPPINGS.P1.C17] = REMOTE_CONTROLS.MODULATE_CONTROL(7, bitwig);

    /* Buttons */
    functionMap[MAPPINGS.P1.C18] = REMOTE_CONTROLS.SELECT_PAGE(0, bitwig);
    functionMap[MAPPINGS.P1.C19] = REMOTE_CONTROLS.SELECT_PAGE(1, bitwig);
    functionMap[MAPPINGS.P1.C20] = REMOTE_CONTROLS.SELECT_PAGE(2, bitwig);
    functionMap[MAPPINGS.P1.C21] = REMOTE_CONTROLS.SELECT_PAGE(3, bitwig);
    functionMap[MAPPINGS.P1.C22] = REMOTE_CONTROLS.SELECT_PAGE(4, bitwig);
    functionMap[MAPPINGS.P1.C23] = REMOTE_CONTROLS.SELECT_PAGE(5, bitwig);
    functionMap[MAPPINGS.P1.C24] = REMOTE_CONTROLS.SELECT_PAGE(6, bitwig);
    functionMap[MAPPINGS.P1.C25] = REMOTE_CONTROLS.SELECT_PAGE(7, bitwig);
    functionMap[MAPPINGS.P1.C26] = REMOTE_CONTROLS.SELECT_PAGE(8, bitwig);

    // functionMap[MAPPINGS.P1.C18] = TRACK.SELECT(0, bitwig);
    // functionMap[MAPPINGS.P1.C19] = TRACK.SELECT(1, bitwig);
    // functionMap[MAPPINGS.P1.C20] = TRACK.SELECT(2, bitwig);
    // functionMap[MAPPINGS.P1.C21] = TRACK.SELECT(3, bitwig);
    // functionMap[MAPPINGS.P1.C22] = TRACK.SELECT(4, bitwig);
    // functionMap[MAPPINGS.P1.C23] = TRACK.SELECT(5, bitwig);
    // functionMap[MAPPINGS.P1.C24] = TRACK.SELECT(6, bitwig);
    // functionMap[MAPPINGS.P1.C25] = TRACK.SELECT(7, bitwig);
    // functionMap[MAPPINGS.P1.C26] = TRACK.SELECT(8, bitwig);

    /* * * Faders * * * * * */
    functionMap[MAPPINGS.P1.C1]  = TRACK.VOLUME(0, bitwig);
    functionMap[MAPPINGS.P1.C2]  = TRACK.VOLUME(1, bitwig);
    functionMap[MAPPINGS.P1.C3]  = TRACK.VOLUME(2, bitwig);
    functionMap[MAPPINGS.P1.C4]  = TRACK.VOLUME(3, bitwig);
    functionMap[MAPPINGS.P1.C5]  = TRACK.VOLUME(4, bitwig);
    functionMap[MAPPINGS.P1.C6]  = TRACK.VOLUME(5, bitwig);
    functionMap[MAPPINGS.P1.C7]  = TRACK.VOLUME(6, bitwig);
    functionMap[MAPPINGS.P1.C8]  = TRACK.VOLUME(7, bitwig);
    functionMap[MAPPINGS.P1.C9]  = TRACK.VOLUME(8, bitwig);
}

