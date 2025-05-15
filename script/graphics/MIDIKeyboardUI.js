class MIDIKeyboardUI {
    constructor(startNote = 60, numKeys = 13) { // Default to C4, 1 octave (C to C)
        this._container = document.createElement("div");
        this._container.style.display = "flex";
        this._container.style.justifyContent = "center";
        this._container.style.alignItems = "flex-start"; // Align keys to the top
        this._container.style.padding = "10px";
        this._container.style.backgroundColor = "#333"; // Dark background for the keyboard area
        this._container.style.borderRadius = "4px";
        this._container.style.position = "relative"; // For positioning black keys
        this._container.style.height = "100px"; // Approximate height

        this.noteOffset = startNote; // MIDI note number for the first key

        // Define key types (0 for white, 1 for black) for one octave pattern
        // C, C#, D, D#, E, F, F#, G, G#, A, A#, B
        const keyPattern = [0, 1, 0, 1, 0, 0, 1, 0, 1, 0, 1, 0]; 
        const whiteKeyWidth = 30; // pixels
        const blackKeyWidth = whiteKeyWidth * 0.6;
        const blackKeyHeight = parseFloat(this._container.style.height) * 0.6;

        let currentX = 0;

        for (let i = 0; i < numKeys; i++) {
            const midiNote = this.noteOffset + i;
            const keyType = keyPattern[i % 12];
            const key = document.createElement("div");
            key.style.cursor = "pointer";
            key.style.boxSizing = "border-box";

            if (keyType === 0) { // White key
                key.style.width = whiteKeyWidth + "px";
                key.style.height = this._container.style.height;
                key.style.backgroundColor = "white";
                key.style.border = "1px solid #222";
                key.style.zIndex = "1";
                key.style.position = "relative"; // Ensure it's part of the normal flow for flex
                key.dataset.note = midiNote;
                this._container.appendChild(key);
            } else { // Black key
                key.style.width = blackKeyWidth + "px";
                key.style.height = blackKeyHeight + "px";
                key.style.backgroundColor = "black";
                key.style.border = "1px solid #555";
                key.style.position = "absolute";
                key.style.zIndex = "2";
                
                // Calculate position relative to the previous white key
                // This logic assumes a standard keyboard layout
                const previousWhiteKey = this._container.children[this._container.children.length -1];
                if (previousWhiteKey) {
                    const prevKeyRect = previousWhiteKey.getBoundingClientRect(); // Won't work correctly here as it's not in DOM
                    // Simplified positioning: place it half-way over the previous white key's right edge
                    // This needs to be calculated based on cumulative white key widths
                    let whiteKeysPassed = 0;
                    for(let k=0; k < i; k++) {
                        if(keyPattern[k % 12] === 0) whiteKeysPassed++;
                    }
                     // Position black key relative to the start of the white key it overlaps
                    key.style.left = (whiteKeysPassed * whiteKeyWidth) - (blackKeyWidth / 2) + "px";
                }

                key.style.top = "0px";
                key.dataset.note = midiNote;
                this._container.appendChild(key);
            }

            key.addEventListener("mousedown", (event) => {
                event.stopPropagation();
                const note = parseInt(event.target.dataset.note);
                if (!isNaN(note)) {
                    this._dispatchNoteOn(note);
                    // Visual feedback
                    event.target.style.backgroundColor = keyType === 0 ? "#ccc" : "#555";
                }
            });

            key.addEventListener("mouseup", (event) => {
                event.stopPropagation();
                // Could dispatch note off here if needed
                event.target.style.backgroundColor = keyType === 0 ? "white" : "black";
            });
            key.addEventListener("mouseleave", (event) => { // Reset if mouse leaves while pressed
                 event.target.style.backgroundColor = keyType === 0 ? "white" : "black";
            });
        }
    }

    _dispatchNoteOn(noteNumber) {
        this._container.dispatchEvent(new CustomEvent("midiNoteOn", {
            bubbles: true,
            composed: true, // Important for events crossing shadow DOM if this were a web component
            detail: {
                note: noteNumber
            }
        }));
    }

    get node() {
        return this._container;
    }
}

export default MIDIKeyboardUI; // Standard ES6 module export
// However, for the current project structure, we might just rely on it being globally available
// or handled by the bundler if pink-trombone.min.js is generated.
// For now, let's assume PinkTromboneUI.js will import it. 