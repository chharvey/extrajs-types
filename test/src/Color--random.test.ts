import {Color} from '../../index'
import test from './test'


export default Promise.all([
	test((() => { let s = Color.random(     ); console.log(s.toString()); return `${s.toString().slice(0,1)}` })(), '#'),
	test((() => { let s = Color.random(true ); console.log(s.toString()); return `${s.toString().slice(0,1)}` })(), '#'),
	test((() => { let s = Color.random(false); console.log(s.toString()); return `${s.toString().slice(0,1)}` })(), '#'),
])
