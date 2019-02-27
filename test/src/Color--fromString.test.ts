import { Color } from '../../index'
import test from './test'


export default Promise.all([
	test(Color.fromString(            ).toString(), '#00000000'),
	test(Color.fromString('#e4f'      ).toString(), '#ee44ff'),
	test(Color.fromString('#6a43'     ).toString(), '#66aa4433'),
	test(Color.fromString('rgb(0,0,0)').toString(), '#000000'),
	test(Color.fromString('rgb(20%, 30,  40%,  .5)').toString(), '#331e6680'),
	test(Color.fromString('rgba(20%, 30,  40%,  .5)').toString(), '#331e6680'),
	test(Color.fromString('rgb(20%   30%  40% / .5)' ).toString(), '#334d6680'),
	test(Color.fromString('rgb(20    30   40  / 50%)').toString(), '#141e2880'),
	test(Color.fromString('cmyk(0,0,0,0)').toString(), '#ffffff'),
	test(Color.fromString('cmyk( 20%, .3,   40%, .15, .5    )' ).toString(), '#ad988280'),
	test(Color.fromString('cmyka(20%, .30,  40%, .15, .5    )' ).toString(), '#ad988280'),
	test(Color.fromString('cmyk(20%    30%  40%   15%  / .5 )' ).toString(), '#ad988280'),
	test(Color.fromString('cmyk(.20   .30   .40  .15   / 50%)').toString(), '#ad988280'),
	test((() => {
		try {
			return Color.fromString('hsl(0,0,0)').toString()
		} catch (e) {
			return e.name
		}
	})(), 'RangeError'),
	test(Color.fromString('hsl(0deg   , 0%,   0%)').toString(), '#000000'),
	test(Color.fromString('hsl( 20grad, 30%,  40%,  .5)' ).toString(), '#855a4780'),
	test(Color.fromString('hsla(20grad, 30%,  40%, 25%)' ).toString(), '#855a4740'),
	test(Color.fromString('hsl( 20      30%  40% / .5)'  ).toString(), '#855c4780'),
	test(Color.fromString('hsl(20deg    30%  40% /  50%)').toString(), '#855c4780'),
	test(Color.fromString('hsl(20grad   30%  40% /  .5)').toString(), '#855a4780'),
	test((() => {
		try {
			return Color.fromString('hwb(0,0,0)').toString()
		} catch (e) {
			return e.name
		}
	})(), 'RangeError'),
	test(Color.fromString('hwb( 0deg   ,  0%,0%)').toString(), '#ff0000'),
	test(Color.fromString('hwb(  20grad, 30%,  40%,  .5)' ).toString(), '#99634d80'),
	test(Color.fromString('hwba(20grad , 30%,  40%,  .5)' ).toString(), '#99634d80'),
	test(Color.fromString('hwb(20deg     30%   40% / .5)'  ).toString(), '#99664d80'),
	test(Color.fromString('hwb(20        30%  40%  / 50%)').toString(), '#99664d80'),
	test(Color.fromString('hwb(20grad 30%  40%  / .5)').toString(), '#99634d80'),
	test(Color.fromString('black'     ).toString(), '#000000'),
	test(Color.fromString('palegreen' ).toString(), '#98fb98'),
	test((() => {
		try {
			return Color.fromString('blanco').toString()
		} catch (e) {
			return e.name
		}
	})(), 'ReferenceError'),
])
