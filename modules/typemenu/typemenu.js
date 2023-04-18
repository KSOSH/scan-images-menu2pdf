const {spawn, exec} = require('child_process');
const path = require('path');
const root = __dirname;

function typemenu(json) {
	var promise = new Promise((resolve, reject) => {
		/**
		 * Под Linux будут другие пути и команды
		 */
		// Windows exe
		json = JSON.stringify(json);
		json = json.replace(/"/gm, `"""`)
		const bat = exec(path.join(root, `dist/typemenu.exe --json ` + json), (error, stdout, stderr) => {
			console.log('Menu', stdout)
			if (stdout) {
				if (!stdout.trim())
					reject(new Error('Nothing selected menu'));
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
		const bat = spawn('python', [path.join(root, 'typemenu.py'), '--json' ,json]);
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
		});
		*/
	})
	return promise;
}
module.exports = typemenu;