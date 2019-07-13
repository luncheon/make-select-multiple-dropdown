const fs = require('fs')
const path = require('path')
const { createPatch } = require('diff')
const { Diff2Html } = require("diff2html")
const { highlight } = require('highlight.js')

const resolvePath = (...segments) => path.resolve(__dirname, ...segments)
const outDir = resolvePath('.diff')
fs.mkdirSync(outDir, { recursive: true })

const unescapeHtml = s => s
  .replace(/&#x([0-9A-F]+);/g, (_, x) => String.fromCodePoint(parseInt(x, 16)))
  .replace(/&quot;/g, '"')
  .replace(/&lt;/g, '<')
  .replace(/&gt;/g, '>')
  .replace(/&amp;/g, '&')

const _highlight = (lang, s) => highlight(lang, unescapeHtml(s)).value

const hl = (lang, s) => {
  let html = ''
  let previousIndex = 0
  for (const { index, 0: { length }, 1: tagName, 2: content } of s.matchAll(/<(?<tagName>[a-z]+)>(.+?)<\/\k<tagName>>/g)) {
    html += _highlight(lang, s.slice(previousIndex, index))
    html += `<${tagName}>${_highlight(lang, content)}</${tagName}>`
    previousIndex = index + length
  }
  html += _highlight(lang, s.slice(previousIndex))
  return html
}

fs.readdirSync(resolvePath('src/codes'))
  .sort()
  .map(filename => resolvePath('src/codes', filename))
  .map(filepath => fs.promises.readFile(filepath, 'utf8').then(content => ({ filepath, content })))
  .map((file, i, files) => [files[i - 1] || Promise.resolve({ content: '' }), file])
  .forEach(async ([promiseBefore, promiseAfter]) => {
    const before = await promiseBefore
    const after = await promiseAfter
    const diff = createPatch(' ', before.content, after.content, undefined, undefined, { context: 1000 })
    const _html = Diff2Html.getPrettyHtml(diff)
    let lang = 'html'
    const html = _html.replace(/(<span class="d2h-code-line-ctn">)(.+?)(<\/span>)/g, (_, $1, $2, $3) => {
      let previousIndex = 0
      let html = ''
      for (const { index, 0: { length }, 1: closing, 2: tagName } of $2.matchAll(/&lt;(&#x2F;)?(.+?)&gt;/g)) {
        html += hl(lang, $2.slice(previousIndex, index))
        html += `<span class="hljs-tag">&lt;${closing || ''}<span class="hljs-name">${hl(lang, tagName)}</span>&gt;</span>`
        if (closing) {
          lang = 'html'
        } else if (tagName === 'style') {
          lang = 'css'
        } else if (tagName === 'script') {
          lang = 'js'
        }
        previousIndex = index + length
      }
      html += hl(lang, $2.slice(previousIndex))
      return $1 + html + $3
    })
    return fs.promises.writeFile(resolvePath(outDir, path.basename(after.filepath)), html, 'utf8')
  })
