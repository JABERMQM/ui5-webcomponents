import UI5Element from "@ui5/webcomponents-base/dist/UI5Element.js";
import litRender from "@ui5/webcomponents-base/dist/renderer/LitRenderer.js";
import TreeItem from "./TreeItem.js";
import List from "./List.js";
import TreeListItem from "./TreeListItem.js";
import ListMode from "./types/ListMode.js";
import TreeItemsAlign from "./types/TreeItemsAlign.js";

// Template
import TreeTemplate from "./generated/templates/TreeTemplate.lit.js";

// Styles
import TreeCss from "./generated/themes/Tree.css.js";

/**
 * @public
 */
const metadata = {
	tag: "ui5-tree",
	properties: /** @lends sap.ui.webcomponents.main.Tree.prototype */ {
		/**
		 * Defines the mode of the <code>ui5-tree</code>. Since the tree uses a <code>ui5-list</code> to display its structure,
		 * the tree modes are exactly the same as the list modes, and are all applicable.
		 * <br><br>
		 * <b>Note:</b> Available options are <code>None</code>, <code>SingleSelect</code>, <code>SingleSelectBegin</code>,
		 * <code>SingleSelectEnd</code>, <code>MultiSelect</code>, and <code>Delete</code>.
		 *
		 * @public
		 * @type {ListMode}
		 * @defaultValue "None"
		 */
		mode: {
			type: ListMode,
			defaultValue: ListMode.None,
		},

		/**
		 * Defines the text that is displayed when the <code>ui5-tree</code> contains no items.
		 *
		 * @type {string}
		 * @defaultvalue ""
		 * @public
		 */
		noDataText: {
			type: String,
		},

		/**
		 * Defines the <code>ui5-tree</code> header text.
		 * <br><br>
		 * <b>Note:</b> If the <code>header</code> slot is set, this property is ignored.
		 *
		 * @type {string}
		 * @defaultvalue ""
		 * @public
		 */
		headerText: {
			type: String,
		},

		/**
		 * Defines the <code>ui5-tree</code> footer text.
		 *
		 * @type {string}
		 * @defaultvalue ""
		 * @public
		 */
		footerText: {
			type: String,
		},

		/**
		 * An array, containing a flat structure of list items to render
		 *
		 * @private
		 */
		_listItems: {
			type: Object,
			multiple: true,
		},

		/**
		 * Shows the toggle button at the end, rather than at the beginning of the items
		 *
		 * @protected
		 * @since 1.0.0-rc.8
		 */
		_toggleButtonEnd: {
			type: Boolean,
		},

		/**
		 * Represents the tree in a very minimal state - icons only with no text and no toggle buttons
		 *
		 * @protected
		 * @since 1.0.0-rc.8
		 */
		_minimal: {
			type: Boolean,
		},

		/**
		 * Defines the items alignment.
		 * <br><br>
		 * Available options are <code>Start</code> and <code>Text (default)</code>.
		 * <br>
		 * The <code>Text</code> option means the items
		 * will be aligned by their text - the items without icon will be indented.
		 * <br>
		 * The <code>Start</code> option means the items
		 * will be aligned from the start - the items without icon will not be indented.
		 *
		 * @private
		 * @type {TreeItemsAlign}
		 * @defaultvalue "Start"
		 * @since 1.0.0-rc.11
		 */
		alignItems: {
			type: String,
			defaultValue: TreeItemsAlign.Start,
		},
	},
	managedSlots: true,
	slots: /** @lends sap.ui.webcomponents.main.Tree.prototype */ {

		/**
		 * Defines the items of the <code>ui5-tree</code>. Tree items may have other tree items as children.
		 * <br><br>
		 * <b>Note:</b> Use <code>ui5-tree-item</code> for the intended design.
		 *
		 * @type {HTMLElement[]}
		 * @slot
		 * @public
		 */
		"default": {
			type: HTMLElement,
			propertyName: "items",
		},

		/**
		 * Defines the <code>ui5-tree</code> header.
		 * <br><br>
		 * <b>Note:</b> When the <code>header</code> slot is set, the
		 * <code>headerText</code> property is ignored.
		 *
		 * @type {HTMLElement[]}
		 * @slot
		 * @public
		 */
		header: {
			type: HTMLElement,
		},
	},
	events: /** @lends sap.ui.webcomponents.main.Tree.prototype */ {

		/**
		 * Fired when a tree item is expanded or collapsed.
		 * <i>Note:</i> You can call <code>preventDefault()</code> on the event object to suppress the event, if needed.
		 * This may be handy for example if you want to dynamically load tree items upon the user expanding a node.
		 * Even if you prevented the event's default behavior, you can always manually call <code>toggle()</code> on a tree item.
		 *
		 * @event sap.ui.webcomponents.main.Tree#item-toggle
		 * @param {HTMLElement} item the toggled item.
		 * @public
		 */
		"item-toggle": {
			detail: {
				item: { type: HTMLElement },
			},
		},

		/**
		 * Fired when a tree item is activated.
		 *
		 * @event sap.ui.webcomponents.main.Tree#item-click
		 * @param {HTMLElement} item the clicked item.
		 * @public
		 */
		"item-click": {
			detail: {
				item: { type: HTMLElement },
			},
		},

		/**
		 * Fired when the Delete button of any tree item is pressed.
		 * <br><br>
		 * <b>Note:</b> A Delete button is displayed on each item,
		 * when the <code>ui5-tree</code> <code>mode</code> property is set to <code>Delete</code>.
		 *
		 * @event sap.ui.webcomponents.main.Tree#item-delete
		 * @param {HTMLElement} item the deleted item.
		 * @public
		 */
		"item-delete": {
			detail: {
				item: { type: HTMLElement },
			},
		},

		/**
		 * Fired when selection is changed by user interaction
		 * in <code>SingleSelect</code>, <code>SingleSelectBegin</code>, <code>SingleSelectEnd</code> and <code>MultiSelect</code> modes.
		 *
		 * @event sap.ui.webcomponents.main.Tree#selection-change
		 * @param {Array} selectedItems An array of the selected items.
		 * @param {Array} previouslySelectedItems An array of the previously selected items.
		 * @public
		 */
		"selection-change": {
			detail: {
				selectedItems: { type: Array },
				previouslySelectedItems: { type: Array },
			},
		},
	},
};

/**
 * @class
 *
 * <h3 class="comment-api-title">Overview</h3>
 * The <code>ui5-tree</code> component provides a tree structure for displaying data in a hierarchy.
 *
 * <h3>Keyboard Handling</h3>
 * <code>ui5-tree</code> provides advanced keyboard handling. You can use the up/down arrow keys to navigate to the previous/next item in the list,
 * representing the tree, regardless of nesting, but also the left/right arrow keys to drill down and go up the tree. If you press the right arrow
 * on a tree node, it will expand, if not expanded. If you press the right arrow key once more, the first child of this node will be selected.
 * If you press the left arrow on a tree node, it will collapse, if expanded. If you press the left arrow key once more, the parent node of this
 * tree node will be selected.
 *
 * <h3>ES6 Module Import</h3>
 * <code>import @ui5/webcomponents/dist/Tree.js";</code>
 * <br>
 * <code>import @ui5/webcomponents/dist/TreeItem.js";</code> (for its respective item element)
 *
 * @constructor
 * @author SAP SE
 * @alias sap.ui.webcomponents.main.Tree
 * @extends UI5Element
 * @tagname ui5-tree
 * @appenddocs TreeItem
 * @public
 * @since 1.0.0-rc.8
 */
class Tree extends UI5Element {
	static get metadata() {
		return metadata;
	}

	static get render() {
		return litRender;
	}

	static get styles() {
		return TreeCss;
	}

	static get template() {
		return TreeTemplate;
	}

	static get dependencies() {
		return [
			List,
			TreeListItem,
			TreeItem,
		];
	}

	constructor() {
		super();
		this._observer = new MutationObserver(this.onTreeStructureChange.bind(this));
	}

	onBeforeRendering() {
		this._listItems = [];
		buildTree(this, 1, this._listItems);
		this.applyItemsAlignment();
	}

	onEnterDOM() {
		this._observer.observe(this, { attributes: true, childList: true, subtree: true });
	}

	onExitDOM() {
		this._observer.disconnect();
	}

	onTreeStructureChange() {
		// setTimeout is needed for IE11 so that it does not interfere with ItemNavigation.js and its await on RenderScheduler.
		// Otherwise this invalidation happens too soon and the ItemNavigation is blocked on waiting the tree to finish
		setTimeout(() => {
			this._listItems = []; // trigger onBeforeRendering by modifying the tracked property and force tree re-build
		}, 0);
	}

	/**
	 * Analyzes each level and applies identation if necessary.
	 * - alignItems="Start": does not provide additional indentation
	 * - alignItems="Text": provides additional indentation for tree level,
	 *  that consists of mixture of items with and without icons.
	 */
	applyItemsAlignment() {
		if (!this.alignItemsByText || !this.depth) {
			return;
		}

		for (let i = 1; i <= this.depth; i++) {
			const itemsForLevel = this.getItemsByLevel(this._listItems, i);
			this.indentItems(itemsForLevel);
		}
	}

	/**
	 * Marks the items that needs to be idented.
	 * @param {Array} items
	 */
	indentItems(items) {
		const hasMixedItems = this.hasMixedItems(items);

		if (!hasMixedItems) {
			return;
		}

		items.forEach(item => {
			item.indent = !item.treeItem.icon;
		});
	}

	/**
	 * Checks if the given items are mixture of ones with and without icons.
	 * @param {Array} items
	 * @returns {boolean}
	 */
	hasMixedItems(items) {
		let itemsWithIcons = 0;
		let itemsWithoutIcons = 0;

		items.forEach(item => {
			if (item.treeItem.icon) {
				itemsWithIcons++;
			} else {
				itemsWithoutIcons++;
			}
		});

		return itemsWithIcons > 0 && itemsWithoutIcons > 0;
	}

	/**
	 * Filters all the items for a given level.
	 * @param {Array} items
	 * @param {Integer} level
	 * @returns {Array}
	 */
	getItemsByLevel(items, level) {
		return items.filter(item => item.level === level);
	}

	get list() {
		return this.getDomRef();
	}

	get _role() {
		return "tree";
	}

	get depth() {
		if (this._listItems.length) {
			return Math.max(...this._listItems.map(item => item.level));
		}

		return null;
	}

	get alignItemsByText() {
		return this.alignItems === TreeItemsAlign.Text;
	}

	_onListItemStepIn(event) {
		const listItem = event.detail.item;
		const treeItem = listItem.treeItem;
		if (treeItem.items.length > 0) {
			const firstChild = treeItem.items[0];
			const firstChildListItem = this.list.getSlottedNodes("items").find(li => li.treeItem === firstChild);
			firstChildListItem && this.list.focusItem(firstChildListItem);
		}
	}

	_onListItemStepOut(event) {
		const listItem = event.detail.item;
		const treeItem = listItem.treeItem;
		if (treeItem.parentElement !== this) {
			const parent = treeItem.parentElement;
			const parentListItem = this.list.getSlottedNodes("items").find(li => li.treeItem === parent);
			parentListItem && this.list.focusItem(parentListItem);
		}
	}

	_onListItemToggle(event) {
		const listItem = event.detail.item;
		const treeItem = listItem.treeItem;
		const defaultPrevented = !this.fireEvent("item-toggle", { item: treeItem }, true);
		if (!defaultPrevented) {
			treeItem.toggle();
		}
	}

	_onListItemClick(event) {
		const listItem = event.detail.item;
		const treeItem = listItem.treeItem;
		this.fireEvent("item-click", { item: treeItem });
	}

	_onListItemDelete(event) {
		const listItem = event.detail.item;
		const treeItem = listItem.treeItem;
		this.fireEvent("item-delete", { item: treeItem });
	}

	_onListSelectionChange(event) {
		const previouslySelectedItems = event.detail.previouslySelectedItems.map(item => item.treeItem);
		const selectedItems = event.detail.selectedItems.map(item => item.treeItem);

		previouslySelectedItems.forEach(item => {
			item.selected = false;
		});
		selectedItems.forEach(item => {
			item.selected = true;
		});

		this.fireEvent("selection-change", {
			previouslySelectedItems,
			selectedItems,
		});
	}

	/**
	 * Returns the corresponding list item for a given tree item
	 *
	 * @param item The tree item
	 * @protected
	 */
	_getListItemForTreeItem(item) {
		return this.list.items.find(listItem => listItem.treeItem === item);
	}

	/**
	 * Perform Depth-First-Search walk on the tree and run a callback on each node
	 *
	 * @public
	 * @param {function} callback function to execute on each node of the tree with 2 arguments: the node and the level
	 */
	walk(callback) {
		walkTree(this, 1, callback);
	}
}

const walkTree = (el, level, callback) => {
	el.items.forEach(item => {
		callback(item, level);
		if (item.items.length > 0) {
			walkTree(item, level + 1, callback);
		}
	});
};

const buildTree = (el, level, result) => {
	el.items.forEach(item => {
		const listItem = {
			treeItem: item,
			level,
		};

		result.push(listItem);
		if (item.expanded && item.items.length > 0) {
			buildTree(item, level + 1, result);
		}
	});
};

Tree.define();

export default Tree;
