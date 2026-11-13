import tseslint from 'typescript-eslint'
import stylistic from '@stylistic/eslint-plugin'

export default tseslint.config({
    files: ['src/**/*.ts', 'test/**/*.ts', 'e2e/**/*.ts'],
    languageOptions: {
        parser: tseslint.parser
    },
    plugins: {
        '@stylistic': stylistic,
        '@typescript-eslint': tseslint.plugin
    },
    rules: {
        '@stylistic/max-len': ['warn', { code: 115, ignoreUrls: true, ignoreStrings: true }],
        '@stylistic/function-call-argument-newline': ['error', 'consistent'],
        '@stylistic/function-paren-newline': ['error', 'multiline-arguments'],
        'no-nested-ternary': 'warn',
        '@typescript-eslint/no-non-null-assertion': 'warn',
        'max-params': ['warn', 4],
        'max-lines': ['warn', 300],
        'complexity': ['warn', 10],
        'eqeqeq': ['warn', 'smart']
    }
})