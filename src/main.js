const core = require('@actions/core');
const exec = require('@actions/exec');
const tmp = require('tmp');


async function keychain_import(p12_content, p12_password, keychain_name) {
  const buffer = Buffer.from(p12_content, 'base64')
  const tempFile = tmp.fileSync()
  fs.writeFileSync(tempFile.name, buffer)

  await exec.exec('security', 'import', tempFile.name, '-t', 'agg', '-k', keychain_name, '-P', `'${p12_password}'`, '-a');

  fs.fs.unlinkSync(tempFile.name)
}


async function run() {

  try {
    // Verify input

    const p12content = core.getInput('p12-base64')
    const p12password = core.getInput('p12-password')

    if (os.platform() !== 'darwin') {
      throw 'Action requires macOS agent.';
    }

    //

    const keychain = "build.keychain";

    // Create keychain

    await exec.exec('security', 'create-keychain', '-p', '""', keychain);
    keychain_import(p12content, p12_password, keychain);

    await exec.exec('security', 'default-keychain', '-s', keychain);
    await exec.exec('security', 'unlock-keychain', '-p', '""', keychain);
    await exec.exec('security', 'set-key-partition-list', '-S', 'apple-tool:,apple:,codesign:', '-s', '-k', '""', keychain);

  } catch (error) {
    core.setFailed(error.message);
  }

}

run();
