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
			console.log('Calendar', stdout)
			if (stdout) {
				if (!stdout.trim())
					reject(new Error('Nothing selected date'));
				else
					resolve(stdout.trim())
			} else if (error) {
				reject(new Error('Nothing selected date'));
			} else if (stderr) {
				reject(new Error('Nothing selected date'));
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