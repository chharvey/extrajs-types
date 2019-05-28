import * as xjs from 'extrajs'

import Integer from './Integer.class'
import TreeNode from './TreeNode.class'


/**
 * A node in a Tree, whose traversal is depth-first postorder.
 */
export default abstract class TreeNodeBreadth extends TreeNode {
	/**
	 * Construct a new TreeNode object.
	 * @param   value this node’s data value
	 */
	constructor(value: unknown) {
		super(value)
	}

	/**
	 * Return a given level of this node’s tree.
	 *
	 * Levels:
	 * - 0 returns this
	 * - 1 returns this children
	 * - 2 returns grandchildren
	 * - etc.
	 * @param   level the tree level
	 * @returns an array of nodes at the given level, in sibling order
	 * @throws  {AssertionError} if the given level is negative
	 */
	private _givenLevel(level: Integer): TreeNodeBreadth[] {
		xjs.Number.assertType(level.valueOf(), 'non-negative') // TODO Integer#assertType
		return (level.equals(0)) ? [this] :
			this._CHILDREN.map((child) => (child as TreeNodeBreadth)._givenLevel(level.prev)).reduce((a, b) => a.concat(b)) // COMBAK Array#flat
		// TODO change `this._CHILDREN` to type `this[]`
	}

	/**
	 * Return a shallow array of all nodes in this TreeNode’s tree, in order of breadth-first order.
	 * @override TreeNode
	 */
	nodes(): TreeNodeBreadth[] {
		const returned: TreeNodeBreadth[] = []
		for (let i: Integer = new Integer(0); i < this.height; i = i.next) {
			returned.push(...this._givenLevel(i))
		}
		return returned
	}
}
