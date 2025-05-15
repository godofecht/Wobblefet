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
        this._container.style.position = "relative"; // Important for NippleJS & label positioning
        this._container.style.boxSizing = "border-box";
        this._container.style.backgroundColor = "#FFFFFF"; // Was #f0f0f0, now white
        this._container.style.border = "1px solid #000000"; // Was #ccc, now black
        this._container.style.borderRadius = "4px";
        // Removed padding from this._container to allow padElement to be full size
        // this._container.style.padding = "25px"; 

        // Create an inner element for the XYPad itself
        this._padElement = document.createElement("div");
        this._padElement.id = this._container.id + "-pad";
        this._padElement.style.width = "100%";
        this._padElement.style.height = "100%";
        this._padElement.style.position = "relative"; // Or static, XYPad might handle its canvas
        this._container.appendChild(this._padElement);

        // X-axis Label (Pitch) - positioned relative to _container
        const xLabel = document.createElement("div");
        xLabel.innerText = "Pitch (Low \u2192 High)";
        xLabel.style.position = "absolute";
        xLabel.style.bottom = "5px"; // At the bottom of the container
        xLabel.style.left = "50%";
        xLabel.style.transform = "translateX(-50%)";
        xLabel.style.color = "#000000";
        xLabel.style.fontSize = "12px";
        xLabel.style.whiteSpace = "nowrap";
        this._container.appendChild(xLabel);

        // Y-axis Label (Breathiness) - positioned relative to _container
        const yLabel = document.createElement("div");
        yLabel.innerText = "Breathiness (High \u2193 Low)"; // Updated text & arrow for inverted logic
        yLabel.style.position = "absolute";
        yLabel.style.top = "calc(100% - 35px)"; // Moved further down (bottom anchored with offset)
        yLabel.style.left = "15px"; 
        yLabel.style.transform = "translateY(-50%) rotate(-90deg)";
        yLabel.style.transformOrigin = "center left"; // Adjusted for better positioning after rotation
        yLabel.style.color = "#000000";
        yLabel.style.fontSize = "12px";
        yLabel.style.whiteSpace = "nowrap";
        this._container.appendChild(yLabel);

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
            el: '#' + this._padElement.id, // Use the new padElement
            width: this._padElement.offsetWidth, // Use padElement's dimensions
            height: this._padElement.offsetHeight, // Use padElement's dimensions
            pointerColor: 'rgba(0, 0, 0, 0.8)', // Was Pinkish, now black with some transparency
            xRange: libXRange,
            yRange: libYRange,
            callback: (pointer) => { // pointer object has {x, y}
                const normalizedX = (pointer.x - libXRange.min) / (libXRange.max - libXRange.min);
                const normalizedY = 1.0 - ((pointer.y - libYRange.min) / (libYRange.max - libYRange.min));

                const freqInterpolation = normalizedX;
                const frequency = this._frequency_range.min + ((this._frequency_range.max - this._frequency_range.min) * freqInterpolation);

                const tensenessInterpolation = 1.0 - normalizedY; // Inverted logic for tenseness
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
        const normalizedY = 1.0 - ((point.y - yRange.min) / (yRange.max - yRange.min));

        const freqInterpolation = normalizedX;
        const frequency = this._frequency_range.min + ((this._frequency_range.max - this._frequency_range.min) * freqInterpolation);

        const tensenessInterpolation = 1.0 - normalizedY; // Inverted logic for tenseness
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