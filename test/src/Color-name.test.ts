import {Color} from '../../index'
import test from './test'


export default Promise.all([
	test(`${Color.fromString('#000000').name()}`, 'black'),
	test(`${Color.fromString('#98FB98').name()}`, 'palegreen'),
	test(`${Color.fromString('#fa8072').name()}`, 'salmon'),
	test(`${Color.fromString('#c0ffee').name()}`, 'null'),
])
