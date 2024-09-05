import globals from 'globals'
import js from '@eslint/js'
import ts from 'typescript-eslint'
import prettier from 'eslint-plugin-prettier/recommended'

export default [
	{ files: ['**/*.{js,mjs,cjs,ts}'] },
	{ languageOptions: { globals: globals.browser } },
	js.configs.recommended,
	...ts.configs.recommended,
	prettier,
	{
		rules: {
			'no-unused-vars': 'off',
			'no-mixed-spaces-and-tabs': 'off',
			'prefer-const': 'warn',
			'@typescript-eslint/no-unused-vars': 'off',
			'@typescript-eslint/no-explicit-any': 'off',
		},
	},
]
