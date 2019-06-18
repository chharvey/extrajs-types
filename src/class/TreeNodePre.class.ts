import TreeNode from './TreeNode.class'


/**
 * A node in a Tree, whose traversal is depth-first preorder.
 * @see https://en.wikipedia.org/wiki/Tree_traversal#Pre-order_(NLR)
 */
export default class TreeNodePre extends TreeNode {
	/**
	 * Construct a new TreeNode object.
	 * @param   value this node’s data value
	 */
	constructor(value: unknown) {
		super(value)
	}

	/**
	 * Return a shallow array of all nodes in this TreeNode’s tree, in order of depth-first preorder.
	 * @override TreeNode
	 */
	nodes(): this[] {
		const returned: this[] = []
		returned.push(this)
		this._CHILDREN.forEach((child) => {
			returned.push(...child.nodes())
		})
		return returned
	}
}
