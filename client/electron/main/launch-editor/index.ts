/**
 * Copyright (c) 2015-present, Facebook, Inc.
 *
 * This source code is licensed under the MIT license found in the
 * LICENSE file at
 * https://github.com/facebookincubator/create-react-app/blob/master/LICENSE
 *
 * Modified by Yuxi Evan You
 */

import fs from 'node:fs'
import os from 'node:os'
import path from 'node:path'
import process from 'node:process'
import { execa } from 'execa'

import guessEditor from './guess'
import getArgumentsForPosition from './get-args'

function isTerminalEditor(editor: string) {
  switch (editor) {
    case 'vim':
    case 'emacs':
    case 'nano':
      return true
  }
  return false
}

function normalizePath(filename: string) {
  const { win32, posix } = path
  return filename.split(win32.sep).join(posix.sep)
}

const positionRE = /:(\d+)(:(\d+))?$/
function parseFile(file: string) {
  file = normalizePath(decodeURIComponent(file))
  const fileName = file.replace(positionRE, '')
  const match = file.match(positionRE)
  const lineNumber = match && match[1]
  const columnNumber = match && match[3]
  return {
    fileName,
    lineNumber,
    columnNumber,
  }
}

let _childProcess: any | null = null

export default async function launchEditor(file: string, specifiedEditor?: string) {
  const parsed = parseFile(file)
  let { fileName } = parsed
  const { lineNumber, columnNumber } = parsed

  if (!fs.existsSync(fileName))
    throw new Error('File does not exist.')

  const [editor, ...args] = await guessEditor(specifiedEditor)
  if (!editor)
    throw new Error('No suitable editor found.')

  if (
    process.platform === 'linux'
    && fileName.startsWith('/mnt/')
    && /Microsoft/i.test(os.release())
  ) {
    // Assume WSL / "Bash on Ubuntu on Windows" is being used, and
    // that the file exists on the Windows file system.
    // `os.release()` is "4.4.0-43-Microsoft" in the current release
    // build of WSL, see: https://github.com/Microsoft/BashOnWindows/issues/423#issuecomment-221627364
    // When a Windows editor is specified, interop functionality can
    // handle the path translation, but only if a relative path is used.
    fileName = path.relative('', fileName)
  }

  if (lineNumber) {
    const extraArgs = getArgumentsForPosition(editor, fileName, lineNumber, columnNumber ?? undefined)
    args.push(...extraArgs)
  }
  else {
    args.push(fileName)
  }

  if (_childProcess && isTerminalEditor(editor)) {
    // There's an existing editor process already and it's attached
    // to the terminal, so go kill it. Otherwise two separate editor
    // instances attach to the stdin/stdout which gets confusing.
    _childProcess.kill('SIGKILL')
  }

  if (process.platform === 'win32') {
    // On Windows, launch the editor in a shell because spawn can only
    // launch .exe files.
    _childProcess = execa(
      'cmd.exe',
      ['/C', editor].concat(args),
      { stdio: 'inherit' },
    )
  }
  else {
    _childProcess = execa(
      editor,
      args,
      { stdio: 'inherit' },
    )
  }

  return _childProcess
}
