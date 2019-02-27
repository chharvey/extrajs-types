import { Vector } from '../../index'
import test from './test'


export default Promise.all([
	test(new Vector([3, -3, 1]).cross(new Vector([4, 9, 2])).toString(), '⟨-15, -2, 39⟩'),
])
