window.__issues = []
window.__text = []
window.__frame = 0

;(function () {
    const seen = new WeakSet()
    const rec = (kind, msg) => window.__issues.push({ kind, msg })
    const P = CanvasRenderingContext2D.prototype
    for (const name of ['moveTo', 'lineTo', 'arc', 'rect', 'fillRect', 'strokeRect', 'clearRect', 'bezierCurveTo', 'quadraticCurveTo', 'arcTo', 'ellipse', 'roundRect', 'fillText', 'strokeText', 'translate', 'scale', 'drawImage', 'createLinearGradient', 'createRadialGradient']) {
        const orig = P[name]
        if (!orig) continue
        P[name] = function (...args) {
            for (let i = 0; i < args.length; i++) {
                const a = args[i]
                if (typeof a === 'number' && !Number.isFinite(a)) { rec('nonfinite', `${name} arg${i}=${a}` + (typeof args[0] === 'string' ? ` "${args[0]}"` : '')); break }
            }
            if (name === 'fillText' || name === 'strokeText') {
                const s = String(args[0])
                if (/NaN|undefined|Infinity|null|\[object/.test(s)) rec('badtext', `${name} "${s}"`)
                const t = this.getTransform(), w = this.measureText(s).width
                let x = args[1]
                const al = this.textAlign
                if (al === 'center') x -= w / 2; else if (al === 'end' || al === 'right') x -= w
                const x0 = t.a * x + t.e, x1 = t.a * (x + w) + t.e, y = t.d * args[2] + t.f
                window.__text.push({ s, x0, x1, y, cw: this.canvas.width, ch: this.canvas.height, alpha: this.globalAlpha, frame: window.__frame })
            }
            return orig.apply(this, args)
        }
    }

    const raf = window.requestAnimationFrame
    window.requestAnimationFrame = cb => raf(ts => {
        window.__frame++
        window.__text = window.__text.filter(t => t.frame >= window.__frame - 1)
        try { cb(ts) } catch (e) {
            if (e && typeof e === 'object') seen.add(e)
            rec('rafthrow', String(e && e.stack || e))
            throw e
        }
    })

    window.addEventListener('error', e => {
        if (e.message === 'Script error.' || seen.has(e.error)) return
        rec('pageerror', String(e.error && e.error.stack || e.message))
    })
    window.addEventListener('unhandledrejection', e => rec('rejection', String(e.reason && e.reason.stack || e.reason)))

    window.__collectTextIssues = () => {
        const res = []
        const cur = window.__text.filter(t => t.frame === window.__frame)
        for (const t of cur) {
            if (!t.s.trim() || t.alpha < 0.05) continue
            if (t.x0 < -2 || t.x1 > t.cw + 2) res.push(`text "${t.s.slice(0, 40)}" x=[${t.x0.toFixed(0)},${t.x1.toFixed(0)}] canvasW=${t.cw}`)
            if (t.y < -2 || t.y > t.ch + 20) res.push(`text "${t.s.slice(0, 40)}" y=${t.y.toFixed(0)} canvasH=${t.ch}`)
        }
        for (let i = 0; i < cur.length; i++) for (let j = i + 1; j < cur.length; j++) {
            const a = cur[i], b = cur[j]
            if (!a.s.trim() || !b.s.trim() || a.alpha < 0.5 || b.alpha < 0.5) continue
            if (a.s === b.s && Math.abs(a.x0 - b.x0) < 1 && Math.abs(a.y - b.y) < 1) continue
            const ov = Math.min(a.x1, b.x1) - Math.max(a.x0, b.x0)
            if (ov > 3 && Math.abs(a.y - b.y) < 6) res.push(`overlap "${a.s.slice(0, 25)}" & "${b.s.slice(0, 25)}" by ${ov.toFixed(0)}px y=${a.y.toFixed(0)}`)
        }
        for (const m of new Set(res.slice(0, 6))) rec(m.startsWith('overlap') ? 'textoverlap' : 'textoutside', m)
    }
})()