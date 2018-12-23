import {Length, LengthUnit} from '../../index'
import test from './test'


export default Promise.all([
	test(new Length(  ).toString(                 ), '0cm'),
	test(new Length( 1).toString(10, LengthUnit.CM), '1cm'),
	test(new Length(55).toString(10, LengthUnit.MM), '550mm'),
	test(new Length(10).toString(10, LengthUnit.IN), '3.9370078740157477in'),
	test(new Length(12).toString(10, LengthUnit.PT), '340.1574803149606pt'),
	test(new Length(16).toString(10, LengthUnit.PX), '604.7244094488188px'),
	test(new Length(                 ).toString(                 ), '0cm'),
	test(new Length( 1, LengthUnit.CM).toString(10, LengthUnit.CM), '1cm'),
	test(new Length(55, LengthUnit.MM).toString(10, LengthUnit.MM), '55mm'),
	test(new Length(10, LengthUnit.IN).toString(10, LengthUnit.IN), '10in'),
	test(new Length(12, LengthUnit.PT).toString(10, LengthUnit.PT), '12pt'),
	test(new Length(16, LengthUnit.PX).toString(10, LengthUnit.PX), '16px'),
])
