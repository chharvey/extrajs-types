import {Color} from '../../index'
import test from './test'


export default Promise.all([
	test((() => { let s = Color.randomName(); console.log(s.name()); return `${s.toString().slice(0,0)}` })(), ''),
	test((() => { let s = Color.randomName(); console.log(s.name()); return `${s.toString().slice(0,0)}` })(), ''),
	test((() => { let s = Color.randomName(); console.log(s.name()); return `${s.toString().slice(0,0)}` })(), ''),
])
