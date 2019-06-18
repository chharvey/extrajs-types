import TreeNode from './TreeNode.class'


/**
 * A node in a Tree, whose traversal is depth-first postorder.
 * @see https://en.wikipedia.org/wiki/Tree_traversal#Post-order_(LRN)
 */
export default class TreeNodePost extends TreeNode {
	/**
	 * Construct a new TreeNode object.
	 * @param   value this node’s data value
	 */
	constructor(value: unknown) {
		super(value)
	}

	/**
	 * Return a shallow array of all nodes in this TreeNode’s tree, in order of depth-first postorder.
	 * @override TreeNode
	 */
	nodes(): this[] {
		const returned: this[] = []
		this._CHILDREN.forEach((child) => {
			returned.push(...child.nodes())
		})
		returned.push(this)
		return returned
	}
}
