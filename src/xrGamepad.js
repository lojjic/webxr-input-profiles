import { Constants } from "./constants.js";
import { XRGamepadComponent } from "./xrGamepadComponent.js";

/**
  * @description This class connects an XR gamepad, as described in a 
  * mapping.json file, with a Gamepad object, as defined 
  * by https://www.w3.org/TR/gamepad/
  * @author Nell Waliczek / https://github.com/NellWaliczek
*/
class XRGamepad {

  /**
   * @param {Object} gamepad - The Gamepad object provided by the user agent as 
   * defined by https://www.w3.org/TR/gamepad/
   * @param {Object} mapping - The mapping file JSON text as an object
   * @param {String} handedness - An enum value as defined by Handedness in 
   * constants.js
   */
  constructor(gamepad, mapping, handedness) {
    if (!gamepad || !mapping) {
      throw new Error("Cannot create XRGamepad from invalid parameters");
    }

    if (gamepad.id != mapping.id) {
      throw new Error(`Gamepad id ${gamepad.id} and mapping id ${mapping.id} do not match`);
    }

    if (gamepad.handedness && gamepad.handedness != handedness) {
      throw new Error(`Gamepad.handedness ${gamepad.handedness} does not match handedness parameter ${handedness}`);
    }

    handedness = (!handedness || handedness === "") ? Constants.Handedness.NONE : handedness;
    if (!Object.values(Constants.Handedness).includes(handedness)) {
      throw new Error(`Cannot create XRGamepad for unknown handedness ${handedness}`);
    }

    if (!mapping.handedness[handedness]) {
      throw new Error(`No ${handedness} hand exists in mapping for ${gamepad.id}`);
    }

    this.gamepad = gamepad;
    this.mapping = mapping;
    this.handedness = handedness;
    this.hand = this.mapping.handedness[this.handedness];
    
    // Create component objects for each component described in the gamepad's
    // mapping file
    this.xrGamepadComponents = {};
    this.hand.components.forEach((componentIndex) => {
      let component = new XRGamepadComponent(this.gamepad, mapping, componentIndex);
      this.xrGamepadComponents[component.id] = component;

      if (this.hand.primaryButtonComponent == componentIndex) {
        this.primaryButtonComponent = component;
      }

      if (this.hand.primaryAxisComponent == componentIndex) {
        this.primaryAxisComponent = component;
      }
    });
  }

  get id() {
    return this.gamepad.id;
  }

  get asset() {
    return this.hand.asset;
  }

  get root() {
    return this.hand.root;
  }

  get targetRayOrigin() {
    return this.hand.targetRayOrigin;
  }
};

export { XRGamepad };