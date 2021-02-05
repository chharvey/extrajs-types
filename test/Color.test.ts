import * as assert from 'assert'
import xjs_Color, {ColorSpace} from '../src/class/Color.class'

describe('xjs.Color', () => {
	describe('.fromString(string): Color', () => {
		it('returns a new Color object from a string.', () => {
			// #rgb / #rrggbb / #rgba / #rrggbbaa
			assert.strictEqual(xjs_Color.fromString(       ).toString(), '#00000000')
			assert.strictEqual(xjs_Color.fromString('#e4f' ).toString(), '#ee44ff')
			assert.strictEqual(xjs_Color.fromString('#6a43').toString(), '#66aa4433')
			// rgb()
			assert.strictEqual(xjs_Color.fromString('rgb(0,0,0)').toString(), '#000000')
			assert.strictEqual(xjs_Color.fromString('rgb(20%,  30,  40%,  .5)'  ).toString(), '#331e6680')
			assert.strictEqual(xjs_Color.fromString('rgba(20%, 30,  40%,  .5)' ).toString(), '#331e6680')
			assert.strictEqual(xjs_Color.fromString('rgb(20%   30%  40% / .5)' ).toString(), '#334d6680')
			assert.strictEqual(xjs_Color.fromString('rgb(20    30   40  / 50%)').toString(), '#141e2880')
			// cmyk()
			assert.strictEqual(xjs_Color.fromString('cmyk(0,0,0,0)').toString(), '#ffffff')
			assert.strictEqual(xjs_Color.fromString('cmyk( 20%, .3,   40%, .15, .5    )').toString(), '#ad988280')
			assert.strictEqual(xjs_Color.fromString('cmyka(20%, .30,  40%, .15, .5    )').toString(), '#ad988280')
			assert.strictEqual(xjs_Color.fromString('cmyk(20%    30%  40%   15%  / .5 )').toString(), '#ad988280')
			assert.strictEqual(xjs_Color.fromString('cmyk(.20   .30   .40  .15   / 50%)').toString(), '#ad988280')
			// hsl()
			assert.strictEqual(xjs_Color.fromString('hsl(  0deg,  0%,  0%)'       ).toString(), '#000000')
			assert.strictEqual(xjs_Color.fromString('hsl( 20grad, 30%, 40%,  .5)' ).toString(), '#855a4780')
			assert.strictEqual(xjs_Color.fromString('hsla(20grad, 30%, 40%, 25%)' ).toString(), '#855a4740')
			assert.strictEqual(xjs_Color.fromString('hsl( 20      30%  40% / .5)' ).toString(), '#855c4780')
			assert.strictEqual(xjs_Color.fromString('hsl( 20deg   30%  40% / 50%)').toString(), '#855c4780')
			assert.strictEqual(xjs_Color.fromString('hsl( 20grad  30%  40% / .5)' ).toString(), '#855a4780')
			assert.throws((() => xjs_Color.fromString('hsl(0,0,0)').toString()), RangeError)
			// hwb()
			assert.strictEqual(xjs_Color.fromString('hwb(  0deg,   0%,  0%)'      ).toString(), '#ff0000')
			assert.strictEqual(xjs_Color.fromString('hwb( 20grad, 30%, 40%,  .5)' ).toString(), '#99634d80')
			assert.strictEqual(xjs_Color.fromString('hwba(20grad, 30%, 40%,  .5)' ).toString(), '#99634d80')
			assert.strictEqual(xjs_Color.fromString('hwb( 20deg   30%  40% / .5)' ).toString(), '#99664d80')
			assert.strictEqual(xjs_Color.fromString('hwb( 20      30%  40% / 50%)').toString(), '#99664d80')
			assert.strictEqual(xjs_Color.fromString('hwb( 20grad  30%  40% / .5)' ).toString(), '#99634d80')
			assert.throws((() => xjs_Color.fromString('hwb(0,0,0)').toString()), RangeError)
			// named colors
			assert.strictEqual(xjs_Color.fromString('black').toString(), '#000000')
			assert.strictEqual(xjs_Color.fromString('palegreen').toString(), '#98fb98')
			assert.throws((() => xjs_Color.fromString('blanco').toString()), ReferenceError)
		})
	})

	describe('.random(): Color', () => {
		it('returns a new random Color object.', () => {
			assert.strictEqual(xjs_Color.random(     ).toString().slice(0, 1), '#')
			assert.strictEqual(xjs_Color.random(true ).toString().slice(0, 1), '#')
			assert.strictEqual(xjs_Color.random(false).toString().slice(0, 1), '#')
		})
	})

	describe('.randomName(): Color', () => {
		it('returns a randomly selected named color.', () => {
			assert.strictEqual(xjs_Color.randomName().toString().slice(0, 0), '')
			assert.strictEqual(xjs_Color.randomName().toString().slice(0, 0), '')
			assert.strictEqual(xjs_Color.randomName().toString().slice(0, 0), '')
		})
	})

	describe('.constructor', () => {
		it('constructs a new Color object.', () => {
			assert.strictEqual(new xjs_Color(0.5,  0.5, 0.5, 0.5).rgb.join(), '0.5,0.5,0.5,0.5')
			assert.strictEqual(new xjs_Color(0.25, 0.5, 1       ).rgb.join(), '0.25,0.5,1,1')
			assert.strictEqual(new xjs_Color(                   ).rgb.join(), '0,0,0,0')
			assert.strictEqual(new xjs_Color('#e4f'                               ).toString(), '#ee44ff'  )
			assert.strictEqual(new xjs_Color('#6a43'                              ).toString(), '#66aa4433')
			assert.strictEqual(new xjs_Color('rgb(20%   30%  40% / .5)'           ).toString(), '#334d6680')
			assert.strictEqual(new xjs_Color('rgb(20    30   40  / 50%)'          ).toString(), '#141e2880')
			assert.strictEqual(new xjs_Color('cmyk(20%    30%  40%   15%  / .5 )' ).toString(), '#ad988280')
			assert.strictEqual(new xjs_Color('cmyk(.20   .30   .40  .15   / 50%)' ).toString(), '#ad988280')
			assert.strictEqual(new xjs_Color('hsl( 20      30%  40% / .5)'        ).toString(), '#855c4780')
			assert.strictEqual(new xjs_Color('hsl(20deg    30%  40% /  50%)'      ).toString(), '#855c4780')
			assert.strictEqual(new xjs_Color('hsl(20grad   30%  40% /  .5)'       ).toString(), '#855a4780')
			assert.strictEqual(new xjs_Color('hwb(20deg     30%   40% / .5)'      ).toString(), '#99664d80')
			assert.strictEqual(new xjs_Color('hwb(20        30%  40%  / 50%)'     ).toString(), '#99664d80')
			assert.strictEqual(new xjs_Color('hwb(20grad 30%  40%  / .5)'         ).toString(), '#99634d80')
			assert.strictEqual(new xjs_Color('black'                              ).toString(), '#000000'  )
			assert.strictEqual(new xjs_Color('palegreen'                          ).toString(), '#98fb98'  )
		})
	})

	describe('#toString', () => {
		it('return a string representation of the color.', () => {
			assert.strictEqual(new xjs_Color(0.25, 0.5, 1       ).toString(), '#4080ff')
			assert.strictEqual(new xjs_Color(0.25, 0.5, 1       ).toString(ColorSpace.HWB), 'hwb(0.611111111111111turn 25% 0%)')
			assert.strictEqual(new xjs_Color(0.5 , 0.5, 0.5, 0.5).toString(ColorSpace.HWB), 'hwb(0turn 50% 50% / 0.5)')
			assert.strictEqual(new xjs_Color(                   ).toString(ColorSpace.HWB), 'hwb(0turn 0% 100% / 0)')
			assert.strictEqual(new xjs_Color(0.5 , 0.1, 0.9     ).toString(ColorSpace.HSL), 'hsl(0.75turn 80% 50%)')
			assert.strictEqual(xjs_Color.fromString('#e4f0f6'   ).toString(ColorSpace.HWB), 'hwb(0.5555555555555557turn 89.41176470588236% 3.529411764705881%)')
			assert.strictEqual(xjs_Color.fromString('#e4f0f680' ).toString(ColorSpace.HSL), 'hsl(0.5555555555555557turn 50% 92.94117647058824% / 0.5019607843137255)')
		})
	})

	describe('#invert', () => {
		it('return the difference between the color and white.', () => {
			assert.strictEqual(new xjs_Color(0.5, 0, 0).invert().toString(), '#80ffff')
		})
	})

	describe('#rotate', () => {
		it('return a new color with a specified rotation.', () => {
			assert.strictEqual(new xjs_Color(1, 0, 0     ).rotate(120).toString(), '#00ff00')
			assert.strictEqual(new xjs_Color(1, 0, 0, 0.5).rotate(120).toString(), '#00ff0080')
		})
	})

	describe('#complement', () => {
		it('return a new color with a 180-degree rotation.', () => {
			assert.strictEqual(new xjs_Color(0.5, 0, 0).complement().toString(), '#008080')
		})
	})

	describe('#name', () => {
		it('return the string name, if it exists, of the color.', () => {
			assert.strictEqual(xjs_Color.fromString('#000000').name(), 'black')
			assert.strictEqual(xjs_Color.fromString('#98FB98').name(), 'palegreen')
			assert.strictEqual(xjs_Color.fromString('#fa8072').name(), 'salmon')
			assert.strictEqual(xjs_Color.fromString('#c0ffee').name(), null)
		})
	})
})
