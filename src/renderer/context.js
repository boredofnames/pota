import { Context } from '../lib/reactivity/primitives/solid.js'

import { toHTML } from './@renderer.js'

export function context(defaultValue = undefined) {
	/** @type {any} */
	const ctx = Context(defaultValue)

	/**
	 * Sets the `value` for the context
	 *
	 * @param {object} props
	 * @param {any} props.value
	 * @param {Children} [props.children]
	 * @returns {Children} Children
	 */
	ctx.Provider = props =>
		ctx(props.value, () => toHTML(props.children))

	return ctx
}
