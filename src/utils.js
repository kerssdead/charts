String.prototype.hashCode = function() {
    let hash = 0, i, chr
    if (this.length === 0)
        return hash
    for (i = 0; i < this.length; i++) {
        chr = this.charCodeAt(i)
        hash = ((hash << 5) - hash) + chr
        hash |= 0
    }
    return hash
}

Object.prototype.hashCode = function() {
    return JSON.stringify(this).hashCode()
}

function adjustColor(color, amount) {
    return '#' + color.replace(/^#/, '').replace(/../g, color => ('0' + Math.min(255, Math.max(0, parseInt(color, 16) + amount)).toString(16)).slice(-2));
}