import { execSync } from 'child_process'
import fs from 'fs'

// bump version number
execSync('npm version patch --git-tag-version false')

// read version number
import('../package.json', {
	assert: { type: 'json' },
}).then(json => {
	// write version number to ./src/version.js
	const version = json.default.version
	fs.writeFileSync(
		'./src/version.js',
		"export const version = '" + version + "'",
	)

	// git add, commit with version number
	execSync('git add --all')
	execSync('git commit -m "v' + version + '"')

	// git push / npm publish
	execSync('git push --all --prune')
	execSync('npm publish')
})