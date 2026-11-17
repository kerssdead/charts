import { escapeHtml } from '@/helpers/Text'

describe('Escaping html', () => {
    it('Should escape html special characters', () => {
        expect(escapeHtml('<a href="x">&\'</a>'))
            .toBe('&lt;a href=&quot;x&quot;&gt;&amp;&#39;&lt;/a&gt;')
    })

    it('Should return empty text for missing values', () => {
        expect([escapeHtml(null), escapeHtml(undefined)])
            .toEqual(['', ''])
    })

    it('Should convert other values to text', () => {
        expect(escapeHtml(12))
            .toBe('12')
    })
})
