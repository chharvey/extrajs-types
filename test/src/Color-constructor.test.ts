import { Color } from '../../index'
import test from './test'


export default Promise.all([
	test(new Color(0.5 , 0.5, 0.5, 0.5).rgb.join(), '0.5,0.5,0.5,0.5'),
	test(new Color(0.25, 0.5, 1       ).rgb.join(), '0.25,0.5,1,1'),
	test(new Color(                   ).rgb.join(), '0,0,0,0'),
	test(new Color('#e4f'                               ).toString(), '#ee44ff'  ),
	test(new Color('#6a43'                              ).toString(), '#66aa4433'),
	test(new Color('rgb(20%   30%  40% / .5)'           ).toString(), '#334d6680'),
	test(new Color('rgb(20    30   40  / 50%)'          ).toString(), '#141e2880'),
	test(new Color('cmyk(20%    30%  40%   15%  / .5 )' ).toString(), '#ad988280'),
	test(new Color('cmyk(.20   .30   .40  .15   / 50%)' ).toString(), '#ad988280'),
	test(new Color('hsl( 20      30%  40% / .5)'        ).toString(), '#855c4780'),
	test(new Color('hsl(20deg    30%  40% /  50%)'      ).toString(), '#855c4780'),
	test(new Color('hsl(20grad   30%  40% /  .5)'       ).toString(), '#855a4780'),
	test(new Color('hwb(20deg     30%   40% / .5)'      ).toString(), '#99664d80'),
	test(new Color('hwb(20        30%  40%  / 50%)'     ).toString(), '#99664d80'),
	test(new Color('hwb(20grad 30%  40%  / .5)'         ).toString(), '#99634d80'),
	test(new Color('black'                              ).toString(), '#000000'  ),
	test(new Color('palegreen'                          ).toString(), '#98fb98'  ),
])
