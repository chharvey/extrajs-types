import * as xjs from 'extrajs'

import Integer from './Integer.class'
import Percentage from './Percentage.class'
import Angle, {AngleUnit} from './Angle.class'

const NAMES: { [index: string]: string } = require('../../src/color-names.json') // NB relative to dist


/**
 * Enum for the types of string representations of colors.
 */
export enum ColorSpace {
	/** #rrggbb / #rrggbbaa / #rgb / #rgba */
	HEX,
	/** rgb(r g b [/ a]) */
	RGB,
	/** hsv(h s v [/ a]) */
	HSV,
	/** hsl(h s l [/ a]) */
	HSL,
	/** hwb(h w b [/ a]) */
	HWB,
	/** cmyk(c m y k [/ a]) */
	CMYK,
}


/**
 * A 24/32-bit color ("True Color") that can be displayed in a pixel, given three primary color channels
 * and a possible transparency channel.
 */
export default class Color {
	/**
	 * Calculate the alpha of two or more overlapping translucent colors.
	 *
	 * For two overlapping colors with respective alphas `a` and `b`, the compounded alpha
	 * of an even mix will be `1 - (1-a)*(1-b)`.
	 * For three, it would be `1 - (1-a)*(1-b)*(1-c)`.
	 * An alpha is a Percentage, and represents the opacity
	 * of a translucent color. An alpha of 0 is completely transparent; an alpha
	 * of 1 is completely opaque.
	 * @param  alphas the alphas to compound
	 * @return the compounded alpha
	 */
	private static _compoundOpacity(...alphas: Percentage[]): Percentage {
		return alphas.map((a) => a.conjugate).reduce((a,b) => a.times(b)).conjugate
	}

	/**
	 * Transform an sRGB channel value (gamma-corrected) to a linear value.
	 *
	 * Approximately, the square of the value: `(x) => x * x`.
	 * @see https://www.w3.org/Graphics/Color/sRGB.html
	 * @see https://en.wikipedia.org/wiki/SRGB#The_reverse_transformation
	 * @param   c_srgb an rgb component of a color
	 * @returns the transformed linear value
	 */
	private static _sRGB_Linear(c_srgb: Percentage): Percentage {
		const c = c_srgb.valueOf()
		return new Percentage((c <= 0.03928) ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
	}
	/**
	 * Return the inverse of {@link Color._sRGB_Linear}.
	 *
	 * Approximately, the square root of the value: `(x) => Math.sqrt(x)`.
	 * @see https://www.w3.org/Graphics/Color/sRGB.html
	 * @see https://en.wikipedia.org/wiki/SRGB#The_forward_transformation_(CIE_XYZ_to_sRGB)
	 * @param   c_lin a perceived luminance (linear) of a color’s rgb component
	 * @returns the transformed sRGB value
	 */
	private static _linear_sRGB(c_lin: Percentage): Percentage {
		const c = c_lin.valueOf()
		return new Percentage((c <= 0.00304) ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055)
	}

	/**
	 * Return a new Color object, given red, green, and blue, in RGB-space, where
	 * each color channel is an integer 0–255.
	 * @param   red   the RGB-red   channel of this color
	 * @param   green the RGB-green channel of this color
	 * @param   blue  the RGB-blue  channel of this color
	 * @param   alpha the alpha channel of this color
	 * @returns a new Color object with rgba(red, green, blue, alpha)
	 */
	static fromRGB(red: Integer|number = 0, green: Integer|number = 0, blue: Integer|number = 0, alpha: Percentage|number = 1): Color {
		return (red instanceof Integer && green instanceof Integer && blue instanceof Integer && alpha instanceof Percentage) ?
			new Color(...[red, green, blue].map((c) => new Percentage(c.clamp(0, 255).dividedBy(255))), alpha) :
			Color.fromRGB(new Integer(red), new Integer(green), new Integer(blue), new Percentage(alpha))
	}

	/**
	 * Return a new Color object, given hue, saturation, and value in HSV-space.
	 *
	 * The HSV-hue        must be between 0 and 360.
	 * @param   hue the HSV-hue channel of this color (a number 0—360)
	 * @param   sat the HSV-sat channel of this color
	 * @param   val the HSV-val channel of this color
	 * @param   alpha the alpha channel of this color
	 * @returns a new Color object with hsva(hue, sat, val, alpha)
	 */
	static fromHSV(hue = 0, sat: Percentage|number = 0, val: Percentage|number = 0, alpha: Percentage|number = 1): Color {
		return (sat instanceof Percentage && val instanceof Percentage && alpha instanceof Percentage) ? (() => {
		hue = xjs.Math.mod(hue, 360)
			const [s, v]: number[] = [sat, val].map((p) => p.valueOf())
			let c: number = s * v
			let x: number = c * (1 - Math.abs(hue/60 % 2 - 1))
			let m: number = v - c
		let rgb: number[] = [c, x, 0]
		;    if (  0 <= hue && hue <  60) { rgb = [c, x, 0] }
		else if ( 60 <= hue && hue < 120) { rgb = [x, c, 0] }
		else if (120 <= hue && hue < 180) { rgb = [0, c, x] }
		else if (180 <= hue && hue < 240) { rgb = [0, x, c] }
		else if (240 <= hue && hue < 300) { rgb = [x, 0, c] }
		else if (300 <= hue && hue < 360) { rgb = [c, 0, x] }
		return new Color(...rgb.map((c) => new Percentage(c + m)), alpha)
		})() : Color.fromHSV(
			hue,
			new Percentage(sat),
			new Percentage(val),
			new Percentage(alpha)
		)
	}

	/**
	 * Return a new Color object, given hue, saturation, and luminosity in HSL-space.
	 *
	 * The HSL-hue        must be between 0 and 360.
	 * @see https://www.w3.org/TR/css-color-4/#hsl-to-rgb
	 * @param   hue the HSL-hue channel of this color (a number 0—360)
	 * @param   sat the HSL-sat channel of this color
	 * @param   lum the HSL-lum channel of this color
	 * @param   alpha the alpha channel of this color
	 * @returns a new Color object with hsla(hue, sat, lum, alpha)
	 */
	static fromHSL(hue = 0, sat: Percentage|number = 0, lum: Percentage|number = 0, alpha: Percentage|number = 1): Color {
		return (sat instanceof Percentage && lum instanceof Percentage && alpha instanceof Percentage) ? (() => {
		hue = xjs.Math.mod(hue, 360)
			const [s, l]: number[] = [sat, lum].map((p) => p.valueOf())
			let c: number = s * (1 - Math.abs(2*l - 1))
			let x: number = c * (1 - Math.abs(hue/60 % 2 - 1))
			let m: number = l - c/2
		let rgb: number[] = [c, x, 0]
		;    if (  0 <= hue && hue <  60) { rgb = [c, x, 0] }
		else if ( 60 <= hue && hue < 120) { rgb = [x, c, 0] }
		else if (120 <= hue && hue < 180) { rgb = [0, c, x] }
		else if (180 <= hue && hue < 240) { rgb = [0, x, c] }
		else if (240 <= hue && hue < 300) { rgb = [x, 0, c] }
		else if (300 <= hue && hue < 360) { rgb = [c, 0, x] }
		return new Color(...rgb.map((c) => new Percentage(c + m)), alpha)
		})() : Color.fromHSL(
			hue,
			new Percentage(sat),
			new Percentage(lum),
			new Percentage(alpha)
		)
	}

	/**
	 * Return a new Color object, given hue, white, and black in HWB-space.
	 *
	 * The HWB-hue   must be between 0 and 360.
	 * @see https://www.w3.org/TR/css-color-4/#hwb-to-rgb
	 * @param   hue   the HWB-hue   channel of this color (a number 0—360)
	 * @param   white the HWB-white channel of this color
	 * @param   black the HWB-black channel of this color
	 * @param   alpha the alpha     channel of this color
	 * @returns a new Color object with hwba(hue, white, black, alpha)
	 */
	static fromHWB(hue = 0, white: Percentage|number = 0, black: Percentage|number = 0, alpha: Percentage|number = 1): Color {
		return (white instanceof Percentage && black instanceof Percentage && alpha instanceof Percentage) ? (() => {
		return Color.fromHSV(hue, 1 - white.valueOf() / black.conjugate.valueOf(), black.conjugate, alpha)
		})() : Color.fromHWB(
			hue,
			new Percentage(white),
			new Percentage(black),
			new Percentage(alpha)
		)
		/*
		 * HWB -> RGB:
		 * var rgb = Color.fromHSL([hue, 1, 0.5]).rgb
		 * for (var i = 0; i < 3; i++) {
		 *   rgb[i] *= (1 - white - black)
		 *   rgb[i] += white
		 * }
		 * return new Color(...rgb)
		 */
	}

	/**
	 * Return a new Color object, given cyan, magenta, yellow, and black in CMYK-space.
	 *
	 * @see https://www.w3.org/TR/css-color-4/#cmyk-rgb
	 * @param   cyan    the CMYK-cyan    channel of this color
	 * @param   magenta the CMYK-magenta channel of this color
	 * @param   yellow  the CMYK-yellow  channel of this color
	 * @param   black   the CMYK-black   channel of this color
	 * @param   alpha   the alpha channel of this color
	 * @returns a new Color object with cmyka(cyan, magenta, yellow, black, alpha)
	 */
	static fromCMYK(cyan: Percentage|number = 0, magenta: Percentage|number = 0, yellow: Percentage|number = 0, black: Percentage|number = 0, alpha: Percentage|number = 1): Color {
		return (cyan instanceof Percentage && magenta instanceof Percentage && yellow instanceof Percentage && black instanceof Percentage && alpha instanceof Percentage) ? new Color(
			new Percentage(cyan   .times(black.conjugate).valueOf() + black.valueOf()).clamp().conjugate,
			new Percentage(magenta.times(black.conjugate).valueOf() + black.valueOf()).clamp().conjugate,
			new Percentage(yellow .times(black.conjugate).valueOf() + black.valueOf()).clamp().conjugate,
			alpha
		) : Color.fromCMYK(
			new Percentage(cyan),
			new Percentage(magenta),
			new Percentage(yellow),
			new Percentage(black),
			new Percentage(alpha)
		)
	}

	/**
	 * Return a new Color object, given a string.
	 *
	 * The string must have one of the following formats (spaces optional):
	 *  - `#rrggbb`
	 *  - `#rrggbbaa`
	 *  - `#rgb`
	 *  - `#rgba`
	 *  - `rgb(r, g, b)`         — DEPRECATED
	 *  - `rgb(r, g, b, a)`      — DEPRECATED
	 *  - `rgba(r, g, b, a)`     — DEPRECATED
	 *  - `rgb(r g b)`
	 *  - `rgb(r g b / a)`
	 *  - `hsv(h, s, v)`         — DEPRECATED
	 *  - `hsv(h, s, v, a)`      — DEPRECATED
	 *  - `hsva(h, s, v, a)`     — DEPRECATED
	 *  - `hsv(h s v)`
	 *  - `hsv(h s v / a)`
	 *  - `hsl(h, s, l)`         — DEPRECATED
	 *  - `hsl(h, s, l, a)`      — DEPRECATED
	 *  - `hsla(h, s, l, a)`     — DEPRECATED
	 *  - `hsl(h s l)`
	 *  - `hsl(h s l / a)`
	 *  - `hwb(h, w, b)`         — DEPRECATED
	 *  - `hwb(h, w, b, a)`      — DEPRECATED
	 *  - `hwba(h, w, b, a)`     — DEPRECATED
	 *  - `hwb(h w b)`
	 *  - `hwb(h w b / a)`
	 *  - `cmyk(c, m, y, k)`     — DEPRECATED
	 *  - `cmyk(c, m, y, k, a)`  — DEPRECATED
	 *  - `cmyka(c, m, y, k, a)` — DEPRECATED
	 *  - `cmyk(c m y k)`
	 *  - `cmyk(c m y k / a)`
   *  - *any exact string match of a named color*
	 *
	 * Note that the comma-separated value syntax, while still supported, is deprecated.
	 * Authors should convert to the new space-separated value syntax, as specified in
	 * {@link https://drafts.csswg.org/css-color/|CSS Color Module Level 4, Editor’s Draft}.
	 * Deprecated syntax will become obsolete in an upcoming major version.
	 *
	 * @see {@link https://www.w3.org/TR/css-color-4/#named-colors|Named Colors | CSS Color Module Level 4}
	 * @param   str a string of one of the forms described
	 * @returns a new Color object constructed from the given string
	 * @throws  {RangeError} if the string given is not a valid format
	 * @throws  {ReferenceError} if the color name given was not found
	 */
	static fromString(str = ''): Color {
		if (str === '') return new Color()
		if (str[0] === '#') {
			if (![4,5,7,9].includes(str.length)) throw new RangeError(`Invalid string format: '${str}'. Hex color must have 3, 4, 6, or 8 digits.`)
			if ([4,5].includes(str.length)) {
				let [r, g, b, a]: string[] = [str[1], str[2], str[3], str[4] || '']
				return Color.fromString(`#${r}${r}${g}${g}${b}${b}${a}${a}`)
			}
			let red  : Percentage = new Percentage(                     parseInt(str.slice(1,3), 16) / 255)
			let green: Percentage = new Percentage(                     parseInt(str.slice(3,5), 16) / 255)
			let blue : Percentage = new Percentage(                     parseInt(str.slice(5,7), 16) / 255)
			let alpha: Percentage = new Percentage((str.length === 9) ? parseInt(str.slice(7,9), 16) / 255 : 1)
			return new Color(red, green, blue, alpha)
		}
		if (!str.includes('(')) {
			const returned: string|null = NAMES[str] || null
			if (!returned) throw new ReferenceError(`No color found for the name given: '${str}'.`)
			return Color.fromString(returned)
		}

		/* ---- else, the string is a CSS function ---- */
		const space : string = str.split('(')[0]
		const cssarg: string = str.split('(')[1].slice(0, -1)
		const channelstrings: string[] = (cssarg.includes(',')) ?
			cssarg.split(',') : // legacy syntax — COMBAK{DEPRECATED}
			cssarg.split('/')[0].split(' ').filter((s) => s !== '')
		if (cssarg.includes('/')) {
			channelstrings.push(cssarg.split('/')[1])
		}
		function _rgbStrings(channels: string[]): Color {
			// NOTE: allows different components to mix and match numbers & percents.
			// TODO: starting in CSS Colors 4, all components must be all numbers or all percents
			let red  : Percentage      =                 (!Number.isNaN(+channels[0])) ? new Percentage(+channels[0] / 255) : Percentage.fromString(channels[0])
			let green: Percentage      =                 (!Number.isNaN(+channels[1])) ? new Percentage(+channels[1] / 255) : Percentage.fromString(channels[1])
			let blue : Percentage      =                 (!Number.isNaN(+channels[2])) ? new Percentage(+channels[2] / 255) : Percentage.fromString(channels[2])
			let alpha: Percentage|null = (channels[3]) ? (!Number.isNaN(+channels[3])) ? new Percentage(+channels[3]      ) : Percentage.fromString(channels[3]) : null
			return new Color(red, green, blue, (alpha) ? alpha.valueOf() : undefined)
		}
		function _hsvStrings(channels: string[]): Color {
			let hue  : number = (!Number.isNaN(+channels[0])) ? +channels[0] : Angle.fromString(channels[0]).convert(AngleUnit.DEG)
			let sat  : Percentage = Percentage.fromString(channels[1])
			let val  : Percentage = Percentage.fromString(channels[2])
			let alpha: Percentage = (channels[3]) ? (!Number.isNaN(+channels[3])) ? new Percentage(+channels[3]) : Percentage.fromString(channels[3]) : new Percentage(1)
			return Color.fromHSV(hue, sat, val, alpha)
		}
		function _hslStrings(channels: string[]): Color {
			let hue  : number = (!Number.isNaN(+channels[0])) ? +channels[0] : Angle.fromString(channels[0]).convert(AngleUnit.DEG)
			let sat  : Percentage = Percentage.fromString(channels[1])
			let lum  : Percentage = Percentage.fromString(channels[2])
			let alpha: Percentage = (channels[3]) ? (!Number.isNaN(+channels[3])) ? new Percentage(+channels[3]) : Percentage.fromString(channels[3]) : new Percentage(1)
			return Color.fromHSL(hue, sat, lum, alpha)
		}
		function _hwbStrings(channels: string[]): Color {
			let hue  : number = (!Number.isNaN(+channels[0])) ? +channels[0] : Angle.fromString(channels[0]).convert(AngleUnit.DEG)
			let white: Percentage = Percentage.fromString(channels[1])
			let black: Percentage = Percentage.fromString(channels[2])
			let alpha: Percentage = (channels[3]) ? (!Number.isNaN(+channels[3])) ? new Percentage(+channels[3]) : Percentage.fromString(channels[3]) : new Percentage(1)
			return Color.fromHWB(hue, white, black, alpha)
		}
		function _cmykStrings(channels: string[]): Color {
			let cyan   : Percentage =                 (!Number.isNaN(+channels[0])) ? new Percentage(+channels[0]) : Percentage.fromString(channels[0])
			let magenta: Percentage =                 (!Number.isNaN(+channels[1])) ? new Percentage(+channels[1]) : Percentage.fromString(channels[1])
			let yellow : Percentage =                 (!Number.isNaN(+channels[2])) ? new Percentage(+channels[2]) : Percentage.fromString(channels[2])
			let black  : Percentage =                 (!Number.isNaN(+channels[3])) ? new Percentage(+channels[3]) : Percentage.fromString(channels[3])
			let alpha  : Percentage = (channels[4]) ? (!Number.isNaN(+channels[4])) ? new Percentage(+channels[4]) : Percentage.fromString(channels[4]) : new Percentage(1)
			return Color.fromCMYK(cyan, magenta, yellow, black, alpha)
		}
		let returned: (channels: string[]) => Color;
		try {
			returned = xjs.Object.switch<Color>(space, {
				rgb   : _rgbStrings,
				rgba  : _rgbStrings, // COMBAK{DEPRECATED}
				hsv   : _hsvStrings,
				hsva  : _hsvStrings, // COMBAK{DEPRECATED}
				hsl   : _hslStrings,
				hsla  : _hslStrings, // COMBAK{DEPRECATED}
				hwb   : _hwbStrings,
				hwba  : _hwbStrings, // COMBAK{DEPRECATED}
				cmyk  : _cmykStrings,
				cmyka : _cmykStrings, // COMBAK{DEPRECATED}
			})
		} catch (e) {
			throw new RangeError(`Invalid string format: '${str}'. No CSS function found.`)
		}
		return returned(channelstrings.map((s) => s.trim()))
  }

	/**
	 * Mix (average) a set of 2 or more colors. The average will be weighted evenly.
	 *
	 * If two colors `a` and `b` are given, calling this static method, `Color.mix([a, b])`,
	 * is equivalent to calling `a.mix(b)` without a weight.
	 * However, calling `Color.mix([a, b, c])` with 3 or more colors yields an even mix,
	 * and will *not* yield the same results as calling `a.mix(b).mix(c)`, which yields an uneven mix.
	 * Note that the order of the given colors does not change the result, that is,
	 * `Color.mix([a, b, c])` returns the same result as `Color.mix([c, b, a])`.
	 * @see Color.mix
	 * @param   colors an array of Color objects, of length >=2
	 * @returns a mix of the given colors
	 */
	static mix(colors: Color[]): Color {
		let red  : Percentage = new Percentage(xjs.Math.meanArithmetic(colors.map((c) => c.red  .valueOf())))
		let green: Percentage = new Percentage(xjs.Math.meanArithmetic(colors.map((c) => c.green.valueOf())))
		let blue : Percentage = new Percentage(xjs.Math.meanArithmetic(colors.map((c) => c.blue .valueOf())))
		let alpha: Percentage = Color._compoundOpacity(...colors.map((c) => c.alpha))
		return new Color(red, green, blue, alpha)
	}

	/**
	 * Blur a set of 2 or more colors. The average will be weighted evenly.
	 *
	 * Behaves almost exactly the same as {@link Color.mix},
	 * except that this method uses a more visually accurate, slightly brighter, mix.
	 * @see Color.blur
	 * @param   colors an array of Color objects, of length >=2
	 * @returns a blur of the given colors
	 */
	static blur(colors: Color[]): Color {
		/**
		 * Calculate the compound value of two or more overlapping same-channel values.
		 * @private
		 * @param   arr an array of same-channel values (red, green, or blue)
		 * @returns the compounded value
		 */
		function compoundChannel(arr: Percentage[]): Percentage {
			return Color._linear_sRGB(new Percentage(xjs.Math.meanArithmetic(arr.map((p) => Color._sRGB_Linear(p).valueOf()))))
		}
		let red  : Percentage =        compoundChannel(   colors.map((c) => c.red  ))
		let green: Percentage =        compoundChannel(   colors.map((c) => c.green))
		let blue : Percentage =        compoundChannel(   colors.map((c) => c.blue ))
		let alpha: Percentage = Color._compoundOpacity(...colors.map((c) => c.alpha))
		return new Color(red, green, blue, alpha)
	}

	/**
	 * Generate a random color.
	 * @param   alpha should the alpha channel also be randomized? (if false, default alpha value is 1)
	 * @returns a Color object with random values
	 */
	static random(alpha = true): Color {
		return Color.fromString(`#${Math.random().toString(16).slice(2, (alpha) ? 10 : 8)}`)
	}

	/**
	 * Randomly select a Named Color.
	 * @returns one of the Named Colors, randomly chosen
	 */
	static randomName(): Color {
		let named_colors: [string, string][] = Object.entries(NAMES)
		return Color.fromString(named_colors[Math.floor(Math.random() * named_colors.length)][0])
	}


	/** The red channel of this color. */
	private readonly _RED: Percentage;
	/** The green channel of this color. */
	private readonly _GREEN: Percentage;
	/** The blue channel of this color. */
	private readonly _BLUE: Percentage;
	/** The alpha channel of this color. */
	private readonly _ALPHA: Percentage;

	private readonly _MAX: number
	private readonly _MIN: number
	private readonly _CHROMA: number

	/**
	 *
	 * Construct a new Color object.
	 *
	 * Calling `new Color(r, g, b, a)` (4 arguments) specifies default behavior.
	 * Calling `new Color(r, g, b)` (3 arguments) will result in an opaque color (`#rrggbbFF`),
	 * where the alpha is 1 by default.
	 * Calling `new Color()` (no arguments) will result in transparent (`#00000000`).
	 * @param red   the red   channel of this color
	 * @param green the green channel of this color
	 * @param blue  the blue  channel of this color
	 * @param alpha the alpha channel of this color
	 */
	constructor(red: Percentage|number = 0, green: Percentage|number = 0, blue: Percentage|number = 0, alpha: Percentage|number = 1) {
		if (arguments.length === 0) alpha = 0
		;[this._RED, this._GREEN, this._BLUE] = [red, green, blue].map((c) => new Percentage(c).clamp())
		this._ALPHA = new Percentage(alpha).clamp()

		this._MAX    = Math.max(...[this._RED, this._GREEN, this._BLUE].map((c) => c.valueOf()))
		this._MIN    = Math.min(...[this._RED, this._GREEN, this._BLUE].map((c) => c.valueOf()))
		this._CHROMA = this._MAX - this._MIN
	}

	/**
	 * Return a string representation of this color.
	 *
	 * If the alpha of this color is 1, then the string returned will represent an opaque color,
	 * `hsv(h s v)`, `hsl(h s l)`, etc.
	 * Otherwise, the string returned will represent a translucent color,
	 * `hsv(h s v / a)`, `hsl(h s l / a)`, etc.
	 *
	 * The format of the numbers returned will be as follows. The default format is {@link ColorSpace.HEX}.
	 * - all HEX values will be base 16 integers in [00,FF], two digits
	 * - HSV/HSL/HWB-hue values will be base 10 decimals in [0,360) rounded to the nearest 0.1
	 * - HSV/HSL-sat/val/lum, HWB-white/black, and CMYK-cyan/magenta/yellow/black values will be base 10 decimals in [0,1] rounded to the nearest 0.01
	 * - all RGB values will be base 10 integers in [0,255], one to three digits
	 * - all alpha values will be base 10 decimals in [0,1], rounded to the nearest 0.001
	 * @override
	 * @param   space represents the space in which this color exists
	 * @returns a string representing this color
	 */
	toString(space = ColorSpace.HEX): string {
		const leadingZero = (n: number, r: number = 10) => `0${n.toString(r)}`.slice(-2)
		if (space === ColorSpace.HEX) {
			return `#${this.rgb.slice(0,3).map((c) => leadingZero(Math.round(c.of(255)), 16)).join('')}${(this.alpha.lessThan(1)) ? leadingZero(Math.round(this.alpha.of(255)), 16) : ''}`
		}
		/* ---- else, the string is a CSS function ---- */
		const returned: string[] = xjs.Object.switch<string[]>(`${space}`, {
			[ColorSpace.RGB]: () => this.rgb.slice(0,3).map((c) => `${Math.round(c.of(255))}`),
			[ColorSpace.HSV]: () => [
				`${Math.round(this.hsvHue *  10) /  10}deg`,
				`${Math.round(this.hsvSat.of(100))}%`,
				`${Math.round(this.hsvVal.of(100))}%`,
			],
			[ColorSpace.HSL]: () => [
				`${Math.round(this.hslHue *  10) /  10}deg`,
				`${Math.round(this.hslSat.of(100))}%`,
				`${Math.round(this.hslLum.of(100))}%`,
			],
			[ColorSpace.HWB]: () => [
				`${Math.round(this.hwbHue   *  10) /  10}deg`,
				`${Math.round(this.hwbWhite.of(100))}%`,
				`${Math.round(this.hwbBlack.of(100))}%`,
			],
			[ColorSpace.CMYK]: () => this.cmyk.slice(0,4).map((c) => `${Math.round(c.of(100)) / 100}`),
		})()
		return `${ColorSpace[space].toLowerCase()}(${returned.join(' ')}${
			(this.alpha.lessThan(1)) ? ` / ${Math.round(this.alpha.of(1000)) / 1000}` : ''
		})`
	}

	/**
	 * Get the red channel of this color.
	 */
	get red(): Percentage { return this._RED }

	/**
	 * Get the green channel of this color.
	 */
	get green(): Percentage { return this._GREEN }

	/**
	 * Get the blue channel of this color.
	 */
	get blue(): Percentage { return this._BLUE }

	/**
	 * Get the alpha (opacity) of this color.
	 */
	get alpha(): Percentage { return this._ALPHA }

	/**
	 * Get the hsv-hue of this color.
	 *
	 * The HSV-space hue (in degrees) of this color, or what "color" this color is.
	 * A number bound by [0, 360).
	 */
	get hsvHue(): number {
		if (this._CHROMA === 0) return 0
		let rgb_norm: [number, number, number] = [
			this._RED.valueOf(),
			this._GREEN.valueOf(),
			this._BLUE.valueOf(),
		]
		return [
			(r: number, g: number, b: number) => ((g - b) / this._CHROMA + 6) % 6 * 60,
			(r: number, g: number, b: number) => ((b - r) / this._CHROMA + 2)     * 60,
			(r: number, g: number, b: number) => ((r - g) / this._CHROMA + 4)     * 60,
		][rgb_norm.indexOf(this._MAX)](...rgb_norm)
		/*
		 * Exercise: prove:
		 * _HSV_HUE === Math.atan2(Math.sqrt(3) * (g - b), 2*r - g - b)
		 */
	}

	/**
	 * Get the hsv-saturation of this color.
	 *
	 * The vividness of this color. A lower saturation means the color is closer to white,
	 * a higher saturation means the color is more true to its hue.
	 */
	get hsvSat(): Percentage {
		return new Percentage((this._CHROMA === 0) ? 0 : this._CHROMA / this.hsvVal.valueOf())
	}

	/**
	 * Get the hsv-value of this color.
	 *
	 * The brightness of this color. A lower value means the color is closer to black, a higher
	 * value means the color is more true to its hue.
	 */
	get hsvVal(): Percentage {
		return new Percentage(this._MAX)
	}

	/**
	 * Get the hsl-hue of this color.
	 *
	 * The Hue of this color. Identical to {@link Color.hsvHue}.
	 * A number bound by [0, 360).
	 */
	get hslHue(): number {
		return this.hsvHue
	}

	/**
	 * Get the hsl-saturation of this color.
	 *
	 * The amount of "color" in the color. A lower saturation means the color is more grayer,
	 * a higher saturation means the color is more colorful.
	 */
	get hslSat(): Percentage {
		return new Percentage((this._CHROMA === 0) ? 0 : (this._CHROMA / ((this.hslLum.valueOf() <= 0.5) ? 2*this.hslLum.valueOf() : (2 - 2*this.hslLum.valueOf()))))
		/*
		 * Exercise: prove:
		 * _HSL_SAT === _CHROMA / (1 - Math.abs(2*this.hslLum - 1))
		 * Proof:
		 * denom == (function (x) {
		 *   if (x <= 0.5) return 2x
		 *   else          return 2 - 2x
		 * })(_HSL_LUM)
		 * Part A. Let x <= 0.5. Then 2x - 1 <= 0, and |2x - 1| == -(2x - 1).
		 * Then 1 - |2x - 1| == 1 + (2x - 1) = 2x. //
		 * Part B. Let 0.5 < x. Then 1 < 2x - 1, and |2x - 1| == 2x - 1.
		 * Then 1 - |2x - 1| == 1 - (2x - 1) = 2 - 2x. //
		 */
	}

	/**
	 * Get the hsl-luminosity of this color.
	 *
	 * How "white" or "black" the color is. A lower luminosity means the color is closer to black,
	 * a higher luminosity means the color is closer to white.
	 */
	get hslLum(): Percentage {
		return new Percentage(0.5 * (this._MAX + this._MIN))
	}

	/**
	 * Get the hwb-hue of this color.
	 *
	 * The Hue of this color. Identical to {@link Color.hsvHue}.
	 * A number bound by [0, 360).
	 */
	get hwbHue(): number {
		return this.hsvHue
	}

	/**
	 * Get the hwb-white of this color.
	 *
	 * The amount of White in this color. A higher white means the color is closer to #fff,
	 * a lower white means the color has a true hue (more colorful).
	 */
	get hwbWhite(): Percentage {
		return new Percentage(this._MIN)
	}

	/**
	 * Get the hwb-black of this color.
	 *
	 * The amount of Black in this color. A higher black means the color is closer to #000,
	 * a lower black means the color has a true hue (more colorful).
	 */
	get hwbBlack(): Percentage {
		return new Percentage(1 - this._MAX)
	}

	/**
	 * Get the cmyk-cyan of this color.
	 *
	 * The amount of Cyan in this color, or a subtraction of the amount of Red in this color.
	 */
	get cmykCyan(): Percentage {
		return new Percentage((this.cmykBlack.equals(1)) ? 0 : (1 - this._RED.valueOf() - this.cmykBlack.valueOf()) / this.cmykBlack.conjugate.valueOf())
	}

	/**
	 * Get the cmyk-magenta of this color.
	 *
	 * The amount of Magenta in this color, or a subtraction of the amount of Green in this color.
	 */
	get cmykMagenta(): Percentage {
		return new Percentage((this.cmykBlack.equals(1)) ? 0 : (1 - this._GREEN.valueOf() - this.cmykBlack.valueOf()) / this.cmykBlack.conjugate.valueOf())
	}

	/**
	 * Get the cmyk-yellow of this color.
	 *
	 * The amount of Yellow in this color, or a subtraction of the amount of Blue in this color.
	 */
	get cmykYellow(): Percentage {
		return new Percentage((this.cmykBlack.equals(1)) ? 0 : (1 - this._BLUE.valueOf() - this.cmykBlack.valueOf()) / this.cmykBlack.conjugate.valueOf())
	}

	/**
	 * Get the cmyk-black of this color.
	 *
	 * The amount of Black in this color in the CMYK color space.
	 */
	get cmykBlack(): Percentage {
		return new Percentage(1 - this._MAX)
	}

	/**
	 * Get an array of RGBA channels.
	 */
	get rgb(): [Percentage, Percentage, Percentage, Percentage] {
		return [this.red, this.green, this.blue, this.alpha]
	}

	/**
	 * Get an array of HSVA channels.
	 */
	get hsv(): [number, Percentage, Percentage, Percentage] {
		return [this.hsvHue, this.hsvSat, this.hsvVal, this.alpha]
	}

	/**
	 * Get an array of HSLA channels.
	 */
	get hsl(): [number, Percentage, Percentage, Percentage] {
		return [this.hslHue, this.hslSat, this.hslLum, this.alpha]
	}

	/**
	 * Get an array of HWBA channels.
	 */
	get hwb(): [number, Percentage, Percentage, Percentage] {
		return [this.hwbHue, this.hwbWhite, this.hwbBlack, this.alpha]
	}

	/**
	 * Get an array of CMYKA channels.
	 */
	get cmyk(): [Percentage, Percentage, Percentage, Percentage, Percentage] {
		return [this.cmykCyan, this.cmykMagenta, this.cmykYellow, this.cmykBlack, this.alpha]
	}

	/**
	 * Return the inversion of this color, preserving alpha.
	 *
	 * The inversion of a color is the difference between that color and white.
	 * @returns a new Color object that corresponds to this color’s inversion
	 */
	invert(): Color {
		return new Color(
			this.red  .conjugate,
			this.green.conjugate,
			this.blue .conjugate,
			this.alpha
		)
	}

	/**
	 * Return a hue-rotation of this color, preserving alpha.
	 *
	 * a the number of degrees to rotate
	 * @returns a new Color object corresponding to this color rotated by `a` degrees
	 */
	rotate(a: number): Color {
		return Color.fromHSV(((this.hsvHue + a) % 360), this.hsvSat, this.hsvVal, this.alpha)
	}

	/**
	 * Return the complement of this color.
	 *
	 * The complement of a color amounts to a hue rotation of 180 degrees.
	 * @returns a new Color object that corresponds to this color’s complement
	 */
	complement(): Color {
		return this.rotate(180)
	}

	/**
	 * Return a more saturated (more colorful) version of this color by a percentage.
	 *
	 * This method calculates saturation in the HSL space.
	 * A parameter of 1.0 returns a color with full saturation, and 0.0 returns an identical color.
	 * Set `relative = true` to specify the amount as relative to the color’s current saturation.
	 *
	 * For example, if `$color` has an HSL-sat of 0.5, then calling `$color.saturate(0.5)` will return
	 * a new color with an HSL-sat of 1.0, because the argument 0.5 is simply added to the color’s saturation.
	 * However, calling `$color.saturate(0.5, true)` will return a new color with an HSL-sat of 0.75,
	 * because the argument 0.5, relative to the color’s current saturation of 0.5, results in
	 * an added saturation of 0.25.
	 *
	 * @param   p the value by which to saturate this color
	 * @param   relative should the saturation added be relative?
	 * @returns a new Color object that corresponds to this color saturated by `p`
	 */
	saturate(p: Percentage|number, relative = false): Color {
		return (p instanceof Percentage) ? Color.fromHSL(
			this.hslHue,
			new Percentage(this.hslSat.valueOf() + ((relative) ? (p.times(this.hslSat)) : p).valueOf()),
			this.hslLum,
			this.alpha
		) : this.saturate(new Percentage(p), relative)
	}

	/**
	 * Return a less saturated version of this color by a percentage.
	 *
	 * A parameter of 1.0 returns a grayscale color, and 0.0 returns an identical color.
	 * @param   p the value by which to desaturate this color
	 * @param   relative should the saturation subtracted be relative?
	 * @returns a new Color object that corresponds to this color desaturated by `p`
	 */
	desaturate(p: Percentage, relative = false): Color {
		return this.saturate(-p, relative)
	}

	/**
	 * Return a lighter version of this color by a percentage.
	 *
	 * This method calculates with luminosity in the HSL space.
	 * A parameter of 1.0 returns white, and 0.0 returns an identical color.
	 * Set `relative = true` to specify the amount as relative to the color’s current luminosity.
	 *
	 * For example, if `$color` has an HSL-lum of 0.5, then calling `$color.lighten(0.5)` will return
	 * a new color with an HSL-lum of 1.0, because the argument 0.5 is simply added to the color’s luminosity.
	 * However, calling `$color.lighten(0.5, true)` will return a new color with an HSL-lum of 0.75,
	 * because the argument 0.5, relative to the color’s current luminosity of 0.5, results in
	 * an added luminosity of 0.25.
	 *
	 * @param   p the amount by which to lighten this color
	 * @param   relative should the luminosity added be relative?
	 * @returns a new Color object that corresponds to this color lightened by `p`
	 */
	lighten(p: Percentage|number, relative = false): Color {
		return (p instanceof Percentage) ? Color.fromHSL(
			this.hslHue,
			this.hslSat,
			new Percentage(this.hslLum.valueOf() + ((relative) ? (p.times(this.hslLum)) : p).valueOf()),
			this.alpha
		) : this.lighten(new Percentage(p), relative)
	}

	/**
	 * Return a darker version of this color by a percentage.
	 *
	 * A parameter of 1.0 returns black, and 0.0 returns an identical color.
	 * @param   p the amount by which to darken this color
	 * @param   relative should the luminosity subtracted be relative?
	 * @returns a new Color object that corresponds to this color darkened by `p`
	 */
	darken(p: Percentage|number, relative = false): Color {
		return this.lighten(-p, relative)
	}

	/**
	 * Return a new color with the complemented alpha of this color.
	 *
	 * E.g. an alpha of 0.7, complemented, is 0.3 (the complement with 1.0).
	 * @returns a new Color object with the same color but complemented alpha
	 */
	negate(): Color {
		return new Color(this.red, this.green, this.blue, this.alpha.conjugate)
	}

	/**
	 * Return a less faded (larger alpha) version of this color.
	 *
	 * A parameter of 1.0 returns full opaqueness, and 0.0 returns an identical color.
	 * Set `relative = true` to specify the amount as relative to the color’s current opacity.
	 *
	 * For example, if `$color` has an alpha of 0.5, then calling `$color.fadeIn(0.5)` will return
	 * a new color with an alpha of 1.0, because the argument 0.5 is simply added to the color’s alpha.
	 * However, calling `$color.fadeIn(0.5, true)` will return a new color with an alpha of 0.75,
	 * because the argument 0.5, relative to the color’s current alpha of 0.5, results in
	 * an added alpha of 0.25.
	 *
	 * @param   p the amount by which to fade in this color
	 * @param   relative should the alpha added be relative?
	 * @returns a new Color object that corresponds to this color faded in by `p`
	 */
	fadeIn(p: Percentage|number, relative = false): Color {
		return (p instanceof Percentage) ? new Color(
			this.red,
			this.green,
			this.blue,
			new Percentage(this.alpha.valueOf() + ((relative) ? p.times(this.alpha) : p).valueOf())
		) : this.fadeIn(new Percentage(p), relative)
	}

	/**
	 * Return a more faded (smaller alpha) version of this color.
	 *
	 * A parameter of 1.0 returns transparent, and 0.0 returns an identical color.
	 * Set `relative = true` to specify the amount as relative to the color’s current opacity.
	 * @param   p the amount by which to fade out this color
	 * @param   relative should the alpha subtracted be relative?
	 * @returns a new Color object that corresponds to this color faded out by `p`
	 */
	fadeOut(p: Percentage|number, relative = false): Color {
		return this.fadeIn(-p, relative)
	}

	/**
	 * Mix (average) another color with this color, with a given weight favoring that color.
	 *
	 * If `weight == 0.0`, return exactly this color.
	 * `weight == 1.0` return exactly the other color.
	 * `weight == 0.5` (default if omitted) return a perfectly even mix.
	 * In other words, `weight` is "how much of the other color you want."
	 * Note that `color1.mix(color2, weight)` returns the same result as `color2.mix(color1, 1-weight)`.
	 * @param   color the second color
	 * @param   weight between 0.0 and 1.0; the weight favoring the other color
	 * @returns a mix of the two given colors
	 */
	mix(color: Color, weight = 0.5): Color {
		let red  : Percentage = new Percentage(xjs.Math.average(this.red  .valueOf(), color.red  .valueOf(), weight))
		let green: Percentage = new Percentage(xjs.Math.average(this.green.valueOf(), color.green.valueOf(), weight))
		let blue : Percentage = new Percentage(xjs.Math.average(this.blue .valueOf(), color.blue .valueOf(), weight))
		let alpha: Percentage = Color._compoundOpacity(this.alpha, color.alpha)
		return new Color(red, green, blue, alpha)
	}

	/**
	 * Blur another color with this color, with a given weight favoring that color.
	 *
	 * Behaves almost exactly the same as {@link Color.mix},
	 * except that this method uses a more visually accurate, slightly brighter, mix.
	 * @see {@link https://www.youtube.com/watch?v=LKnqECcg6Gw|“Computer Color is Broken” by minutephysics}
	 * @param   color the second color
	 * @param   weight between 0.0 and 1.0; the weight favoring the other color
	 * @returns a blur of the two given colors
	 */
	blur(color: Color, weight = 0.5): Color {
		/**
		 * Calculate the compound value of two overlapping same-channel values.
		 * @private
		 * @param   c1 the first channel value (red, green, or blue)
		 * @param   c2 the second channel value (corresponding to `c1`)
		 * @returns the compounded value
		 */
		function compoundChannel(c1: Percentage, c2: Percentage): Percentage {
			return Color._linear_sRGB(new Percentage(xjs.Math.average(
				Color._sRGB_Linear(c1).valueOf(),
				Color._sRGB_Linear(c2).valueOf(),
				weight
			)))
		}
		let red  : Percentage =        compoundChannel(this.red   , color.red  )
		let green: Percentage =        compoundChannel(this.green , color.green)
		let blue : Percentage =        compoundChannel(this.blue  , color.blue )
		let alpha: Percentage = Color._compoundOpacity(this.alpha , color.alpha)
		return new Color(red, green, blue, alpha)
	}

	/**
	 * Compare this color with another color.
	 *
	 * Return `true` if they are the same color.
	 * Colors are the “same” iff they have exactly the same RGBA channels.
	 * Thus, “same” colors are “replaceable”.
	 * @param   color a Color object
	 * @returns is the argument the “same” color as this color?
	 */
	equals(color: Color): boolean {
		if (this === color) return true
		if (this.alpha.equals(0) && color.alpha.equals(0)) return true
		return (
			this.red  .equals(color.red  ) &&
			this.green.equals(color.green) &&
			this.blue .equals(color.blue ) &&
			this.alpha.equals(color.alpha)
		)
	}

	/**
	 * Return the *relative luminance* of this color.
	 *
	 * The relative luminance of a color is the perceived brightness of that color.
	 * Note that this is different from the actual luminosity of the color.
	 * For examle, lime (`#00ff00`) and blue (`#0000ff`) both have a luminosity of 0.5,
	 * even though lime is perceived to be much brighter than blue.
	 * In fact, the relative luminance of lime is 0.72 — about ten times that of blue’s, which is only 0.07.
	 *
	 * In this method, alpha is ignored, that is, the color is assumed to be opaque.
	 * @see https://www.w3.org/TR/WCAG21/#dfn-relative-luminance
	 * @see https://en.wikipedia.org/wiki/Relative_luminance#Relative_luminance_in_colorimetric_spaces
	 * @returns the relative luminance of this color, a number 0–1
	 */
	relativeLuminance(): number {
		return (
			Color._sRGB_Linear(this.red  ).of(0.2126) +
			Color._sRGB_Linear(this.green).of(0.7152) +
			Color._sRGB_Linear(this.blue ).of(0.0722)
		)
	}

	/**
	 * Return the *contrast ratio* between two colors.
	 * @see https://www.w3.org/TR/WCAG/#dfn-contrast-ratio
	 * @param   color the second color to check
	 * @returns the contrast ratio of this color with the argument, a number 1–21
	 */
	contrastRatio(color: Color): number {
		let rl_this:  number =  this.relativeLuminance()
		let rl_color: number = color.relativeLuminance()
		return (Math.max(rl_this, rl_color) + 0.05) / (Math.min(rl_this, rl_color) + 0.05)
	}

	/**
	 * Return a string name of this color, if one exists.
	 * @see {@link https://www.w3.org/TR/css-color-4/#named-colors|Named Colors | CSS Color Module Level 4}
	 * @returns the name of this color, else `null` if it does not have one
	 */
	name(): string|null {
		let named_colors: [string, string][] = Object.entries(NAMES)
		const returned: [string, string]|null = named_colors.find((c) => c[1].toLowerCase() === this.toString()) || null
		return (returned) ? returned[0] : null
	}
}
