const {spawn, exec} = require('child_process');
const path = require('path');
const root = __dirname;

function opendialog(json) {
	var promise = new Promise((resolve, reject) => {
		/**
		 * Под Linux будут другие пути и команды
		 */
		// Windows exe
		const bat = exec(path.join(root, 'dists/opendialog.exe'), (error, stdout, stderr) => {
			if (stdout) {
				if (stdout.trim() == 'None'){
					console.log(stdout)
					reject(`No Dialog select`);
				}else{
					console.log(stdout)
					resolve(stdout.trim())
				}
			} else if (error) {
				console.log(error)
				reject(`No Dialog select`);
			} else if (stderr) {
				console.log(stderr)
				reject(`No Dialog select`);
			}
		});
	});
	return promise;
}

module.exports = opendialog;
