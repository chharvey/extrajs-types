import {Vector} from '../../index'
import test from './test'


export default Promise.all([
	test(new Vector(        ).toString(), '⟨⟩'),
	test(new Vector([      ]).toString(), '⟨⟩'),
	test(new Vector([42    ]).toString(), '⟨42⟩'),
	test(new Vector([42, 24]).toString(), '⟨42, 24⟩'),
])
