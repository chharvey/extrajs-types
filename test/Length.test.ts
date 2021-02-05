import * as assert from 'assert'
import xjs_Length, {LengthUnit} from '../src/class/Length.class'

describe('xjs.Length', () => {
	describe('.constructor', () => {
		it('constructs a new Length object.', () => {
			assert.strictEqual(new xjs_Length(  ).toString(                 ), '0cm')
			assert.strictEqual(new xjs_Length( 1).toString(10, LengthUnit.CM), '1cm')
			assert.strictEqual(new xjs_Length(55).toString(10, LengthUnit.MM), '550mm')
			assert.strictEqual(new xjs_Length(10).toString(10, LengthUnit.IN), '3.9370078740157477in')
			assert.strictEqual(new xjs_Length(12).toString(10, LengthUnit.PT), '340.1574803149606pt')
			assert.strictEqual(new xjs_Length(16).toString(10, LengthUnit.PX), '604.7244094488188px')
			assert.strictEqual(new xjs_Length(                 ).toString(                 ), '0cm')
			assert.strictEqual(new xjs_Length( 1, LengthUnit.CM).toString(10, LengthUnit.CM), '1cm')
			assert.strictEqual(new xjs_Length(55, LengthUnit.MM).toString(10, LengthUnit.MM), '55mm')
			assert.strictEqual(new xjs_Length(10, LengthUnit.IN).toString(10, LengthUnit.IN), '10in')
			assert.strictEqual(new xjs_Length(12, LengthUnit.PT).toString(10, LengthUnit.PT), '12pt')
			assert.strictEqual(new xjs_Length(16, LengthUnit.PX).toString(10, LengthUnit.PX), '16px')
		})
	})
})
