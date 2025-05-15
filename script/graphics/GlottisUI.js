/*
    TODO        
        throttle value setter
        set actual frequency range
*/

import XYPad from 'xypadjs/dist/xypad.js';
// import { Pointer } from 'xypadjs'; // If Pointer class is exported and needed for type hints

Math.clamp = function(value, min = 0, max = 1) {
    return value < min ? min : value < max ? value : max;
}

class GlottisUI {
    constructor() {
        this._frequency_range = { min: 80, max: 600 }; // Adjusted range for typical voice
        this._tenseness_range = { min: 0.0, max: 1.0 }; // Tenseness is 0-1

        this._container = document.createElement("div");
        this._container.id = "glottis-ui-container-" + Date.now(); // Unique ID for the container
        this._container.style.width = "100%";
        this._container.style.height = "100%";
        this._container.style.position = "relative"; // Important for NippleJS
        this._container.style.boxSizing = "border-box";
        this._container.style.backgroundColor = "#f0f0f0"; // A light background for the pad area
        this._container.style.border = "1px solid #ccc";
        this._container.style.borderRadius = "4px";

        this._xyPadInstance = null;
        this._isPadInitialized = false;

        const mutationObserver = new MutationObserver((mutationsList, observer) => {
            if (document.contains(this._container) && this._container.offsetWidth > 0 && this._container.offsetHeight > 0 && !this._isPadInitialized) {
                this._initXYPad();
                this._isPadInitialized = true;
                observer.disconnect();
            }
        });
        mutationObserver.observe(document.body, { childList: true, subtree: true });

        this._container.addEventListener("message", event => {
            if(event.detail.type == "toggleButton") {
                if(event.detail.parameterName == "voice") {
                    // This was for _alwaysVoice, NippleJS doesn't use this directly
                    // This logic might need to be re-evaluated based on how 'voice' button now works
                }
            }
        });
    }

    _initXYPad() {
        if (this._xyPadInstance) {
            this._xyPadInstance.destroy(); // xypadjs has a destroy method
        }

        const libXRange = { min: -100, max: 100 }; // xypadjs default
        const libYRange = { min: -100, max: 100 }; // xypadjs default

        this._xyPadInstance = new XYPad({
            el: '#' + this._container.id, // Use the ID selector string
            width: this._container.offsetWidth,
            height: this._container.offsetHeight,
            pointerColor: 'rgba(236, 72, 153, 0.9)', // Pinkish, less transparent
            xRange: libXRange,
            yRange: libYRange,
            callback: (pointer) => { // pointer object has {x, y}
                const normalizedX = (pointer.x - libXRange.min) / (libXRange.max - libXRange.min);
                const normalizedY = 1.0 - ((pointer.y - libYRange.min) / (libYRange.max - libYRange.min));

                const freqInterpolation = normalizedX;
                const frequency = this._frequency_range.min + ((this._frequency_range.max - this._frequency_range.min) * freqInterpolation);

                const tensenessInterpolation = normalizedY;
                const tenseness = 1 - Math.cos(tensenessInterpolation * Math.PI * 0.5);
                const loudness = Math.pow(tenseness, 0.25);

                this._dispatchParameter("frequency", frequency);
                this._dispatchParameter("tenseness", tenseness);
                this._dispatchParameter("loudness", loudness);
            }
        });
        
        const initialX = libXRange.min + (libXRange.max - libXRange.min) / 2;
        const initialY = libYRange.min + (libYRange.max - libYRange.min) / 2;
        if (this._xyPadInstance && typeof this._xyPadInstance.movePointerTo === 'function') {
            this._xyPadInstance.movePointerTo(initialX, initialY);
            // Manually trigger callback for initial position as movePointerTo might not.
            this._dispatchXYPadChange({ x: initialX, y: initialY }, libXRange, libYRange);
        } else {
            console.error("GlottisUI: XYPad instance not available or movePointerTo is not a function for initial setup.");
        }
    }

    _dispatchXYPadChange(point, xRange, yRange) { 
        const normalizedX = (point.x - xRange.min) / (xRange.max - xRange.min);
        // Ensure Y is inverted for our tenseness logic (0=bottom, 1=top)
        // xypadjs might have Y increasing downwards on its canvas.
        const normalizedY = 1.0 - ((point.y - yRange.min) / (yRange.max - yRange.min));

        const freqInterpolation = normalizedX;
        const frequency = this._frequency_range.min + ((this._frequency_range.max - this._frequency_range.min) * freqInterpolation);

        const tensenessInterpolation = normalizedY;
        const tenseness = 1 - Math.cos(tensenessInterpolation * Math.PI * 0.5);
        const loudness = Math.pow(tenseness, 0.25);

        this._dispatchParameter("frequency", frequency);
        this._dispatchParameter("tenseness", tenseness);
        this._dispatchParameter("loudness", loudness);
    }

    _dispatchParameter(name, value) {
        this._container.dispatchEvent(new CustomEvent("setParameter", {
            bubbles: true,
            detail: {
                parameterName: name,
                newValue: value,
            }
        }));
    }

    get node() {
        return this._container;
    }
}

export default GlottisUI;