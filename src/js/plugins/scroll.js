import MobileDetector from '../utils/mobile-detector';

const MIN_WHEEL_DELTA = 40;

export default class Scroll {
  /**
   * Scroll handler for the WebSlides.
   * @param {WebSlides} wsInstance The WebSlides instance
   */
  constructor(wsInstance) {
    /**
     * @type {WebSlides}
     * @private
     */
    this.ws_ = wsInstance;
    /**
     * Where the scroll is going to happen. The WebSlides element.
     * @type {Element}
     * @private
     */
    this.scrollContainer_ = wsInstance.el;
    /**
     * Whether movement is happening up or down.
     * @type {boolean}
     * @private
     */
    this.isGoingUp_ = false;
    /**
     * Whether movement is happening left or right.
     * @type {boolean}
     * @private
     */
    this.isGoingLeft_ = false;
    /**
     * Timeout id holder.
     * @type {?number}
     * @private
     */
    this.timeout_ = null;

    if (!MobileDetector.isAny()) {
        this.scrollContainer_.addEventListener(
            'wheel', this.onMouseWheel_.bind(this));

        if (!wsInstance.isVertical) {
          wsInstance.el.addEventListener(
              'ws:slide-change', this.onSlideChange_.bind(this));
        }
    }
  }

  /**
   * When the slides change, set an inner timeout to avoid prematurely
   * changing to the next slide again.
   * @private
   */
  onSlideChange_() {
    this.timeout_ = setTimeout(() => { this.timeout_ = null; }, 400);
  }

  /**
   * Reacts to the wheel event. Detects whether is going up or down and decides
   * if it needs to move the slide based on the amount of delta.
   * @param {WheelEvent} event The Wheel Event.
   * @private
   */
  onMouseWheel_(event) {
    if (this.ws_.isMoving || this.timeout_) {
      event.preventDefault();
      return;
    }

    const { deltaY: wheelDeltaY, deltaX: wheelDeltaX } = event;
    this.isGoingUp_ = wheelDeltaY < 0;
    this.isGoingLeft_ = wheelDeltaX < 0;

    // If we're mainly moving horizontally, prevent default
    if (Math.abs(wheelDeltaX) > Math.abs(wheelDeltaY)) {
      if (!this.ws_.isVertical) {
        event.preventDefault();
      } else {
        // If we're moving horizontally but this is vertical, return to avoid
        // unwanted navigation.
        return;
      }
    }

    if (Math.abs(wheelDeltaY) >= MIN_WHEEL_DELTA ||
        Math.abs(wheelDeltaX) >= MIN_WHEEL_DELTA) {
      if (this.isGoingUp_ || this.isGoingLeft_) {
        this.ws_.goPrev();
      } else {
        this.ws_.goNext();
      }

      event.preventDefault();
    }
  }
};
