const {spawn, exec} = require('child_process');
const path = require('path');
const root = __dirname;

function calendar() {
	var promise = new Promise((resolve, reject) => {
		/**
		 * Под Linux будут другие пути и команды
		 */
		// Windows exe
		const bat = exec(path.join(root, 'dists/calendar.exe'), (error, stdout, stderr) => {
			if (stdout) {
				if (!stdout.trim())
					reject(`No calendar select`);
				else
					resolve(stdout.trim())
			} else if (error) {
				reject(error);
			} else if (stderr) {
				reject(stderr);
			}
		});
		/*
		// Python file
		const bat = spawn('python', [path.join(root, 'calend.py')]);
		let rt = '';
		bat.stdout.on('data', (data) => {
			let str = data.toString().trim();
			rt = str;
		});

		bat.stderr.on('data', (data) => {
			rt = '';
		});

		bat.on('exit', (code) => {
			resolve(rt);
		});*/
	})
	return promise;
}
module.exports = calendar;