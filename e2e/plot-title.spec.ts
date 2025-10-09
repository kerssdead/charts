/*
    #322 Title is not displaying
    https://github.com/kerssdead/charts/issues/322
 */

import { expect, test } from '@playwright/test'
import { Screenshot } from './utils/Screenshot'
import { BrowserResult } from './utils/BrowserResult'

test('Tree Map should not has legend', async ({ page, browserName }) => {
    await page.goto('/charts/')

    const title = page.locator('#title'),
        legend = page.locator('#legend'),
        chartType = page.locator('#chart-type')

    await legend.click()
    await title.click()

    await chartType.selectOption('0')

    const frame = await Screenshot.get(page, {
        x: 440,
        y: 10,
        width: 48,
        height: 30
    })

    const result: BrowserResult = {
        chromium: 'iVBORw0KGgoAAAANSUhEUgAAADAAAAAeCAIAAADlxgqWAAACgUlEQVR4nOyXzYtxURzHj5lpFrOZmdVMTU3TTPOymZlmooT/QCQbW8qCWBAl2chOEnlbCGHFAosnC8rSUnkrKZGXBUVCEYnn97h1m9wnZiZk4bs4nfM7v9P93Ht/L/eezOdztE86QXumA9A6HYDW6QC0Tgegddp7oG63azKZVp9hsVjZbLZarUokkqurK/zg5eUlNnc4HM1mUy6X45bvi7TUyyqVyv39/eozTqfT5/Mlk8lMJvP29gYWu92uVqt7vR6JRILl+/s7EJdKpYeHB/RDLT8huONAIIAv4/G4x+OhUCgKhQI3ksnker1+fX19cXGBWaRSKdqQloHOzs54PB6+7Pf7AHR3d/fVCNLpdGg7+mVQW61WeCMqlWo0GlksFswok8menp4gsIj+4OxyudLp9Hg8/vj44PP52Lsm6gj9SsFgEDja7Xar1cKBYBIOh4nOoVDo8fFRr9fHYrFUKgVJA0HmdrvRBoFw0Wg0PC1ms1kikVhyAGKBQIAWD3U6nULgRyIRWAqFwnK5jDYOtFZQAgaDwefnJwT+8fExpCGHwxGLxbBls9mI/lsvjLlcDsabmxuv14sbJ5MJjPl8Hu0eqFgswvhnoaWtQqGAdg+EFWuDwUClUpe2Tk9P0e6BXl5eoKbDhMFg4EYo8dFo9PX1lei/yaCGdkY0stlstCikeE4Nh0Mul6vRaGq1GtoSENb+oMNAMhOBmEwmJBr0NWi3SqXy+fkZ4Oh0ukgkQj8FOjr654C1zBV27AMBLgPlDqrRVx8QVEutVgsTs9lsNBobjQYg+v1+qALEK5I29ecKmdzpdM7Pz6Eb/tcBQKElQ2G8vb3Fu/IWgTalwyfsOv0FAAD//460oVwAAAAGSURBVAMAhlYKMiRZaYEAAAAASUVORK5CYII=',
        firefox: 'iVBORw0KGgoAAAANSUhEUgAAADAAAAAeCAYAAABqpJ3BAAAC40lEQVRYR+1WP0jyYRB+DCEICloMmhTBIaJQKZSgyHBoqSAa+kPkliCUhUOTlEtLgpgitBQRRDREaVNBFBEmCmYOQRQFOgQl4qKIfN93LygZP/XXJ6WCN4nv3e+95567517Bn3+GGjZBHUCF2aszUGECUGegzkCZFai3UJkFLDuck4HHx0dsbW3x/nh/fz8oJhqNYmlpCW1tbQVjXS4Xnp+fsbCwgPb2dt53FHLkBHB2dgatVsv74yaTCefn5wgEAgiFQujs7GSxy8vLSKfTsFqtEAqF7D8Ce3V1xXzlcjnvO74F4O3tDZeXl3kxbrcbOzs76OjowOrqat6ZTCbD0dERXl9fsba2lqusQCBgfslkEo2Njb8HgAutw+GAwWDA8PAwTk9PeVWupgBYLBa8vLwwBp6enmC323FwcMCAjo+Po6+vD0ajsWALPTw8wGazwev1Msao1SYmJqDRaIoWi7eMlmJAqVTmZuD+/h6Tk5N5F09NTWFvb48TwPHxMUZHRzkT3djYYMLwrRn4nxb6DCA7xHxa6P39HRKJBIlEApubm5ifn2fXezyeHCi/3w+FQsGJ4UcY+A4Aajmz2Yyenh7c3t7mJbmysoL19XXWeqRkXFZxACMjIzg5OcHc3Bymp6fzciQlpNlSqVS4ubmpTgBSqZQNfTEjmaYhr0oGuru7cXd3h8XFxYKK09LSgoGBgeoEQGq1v7/PdgxJ72cjNSOFouU5NjZWOQAfHx9obW3l3MTb29vQ6XQQiUTsPdXc3Mz8UqkUhoaGcH19DafTCb1e//sAent74fP5WGvMzMywRL++hTKZDNRqNfOjXiefhoYGtjOotaj6dNbU1PQ7AMLhMLuUbHd3F7Ozs+w3bePDw0MMDg7i4uICwWAQXV1d7IwYogpnN3c2U3q2UPXFYnHBGecto0VloshhPB5HLBZjLVKoitnwSCTCqk5GbJBClbIfB1AqgXLP6wDKrWC58TXPwF8eK0XFGYVNsgAAAABJRU5ErkJggg==',
        webkit: 'iVBORw0KGgoAAAANSUhEUgAAAGAAAAA8CAYAAACZ1L+0AAAAAXNSR0IArs4c6QAAAERlWElmTU0AKgAAAAgAAYdpAAQAAAABAAAAGgAAAAAAA6ABAAMAAAABAAEAAKACAAQAAAABAAAAYKADAAQAAAABAAAAPAAAAABU0H2EAAAEZklEQVR4Ae1bTSh1QRj+rj6JlfK3ECUSEhvChliRUlgo2RBRNhYiFiyUa+OvrBTJTwhJIbJgYalkQST/yYKF/CRF36en3sVM1z1zrjvf3Pvd9y7mOe/MO/POed7znHtm7rmOP1+fX/wxxkCQscgcGAxwAgxfCJwAToBhBgyHZwVwAgwzYDg8K4ATYJgBw+FZAZwAwwwYDs8K4AQYZsBweFYAJ8AwA4bDswI4AYYZMByeFcAJMMyA4fCsAE6AYQYMh2cFGE7Ab9X4/f39cL28vFTtYsuvpqYG/tPT08DMzExgfX29rXHI+eTkBIcjIyPA9PR0YGNjI7n4BLICDKfBofpeUHZ2Nqa6t7enZcrj4+MYt66uDlhWVgZcWVkR4m1sbMBeXFwElpaWAsvLywW/zc1N2MXFxcCSkhLg+vq64GfaYAUYzoDyd0BPTw+m+vDw4HbKtbW1aP/4+AB2dHQA09LS3PZLSkpCe3V1NZAUJ3fa399H1djYGDAyMhIoK0Du56s2K8BwZpQVQPdSq/nSUwYpgPrl5+dbdUV7bm6ukt//4sQKMJxJZQXonic9XQ0NDSFUVlYWsKWlBUjrgd3dXWEq9DR0fHyM+oGBAaFd1fj8/ITr8PAwkJ6iaD2RkJCA+oKCAiDNKzw8HLanBSvAU+a81M9nFHB1dYVTmpmZAT4/PwPpStve3oZ9cXEBpOL8/ByHNzc3wO7ubmpSQopD646dnR2hHz1lUT3h/Pw8/FZXV4GJiYlCP1WDFaDKlCY/n1GA1fmdnZ3Bxel0Ajs7O4FtbW3Avr4+IBV0Dyf7O+zt7UUTXdm0Z7S8vIx6Wp/c39/DrqqqApIim5ubYdMKHYaNghVggywdrn6jAG+f/OPjI4YcHBwUhqYVP1351BgVFYXDhYUFYHR0NHBrawt4e3sLjI2NBaoWrABVpjT5BawCjo6OQOn7+zvQ4XAIFK+trQm2bMTExKDq7u4OSHtUrACZKR+3A1YBp6enQmro79Ke7qo+PT0J46ka/B2gypQmv4BVQFhYmEAp7emMjo4K9apGXl6eqqvgxwoQ6Pj3RsAqIDk5WWCb1gU5OTmoj4+PF9plg94SoX60Syr7WdmsACuGNLf7vQJeXl48oiglJQX96Eq/vr6GPTs7C2xvb3c57tLSEupbW1uBERERwK6uLpf+VpWsACuGNLf7nQJSU1MFSiYnJ2G/vr4CaS9HcHJhhISEoJb2giorK2HTWxyHh4ewMzIygLRypnio/CpodzY4OJiqbCErwBZd3nf2ugLkPRXZ/u4UZL+gINfXRmFhIYYoKioC0r78xMQEbNqfl/vLNpy/ioqKChzOzc0Bm5qagFNTU0C5oHs+fUc0NDTILrZs12dpawh2/gkDyu+G/iSIzr70S9Xb2xvCxMXFAWVFqc6Bxjk4OEAX+g2adj9pxRsaGqo6pFs/VoBbevQ3+r0C9FOkNwIrQC+/lqNzAiwp0uvACdDLr+XonABLivQ6cAL08ms5+l8P3xqFewqz2gAAAABJRU5ErkJggg=='
    }

    expect(frame).toBe(result[browserName])
})