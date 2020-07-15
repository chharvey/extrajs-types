import * as assert from 'assert'
import xjs_Vector from '../src/class/Vector.class'

describe('xjs.Vector', () => {
	describe('.constructor', () => {
		it('constructs a new Vector object.', () => {
			assert.strictEqual(new xjs_Vector(        ).toString(), '⟨⟩')
			assert.strictEqual(new xjs_Vector([      ]).toString(), '⟨⟩')
			assert.strictEqual(new xjs_Vector([42    ]).toString(), '⟨42⟩')
			assert.strictEqual(new xjs_Vector([42, 24]).toString(), '⟨42, 24⟩')
		})
	})

	describe('#cross', () => {
		it('computes the cross product.', () => {
			assert.strictEqual(new xjs_Vector([3, -3, 1]).cross(new xjs_Vector([4, 9, 2])).toString(), '⟨-15, -2, 39⟩')
		})
	})
})
