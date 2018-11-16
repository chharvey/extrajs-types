import {Color} from '../../index'
import test from './test'


export default Promise.all([
	test(new Color(255,0,0     ).rotate(120).toString(), '#00ff00'),
	test(new Color(255,0,0, 0.5).rotate(120).toString(), '#00ff0080'),
])
