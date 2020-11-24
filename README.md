# M-Audio Oxygen 61 Controller Script for Bitwig

Controller script for the M-Audio 61. Maps to factory preset 1. Maybe works for other devices in the Oxygen range but I haven't tried

# Installation

Clone this repo into your Controller Scripts directory which by default is:

* Linux: _~/Bitwig Studio/Controller Scripts/_

* Windows: _%USERPROFILE%\\Documents\\Bitwig Studio\\Controller Scripts\\_

* Mac: _~/Documents/Bitwig Studio/Controller Scripts_

(You can clone it wherever you want, just make sure the contents of `controller-scripts/` end up within your Controller Scripts somehow)

Then tell Bitwig to load the controller by going to _Dashboard -> Settings -> Controllers_, selecting "add controller" and choosing "Oxygen 61" under "M-Audio"

# Mappings

C1 - C9: Volume faders for the first 9 instrument/audio/hybrid tracks  
C10 - C17: Control the remote controls page for the currently selected device  
C18 - C26: Select from the first 9 instrument/audio/hybrid tracks  
C27 - C30: Transport control  
C32: Unmapped, map yourself  
C31, C33: Default behaviour (pitch bend, sustain)

## Help me out?
If anything goes wrong, let me know! You can check the debug console by opening up the _Studio I/O Panel_ (select it on the bottom right), and clicking on _Show Control Script Console_. If there's a bunch of red text, let me know what it says.
