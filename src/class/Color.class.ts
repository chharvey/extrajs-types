import * as xjs from 'extrajs'

// TODO: move to xjs.Number
const xjs_Number_REGEXP: Readonly<RegExp> = /^-?(?:\d+(?:\.\d+)?|\.\d+)$/

import Integer from './Integer.class'
import Percentage from './Percentage.class'
import Fraction from './Fraction.class'
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
	/** cmyk(c m y k [/ a]) */
	CMYK,
	/** hsv(h s v [/ a]) */
	HSV,
	/** hsl(h s l [/ a]) */
	HSL,
	/** hwb(h w b [/ a]) */
	HWB,
}


/**
 * An abstract representation of a color that can be displayed in a pixel,
 * given three primary color channels and a possible transparency channel.
 */
export default class Color {
	private static readonly _NUMBER_OR_PERCENTAGE: string = `${xjs_Number_REGEXP.source.slice(1,-1)}%?`
	private static readonly _NUMBER_OR_ANGLE     : string = `${xjs_Number_REGEXP.source.slice(1,-1)}(?:deg|grad|rad|turn)?`

	/**
	 * An immutable RegExp instance, representing a string in {@link ColorSpace.HEX} format.
	 */
	static readonly REGEXP_HEX: Readonly<RegExp> = /^#(?:(?:[\da-f]{3}){1,2}|(?:[\da-f]{4}){1,2})$/i
	/**
	 * An immutable RegExp instance, representing a string in {@link ColorSpace.RGB} format.
	 *
	 * @deprecated Support for legacy syntax `rgb(r, g, b [, a]?)`.
	 */
	static readonly REGEXP_RGB_LEGACY: Readonly<RegExp> = new RegExp(`^rgb\\(\\s*${
		Color._NUMBER_OR_PERCENTAGE +
		`(?:\\s*,\\s*${Color._NUMBER_OR_PERCENTAGE}){2,3}`
	}\\s*\\)$`)
	/**
	 * An immutable RegExp instance, representing a string in {@link ColorSpace.RGB} format.
	 *
	 * @deprecated Support for legacy syntax `rgba(r, g, b, a)`.
	 */
	static readonly REGEXP_RGBA_LEGACY: Readonly<RegExp> = new RegExp(`^rgba\\(\\s*${
		Color._NUMBER_OR_PERCENTAGE +
		`(?:\\s*,\\s*${Color._NUMBER_OR_PERCENTAGE}){3}`
	}\\s*\\)$`)
	/**
	 * An immutable RegExp instance, representing a string in {@link ColorSpace.RGB} format.
	 *
	 * Updated with CSS-Color-4 specs.
	 */
	static readonly REGEXP_RGB: Readonly<RegExp> = new RegExp(`^rgb\\(\\s*${
		`(?:${
			`${xjs_Number_REGEXP.source.slice(1,-1)}(?:\\s+${xjs_Number_REGEXP.source.slice(1,-1)}){2}` + `|` +
			`${Percentage.REGEXP.source.slice(1,-1)}(?:\\s+${Percentage.REGEXP.source.slice(1,-1)}){2}`
		})` +
		`(?:\\s*/\\s*${Color._NUMBER_OR_PERCENTAGE})?`
	}\\s*\\)$`)
	/**
	 * An immutable RegExp instance, representing a string in {@link ColorSpace.CMYK} format.
	 *
	 * @deprecated Support for legacy syntax `cmyk(c, m, y, k [, a]?)`.
	 */
	static readonly REGEXP_CMYK_LEGACY: Readonly<RegExp> = new RegExp(`^cmyk\\(\\s*${
		Color._NUMBER_OR_PERCENTAGE +
		`(?:\\s*,\\s*${Color._NUMBER_OR_PERCENTAGE}){3,4}`
	}\\s*\\)$`)
	/**
	 * An immutable RegExp instance, representing a string in {@link ColorSpace.CMYK} format.
	 *
	 * @deprecated Support for legacy syntax `cmyka(c, m, y, k, a)`.
	 */
	static readonly REGEXP_CMYKA_LEGACY: Readonly<RegExp> = new RegExp(`^cmyka\\(\\s*${
		Color._NUMBER_OR_PERCENTAGE +
		`(?:\\s*,\\s*${Color._NUMBER_OR_PERCENTAGE}){4}`
	}\\s*\\)$`)
	/**
	 * An immutable RegExp instance, representing a string in {@link ColorSpace.CMYK} format.
	 *
	 * Updated with CSS-Color-4 specs.
	 */
	static readonly REGEXP_CMYK: Readonly<RegExp> = new RegExp(`^cmyk\\(\\s*${
		`(?:${
			`${xjs_Number_REGEXP.source.slice(1,-1)}(?:\\s+${xjs_Number_REGEXP.source.slice(1,-1)}){3}` + `|` +
			`${Percentage.REGEXP.source.slice(1,-1)}(?:\\s+${Percentage.REGEXP.source.slice(1,-1)}){3}`
		})` +
		`(?:\\s*/\\s*${Color._NUMBER_OR_PERCENTAGE})?`
	}\\s*\\)$`)
	/**
	 * An immutable RegExp instance, representing a string in {@link ColorSpace.HSV}, {@link ColorSpace.HSL}, or {@link ColorSpace.HWB} formats.
	 *
	 * @deprecated Support for legacy syntax `hsv(h, s, v [, a]?)`, `hsl(h, s, v [, a]?)`, `hwb(h, s, v [, a]?)`.
	 */
	static readonly REGEXP_HUE_LEGACY: Readonly<RegExp> = new RegExp(`^(?:hsv|hsl|hwb)\\(\\s*${
		Color._NUMBER_OR_ANGLE +
		`(?:\\s*,\\s*${Percentage.REGEXP.source.slice(1,-1)}){2}` +
		`(?:\\s*,\\s*${Color._NUMBER_OR_PERCENTAGE})?`
	}\\s*\\)$`)
	/**
	 * An immutable RegExp instance, representing a string in {@link ColorSpace.HSV}, {@link ColorSpace.HSL}, or {@link ColorSpace.HWB} formats.
	 *
	 * @deprecated Support for legacy syntax `hsva(h, s, v , a)`, `hsla(h, s, v , a)`, `hwba(h, s, v , a)`.
	 */
	static readonly REGEXP_HUEA_LEGACY: Readonly<RegExp> = new RegExp(`^(?:hsv|hsl|hwb)a\\(\\s*${
		Color._NUMBER_OR_ANGLE +
		`(?:\\s*,\\s*${Percentage.REGEXP.source.slice(1,-1)}){2}` +
		`\\s*,\\s*${Color._NUMBER_OR_PERCENTAGE}`
	}\\s*\\)$`)
	/**
	 * An immutable RegExp instance, representing a string in {@link ColorSpace.HSV}, {@link ColorSpace.HSL}, or {@link ColorSpace.HWB} formats.
	 *
	 * Updated with CSS-Color-4 specs.
	 */
	static readonly REGEXP_HUE: Readonly<RegExp> = new RegExp(`^(?:hsv|hsl|hwb)\\(\\s*${
		Color._NUMBER_OR_ANGLE +
		`(?:\\s+${Percentage.REGEXP.source.slice(1,-1)}){2}` +
		`(?:\\s*/\\s*${Color._NUMBER_OR_PERCENTAGE})?`
	}\\s*\\)$`)

	/**
	 * Calculate the alpha of several overlapping translucent colors.
	 *
	 * For three overlapping colors with respective alphas `a`, `b` and `c`,
	 * the compounded alpha will be `1  -  (1 - a)*(1 - b)*(1 - c)`.
	 * @param   alphas the alphas to compound
	 * @returns the compounded alpha
	 */
	private static _compoundOpacity(...alphas: Fraction[]): Fraction {
		return alphas.map((a) => a.conjugate).reduce((a,b) => a.times(b)).conjugate
		// return new Fraction(xjs.Math.meanGeometric(...alphas.map((a) => a.conjugate.valueOf())) ** alphas.length).conjugate
	}
	/**
	 * Calculate the weighed compound opacity of two or more overlapping translucent colors.
	 *
	 * For two overlapping colors with respective alphas `a` and `b`,
	 * the compounded alpha of an even mix will be `1  -  (1 - a)*(1 - b)`
	 * (equivalent to `1  -  ((1-a)**0.5 * (1-b)**0.5)  **  2`).
	 * For an uneven mix, a weight 0.75 favoring a2, it will be
	 * `1  -  ((1-a)**0.25 * (1-b)**0.75)  **  2`.
	 * @param   a1 the first alpha value
	 * @param   a2 the second alpha value
	 * @param   w the weight favoring the second alpha
	 * @returns the compounded alpha
	 */
	private static _compoundOpacityWeighted(a1: Fraction, a2: Fraction, w: number): Fraction {
		return new Fraction(xjs.Math.interpolateGeometric(a1.conjugate.valueOf(), a2.conjugate.valueOf(), w) ** 2).conjugate
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
	private static _sRGB_Linear(c_srgb: Fraction): Fraction {
		let c = c_srgb.valueOf()
		return new Fraction((c <= 0.03928) ? c / 12.92 : ((c + 0.055) / 1.055) ** 2.4)
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
	private static _linear_sRGB(c_lin: Fraction): Fraction {
		let c = c_lin.valueOf()
		return new Fraction((c <= 0.00304) ? c * 12.92 : 1.055 * c ** (1 / 2.4) - 0.055)
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
	static fromRGB(red: Integer|number = 0, green: Integer|number = 0, blue: Integer|number = 0, alpha: Fraction|number = 1): Color {
		return (red instanceof Integer && green instanceof Integer && blue instanceof Integer && alpha instanceof Fraction) ?
			new Color(...[red, green, blue].map((c) => new Fraction(c.clamp(0, 255).dividedBy(255))), alpha) :
			Color.fromRGB(new Integer(red), new Integer(green), new Integer(blue), new Fraction(alpha))
	}

	/**
	 * Return a new Color object, given cyan, magenta, yellow, and black in CMYK-space.
	 *
	 * @see https://www.w3.org/TR/css-color-4/#cmyk-rgb
	 * @param   cyan    the CMYK-cyan    channel of this color
	 * @param   magenta the CMYK-magenta channel of this color
	 * @param   yellow  the CMYK-yellow  channel of this color
	 * @param   black   the CMYK-black   channel of this color
	 * @param   alpha   the alpha        channel of this color
	 * @returns a new Color object with cmyka(cyan, magenta, yellow, black, alpha)
	 */
	static fromCMYK(cyan: Fraction|number = 0, magenta: Fraction|number = 0, yellow: Fraction|number = 0, black: Fraction|number = 0, alpha: Fraction|number = 1): Color {
		return (cyan instanceof Fraction && magenta instanceof Fraction && yellow instanceof Fraction && black instanceof Fraction && alpha instanceof Fraction) ? new Color(
			new Fraction(cyan   .times(black.conjugate).valueOf() + black.valueOf()).conjugate,
			new Fraction(magenta.times(black.conjugate).valueOf() + black.valueOf()).conjugate,
			new Fraction(yellow .times(black.conjugate).valueOf() + black.valueOf()).conjugate,
			alpha
		) : Color.fromCMYK(
			new Fraction(cyan),
			new Fraction(magenta),
			new Fraction(yellow),
			new Fraction(black),
			new Fraction(alpha)
		)
	}

	/**
	 * Return a new Color object, given hue, saturation, and value in HSV-space.
	 *
	 * @param   hue the HSV-hue channel of this color
	 * @param   sat the HSV-sat channel of this color
	 * @param   val the HSV-val channel of this color
	 * @param   alpha the alpha channel of this color
	 * @returns a new Color object with hsva(hue, sat, val, alpha)
	 */
	static fromHSV(hue: Angle|number = 0, sat: Fraction|number = 0, val: Fraction|number = 0, alpha: Fraction|number = 1): Color {
		return (hue instanceof Angle && sat instanceof Fraction && val instanceof Fraction && alpha instanceof Fraction) ? (() => {
			const [s, v]: number[] = [sat, val].map((p) => p.valueOf())
			let c: number = s * v
			let x: number = c * (1 - Math.abs(hue.convert(AngleUnit.DEG) / 60 % 2 - 1))
			let m: number = v - c
			let rgb: number[] = [c, x, 0]
			;    if (!hue.lessThan(0/6) && hue.lessThan(1/6)) { rgb = [c, x, 0] }
			else if (!hue.lessThan(1/6) && hue.lessThan(2/6)) { rgb = [x, c, 0] }
			else if (!hue.lessThan(2/6) && hue.lessThan(3/6)) { rgb = [0, c, x] }
			else if (!hue.lessThan(3/6) && hue.lessThan(4/6)) { rgb = [0, x, c] }
			else if (!hue.lessThan(4/6) && hue.lessThan(5/6)) { rgb = [x, 0, c] }
			else if (!hue.lessThan(5/6) && hue.lessThan(6/6)) { rgb = [c, 0, x] }
			return new Color(...rgb.map((c) => new Fraction(Math.min(c + m, 1))), alpha)
		})() : Color.fromHSV(
			new Angle(hue),
			new Fraction(sat),
			new Fraction(val),
			new Fraction(alpha)
		)
	}

	/**
	 * Return a new Color object, given hue, saturation, and luminosity in HSL-space.
	 *
	 * @see https://www.w3.org/TR/css-color-4/#hsl-to-rgb
	 * @param   hue the HSL-hue channel of this color
	 * @param   sat the HSL-sat channel of this color
	 * @param   lum the HSL-lum channel of this color
	 * @param   alpha the alpha channel of this color
	 * @returns a new Color object with hsla(hue, sat, lum, alpha)
	 */
	static fromHSL(hue: Angle|number = 0, sat: Fraction|number = 0, lum: Fraction|number = 0, alpha: Fraction|number = 1): Color {
		return (hue instanceof Angle && sat instanceof Fraction && lum instanceof Fraction && alpha instanceof Fraction) ? (() => {
			const [s, l]: number[] = [sat, lum].map((p) => p.valueOf())
			let c: number = s * (1 - Math.abs(2*l - 1))
			let x: number = c * (1 - Math.abs(hue.convert(AngleUnit.DEG) / 60 % 2 - 1))
			let m: number = l - c/2
			let rgb: number[] = [c, x, 0]
			;    if (!hue.lessThan(0/6) && hue.lessThan(1/6)) { rgb = [c, x, 0] }
			else if (!hue.lessThan(1/6) && hue.lessThan(2/6)) { rgb = [x, c, 0] }
			else if (!hue.lessThan(2/6) && hue.lessThan(3/6)) { rgb = [0, c, x] }
			else if (!hue.lessThan(3/6) && hue.lessThan(4/6)) { rgb = [0, x, c] }
			else if (!hue.lessThan(4/6) && hue.lessThan(5/6)) { rgb = [x, 0, c] }
			else if (!hue.lessThan(5/6) && hue.lessThan(6/6)) { rgb = [c, 0, x] }
			return new Color(...rgb.map((c) => new Fraction(Math.min(c + m, 1))), alpha)
		})() : Color.fromHSL(
			new Angle(hue),
			new Fraction(sat),
			new Fraction(lum),
			new Fraction(alpha)
		)
	}

	/**
	 * Return a new Color object, given hue, white, and black in HWB-space.
	 *
	 * @see https://www.w3.org/TR/css-color-4/#hwb-to-rgb
	 * @param   hue   the HWB-hue   channel of this color
	 * @param   white the HWB-white channel of this color
	 * @param   black the HWB-black channel of this color
	 * @param   alpha the alpha     channel of this color
	 * @returns a new Color object with hwba(hue, white, black, alpha)
	 */
	static fromHWB(hue: Angle|number = 0, white: Fraction|number = 0, black: Fraction|number = 0, alpha: Fraction|number = 1): Color {
		return (hue instanceof Angle && white instanceof Fraction && black instanceof Fraction && alpha instanceof Fraction) ? (() => {
			const [w, b]: number[] = [white, black].map((p) => p.valueOf())
			let rgb: Fraction[] = Color.fromHSL(hue, new Fraction(1), new Fraction(0.5)).rgb.slice(0, 3)
				.map((c) => new Fraction(Math.min(c.valueOf() * (1 - w - b) + w, 1)))
			return new Color(...rgb, alpha)
		})() : Color.fromHWB(
			new Angle(hue),
			new Fraction(white),
			new Fraction(black),
			new Fraction(alpha)
		)
		/*
		 * Exercise: prove:
		 * hwb = fromHSV(hue, 1 - w / (1 - b), 1 - b, a)
		 */
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
	static fromString(str: string = ''): Color {
		if (str === '') return new Color()

		/* ---- the string is a hex color ---- */
		if (Color.REGEXP_HEX.test(str)) {
			if (/^#[\da-f]{3,4}$/i.test(str)) {
				let [r, g, b, a]: string[] = [str[1], str[2], str[3], str[4] || '']
				return Color.fromString(`#${r}${r}${g}${g}${b}${b}${a}${a}`)
			}
			let red  : Fraction      =                      new Fraction(parseInt(str.slice(1,3), 16) / 255)
			let green: Fraction      =                      new Fraction(parseInt(str.slice(3,5), 16) / 255)
			let blue : Fraction      =                      new Fraction(parseInt(str.slice(5,7), 16) / 255)
			let alpha: Fraction|null = (str.length === 9) ? new Fraction(parseInt(str.slice(7,9), 16) / 255) : null
			return new Color(red, green, blue, alpha || void 0)
		}

		/* ---- the string is a CSS function ---- */
		if (new RegExp(`^(?:${[
			Color.REGEXP_RGB_LEGACY,
			Color.REGEXP_RGBA_LEGACY,
			Color.REGEXP_RGB,
			Color.REGEXP_CMYK_LEGACY,
			Color.REGEXP_CMYKA_LEGACY,
			Color.REGEXP_CMYK,
			Color.REGEXP_HUE_LEGACY,
			Color.REGEXP_HUEA_LEGACY,
			Color.REGEXP_HUE,
		].map((r) => r.source.slice(1,-1)).join('|')})$`).test(str)) {
			// COMBAK: add a console warning for legacy syntax, once CSS-Colors-4 is released.
			// if (new RegExp(`^(?:${[
			// 	Color.REGEXP_RGB_LEGACY,
			// 	Color.REGEXP_RGBA_LEGACY,
			// 	Color.REGEXP_CMYK_LEGACY,
			// 	Color.REGEXP_CMYKA_LEGACY,
			// 	Color.REGEXP_HUE_LEGACY,
			// 	Color.REGEXP_HUEA_LEGACY,
			// ].map((r) => r.source.slice(1,-1)).join('|')})$`).test(str)) {
			// 	console.warn(`Warning: Color notation '${str}' is deprecated. See https://www.w3.org/TR/css-color-4/.`)
			// }
			let space : string = str.split('(')[0]
			let cssarg: string = str.split('(')[1].slice(0, -1)
			let channels: string[] = (cssarg.includes(',')) ?
				cssarg.split(',') : // legacy syntax — COMBAK{DEPRECATED}
				cssarg.split('/')[0].split(' ').filter((s) => s !== '')
			if (cssarg.includes('/')) {
				channels.push(cssarg.split('/')[1])
			}
			channels = channels.map((cs) => cs.trim())
			if (new RegExp(`^(?:${[
				Color.REGEXP_RGB_LEGACY,
				Color.REGEXP_RGBA_LEGACY,
				Color.REGEXP_RGB,
			].map((r) => r.source.slice(1,-1)).join('|')})$`).test(str)) {
				let red   : Fraction      =                 new Fraction((xjs_Number_REGEXP.test(channels[0])) ? +channels[0] / 255 : Percentage.fromString(channels[0]))
				let green : Fraction      =                 new Fraction((xjs_Number_REGEXP.test(channels[1])) ? +channels[1] / 255 : Percentage.fromString(channels[1]))
				let blue  : Fraction      =                 new Fraction((xjs_Number_REGEXP.test(channels[2])) ? +channels[2] / 255 : Percentage.fromString(channels[2]))
				let alpha : Fraction|null = (channels[3]) ? new Fraction((xjs_Number_REGEXP.test(channels[3])) ? +channels[3]       : Percentage.fromString(channels[3])) : null
				return new Color(red, green, blue, alpha || void 0)
			}
			if (new RegExp(`^(?:${[
				Color.REGEXP_CMYK_LEGACY,
				Color.REGEXP_CMYKA_LEGACY,
				Color.REGEXP_CMYK,
			].map((r) => r.source.slice(1,-1)).join('|')})$`).test(str)) {
				let cyan    : Fraction      =                 new Fraction((xjs_Number_REGEXP.test(channels[0])) ? +channels[0] : Percentage.fromString(channels[0]))
				let magenta : Fraction      =                 new Fraction((xjs_Number_REGEXP.test(channels[1])) ? +channels[1] : Percentage.fromString(channels[1]))
				let yellow  : Fraction      =                 new Fraction((xjs_Number_REGEXP.test(channels[2])) ? +channels[2] : Percentage.fromString(channels[2]))
				let black   : Fraction      =                 new Fraction((xjs_Number_REGEXP.test(channels[3])) ? +channels[3] : Percentage.fromString(channels[3]))
				let alpha   : Fraction|null = (channels[4]) ? new Fraction((xjs_Number_REGEXP.test(channels[4])) ? +channels[4] : Percentage.fromString(channels[4])) : null
				return Color.fromCMYK(cyan, magenta, yellow, black, alpha || void 0)
			}
			if (new RegExp(`^(?:${[
				Color.REGEXP_HUE_LEGACY,
				Color.REGEXP_HUEA_LEGACY,
				Color.REGEXP_HUE,
			].map((r) => r.source.slice(1,-1)).join('|')})$`).test(str)) {
				let hue  : Angle         = Angle.fromString((xjs_Number_REGEXP.test(channels[0])) ? `${channels[0]}deg` : channels[0])
				let p1   : Fraction      = new Fraction(Percentage.fromString(channels[1]))
				let p2   : Fraction      = new Fraction(Percentage.fromString(channels[2]))
				let alpha: Fraction|null = (channels[3]) ? new Fraction((xjs_Number_REGEXP.test(channels[3])) ? +channels[3] : Percentage.fromString(channels[3])) : null
				return xjs.Object.switch<Color>(space, {
					hsv  : Color.fromHSV,
					hsva : Color.fromHSV, // COMBAK{DEPRECATED}
					hsl  : Color.fromHSL,
					hsla : Color.fromHSL, // COMBAK{DEPRECATED}
					hwb  : Color.fromHWB,
					hwba : Color.fromHWB, // COMBAK{DEPRECATED}
				})(hue, p1, p2, alpha || void 0)
			}
		}

		/* ---- the string is a named color ---- */
		if (!str.includes('(')) {
			const returned: string|null = NAMES[str] || null
			if (!returned) throw new ReferenceError(`No color found for the name given: '${str}'.`)
			return Color.fromString(returned)
		}

		throw new RangeError(`Invalid string format: '${str}'.`)
  }

	/**
	 * Mix two or more colors. The average will be weighted evenly.
	 *
	 * This method performs the arithmetic mean of each channel of the colors.
	 *
	 * If two colors `a` and `b` are given, calling this static method, `Color.mix([a, b])`,
	 * is equivalent to calling `a.mix(b)` without a weight.
	 * However, calling `Color.mix([a, b, c])` with 3 or more colors yields an even mix,
	 * and will *not* yield the same results as calling `a.mix(b).mix(c)`, which yields an uneven mix.
	 * Note that the order of the given colors does not change the result, that is,
	 * `Color.mix([a, b, c])` returns the same result as `Color.mix([c, b, a])`.
	 * @see Color.mix
	 * @param   colors several Colors to mix
	 * @returns a mix of the given colors
	 */
	static mix(...colors: Color[]): Color {
		return new Color(
			new Fraction(xjs.Math.meanArithmetic(...colors.map((c) => c.red  .valueOf()))),
			new Fraction(xjs.Math.meanArithmetic(...colors.map((c) => c.green.valueOf()))),
			new Fraction(xjs.Math.meanArithmetic(...colors.map((c) => c.blue .valueOf()))),
			Color._compoundOpacity(...colors.map((c) => c.alpha))
		)
	}

	/**
	 * Blur two or more colors. The average will be weighted evenly.
	 *
	 * This method performs the arithmetic mean of each sRGB-adjusted channel of the colors.
	 *
	 * Behaves almost exactly the same as {@link Color.mix},
	 * except that this method uses a more visually accurate, slightly brighter, mix.
	 * @see Color.blur
	 * @param   colors several Colors to blur
	 * @returns a blur of the given colors
	 */
	static blur(...colors: Color[]): Color {
		/**
		 * Return the arithmetic mean of several sRGB-adjusted channels.
		 *
		 * Algorithm:
		 * 1. {@link Color._sRGB_Linear|‘square’} all channels
		 * 2. convert all squares to a numeric value
		 * 3. take the arithmetic mean of the squares
		 * 4. convert the mean back to a Fraction
		 * 5. {@link Color._linear_sRGB|‘square root’} the result
		 * @private
		 * @param   comps a set of channel value (red, green, or blue)
		 * @returns the compounded value
		 */
		function blurChannels(...comps: Fraction[]): Fraction {
			return Color._linear_sRGB(new Fraction(xjs.Math.meanArithmetic(...comps.map((c) => Color._sRGB_Linear(c).valueOf()))))
		}
		return new Color(
			blurChannels(...colors.map((c) => c.red  )),
			blurChannels(...colors.map((c) => c.green)),
			blurChannels(...colors.map((c) => c.blue )),
			Color._compoundOpacity(...colors.map((c) => c.alpha))
		)
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
	private readonly _RED: Fraction;
	/** The green channel of this color. */
	private readonly _GREEN: Fraction;
	/** The blue channel of this color. */
	private readonly _BLUE: Fraction;
	/** The alpha channel of this color. */
	private readonly _ALPHA: Fraction;

	private readonly _MAX: number
	private readonly _MIN: number
	private readonly _CHROMA: number

	/**
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
	constructor(red: Fraction|number = 0, green: Fraction|number = 0, blue: Fraction|number = 0, alpha: Fraction|number = 1) {
		if (arguments.length === 0) alpha = 0
		;[this._RED, this._GREEN, this._BLUE] = [red, green, blue].map((c) => new Fraction(c))
		this._ALPHA = new Fraction(alpha)

		this._MAX    = Math.max(...[this._RED, this._GREEN, this._BLUE].map((c) => c.valueOf()))
		this._MIN    = Math.min(...[this._RED, this._GREEN, this._BLUE].map((c) => c.valueOf()))
		this._CHROMA = this._MAX - this._MIN
	}

	/**
	 * Get the red channel of this color.
	 */
	get red(): Fraction { return this._RED }

	/**
	 * Get the green channel of this color.
	 */
	get green(): Fraction { return this._GREEN }

	/**
	 * Get the blue channel of this color.
	 */
	get blue(): Fraction { return this._BLUE }

	/**
	 * Get the alpha (opacity) of this color.
	 */
	get alpha(): Fraction { return this._ALPHA }

	/**
	 * Get the cmyk-cyan of this color.
	 *
	 * The amount of Cyan in this color, or a subtraction of the amount of Red in this color.
	 * @returns the cmyk-cyan of this color
	 */
	get cmykCyan(): Fraction {
		return new Fraction((this.cmykBlack.equals(1)) ? 0 : (1 - this._RED.valueOf() - this.cmykBlack.valueOf()) / this.cmykBlack.conjugate.valueOf())
	}

	/**
	 * Get the cmyk-magenta of this color.
	 *
	 * The amount of Magenta in this color, or a subtraction of the amount of Green in this color.
	 * @returns the cmyk-magenta of this color
	 */
	get cmykMagenta(): Fraction {
		return new Fraction((this.cmykBlack.equals(1)) ? 0 : (1 - this._GREEN.valueOf() - this.cmykBlack.valueOf()) / this.cmykBlack.conjugate.valueOf())
	}

	/**
	 * Get the cmyk-yellow of this color.
	 *
	 * The amount of Yellow in this color, or a subtraction of the amount of Blue in this color.
	 * @returns the cmyk-yellow of this color
	 */
	get cmykYellow(): Fraction {
		return new Fraction((this.cmykBlack.equals(1)) ? 0 : (1 - this._BLUE.valueOf() - this.cmykBlack.valueOf()) / this.cmykBlack.conjugate.valueOf())
	}

	/**
	 * Get the cmyk-black of this color.
	 *
	 * The amount of Black in this color in the CMYK color space.
	 * @returns the cmyk-black of this color
	 */
	get cmykBlack(): Fraction {
		return new Fraction(1 - this._MAX)
	}

	/**
	 * Get the hsv-hue of this color.
	 *
	 * The HSV-space hue (in degrees) of this color, or what "color" this color is.
	 * @returns the hsv-hue of this color
	 */
	get hsvHue(): Angle {
		if (this._CHROMA === 0) return new Angle()
		let [r, g, b]: [number, number, number] = [
			this._RED.valueOf(),
			this._GREEN.valueOf(),
			this._BLUE.valueOf(),
		]
		return new Angle(xjs.Object.switch<number>(`${this._MAX}`, {
			[r]: () => ((g - b) / this._CHROMA + 6) % 6 * 1/6,
			[g]: () => ((b - r) / this._CHROMA + 2)     * 1/6,
			[b]: () => ((r - g) / this._CHROMA + 4)     * 1/6,
		})())
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
	 * @see https://en.wikipedia.org/wiki/HSL_and_HSV#Saturation
	 * @returns the hsv-saturation of this color.
	 */
	get hsvSat(): Fraction {
		return new Fraction((this._CHROMA === 0) ? 0 : this._CHROMA / this.hsvVal.valueOf())
	}

	/**
	 * Get the hsv-value of this color.
	 *
	 * The brightness of this color. A lower value means the color is closer to black, a higher
	 * value means the color is more true to its hue.
	 * @see https://en.wikipedia.org/wiki/HSL_and_HSV#Lightness
	 * @returns the hsv-value of this color.
	 */
	get hsvVal(): Fraction {
		return new Fraction(this._MAX)
	}

	/**
	 * Get the hsl-hue of this color.
	 *
	 * The Hue of this color. Identical to {@link Color.hsvHue}.
	 * @returns the hsl-hue of this color
	 */
	get hslHue(): Angle {
		return this.hsvHue
	}

	/**
	 * Get the hsl-saturation of this color.
	 *
	 * The amount of "color" in the color. A lower saturation means the color is more grayer,
	 * a higher saturation means the color is more colorful.
	 * @see https://en.wikipedia.org/wiki/HSL_and_HSV#Saturation
	 * @returns the hsl-saturation of this color.
	 */
	get hslSat(): Fraction {
		return new Fraction((this._CHROMA === 0) ? 0 : this._CHROMA / (1 - Math.abs(2 * this.hslLum.valueOf() - 1)))
		/*
		 * Prove:
		 * 1 - |2x - 1| == { x <= 0.5 ? 2x : (2 - 2x) }
		 * Proof:
		 * Case A. Let x <= 0.5. Then 2x - 1 <= 0, and |2x - 1| == -(2x - 1).
		 * Then 1 - |2x - 1| == 1 + (2x - 1) == 2x. //
		 * Case B. Let 0.5 < x. Then 0 < 2x - 1, and |2x - 1| == 2x - 1.
		 * Then 1 - |2x - 1| == 1 - (2x - 1) == 2 - 2x. //
		 */
	}

	/**
	 * Get the hsl-luminosity of this color.
	 *
	 * How "white" or "black" the color is. A lower luminosity means the color is closer to black,
	 * a higher luminosity means the color is closer to white.
	 * @see https://en.wikipedia.org/wiki/HSL_and_HSV#Lightness
	 * @returns the hsl-luminosity of this color.
	 */
	get hslLum(): Fraction {
		return new Fraction(0.5 * (this._MAX + this._MIN))
	}

	/**
	 * Get the hwb-hue of this color.
	 *
	 * The Hue of this color. Identical to {@link Color.hsvHue}.
	 * @returns the hwb-hue of this color
	 */
	get hwbHue(): Angle {
		return this.hsvHue
	}

	/**
	 * Get the hwb-white of this color.
	 *
	 * The amount of White in this color. A higher white means the color is closer to #fff,
	 * a lower white means the color has a true hue (more colorful).
	 * @returns the hwb-white of this color
	 */
	get hwbWhite(): Fraction {
		return new Fraction(this._MIN)
	}

	/**
	 * Get the hwb-black of this color.
	 *
	 * The amount of Black in this color. A higher black means the color is closer to #000,
	 * a lower black means the color has a true hue (more colorful).
	 * Identical to {@link Color.cmykBlack}.
	 * @returns the hwb-black of this color
	 */
	get hwbBlack(): Fraction {
		return this.cmykBlack
	}

	/**
	 * Get an array of RGBA channels.
	 */
	get rgb(): [Fraction, Fraction, Fraction, Fraction] {
		return [this.red, this.green, this.blue, this.alpha]
	}

	/**
	 * Get an array of CMYKA channels.
	 */
	get cmyk(): [Fraction, Fraction, Fraction, Fraction, Fraction] {
		return [this.cmykCyan, this.cmykMagenta, this.cmykYellow, this.cmykBlack, this.alpha]
	}

	/**
	 * Get an array of HSVA channels.
	 */
	get hsv(): [Angle, Fraction, Fraction, Fraction] {
		return [this.hsvHue, this.hsvSat, this.hsvVal, this.alpha]
	}

	/**
	 * Get an array of HSLA channels.
	 */
	get hsl(): [Angle, Fraction, Fraction, Fraction] {
		return [this.hslHue, this.hslSat, this.hslLum, this.alpha]
	}

	/**
	 * Get an array of HWBA channels.
	 */
	get hwb(): [Angle, Fraction, Fraction, Fraction] {
		return [this.hwbHue, this.hwbWhite, this.hwbBlack, this.alpha]
	}

	/**
	 * Return a string representation of this color, as a valid CSS color string.
	 *
	 * If the alpha of this color is 1, then the string returned represents an opaque color,
	 * `hsv(h s v)`, `hsl(h s l)`, etc.
	 * Otherwise, the string returned represents a translucent color,
	 * `hsv(h s v / a)`, `hsl(h s l / a)`, etc.
	 *
	 * Numerical values are as follows:
	 * - HEX   values are unitless base 16 integers in [00,ff], two digits
	 * - RGB   values are unitless base 10 integers in [0,255], one to three digits
	 * - CMYK  values are unitless base 10 decimals in [0,1]
	 * - alpha values are unitless base 10 decimals in [0,1]
	 * - HSV/HSL/HWB-hue values are base 10 decimals in [0,1), expressed in turns (a unit of angle)
	 * - HSV/HSL-sat/val/lum and HWB-white/black values are base 10 decimals in [0,1], expressed in percentages
	 * @override
	 * @param   space represents the space in which this color exists
	 * @returns a string representing this color
	 */
	toString(space = ColorSpace.HEX): string {
		const leadingZero = (n: number, radix: number = 10) => `0${n.toString(radix)}`.slice(-2)
		if (space === ColorSpace.HEX) {
			return `#${this.rgb.slice(0,3).map((c) => leadingZero(Math.round(c.of(255)), 16)).join('')}${(this.alpha.lessThan(1)) ? leadingZero(Math.round(this.alpha.of(255)), 16) : ''}`
		}
		const returned: string[] = xjs.Object.switch<string[]>(`${space}`, {
			[ColorSpace.RGB ]: () => this.rgb .slice(0,3).map((c) => `${Math.round(c.of(255))}`),
			[ColorSpace.CMYK]: () => this.cmyk.slice(0,4).map((c) => `${c}`),
			[ColorSpace.HSV ]: () => [this.hsvHue.toString(10, AngleUnit.TURN), Percentage.stringify(this.hsvSat  .valueOf()), Percentage.stringify(this.hsvVal  .valueOf())],
			[ColorSpace.HSL ]: () => [this.hslHue.toString(10, AngleUnit.TURN), Percentage.stringify(this.hslSat  .valueOf()), Percentage.stringify(this.hslLum  .valueOf())],
			[ColorSpace.HWB ]: () => [this.hwbHue.toString(10, AngleUnit.TURN), Percentage.stringify(this.hwbWhite.valueOf()), Percentage.stringify(this.hwbBlack.valueOf())],
		})()
		return `${ColorSpace[space].toLowerCase()}(${returned.join(' ')}${
			(this.alpha.lessThan(1)) ? ` / ${this.alpha}` : ''
		})`
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
	 * @param   theta the angle to rotate, or a number of degrees
	 * @returns a new Color object corresponding to this color rotated by `theta` degrees
	 */
	rotate(theta: Angle|number): Color {
		return (theta instanceof Angle) ? Color.fromHSV(
			this.hsvHue.plus(theta),
			this.hsvSat,
			this.hsvVal,
			this.alpha
		) : this.rotate(new Angle(theta / Angle.CONVERSION[AngleUnit.DEG]))
	}

	/**
	 * Return the complement of this color.
	 *
	 * The complement of a color amounts to a hue rotation of 180 degrees.
	 * @returns a new Color object that corresponds to this color’s complement
	 */
	complement(): Color {
		return this.rotate(Angle.STRAIGHT)
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
	saturate(p: Fraction|number, relative: boolean = false): Color {
		p = p.valueOf()
		return Color.fromHSL(
			this.hslHue,
			this.hslSat.plusClamp((relative) ? p * this.hslSat.valueOf() : p),
			this.hslLum,
			this.alpha
		)
	}

	/**
	 * Return a less saturated version of this color by a percentage.
	 *
	 * A parameter of 1.0 returns a grayscale color, and 0.0 returns an identical color.
	 * @param   p the value by which to desaturate this color
	 * @param   relative should the saturation subtracted be relative?
	 * @returns a new Color object that corresponds to this color desaturated by `p`
	 */
	desaturate(p: Fraction|number, relative: boolean = false): Color {
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
	lighten(p: Fraction|number, relative: boolean = false): Color {
		p = p.valueOf()
		return Color.fromHSL(
			this.hslHue,
			this.hslSat,
			this.hslLum.plusClamp((relative) ? p * this.hslLum.valueOf() : p),
			this.alpha
		)
	}

	/**
	 * Return a darker version of this color by a percentage.
	 *
	 * A parameter of 1.0 returns black, and 0.0 returns an identical color.
	 * @param   p the amount by which to darken this color
	 * @param   relative should the luminosity subtracted be relative?
	 * @returns a new Color object that corresponds to this color darkened by `p`
	 */
	darken(p: Fraction|number, relative: boolean = false): Color {
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
	fadeIn(p: Fraction|number, relative: boolean = false): Color {
		p = p.valueOf()
		return new Color(
			this.red,
			this.green,
			this.blue,
			this.alpha.plusClamp((relative) ? p * this.alpha.valueOf() : p)
		)
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
	fadeOut(p: Fraction|number, relative: boolean = false): Color {
		return this.fadeIn(-p, relative)
	}

	/**
	 * Mix (average) another color with this color, with a given weight favoring that color.
	 *
	 * This method performs a linear interpolation of each channel of the colors.
	 *
	 * If `weight == 0.0`, return exactly this color.
	 * `weight == 1.0` return exactly the other color.
	 * `weight == 0.5` (default if omitted) return a perfectly even mix.
	 * In other words, `weight` is "how much of the other color you want."
	 * Note that `color1.mix(color2, weight)` returns the same result as `color2.mix(color1, 1-weight)`.
	 * @param   color the second color
	 * @param   weight the weight favoring the other color
	 * @returns a mix of the two given colors
	 */
	mix(color: Color, weight: number = 0.5): Color {
		return new Color(
			new Fraction(xjs.Math.interpolateArithmetic(this.red  .valueOf(), color.red  .valueOf(), weight)),
			new Fraction(xjs.Math.interpolateArithmetic(this.green.valueOf(), color.green.valueOf(), weight)),
			new Fraction(xjs.Math.interpolateArithmetic(this.blue .valueOf(), color.blue .valueOf(), weight)),
			Color._compoundOpacityWeighted(this.alpha , color.alpha, weight)
		)
	}

	/**
	 * Blur another color with this color, with a given weight favoring that color.
	 *
	 * This method performs a linear interpolation of each sRGB-adjusted channel of the colors.
	 *
	 * Behaves almost exactly the same as {@link Color.mix},
	 * except that this method uses a more visually accurate, slightly brighter, mix.
	 * @see {@link https://www.youtube.com/watch?v=LKnqECcg6Gw|“Computer Color is Broken” by minutephysics}
	 * @param   color the second color
	 * @param   weight the weight favoring the other color
	 * @returns a blur of the two given colors
	 */
	blur(color: Color, weight: number = 0.5): Color {
		/**
		 * Return a linear interpolation of two sRGB-adjusted channels.
		 *
		 * Algorithm:
		 * 1. {@link Color._sRGB_Linear|‘square’} both channels
		 * 2. convert both squares to a numeric value
		 * 3. linearly interpolate the squares
		 * 4. convert the mean back to a Fraction
		 * 5. {@link Color._linear_sRGB|‘square root’} the result
		 * @private
		 * @param   c1 the first channel value (red, green, or blue)
		 * @param   c2 the second channel value (corresponding to `c1`)
		 * @param   w the interpolation parameter
		 * @returns the compounded value
		 */
		function blurChannelsWeighted(c1: Fraction, c2: Fraction, w: number): Fraction {
			return Color._linear_sRGB(new Fraction(xjs.Math.interpolateArithmetic(
				Color._sRGB_Linear(c1).valueOf(),
				Color._sRGB_Linear(c2).valueOf(),
				w
			)))
		}
		return new Color(
			blurChannelsWeighted(this.red   , color.red  , weight),
			blurChannelsWeighted(this.green , color.green, weight),
			blurChannelsWeighted(this.blue  , color.blue , weight),
			Color._compoundOpacityWeighted(this.alpha , color.alpha, weight)
		)
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
		return (
			(this.alpha.equals(0) && color.alpha.equals(0)) ||
			(
				this.red  .equals(color.red  ) &&
				this.green.equals(color.green) &&
				this.blue .equals(color.blue ) &&
				this.alpha.equals(color.alpha)
			)
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
		let rl_this : number =  this.relativeLuminance()
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
