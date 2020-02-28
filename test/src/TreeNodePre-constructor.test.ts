import { TreeNodePre } from '../../index'
import test from './test'


export default Promise.all([
	test(new TreeNodePre('x').value as string, 'x'),
	test((() => { try { return `${new TreeNodePre(NaN   ).value}` } catch (err) { return err.name } })(), 'NaNError' ),
	test((() => { try { return `${new TreeNodePre(void 0).value}` } catch (err) { return err.name } })(), 'TypeError'),
])
