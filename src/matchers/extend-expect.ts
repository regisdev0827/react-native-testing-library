/// <reference path="./extend-expect.d.ts" />

import { toBeOnTheScreen } from './to-be-on-the-screen';
import { toBeEmptyElement } from './to-be-empty-element';

expect.extend({
  toBeOnTheScreen,
  toBeEmptyElement,
});