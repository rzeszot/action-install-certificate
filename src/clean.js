const core = require('@actions/core');
const exec = require('@actions/exec');

async function run() {
  try {
    const keychain = "build.keychain";

    await exec.exec('security', ['delete-keychain', keychain]);
  } catch (error) {
    core.setFailed(error.message);
  }
}

run()
