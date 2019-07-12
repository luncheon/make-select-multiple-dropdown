const Highlight = require('highlight.js/lib/highlight.js')
Highlight.registerLanguage('xml', require('highlight.js/lib/languages/xml'))

module.exports = {
  plugins: {
    "posthtml-include": {
      root: 'src',
    },
    "posthtml-inline-assets": {
      cwd: 'src',
      transforms: {
        script: false,
        image: false,
        iframe: {
          resolve(node) {
            return node.tag === 'iframe' && node.attrs && node.attrs.src
          },
          transform(node, data) {
            node.attrs.src = 'data:text/html,' + encodeURIComponent(data.buffer.toString('utf8'))
          },
        },
        code: {
          resolve(node) {
            return node.tag === 'code' && node.attrs && node.attrs.src
          },
          transform(node, data) {
            delete node.attrs.src
            node.content = [data.buffer.toString('utf8')]
          },
        },
      },
    },
  },
}
