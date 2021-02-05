import * as assert from 'assert'
import xjs_Angle, {AngleUnit} from '../src/class/Angle.class'

describe('xjs.Angle', () => {
	describe('.constructor', () => {
		it('constructs a new Angle object.', () => {
			assert.strictEqual(new xjs_Angle(       ).toString(                  ), '0turn')
			assert.strictEqual(new xjs_Angle(0.6    ).toString(10, AngleUnit.TURN), '0.6turn')
			assert.strictEqual(new xjs_Angle(180    ).toString(10, AngleUnit.DEG ), '64800deg')
			assert.strictEqual(new xjs_Angle(100    ).toString(10, AngleUnit.GRAD), '40000grad')
			assert.strictEqual(new xjs_Angle(Math.PI).toString(10, AngleUnit.RAD ), '19.739208802178716rad')
			assert.strictEqual(new xjs_Angle(                       ).toString(                  ), '0turn')
			assert.strictEqual(new xjs_Angle(0.6    , AngleUnit.TURN).toString(10, AngleUnit.TURN), '0.6turn')
			assert.strictEqual(new xjs_Angle(180    , AngleUnit.DEG ).toString(10, AngleUnit.DEG ), '180deg')
			assert.strictEqual(new xjs_Angle(100    , AngleUnit.GRAD).toString(10, AngleUnit.GRAD), '100grad')
			assert.strictEqual(new xjs_Angle(Math.PI, AngleUnit.RAD ).toString(10, AngleUnit.RAD ), '3.141592653589793rad')
		})
	})
})
