/*
  x64-only variant of buildWindows.js, for building on a machine that can't reach GitHub.

  Two things normally need a download that this avoids:
  * the Electron binaries for the target arch, replaced by pointing at an unpacked distribution
  * the winCodeSign toolchain, which is only needed to sign the exe and to write the icon and
    version info into it

  Both are opt-in through the environment, so a machine with network access gets the same output as
  buildWindows.js:
    MIN_ELECTRON_DIST=path/to/node_modules/electron/dist  use a local Electron instead of downloading
    MIN_SKIP_EXECUTABLE_SIGNING=1                          skip signing, leaves the default Electron icon
*/

const fs = require('fs')
const path = require('path')
const archiver = require('archiver')
const builder = require('electron-builder')
const { Arch } = builder

const createPackage = require('./createPackage.js')
const packageFile = require('./../package.json')
const version = packageFile.version

function patchBuilder () {
  const electronDist = process.env.MIN_ELECTRON_DIST
  const skipSigning = !!process.env.MIN_SKIP_EXECUTABLE_SIGNING

  if (!electronDist && !skipSigning) {
    return
  }

  /*
    builder.build is defined as a getter with no setter, so assigning to it is silently ignored in
    non-strict mode. defineProperty is the part that actually takes.
  */
  const originalBuild = builder.build

  Object.defineProperty(builder, 'build', {
    configurable: true,
    writable: true,
    value: function (args) {
      const config = Object.assign({}, args.config)

      if (electronDist) {
        config.electronDist = path.resolve(electronDist)
      }

      if (skipSigning) {
        // without this, electron-builder fetches winCodeSign from GitHub just to look for a signature
        config.win = Object.assign({}, config.win, { signAndEditExecutable: false })
      }

      console.log('building with local overrides:', [electronDist && 'electronDist', skipSigning && 'no signing'].filter(Boolean).join(', '))

      return originalBuild.call(this, Object.assign({}, args, { config }))
    }
  })
}

async function afterPackageBuilt (packagePath) {
  if (!fs.existsSync('dist/app')) {
    fs.mkdirSync('dist/app', { recursive: true })
  }

  const zipName = 'dist/app/Min-v' + version + '-windows.zip'
  const output = fs.createWriteStream(zipName)
  const archive = archiver('zip', { zlib: { level: 9 } })
  archive.directory(packagePath, 'Min-v' + version)
  archive.pipe(output)
  await archive.finalize()
  console.log('created ' + zipName)

  const installer = require('electron-installer-windows')

  const options = {
    src: packagePath,
    dest: 'dist/app/min-installer',
    icon: 'icons/icon256.ico',
    animation: 'icons/windows-installer.gif',
    licenseUrl: 'https://github.com/minbrowser/min/blob/master/LICENSE.txt',
    noMsi: true
  }

  console.log('Creating package (this may take a while)')

  fs.copyFileSync('LICENSE.txt', packagePath + '/LICENSE')

  await installer(options)
    .then(function () {
      fs.renameSync('./dist/app/min-installer/min-' + version + '-setup.exe', './dist/app/min-' + version + '-setup.exe')
    })
    .catch(err => {
      console.error(err, err.stack)
      process.exit(1)
    })
}

patchBuilder()

createPackage('win32', { arch: Arch.x64 })
  .then(afterPackageBuilt)
  .catch(function (error) {
    console.error(error)
    process.exit(1)
  })
