'use babel'

import path from 'path'
import os from 'os'
import tmp from 'tmp'
import {CompositeDisposable} from 'atom'

export default {
  config: {
    executablePath: {
      type: 'string',
      default: '/usr/local/bin/dialyzer'
    },
    includeDirs: {
      type: 'array',
      default: [],
      items: {
        type: 'string'
      }
    },
    pa: {
      type: 'array',
      default: [],
      items: {
        type: 'string'
      }
    }
  },

  activate () {
    require('atom-package-deps').install()
    this.subscriptions = new CompositeDisposable()

    this.subscriptions.add(
      atom.config.observe('linter-erlang-dialyzer.executablePath', executablePath => {
        this.executablePath = executablePath
      })
    )

    this.subscriptions.add(
      atom.config.observe('linter-erlang-dialyzer.pa', pa => {
        this.pa = pa
      })
    )

    this.subscriptions.add(
      atom.config.observe('linter-erlang-dialyzer.includeDirs', includeDirs => {
        this.includeDirs = includeDirs
      })
    )
  },

  deactivate () {
    this.subscriptions.dispose()
  },

  provideLinter () {
    const helpers = require('atom-linter')
    return {
      name: 'erlang-dialyzer',
      grammarScopes: ['source.erlang'],
      scope: 'file',
      // Do not lint continuously
      lintOnFly: false,
      lint: textEditor => {
        const tmpPathObj = tmp.dirSync({unsafeCleanup: true})
        const filePath = textEditor.getPath()
        const args = [tmpPathObj.name]
        let projectPath = null

        if (!filePath.match(/\.erl$/)) {
          return
        }

        for (let path of this.pa) {
          args.push('-pa')
          args.push(path)
        }

        let dirName = path.basename(path.dirname(filePath))
        if (dirName == 'src' | dirName == 'test') {
          projectPath = path.dirname(path.dirName(filePath))
        }

        for (let includePath of this.includeDirs) {
          args.push('-I')
          if (projectPath && !includePath.match(/^\//)) {
            args.push(path.join(projectPath, includePath))
          } else {
            args.push(includePath)
          }
        }

        args.push(filePath)

        console.log(args)

        return helpers.exec(this.executablePath, args).then(result => {
          const toReturn = []
          const patterns = [
            {regex: /(.+):(\d+):\s(.+)/, cb: m => {
              return {lineNumber: m[2], text: m[3]}
            }},
            {regex: /(.+): (.+)/, cb: m => {
              return {lineNumber: 1, text: m[2]}
            }}
          ]

          lines = result.split('\n')
          sourcesLines = textEditor.getBuffer().getLines()
          for (let line of lines) {
            if (!line) {
              continue
            }

            let matches = [for (x of patterns) if (line.match(x.regex)) x.cb(line.match(x.regex))];
            let match = matches[0]
            let lineNumber = parseInt(match.lineNumber) - 1
            let message = match.textEditor
            let type = 'Warning'

            let beforeMatch = message.match(/before: '?(.+?)'?/)
            let sourceLine = sourcesLines[lineNumber]
            let column1 = 0
            let column2 = sourceLine.length
            if (beforeMatch) {
              column2 = sourceLine.lastIndexOf(beforeMatch[1])
            }

            toReturn.push({
              type: type,
              text: message,
              range: [[lineNumber, column1], [lineNumber, column2]],
              filePath
            })
          }
          tmpPathObj.removeCallback()
          return toReturn
        })
      }
    }
  }
}
