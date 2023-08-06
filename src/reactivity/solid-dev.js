// setup
import {
	createRoot,
	createRenderEffect,
	createEffect,
	onCleanup,
	createSignal,
	createMemo,
	untrack,
	createContext,
	useContext,
	getOwner,
} from 'solid-js/dist/dev.js'

import { setReactiveLibrary, children } from '#main'

setReactiveLibrary({
	root: createRoot,
	renderEffect: createRenderEffect,
	effect: createEffect,
	cleanup: onCleanup,
	signal: createSignal,
	memo: createMemo,
	untrack: untrack,
	createContext: defaultValue => {
		const id = Symbol()
		return {
			id,
			defaultValue,
			Provider: function (props) {
				let r
				createRenderEffect(
					() =>
						(r = untrack(() => {
							getOwner().context = {
								[id]: props.value,
							}
							return children(() => props.children)
						})),
				)
				return r
			},
		}
	},
	useContext: useContext,
})

// export
export * from '#main'