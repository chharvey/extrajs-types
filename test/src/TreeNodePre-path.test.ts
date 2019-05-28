import { TreeNodePre } from '../../index'
import test from './test'


//        r (root)
//       / \
//      a   b
//     /     \
//    /\      e
//   c  d     |
//            f

let r: TreeNodePre = new TreeNodePre('r')
let a: TreeNodePre = new TreeNodePre('a')
let b: TreeNodePre = new TreeNodePre('b')
let c: TreeNodePre = new TreeNodePre('c')
let d: TreeNodePre = new TreeNodePre('d')
let e: TreeNodePre = new TreeNodePre('e')
let f: TreeNodePre = new TreeNodePre('f')

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
