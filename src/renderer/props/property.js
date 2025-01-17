import { dispatchNativeEvent } from '../../lib/events/dispatchNativeEvent.js'
import { withValue } from '../../lib/reactivity/withValue.js'
import { isNullUndefined } from '../../lib/std/isNullUndefined.js'

/**
 * @param {Elements} node
 * @param {string} name
 * @param {unknown} value
 * @param {object} props
 * @param {string} localName
 * @param {string} ns
 */
export const setPropertyNS = (
	node,
	name,
	value,
	props,
	localName,
	ns,
) => setProperty(node, localName, value)

/**
 * @param {Elements} node
 * @param {string} name
 * @param {unknown} value
 * @url https://pota.quack.uy/props/setProperty
 */
export const setProperty = (node, name, value) =>
	withValue(value, value => _setProperty(node, name, value))

/**
 * @param {Elements} node
 * @param {string} name
 * @param {unknown} value
 */
export function _setProperty(node, name, value) {
	// if the value is null or undefined it will be set to null
	if (isNullUndefined(value)) {
		// defaulting to undefined breaks `progress` tag and the whole page
		node[name] = null
	} else {
		node[name] = value
	}
	if (name === 'value') {
		dispatchNativeEvent(node, 'input')
		dispatchNativeEvent(node, 'change')
	}
}
