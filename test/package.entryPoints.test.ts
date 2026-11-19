import fs from 'fs'
import path from 'path'

const root = path.resolve(__dirname, '..')

const manifest = JSON.parse(fs.readFileSync(path.join(root, 'package.json'), 'utf8'))

const targets = [
    manifest.main,
    manifest.module,
    manifest.types,
    manifest.exports['.'].types,
    manifest.exports['.'].import,
    manifest.exports['.'].default
]

describe('Package entry points', () => {
    it.each(targets)('Should point %s to an existing file', target => {
        expect(fs.existsSync(path.join(root, target)))
            .toBe(true)
    })

    it('Should publish the dist folder', () => {
        expect(manifest.files)
            .toContain('dist')
    })

    it('Should keep direct dist file paths resolvable', () => {
        expect(manifest.exports['./dist/*'])
            .toBe('./dist/*')
    })
})