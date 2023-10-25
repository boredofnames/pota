import { isReactive, markReactive } from '../@main.js'
import { empty, isArray, isFunction } from '../../std/@main.js'

// abstracts oby reactivity

import $, {
	// signals
	memo as _memo,

	// effects
	root as _root,
	effect as _effect,
	batch as _batch,

	// cleanup/untrack
	cleanup as _cleanup,
	untrack as _untrack,

	// context
	context as _context,
} from 'oby'

/**
 * Creates a signal
 *
 * @param {unknown} [initialValue] - Initial value of the signal
 * @param {unknown} [options] - Signal options
 * @returns {[
 * 	Signal,
 * 	Function | ((currentValue: unknown) => unknown),
 * ]}
 *   - Read/write tuple
 */
export const signal = (initialValue, options) => {
	const s = $(initialValue, options)
	return [markReactive(() => s()), s]
}

/**
 * Creates a read-only signal from the return value of a function that
 * automatically updates
 *
 * @param {Function} fn - Function to re-run when dependencies change
 * @returns {Signal} - Read only signal
 */
export const memo = fn => markReactive(_memo(fn))

/**
 * Creates a new root
 *
 * @param {(dispose: Function) => any} fn
 * @returns {unknown}
 */
export const root = _root

/**
 * Creates a renderEffect
 *
 * @param {Function} fn
 */
export const renderEffect = fn => {
	_effect(fn, { sync: 'init' })
}

/**
 * Creates an effect
 *
 * @param {Function} fn
 */
export const effect = fn => {
	_effect(fn)
}

/**
 * Batches changes to signals
 *
 * @param {Function} fn
 * @returns {unknown}
 */
export const batch = _batch

/**
 * Runs a callback on cleanup
 *
 * @param {Function} fn
 */
export const cleanup = _cleanup

/**
 * Disables tracking for a function
 *
 * @param {Function} fn - Function to run with tracking disabled
 * @returns {unknown}
 */
export const untrack = _untrack

/**
 * Creates a context and returns a function to get or set the value
 *
 * @param {unknown} [defaultValue] - Default value for the context
 * @returns {typeof Context} Context
 */
export function context(defaultValue = empty()) {
	const id = Symbol()

	/**
	 * @overload Gets the context value
	 * @returns {any} Context value
	 */
	/**
	 * @overload Runs `fn` with a new value as context
	 * @param {unknown} newValue - New value for the context
	 * @param {Function} fn - Callback to run with the new context value
	 * @returns {Children} Children
	 */
	/**
	 * @param {unknown | undefined} newValue
	 * @param {Function | undefined} fn
	 */
	function Context(newValue, fn) {
		if (newValue === undefined) {
			const c = _context(id)
			return c ?? defaultValue
		} else {
			let r
			_context({ [id]: newValue }, () => {
				r = untrack(fn)
			})
			return r
		}
	}

	/**
	 * Sets the `value` for the context
	 *
	 * @param {object} props
	 * @param {unknown} props.value
	 * @param {Children} [props.children]
	 * @returns {Children} Children
	 */
	Context.Provider = props =>
		Context(props.value, () => children(() => props.children))

	return Context
}

// THIS IS HERE TO AVOID CIRCULAR IMPORTS

/**
 * Resolves and returns `children` in a memo
 *
 * @param {Function} fn
 * @returns {Signal} Memo
 */
export function children(fn) {
	const children = memo(fn)
	return memo(() => resolve(children()))
}

/**
 * Recursively resolves children functions
 *
 * @param {Children} children
 * @returns {Children}
 */
export function resolve(children) {
	/**
	 * `!isReactive(children)` avoids reading signals to not trigger a
	 * refresh on the parent memo. The issue manifest when `children` is
	 * an array containing more than 1 signal, because an invalidation
	 * on any, will cause invalidation on siblings, as the parent memo
	 * needs to be refreshed. The _most_ likely signals avoided here are
	 * memos returned by the resolved components.
	 */
	if (isFunction(children) && !isReactive(children)) {
		return resolve(children())
	}
	if (isArray(children)) {
		const childrens = []
		for (let child of children) {
			child = resolve(child)
			isArray(child)
				? childrens.push(...child)
				: childrens.push(child)
		}
		return childrens
	}

	return children
}

/**
 * Lazy version of `memo`, it will run the function only when used
 *
 * @author Fabio Spampinato
 * @param {Function} fn - Function to re-run when dependencies change
 * @returns {Signal}
 */
export function lazyMemo(fn) {
	const [sleeping, setSleeping] = signal(true)
	const m = memo(() => {
		if (sleeping()) return
		return fn()
	})
	return markReactive(() => {
		setSleeping(false)
		return m()
	})
}
