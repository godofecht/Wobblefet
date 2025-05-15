/*
    TODO
        .setFreqeuncyRange(min, max)
*/

import TractUI from "./TractUI.js";
import GlottisUI from "./GlottisUI.js";
import ButtonsUI from "./ButtonsUI.js";
import MIDIKeyboardUI from "./MIDIKeyboardUI.js";

class PinkTromboneUI {
    constructor() {
        this._tractUI = new TractUI();
        this._glottisUI = new GlottisUI();
        this._buttonsUI = new ButtonsUI();
        this._midiKeyboardUI = new MIDIKeyboardUI();

        this._container = document.createElement("div");
            this._container.style.height = "100%";
            this._container.style.width = "100%";

            this._container.style.display = "grid";
                this._container.style.gridTemplateRows = "auto 1fr 150px auto";
                this._container.style.gridTemplateColumns = "1fr";
                this._container.style.gridGap = "10px";

            this._container.appendChild(this._buttonsUI.node);
                this._buttonsUI.node.id = "buttonsUI";
                this._buttonsUI.node.style.gridColumn = "1";
                this._buttonsUI.node.style.gridRow = "1";

            this._container.appendChild(this._tractUI.node);
                this._tractUI.node.id = "tractUI";
                this._tractUI.node.style.gridColumn = "1";
                this._tractUI.node.style.gridRow = "2";
                this._tractUI.node.style.width = "100%";
                this._tractUI.node.style.height = "100%";
                this._tractUI.node.style.overflow = "hidden";

            this._container.appendChild(this._glottisUI.node);
                this._glottisUI.node.id = "glottisUI";
                this._glottisUI.node.style.gridColumn = "1";
                this._glottisUI.node.style.gridRow = "3";
            
            this._container.appendChild(this._midiKeyboardUI.node);
                this._midiKeyboardUI.node.id = "midiKeyboardUI";
                this._midiKeyboardUI.node.style.gridColumn = "1";
                this._midiKeyboardUI.node.style.gridRow = "4";

            this._midiKeyboardUI.node.addEventListener("midiNoteOn", event => {
                const midiNote = event.detail.note;
                const frequency = 440 * Math.pow(2, (midiNote - 69) / 12);
                
                this._container.dispatchEvent(new CustomEvent("setParameter", {
                    bubbles: true,
                    composed: true,
                    detail: {
                        parameterName: "frequency",
                        newValue: frequency
                    }
                }));
            });
            
            this._container.addEventListener("message", event => {
                event.stopPropagation();
                Array.from(this._container.children).forEach(child => {
                    if(child !== event.target && child !== this._midiKeyboardUI.node) {
                        child.dispatchEvent(new CustomEvent("message", {
                            detail : event.detail,
                        }));
                    }
                });
            });
    }

    get node() {
        return this._container;
    }

    show() {
        this.node.style.display = "grid";
    }
    hide() {
        this.node.style.display = "none";
    }
}

export default PinkTromboneUI;