import { withValue } from '../../lib/reactive.js'

/**
 * @param {Element} node
 * @param {string} name
 * @param {unknown} value
 * @url https://pota.quack.uy/props/setProperty
 */
export const setProperty = (node, name, value) => {
	withValue(value, value => _setProperty(node, name, value))
}

/**
 * @param {Element} node
 * @param {string} localName
 * @param {unknown} value
 */
export const setPropertyNS = (node, localName, value) => {
	setProperty(node, localName, value)
}

/**
 * @param {Element} node
 * @param {string} name
 * @param {unknown} value
 */
export function _setProperty(node, name, value) {
	// if the value is null or undefined it will be set to null
	if (value == null) {
		// defaulting to `undefined` breaks `progress` tag and the whole page
		node[name] = null
	} else {
		node[name] = value
	}
}
