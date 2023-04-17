const {spawn} = require('child_process');
const path = require('path');
const root = __dirname;

function typemenu(json) {
	var promise = new Promise((resolve, reject) => {
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
	})
	return promise;
}
module.exports = typemenu;