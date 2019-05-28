import * as xjs from 'extrajs'
import { NaNError } from 'extrajs'

import Integer from './Integer.class'


/**
 * A filter function passed to various methods of `TreeNode`.
 *
 * The function is a predicate that filters out or tests some quality of each node in an array.
 * @param   node the node in the array
 * @param   path the path of the node within its tree
 * @param   group the node with which the array is associated
 * @returns Does the node satisfy the predicate?
 */
type FilterFn = (node: TreeNode, path: ReadonlyArray<Integer>, group: TreeNode) => boolean


/**
 * A node in a Tree.
 *
 * A Tree is a data structure containing a set of nodes arranged in a hierarchy.
 * This class encodes the ‘node’ concept in the tree.
 *
 * In the hierarchy, nodes are connected by ‘links’.
 * The links between nodes are not encoded directly in an object, but are formed implicitly
 * when nodes are added as children of each other.
 * The links form an acyclical directed graph:
 * directed in that they only connect parent nodes to child nodes (not vice versa), and
 * acyclical in that no node can be eventually linked to itself.
 * The links are also unique in that there may be no more than one link from a node `a` to a node `b`.
 *
 * A tree must have exactly one root, which is a unique node that has no parent.
 * Trees must have at least one node (the root node).
 *
 * The following properties of the tree hierarchy are observed:
 *
 * - The tree hierarchy embeds a strict partial order relation, "ancestor of", here denoted "`>>`":
 * 	- (Irreflexivity) For a node `a`, `!(a >> a)`.
 * 	- (Asymmetry) For nodes `a` and `b`, if `a >> b`, then `!(b >> a)`.
 * 	- (Transitivity) For nodes `a`, `b`, and `c`, if `a >> b` and `b >> c`, then `a >> c`.
 * - The tree contains a "root node" (a unique maximal element):
 * 	There exists a node `r` such that for every other node `n !== r`, `r >> n`.
 * - Every non-root node has a "parent" (a unique minimum of all its ancestors):
 * 	For each non-root node `a` there exists a node `p` such that the following statements hold:
 * 	- `p >> a` (and by irreflexivity, `p !== a`)
 * 	- Of all other ancestors of `a`, `p` is the minimal element:
 * 	  For all `b`, if `b >> a`, then either `b === p` or `b >> p`
 * - There are no nodes between a node and its parent in this ordering:
 * 	For every node `a` with parent `b`, there does not exist a node `c` such that `b >> c >> a`.
 * - Each set of nodes that share the same "parent" embeds two relations:
 * 	- An equivalence relation, "sibling of", here denoted "`~`":
 * 		- (Reflexivity) For a node `a`, `a ~ a`.
 * 		- (Symmetry) For nodes `a` and `b`, if `a ~ b`, then `b ~ a`.
 * 		- (Transitivity) For nodes `a`, `b`, and `c`, if `a ~ b` and `b ~ c`, then `a ~ c`.
 * 	- A strict total order, "previous to", here denoted "`->`":
 * 		- (Irreflexivity) For a node `a`, `!(a -> a)`.
 * 		- (Asymmetry) For nodes `a` and `b`, if `a -> b`, then `!(b -> a)`.
 * 		- (Transitivity) For nodes `a`, `b`, and `c`, if `a -> b` and `b -> c`, then `a -> c`.
 * 		- (Comparability) For distinct nodes `a !== b` sharing the same parent,
 * 			at least one of the following statements is guaranteed true:
 * 			- `a -> b`
 * 			- `b -> a`
 *
 * *(Meta: The outlined list above is an example of a tree.)*
 */
export default class TreeNode implements Iterable<TreeNode> {
	/** The parent TreeNode that this TreeNode is a child of. */
	private _parent: TreeNode|null = null
	/** The data value of this node. */
	private readonly _VALUE: unknown;
	/** The children of this node. */
	protected readonly _CHILDREN: this[] = []

	/**
	 * Construct a new TreeNode object.
	 * @param   value this node’s data value
	 * @throws  {NanError} if NaN was given as the argument
	 * @throws  {TypeError} if `undefined` was given as the argument
	 */
	constructor(value: unknown) {
		if (typeof value === 'number' && Number.isNaN(value)) throw new NaNError()
		if (value === void 0) throw new TypeError('Must provide value.')
		this._VALUE = value
	}

	/* ============================================================================================ *\
	 * ================ Accessor Properties ======================================================= *
	\* ============================================================================================ */

	/**
	 * Return this TreeNode’s value exactly.
	 *
	 * WARNING: this method returns this node’s actual value.
	 * If the value returned is mutable and is changed, this node will be affected.
	 * @returns the actual value of this node
	 */
	get value(): unknown {
		return this._VALUE
	}

	/**
	 * Return a deep clone of this TreeNode’s value.
	 *
	 * NOTE: If the value returned is mutable and is changed, this node will remain unaffected.
	 * @see xjs.Object.cloneDeep
	 * @returns a deep clone of this node’s value
	 */
	get valueDeep(): unknown {
		return xjs.Object.cloneDeep(this._VALUE)
	}

	/**
	 * Get the root of this TreeNode’s tree.
	 *
	 * Return `this` if this TreeNode is the root (has no parents).
	 * @returns the root of this TreeNode’s tree
	 */
	get root(): TreeNode {
		return (!this._parent) ? this : this.ancestors()[0]
	}

	/**
	 * Return an array of indices describing the path of this TreeNode in its tree.
	 *
	 * If this node has no parent, an empty array is returned.
	 *
	 * Each index in the array describes the position of an ancestor of this node,
	 * where the order of indices begins with the root and ends with this node.
	 * That is, the first entry is the index of this node’s ancestor within the root’s children;
	 * the second entry is the index of this node’s ancestor within the root’s grandchildren;
	 * and so on.
	 *
	 * To get the “depth” of a node, you can call `node.path.length`.
	 *
	 * For example, this diagram shows a tree with nodes.
	 * The paths of the nodes are listed below it.
	 * ```
	 *        r (root)
	 *       / \
	 *      a   b
	 *     /     \
	 *    /\      e
	 *   c  d     |
	 *            f
	 * ```
	 * ```
	 * r.path  //  []  (the path of a root node is an empty array)
	 * a.path  //  [0]
	 * b.path  //  [1]
	 * c.path  //  [0, 0]
	 * d.path  //  [0, 1]
	 * e.path  //  [1, 0]
	 * f.path  //  [1, 0, 0]
	 * ```
	 *
	 * NOTE: The returned array is shallow, not live, meaning any changes to it will not affect the tree.
	 * @returns an array of non-negative integers describing the position of each of this TreeNode’s ancestors
	 */
	get path(): Integer[] {
		if (!this._parent) return []
		const returned: Integer[] = []
		let node: TreeNode = this
		while (node._parent) {
			returned.unshift(new Integer(node._parent._CHILDREN.indexOf(node))) // guaranteed to be non-negative
			node = node._parent
		}
		return returned
	}

	/* ============================================================================================ *\
	 * ================ Parent Accessor Properties ================================================ *
	\* ============================================================================================ */

	/**
	 * Get the size of a tree with this TreeNode as its root.
	 * @returns the total number of nodes in the tree, including this node and descendants of this node
	 */
	get size(): Integer {
		return new Integer(this.nodes().length)
	}

	/**
	 * Get the height of a tree with this TreeNode as its root.
	 * @returns if this node has no children, 1; otherwise, the maximum height of each child, plus 1
	 */
	get height(): Integer {
		if (this._CHILDREN.length === 0) return new Integer(1)
		return Integer.max(...this._CHILDREN.map((child) => child.height)).plus(1)
	}

	/**
	 * Get the first child of this TreeNode.
	 * @returns the child at the start of this TreeNode’s children
	 */
	get firstChild(): TreeNode {
		return this._CHILDREN[0]
	}

	/**
	 * Get the last child of this TreeNode.
	 * @returns the child at the end of this TreeNode’s children
	 */
	get lastChild(): TreeNode {
		return this._CHILDREN[this._CHILDREN.length - 1] // COMBAK Array#lastItem
	}

	/* ============================================================================================ *\
	 * ================ Child Accessor Properties ================================================= *
	\* ============================================================================================ */

	/**
	 * Get the parent, if it exists, of this TreeNode.
	 * @returns the parent of this TreeNode in its parent, or `null` if it has none
	 */
	get parent(): TreeNode|null {
		return this._parent
	}

	/**
	 * Get the previous sibling, if it exists, of this TreeNode, if it has a parent.
	 * @returns the sibling preceeding this TreeNode in its parent, or `null` if this is the first sibling
	 * @throws  {OrphanError} if this TreeNode has no parent
	 */
	get prevSibling(): TreeNode|null {
		if (!this._parent) throw new OrphanError(this)
		return this._parent._CHILDREN[this._parent._CHILDREN.indexOf(this) - 1] || null
	}

	/**
	 * Get the next sibling, if it exists, of this TreeNode, if it has a parent.
	 * @returns the sibling following this TreeNode in its parent, or `null` if this is the last sibling
	 * @throws  {OrphanError} if this TreeNode has no parent
	 */
	get nextSibling(): TreeNode|null {
		if (!this._parent) throw new OrphanError(this)
		return this._parent._CHILDREN[this._parent._CHILDREN.indexOf(this) + 1] || null
	}

	/**
	 * Get the first sibling, if it exists, of this TreeNode, if it has a parent.
	 * @returns the first sibling preceeding this TreeNode in its parent (or `this` if this is the first sibling)
	 * @throws  {OrphanError} if this TreeNode has no parent
	 */
	get firstSibling(): TreeNode {
		if (!this._parent) throw new OrphanError(this)
		return this._parent.firstChild
	}

	/**
	 * Get the last sibling, if it exists, of this TreeNode, if it has a parent.
	 * @returns the last sibling following this TreeNode in its parent (or `this` if this is the last sibling)
	 * @throws  {OrphanError} if this TreeNode has no parent
	 */
	get lastSibling(): TreeNode {
		if (!this._parent) throw new OrphanError(this)
		return this._parent.lastChild
	}

	/* ============================================================================================ *\
	 * ================ Accessor Methods ========================================================== *
	\* ============================================================================================ */

	/**
	 * Return a shallow array of all nodes in this TreeNode’s tree.
	 *
	 * The order of elements in the returned array is
	 * determined by the traversal method:
	 * {@link https://en.wikipedia.org/wiki/Tree_traversal#Pre-order_(NLR)|depth-first preorder} (default),
	 * {@link https://en.wikipedia.org/wiki/Tree_traversal#Post-order_(LRN)|depth-first postorder}, or
	 * {@link https://en.wikipedia.org/wiki/Tree_traversal#Breadth-first_search|breadth-first order}.
	 *
	 * NOTE: The returned array is shallow, not live, meaning any changes to it will not affect the tree.
	 * @see TreeNodePost
	 * @see TreeNodeBreadth
	 * @returns an array of this tree’s nodes that satisfy the predicate
	 */
	nodes(): this[] {
		const returned: this[] = []
		returned.push(this)
		this._CHILDREN.forEach((child) => {
			returned.push(...child.nodes())
		})
		return returned
	}

	/**
	 * Test the existence of a node within this TreeNode’s descendants.
	 * @param   node the node to test
	 * @returns Is `this` an ancestor of `node`?
	 */
	has(node: TreeNode): boolean {
		while (node._parent) {
			if (node._parent === this) return true
			node = node._parent
		}
		return false
	}

	/**
	 * Return a TreeNode given a path and using this TreeNode as the root.
	 *
	 * See {@link TreeNode#path} for details on paths.
	 *
	 * For example:
	 * ```
	 *        r (root)
	 *       / \
	 *      a   b
	 *     /     \
	 *    /\      e
	 *   c  d     |
	 *            f
	 * ```
	 * ```
	 * r.get([])     //  r
	 * r.get([0])    //  a
	 * r.get([1,0])  //  e
	 * a.get([])     //  a
	 * a.get([1])    //  d
	 * b.get([0,0])  //  f
	 * e.get([1])    //  null
	 * ```
	 * @param   path the path to locate a node
	 * @returns the node located at the given path, or `null` if no node exists there
	 */
	get(path: ReadonlyArray<Integer>): TreeNode|null {
		if (path.length === 0) return this
		let step: TreeNode;
		try {
			step = xjs.Array.get(this._CHILDREN, path[0].valueOf())
		} catch {
			return null
		}
		return step.get(path.slice(1))
	}

	/**
	 * Test custom equality between nodes.
	 *
	 * Nodes are equal iff they have “the same” value (as determined by the predicate)
	 * and they have “the same” child nodes (as compared by this method and the same predicate).
	 * @param   node the TreeNode to compare
	 * @param   predicate check the “sameness” of node values
	 * @returns Is this node effectively the same as the given node?
	 */
	equals(node: TreeNode, predicate: (x: any, y: any) => boolean = xjs.Object.sameValueZero): boolean {
		if (this === node) return true
		return predicate(this.value, node.value) &&
			xjs.Array.is(this._CHILDREN, node._CHILDREN, (a, b) => a.equals(b, predicate))
	}

	/* ============================================================================================ *\
	 * ================ Parent Accessor Methods =================================================== *
	\* ============================================================================================ */

	/**
	 * Return a shallow array of the direct children of this TreeNode, optionally filtered by a predicate.
	 *
	 * The order of elements in the returned array is the order of this TreeNode’s children.
	 * If this TreeNode has no children, an empty array is returned.
	 *
	 * NOTE: The returned array is shallow, not live, meaning any changes to it will not affect the tree.
	 * @param   filter an optional predicate by which to filter the children
	 * @param   this_arg optional `this` context in which to call the filter
	 * @returns a shallow array of this node’s child nodes
	 */
	children(filter: FilterFn = () => true, this_arg: unknown = this): TreeNode[] {
		return this._CHILDREN.filter((child) => filter.call(this_arg, child, child.path, this))
	}

	/**
	 * Return a shallow array of all direct and indirect children of this TreeNode, optionally filtered by a predicate.
	 *
	 * The array contains the direct children of this TreeNode, along with the
	 * direct children of *those* children, and so on.
	 * If this TreeNode has no children, an empty array is returned.
	 *
	 * NOTE: The returned array is shallow, not live, meaning any changes to it will not affect the tree.
	 * @param   filter an optional predicate by which to filter the descendants
	 * @param   this_arg optional `this` context in which to call the filter
	 * @returns a shallow array of this node’s descendant nodes
	 */
	descendants(filter: FilterFn = () => true, this_arg: unknown = this): TreeNode[] {
		if (this._CHILDREN.length === 0) return []
		const returned: TreeNode[] = this.nodes()
		returned.splice(returned.indexOf(this), 1)
		return returned.filter((descendant) => filter.call(this_arg, descendant, descendant.path, this))
	}

	/* ============================================================================================ *\
	 * ================ Child Accessor Methods ==================================================== *
	\* ============================================================================================ */

	/**
	 * Return a shallow array of the ancestors of this TreeNode, from “oldest” to “youngest”, optionally filtered by a predicate.
	 *
	 * If this TreeNode has no parent, an empty array is returned.
	 *
	 * NOTE: The returned array is shallow, not live, meaning any changes to it will not affect the tree.
	 * @param   filter an optional predicate by which to filter the ancestors
	 * @param   this_arg optional `this` context in which to call the filter
	 * @returns shallow array of this node’s ancestor nodes, starting with its parent
	 */
	ancestors(filter: FilterFn = () => true, this_arg: unknown = this): TreeNode[] {
		const returned: TreeNode[] = []
		let node: TreeNode = this
		while (node._parent) {
			returned.unshift(node._parent)
			node = node._parent
		}
		return returned.filter((ancestor) => filter.call(this_arg, ancestor, ancestor.path, this))
	}

	/**
	 * Return a shallow array of the siblings of this TreeNode, optionally filtered by a predicate.
	 *
	 * NOTE: The returned array is shallow, not live, meaning any changes to it will not affect the tree.
	 * @param   filter an optional predicate by which to filter the siblings
	 * @param   this_arg optional `this` context in which to call the filter
	 * @returns shallow array of this node’s sibling nodes
	 * @throws  {OrphanError} if this TreeNode has no parent
	 */
	siblings(filter: FilterFn = () => true, this_arg: unknown = this): TreeNode[] {
		if (!this._parent) throw new OrphanError(this)
		return this._parent.children(filter, this_arg)
	}

	/**
	 * Get a shallow array of all the previous siblings of this TreeNode, optionally filtered by a predicate.
	 *
	 * NOTE: The returned array is shallow, not live, meaning any changes to it will not affect the tree.
	 * @param   filter an optional predicate by which to filter the siblings
	 * @param   this_arg optional `this` context in which to call the filter
	 * @returns shallow array of the siblings preceeding this TreeNode in its parent
	 * @throws  {OrphanError} if this TreeNode has no parent
	 */
	prevSiblingsAll(filter: FilterFn = () => true, this_arg: unknown = this): TreeNode[] {
		if (!this._parent) throw new OrphanError(this)
		return this._parent._CHILDREN.slice(0, this._parent._CHILDREN.indexOf(this))
			.filter((child) => filter.call(this_arg, child, child.path, this))
	}

	/**
	 * Get a shallow array of all the next siblings of this TreeNode, optionally filtered by a predicate.
	 *
	 * NOTE: The returned array is shallow, not live, meaning any changes to it will not affect the tree.
	 * @param   filter an optional predicate by which to filter the siblings
	 * @param   this_arg optional `this` context in which to call the filter
	 * @returns all the siblings following this TreeNode in its parent
	 * @throws  {OrphanError} if this TreeNode has no parent
	 */
	nextSiblingsAll(filter: FilterFn = () => true, this_arg: unknown = this): TreeNode[] {
		if (!this._parent) throw new OrphanError(this)
		return this._parent._CHILDREN.slice(this._parent._CHILDREN.indexOf(this) + 1)
			.filter((child) => filter.call(this_arg, child, child.path, this))
	}

	/* ============================================================================================ *\
	 * ================ Mutator Methods =========================================================== *
	\* ============================================================================================ */

	/**
	 * Prepend the given nodes to this TreeNode’s list of children, at the start of the list.
	 * @param    nodes the nodes to prepend
	 * @returns `this`
	 */
	prepend(...nodes: this[]): this {
		this._CHILDREN.unshift(...nodes)
		nodes.forEach((node) => {
			if (node._parent) node._parent.delete(node)
			node._parent = this
		})
		return this
	}

	/**
	 * Append the given nodes to this TreeNode’s list of children, at the end of the list.
	 * @param    nodes the nodes to append
	 * @returns `this`
	 */
	append(...nodes: this[]): this {
		this._CHILDREN.push(...nodes)
		nodes.forEach((node) => {
			if (node._parent) node._parent.delete(node)
			node._parent = this
		})
		return this
	}

	/**
	 * Insert the given nodes into this TreeNode’s list of children, after the specified node or index.
	 *
	 * To prepend the nodes before all the children, use {@link TreeNode#prependChildren|prepend}.
	 * To append  the nodes after  all the children, use {@link TreeNode#prependChildren|append}.
	 * @param    nodes an array of nodes to insert
	 * @param    reference the node or index to insert the new nodes after
	 * @returns `this`
	 */
	insertAfter(nodes: ReadonlyArray<this>, reference: this|Integer|number): this {
		let index: number = (reference instanceof TreeNode) ? this._CHILDREN.indexOf(reference) : reference.valueOf()
		if (index < 0) throw new ReferenceError(`${reference} not found among children.`)
		this._CHILDREN.splice(index, 0, ...nodes)
		nodes.forEach((node) => {
			if (node._parent) node._parent.delete(node)
			node._parent = this
		})
		return this
	}

	/**
	 * Remove the specified children from this TreeNode.
	 *
	 * Only children of this node will be removed
	 * (arguments that are provided but are not children of this node will not be affected).
	 * @param   children the child nodes to remove
	 * @returns `this`
	 */
	delete(...children: this[]): this {
		children.forEach((child) => {
			if (this.has(child)) {
				this._CHILDREN.splice(this._CHILDREN.indexOf(child), 1)
				child._parent = null
			}
		})
		return this
	}

	/**
	 * Remove all children from this TreeNode.
	 * @returns `this`
	 */
	clear(): this {
		this._CHILDREN.forEach((child) => {
			child._parent = null
		})
		this._CHILDREN.splice(0)
		return this
		// return this.delete(...this._CHILDREN) // slower
	}

	/* ============================================================================================ *\
	 * ================ Iteration Methods ========================================================= *
	\* ============================================================================================ */

	/**
	 * Return a new `Iterator` object that contains the key/value pairs for each node in this tree, with `this` being the first node.
	 * @returns a new `Iterator` object
	 */
	entries(): IterableIterator<[Integer[], TreeNode]> {
		return new Map(this.nodes().map((d) => [d.path, d] as [Integer[], TreeNode])).entries()
	}

	/**
	 * Return a new `Iterator` object that contains the paths of each node in this tree, with `this` being the first node.
	 * @returns a new `Iterator` object
	 */
	paths(): IterableIterator<Integer[]> {
		return this.nodes().map((d) => d.path).values()
	}

	/**
	 * Return a new `Iterator` object that contains the nodes in this tree, with `this` being the first node.
	 * @returns a new `Iterator` object
	 */
	values(): IterableIterator<TreeNode> {
		return this.nodes().values()
	}
	/** @implements Iterable<TreeNode> */
	[Symbol.iterator](): Iterator<TreeNode> { return this.values() }

	/**
	 * Iterate over all nodes in this tree, performing the callback function for each node.
	 * @param   callback function to call for each iteration, passing `(node, i, this)` as the arguments (where `i` is the iteration index)
	 * @param   this_arg optional `this` context in which to call the callback
	 */
	forEach(callback: (node: TreeNode, path: ReadonlyArray<Integer>, parentnode: TreeNode) => void, this_arg: unknown = this): void {
		return this.nodes().forEach((node) => { callback.call(this_arg, node, node.path, this) })
	}

	/**
	 * Test whether all nodes in this tree satisfy the given predicate.
	 * @param   predicate predicate to test for each descendant
	 * @param   this_arg optional `this` context in which to call the callback
	 * @returns Does the callback return `true` for each iteration?
	 */
	every(predicate: FilterFn, this_arg: unknown = this): boolean {
		return this.nodes().every((node) => predicate.call(this_arg, node, node.path, this))
	}

	/**
	 * Test whether at least one node in this tree satisfies the given predicate.
	 * @param   predicate predicate to test for each descendant
	 * @param   this_arg optional `this` context in which to call the callback
	 * @returns Does the callback return `true` for at least one iteration?
	 */
	some(predicate: FilterFn, this_arg: unknown = this): boolean {
		return this.nodes().some((node) => predicate.call(this_arg, node, node.path, this))
	}

	/**
	 * Return a shallow array of nodes in this TreeNode’s tree,
	 * optionally filtered by a predicate.
	 * @param   filter predicate by which to filter the nodes
	 * @param   this_arg optional `this` context in which to call the filter
	 * @returns `this.nodes(traversal).filter()`
	 */
	filter(filter: FilterFn, this_arg: unknown = this): TreeNode[] {
		return this.nodes().filter((node) => filter.call(this_arg, node, node.path, this))
	}

	/**
	 * Find the first descendant that satisfies the predicate.
	 * @param   predicate predicate by which to filter the descendants
	 * @param   this_arg optional `this` context in which to call the filter
	 * @returns the first node, in the provided traversal order, that satisfies the predicate
	 */
	find(predicate: FilterFn, this_arg: unknown = this): TreeNode|null {
		return this.filter(predicate, this_arg)[0] || null
	}

	/**
	 * Find the path of the first descendant that satisfies the predicate.
	 * @param   predicate predicate by which to filter the descendants
	 * @param   this_arg optional `this` context in which to call the filter
	 * @returns the path of the first node, in the provided traversal order, that satisfies the predicate
	 */
	findPath(predicate: FilterFn, this_arg: unknown = this): Integer[]|null {
		const found: TreeNode|null = this.find(predicate, this_arg)
		return (found) ? found.path : null
	}

	/* ============================================================================================ *\
	 * ================ Convenience Methods ======================================================= *
	\* ============================================================================================ */

	/**
	 * Prepend this TreeNode to another node’s children, at the start of the list.
	 * @param   parentnode the parent node to prepend to
	 * @returns `this`
	 */
	prependTo(parentnode: TreeNode): this {
		parentnode.prepend(this)
		return this
	}

	/**
	 * Append this TreeNode to another node’s children, at the end of the list.
	 * @param   parentnode the parent node to append to
	 * @returns `this`
	 */
	appendTo(parentnode: TreeNode): this {
		parentnode.append(this)
		return this
	}

	// /**
	//  * Insert this TreeNode into a parent node’s list of children, after the specified child node.
	//  * @param    reference the child node to insert the new node after
	//  * @returns `this`
	//  * @throws  {OrphanError} if `reference` has no parent
	//  */
	// insertThisAfter(reference: TreeNode): this {
	// 	if (!reference._parent) throw new OrphanError(reference)
	// 	reference._parent.insertChildrenAfter([this], reference)
	// 	return this
	// }

	/**
	 * Insert the given nodes before this node in its parent.
	 * @param    nodes the nodes to insert
	 * @returns `this`
	 * @throws  {OrphanError} if this TreeNode has no parent
	 */
	before(...nodes: TreeNode[]): this {
		if (!this._parent) throw new OrphanError(this)
		if (this.prevSibling) {
			this._parent.insertAfter(nodes, this.prevSibling)
		} else {
			this._parent.prepend(...nodes)
		}
		return this
	}

	/**
	 * Insert the given nodes after this node in its parent.
	 * @param    nodes the nodes to insert
	 * @returns `this`
	 * @throws  {OrphanError} if this TreeNode has no parent
	 */
	after(...nodes: TreeNode[]): this {
		if (!this._parent) throw new OrphanError(this)
		this._parent.insertAfter(nodes, this)
		return this
	}

	/**
	 * Remove this node from its parent.
	 * @returns `this`
	 * @throws  {OrphanError} if this TreeNode has no parent
	 */
	remove(): this {
		if (!this._parent) throw new OrphanError(this)
		this._parent.delete(this)
		return this
	}

	/* ============================================================================================ *\
	 * ================ Miscellaneous============================================================== *
	\* ============================================================================================ */

	/**
	 * Return the “youngest” common ancestor of this node and the given node.
	 *
	 * If `this` and the argument have multiple ancestors in common, then the minimum ancestor is returned.
	 * If `this` and the argument have no ancestors in common, `null` is returned.
	 * If `this` or the argument is a root node, then this method simply returns that root node if it is an ancestor of the other.
	 * @param   node the node to compare to
	 * @returns the minimum ancestor between `this` and `node`; if there is none, `null`
	 */
	commonAncestor(node: TreeNode): TreeNode|null {
		if (!this._parent) return (this.has(node)) ? this : null
		if (!node._parent) return node.commonAncestor(this)
		return this.ancestors((n) => node.ancestors().includes(n)).slice(-1)[0] // COMBAK Array#lastItem
	}
}


/**
 * An OrphanError is thrown when an operation on an orphan node (a node without a parent)
 * is attempted but cannot be completed.
 */
class OrphanError extends Error {
	/**
	 * Construct a new OrphanError oject.
	 * @param orphan the orphan node
	 */
	constructor(orphan: TreeNode) {
		super(`${orphan} has no parent node.`)
		this.name = 'OrphanError'
	}
}
