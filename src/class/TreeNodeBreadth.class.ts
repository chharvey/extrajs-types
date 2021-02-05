import * as xjs from 'extrajs'

import TreeNode from './TreeNode.class'


/**
 * A node in a Tree, whose traversal is breadth-first order.
 * @see https://en.wikipedia.org/wiki/Tree_traversal#Breadth-first_search
 */
export default class TreeNodeBreadth extends TreeNode {
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
	 */
	private _givenLevel(level: bigint): this[] {
		xjs.BigInt.assertType(level, xjs.NumericType.NONNEGATIVE)
		return (level === 0n)
			? [this]
			: this._CHILDREN.map((child) => child._givenLevel(level - 1n)).flat()
	}

	/**
	 * Return a shallow array of all nodes in this TreeNode’s tree, in order of breadth-first order.
	 * @override TreeNode
	 */
	nodes(): this[] {
		return [...new Array(Number(this.height))].flatMap((_, i) => this._givenLevel(BigInt(i)))
	}
}
