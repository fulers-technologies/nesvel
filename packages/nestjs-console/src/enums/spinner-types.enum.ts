/**
 * Spinner Types Enum
 *
 * @description
 * Defines all available spinner animation types from the ora/cli-spinners library.
 * These spinners provide visual feedback during long-running operations.
 *
 * @enum {string}
 *
 * @example
 * ```typescript
 * import { SpinnerType, spinner } from 'console-prompts';
 *
 * const spin = spinner('Loading...', { type: SpinnerType.DOTS });
 * await someTask();
 * spin.succeed('Done!');
 * ```
 */
export enum SpinnerType {
  // Basic dots variants
  DOTS = 'dots',
  DOTS2 = 'dots2',
  DOTS3 = 'dots3',
  DOTS4 = 'dots4',
  DOTS5 = 'dots5',
  DOTS6 = 'dots6',
  DOTS7 = 'dots7',
  DOTS8 = 'dots8',
  DOTS9 = 'dots9',
  DOTS10 = 'dots10',
  DOTS11 = 'dots11',
  DOTS12 = 'dots12',
  DOTS13 = 'dots13',
  DOTS8BIT = 'dots8Bit',

  // Line variants
  LINE = 'line',
  LINE2 = 'line2',
  PIPE = 'pipe',

  // Simple variants
  SIMPLE_DOTS = 'simpleDots',
  SIMPLE_DOTS_SCROLLING = 'simpleDotsScrolling',

  // Shape-based
  SAND = 'sand',
  STAR = 'star',
  STAR2 = 'star2',
  FLIP = 'flip',
  HAMBURGER = 'hamburger',

  // Growth animations
  GROW_VERTICAL = 'growVertical',
  GROW_HORIZONTAL = 'growHorizontal',

  // Balloon
  BALLOON = 'balloon',
  BALLOON2 = 'balloon2',

  // Bounce variants
  NOISE = 'noise',
  BOUNCE = 'bounce',
  BOX_BOUNCE = 'boxBounce',
  BOX_BOUNCE2 = 'boxBounce2',

  // Geometric
  TRIANGLE = 'triangle',
  BINARY = 'binary',
  ARC = 'arc',
  CIRCLE = 'circle',
  SQUARE_CORNERS = 'squareCorners',
  CIRCLE_QUARTERS = 'circleQuarters',
  CIRCLE_HALVES = 'circleHalves',
  SQUISH = 'squish',

  // Toggle variants
  TOGGLE = 'toggle',
  TOGGLE2 = 'toggle2',
  TOGGLE3 = 'toggle3',
  TOGGLE4 = 'toggle4',
  TOGGLE5 = 'toggle5',
  TOGGLE6 = 'toggle6',
  TOGGLE7 = 'toggle7',
  TOGGLE8 = 'toggle8',
  TOGGLE9 = 'toggle9',
  TOGGLE10 = 'toggle10',
  TOGGLE11 = 'toggle11',
  TOGGLE12 = 'toggle12',
  TOGGLE13 = 'toggle13',

  // Arrow variants
  ARROW = 'arrow',
  ARROW2 = 'arrow2',
  ARROW3 = 'arrow3',

  // Bouncing
  BOUNCING_BAR = 'bouncingBar',
  BOUNCING_BALL = 'bouncingBall',

  // Fun/themed spinners
  SMILEY = 'smiley',
  MONKEY = 'monkey',
  HEARTS = 'hearts',
  CLOCK = 'clock',
  EARTH = 'earth',
  MATERIAL = 'material',
  MOON = 'moon',
  RUNNER = 'runner',
  PONG = 'pong',
  SHARK = 'shark',
  DQPB = 'dqpb',
  WEATHER = 'weather',
  CHRISTMAS = 'christmas',
  GRENADE = 'grenade',
  POINT = 'point',
  LAYER = 'layer',

  // Special effects
  BETA_WAVE = 'betaWave',
  FINGER_DANCE = 'fingerDance',
  FIST_BUMP = 'fistBump',
  SOCCER_HEADER = 'soccerHeader',
  MINDBLOWN = 'mindblown',
  SPEAKER = 'speaker',
  ORANGE_PULSE = 'orangePulse',
  BLUE_PULSE = 'bluePulse',
  ORANGE_BLUE_PULSE = 'orangeBluePulse',
  TIME_TRAVEL = 'timeTravel',
  AESTHETIC = 'aesthetic',
  DWARF_FORTRESS = 'dwarfFortress',
}
