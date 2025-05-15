/*
    TODO
        Toggle phonemes (voice/voiceless/none)
        refactor button creation
*/

class ButtonsUI {
    constructor() {
        this._container = document.createElement("div");
        this._container.id = "pink-trombone-component-buttons";
        this._container.style.position = "relative";
        this._container.style.zIndex = "1";
        this._container.style.display = "flex";
        this._container.style.flexDirection = "row";
        this._container.style.justifyContent = "space-around";
        this._container.style.alignItems = "center";
        this._container.style.width = "100%";
        this._container.style.padding = "5px 0";

        this._buttons = {
            start : this._createButton("start"),
            wobble : this._createButton("wobble", true, "vibrato.wobble"),
            voice : this._createButton("voice", true, "intensity"),
        };

        this._buttons.start.addEventListener("didResume", event => {
            event.target.parentElement.removeChild(event.target);
        });
        this._buttons.start.addEventListener("click", event => {
            event.target.dispatchEvent(new CustomEvent("resume", {
                bubbles : true,
            }));

        });
    }

    get node() {
        return this._container;
    }

    _createButton(buttonName, isParameter = false, parameterPath) {
        const button = document.createElement("button");
                button.id = buttonName;
                button.value = true;
                button.innerText = (isParameter? "disable ":'') + buttonName;
                button.style.backgroundColor = "white";
                button.style.padding = "10px 20px";
                button.style.border = "1px solid black";
                button.style.borderRadius = "10px";
                button.style.margin = "5px";
                button.style.fontSize = "16px";
                button.style.fontWeight = "bold";
                button.style.color = "black";
                button.style.cursor = "pointer";
                button.style.boxShadow = "0px 2px 4px rgba(0, 0, 0, 0.1)";
                button.style.transition = "transform 0.2s ease, boxShadow 0.2s ease, backgroundColor 0.2s ease, color 0.2s ease";

                button.addEventListener('mousedown', () => {
                    button.style.transform = "translateY(1px)";
                    button.style.boxShadow = "0px 1px 2px rgba(0, 0, 0, 0.15)";
                    button.style.backgroundColor = "black";
                    button.style.color = "white";
                });
                button.addEventListener('mouseup', () => {
                    button.style.transform = "translateY(0px)";
                    button.style.boxShadow = "0px 2px 4px rgba(0, 0, 0, 0.1)";
                    button.style.backgroundColor = "white";
                    button.style.color = "black";
                });
                button.addEventListener('mouseleave', () => { // Reset if mouse leaves while pressed
                    button.style.transform = "translateY(0px)";
                    button.style.boxShadow = "0px 2px 4px rgba(0, 0, 0, 0.1)";
                    // Keep the "active" style if mouseup hasn't occurred yet, or reset if needed
                    // For simplicity, resetting to base state on mouseleave.
                    button.style.backgroundColor = "white";
                    button.style.color = "black";
                });

            this._container.appendChild(button);

            if(isParameter) {
                button.addEventListener("click", event => {
                    button.value = (button.value == "false");

                    const prefix = (button.value == "true")?
                        "disable" :
                        "enable";
                    button.innerText = prefix + ' ' + button.id;
                    
                    button.dispatchEvent(new CustomEvent("setParameter", {
                        bubbles : true,
                        detail : {
                            parameterName : parameterPath || buttonName,
                            newValue : (button.value == "true")? 1:0,
                        }
                    }));

                    button.dispatchEvent(new CustomEvent("message", {
                        bubbles : true,
                        detail : {
                            type : "toggleButton",
                            parameterName : buttonName,
                            newValue : button.value,
                        }
                    }));
                });
            }
        return button;
    }
}

export default ButtonsUI;