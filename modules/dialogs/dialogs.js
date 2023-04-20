const {spawn, exec} = require('child_process');
const path = require('path');
const root = __dirname;

function calendar() {
	var promise = new Promise((resolve, reject) => {
		/**
		 * Под Linux будут другие пути и команды
		 */
		// Windows exe
		const bat = exec(path.join(root, 'dists/dialogs.exe --calendar'), (error, stdout, stderr) => {
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
	})
	return promise;
}

function opendialog(json) {
	var promise = new Promise((resolve, reject) => {
		/**
		 * Под Linux будут другие пути и команды
		 */
		// Windows exe
		const bat = exec(path.join(root, 'dists/dialogs.exe --directory'), (error, stdout, stderr) => {
			if (stdout) {
				if (stdout.trim() == 'None'){
					reject(`No Dialog select`);
				}else{
					resolve(stdout.trim())
				}
			} else if (error) {
				reject(`No Dialog select`);
			} else if (stderr) {
				reject(`No Dialog select`);
			}
		});
	});
	return promise;
}

function typemenu(json) {
	var promise = new Promise((resolve, reject) => {
		/**
		 * Под Linux будут другие пути и команды
		 */
		// Windows exe
		json = JSON.stringify(json);
		json = json.replace(/"/gm, `"""`)
		const bat = exec(path.join(root, `dists/dialogs.exe --typemenu ` + json), (error, stdout, stderr) => {
			if (stdout) {
				if (!stdout.trim())
					reject(`No menu select`);
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

module.exports = {
	calendar: calendar,
	opendialog: opendialog,
	typemenu: typemenu
};