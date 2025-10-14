import type { Config } from 'jest'

const config: Config = {
    preset: 'ts-jest',
    testEnvironment: 'node',
    testMatch: ['**/?(*.)+(test).[tj]s?(x)'],
    moduleFileExtensions: ['ts', 'js', 'json', 'node'],
    moduleDirectories: ["node_modules", "src"]
}

export default config