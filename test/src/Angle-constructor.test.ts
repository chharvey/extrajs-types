import {Angle, AngleUnit} from '../../index'
import test from './test'


export default Promise.all([
	test(new Angle(       ).toString(                  ), '0turn'),
	test(new Angle(0.6    ).toString(10, AngleUnit.TURN), '0.6turn'),
	test(new Angle(180    ).toString(10, AngleUnit.DEG ), '64800deg'),
	test(new Angle(100    ).toString(10, AngleUnit.GRAD), '40000grad'),
	test(new Angle(Math.PI).toString(10, AngleUnit.RAD ), '19.739208802178716rad'),
	test(new Angle(                       ).toString(                  ), '0turn'),
	test(new Angle(0.6    , AngleUnit.TURN).toString(10, AngleUnit.TURN), '0.6turn'),
	test(new Angle(180    , AngleUnit.DEG ).toString(10, AngleUnit.DEG ), '180deg'),
	test(new Angle(100    , AngleUnit.GRAD).toString(10, AngleUnit.GRAD), '100grad'),
	test(new Angle(Math.PI, AngleUnit.RAD ).toString(10, AngleUnit.RAD ), '3.141592653589793rad'),
])
