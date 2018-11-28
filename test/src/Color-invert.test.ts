import {Color} from '../../index'
import test from './test'


export default Promise.all([
	test(new Color(0.5,0,0).invert().toString(), '#80ffff'),
])
