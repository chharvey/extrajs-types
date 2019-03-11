import { TreeNode } from '../../index'
import test from './test'


//        r (root)
//       / \
//      a   b
//     /     \
//    /\      e
//   c  d     |
//            f

let r: TreeNode = new TreeNode('r')
let a: TreeNode = new TreeNode('a')
let b: TreeNode = new TreeNode('b')
let c: TreeNode = new TreeNode('c')
let d: TreeNode = new TreeNode('d')
let e: TreeNode = new TreeNode('e')
let f: TreeNode = new TreeNode('f')

r.append(
	a.append(c, d),
	b.append(e.append(f)),
)

export default Promise.all([
	test(`${r.path}`, ''),
	test(`${a.path}`, '0'),
	test(`${b.path}`, '1'),
	test(`${c.path}`, '0,0'),
	test(`${d.path}`, '0,1'),
	test(`${e.path}`, '1,0'),
	test(`${f.path}`, '1,0,0'),
])
