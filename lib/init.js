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
    
  }
}
