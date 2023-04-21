const {spawn, exec} = require('child_process');
const path = require('path');
const root = __dirname;

function dialogs(json) {
	var promise = new Promise((resolve, reject) => {
		/**
		 * Под Linux будут другие пути и команды
		 */
		// Windows exe
		json = JSON.stringify(json);
		json = json.replace(/"/gm, `"""`)
		const bat = exec(path.join(root, 'dist/dialogs.exe --typemenu ' + json), (error, stdout, stderr) => {
			if (stdout) {
				if (!stdout.trim())
					reject(`None`);
				else
					resolve(stdout.trim())
			} else if (error) {
				reject(error);
			} else if (stderr) {
				reject(stderr);
			}
		});
	})
	return promise;
}
module.exports = dialogs