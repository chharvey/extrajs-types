import { TreeNode } from '../../index'
import test from './test'


export default Promise.all([
	test(new TreeNode('x').value as string, 'x'),
	test((() => { try { return `${new TreeNode(NaN   ).value}` } catch (err) { return err.name } })(), 'NaNError' ),
	test((() => { try { return `${new TreeNode(void 0).value}` } catch (err) { return err.name } })(), 'TypeError'),
])
