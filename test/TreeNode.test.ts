import * as assert from 'assert'
import xjs_TreeNodePre from '../src/class/TreeNodePre.class'

describe('xjs.TreeNodePre', () => {
	describe('.constructor', () => {
		it('constructs a new TreeNode object.', () => {
			assert.strictEqual(new xjs_TreeNodePre('x').value, 'x')
			assert.throws(() => new xjs_TreeNodePre(NaN   ).value, 'NaNError' )
			assert.throws(() => new xjs_TreeNodePre(void 0).value, 'TypeError')
		})
	})

	describe('#path', () => {
		it('describes the path of the node.', () => {
			//        r (root)
			//       / \
			//      a   b
			//     /     \
			//    /\      e
			//   c  d     |
			//            f
			const r: xjs_TreeNodePre = new xjs_TreeNodePre('r')
			const a: xjs_TreeNodePre = new xjs_TreeNodePre('a')
			const b: xjs_TreeNodePre = new xjs_TreeNodePre('b')
			const c: xjs_TreeNodePre = new xjs_TreeNodePre('c')
			const d: xjs_TreeNodePre = new xjs_TreeNodePre('d')
			const e: xjs_TreeNodePre = new xjs_TreeNodePre('e')
			const f: xjs_TreeNodePre = new xjs_TreeNodePre('f')
			r.append(
				a.append(c, d),
				b.append(e.append(f)),
			)
			assert.strictEqual(r.path.join(), '')
			assert.strictEqual(a.path.join(), '0')
			assert.strictEqual(b.path.join(), '1')
			assert.strictEqual(c.path.join(), '0,0')
			assert.strictEqual(d.path.join(), '0,1')
			assert.strictEqual(e.path.join(), '1,0')
			assert.strictEqual(f.path.join(), '1,0,0')
		})
	})
})
