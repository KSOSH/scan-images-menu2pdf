var date;

const fs = require('fs'),
	path = require('path'),
	colors = require('colors'),
	compress_images = require('compress-images'),
	{ spawn, exec } = require('child_process'),
	{ PDFDocument } =  require('./modules/pdf-lib/pdf-lib.js'),
	calendar =  require('./modules/calendar/calendar.js'),
	typemenu = require('./modules/typemenu/typemenu.js'),
	dialog = require('./modules/opendialog/opendialog.js'),
	json = fs.readFileSync('menu.json'),
	jsonPars = JSON.parse(json);

let jsonType = [];
for(let jsn of jsonPars){
	jsonType.push({"name": jsn["name"]})
}

/**
 * Предупреждение
 * Удалить, как решим...
 */
console.log(`
                            НАПОМИНАЕМ`.red.bold +
`
                               ****`.yellow.bold +
`
  Приложение не поддерживает русские символы в выбранной директории!
Убедительная просьба, все изображения разместить в директории, в пути
               которой не импользуются русские символы.

                      Приносим свои извенения.
                        Мы над этим работаем.
`.cyan.bold);

let startTime, endTime, dir = '',
	typeMenu = false,
	mapsFiles;


function openExplorerin(paths, callback) {
	var cmd = ``;
	switch (require(`os`).platform().toLowerCase().replace(/[0-9]/g, ``).replace(`darwin`, `macos`)) {
		case `win`:
			paths = paths || '=';
			paths = paths.replace(/\//g, `\\`);
			paths = paths.replace(/\\$/, ``);
			cmd = `explorer`;
			break;
		case `linux`:
			paths = paths || '/';
			cmd = `xdg-open`;
			break;
		case `macos`:
			paths = paths || '/';
			cmd = `open`;
			break;
	}
	let p = require(`child_process`).spawn(cmd, [paths]);
	p.on('error', (err) => {
		p.kill();
		return callback(err);
	});
}

function isDir(dir_read){
	return new Promise(function(resolve, reject){
		try {
			let stats = fs.lstatSync(dir_read);
			if (stats.isDirectory()) {
				resolve(true);
			}else{
				resolve(false);
			}
		}catch (e) {
			resolve(false);
		}
	});
}

function readDirectory(dir_read){
	return new Promise(function(resolve, reject) {
		let files = fs.readdirSync(dir_read).filter(function(fn) {
				if(fn.endsWith('.jpg') || fn.endsWith('.jpeg') || fn.endsWith('.png') || fn.endsWith('.JPG') || fn.endsWith('.JPEG') || fn.endsWith('.PNG')){
					return true;
				}
				return false;
			});
		resolve(files);
	})
}

function resize(input, output, width) {
	return new Promise(function(resolve, reject){
		// magick convert "E:/scans/0001.jpg" -filter Catrom -resize 1134x -quality 100 "E:/scans/resize/0001.jpg"
		let args = [
			"convert",
			input,
			"-filter",
			"Catrom",
			"-resize",
			`${width}x`,
			"-quality",
			"80",
			output
		];
		const ls = spawn('magick', args);

		ls.stdout.on('data', (data) => {
			console.log(`stdout: ${data}`);
		});

		ls.stderr.on('data', (data) => {
			console.error(`stderr: ${data}`);
		});

		ls.on('close', (code) => {
			if(code == 0){
				resolve(output);
			}else{
				reject(code);
			}
		});
	});
}

function compress(m, d) {
	return new Promise(function(resolve, reject){
		compress_images(
			// directory and files mask
			m,
			// Output directory
			d + 'png/',
			{
				compress_force: true,
				statistic: false,
				autoupdate: true
			},
			false,
			{
				jpg: {
					engine: "mozjpeg",
					command: ["-quality", "80"]
				}
			},
			{
				png: {
					engine: "pngquant",
					command: ["--quality=20-50", "-o"]
				}
			},
			{
				svg: {
					engine: "svgo",
					command: "--multipass"
				}
			},
			{
				gif: {
					engine: "gifsicle",
					command: ["--colors", "64", "--use-col=web"]
				}
			},
			function(err, completed, static){
					console.log(`Чтение изображения:`.cyan.bold + ` ${static.input} `);
				if(!err){
					console.log(`Сжатие изображения:`.bold.cyan + ` ${static.path_out_new} ` + `УСПЕШНО!`.bold.yellow);
					if(completed)
						resolve(completed)
				}else{
					reject(err);
				}
			}
		);
	})
}

function pdfGenerator (outDir, imgs) {
	return new Promise(async function(resolve, reject){
		/**
		 * Если директория для PDF не существует - создать
		 */
		let pdfDirs = await isDir(outDir);
		if(!pdfDirs){
			fs.mkdirSync(outDir);
		}
		try {
			var files = await readDirectory(imgs);
			if(files.length){
				// Создать возможность переключения меню с обычного на 10-ти дневное
				/**
				 * created.
				 */
				mapsFiles = jsonPars[typeMenu]["items"];
				/**
				 * done.
				 */
				let i = 0;
				// Кол-во файлов в файле PDF
				// Зависит от типа меню
				let c = jsonPars[typeMenu]["files"];
				let k = 0;
				// Количество пунктов меню
				let f = mapsFiles.length;
				let pdfDoc;
				/**
				 * Бежим по файлам
				 */
				for(let file of files){
					let fImage = imgs + file;
					let ext = path.extname(file);
					ext = ext.toLowerCase();
					/**
					 * Читаем изображение в буффер
					 */
					let image = await fs.readFileSync(fImage);
					/**
					 * Если счётчик страниц на старте i == 0
					 * Создаём PDF документ 
					 */
					if(i == 0){
						console.log('Создаём PDF документ...'.bold.cyan);
						pdfDoc = await PDFDocument.create();
					}
					/**
					 * Загружаем изображение в PDF файл
					 */
					let pdfImage;
					if(ext == '.jpg' || ext == '.jpeg'){
						pdfImage = await pdfDoc.embedJpg(image);
					}else if(ext == '.png'){
						pdfImage = await pdfDoc.embedPng(image);
					}
					/**
					 * Масштабируем страницу
					 * При сканировании страниц в формате 300dpi
					 * Изображение нужно уменьшить до 27.44%  0.2744
					 */
					let pdfDims = pdfImage.scale(0.7);
					/**
					 * Добавляем страницу по рамерам полученного изображения
					 */
					let page = pdfDoc.addPage([pdfDims.width, pdfDims.height]);
					/**
					 * Рисуем изображение на странице
					 */
					page.drawImage(pdfImage, {
						x: 0,
						y: 0,
						width: pdfDims.width,
						height: pdfDims.height,
					});
					/**
					 * Увеличиваем счётчик страниц
					 */
					++i;
					/**
					 * Если счётчик страниц в PDF равен установленному количеству
					 */
					if(i == c){
						/**
						 * Автор
						 * Создатель
						 * Продюсер
						 */
						/**
						 * Автор документа - откуда получили документ.
						 * Проще говоря, кто организовывает питание в школе
						 */
						pdfDoc.setAuthor(jsonPars[typeMenu]["author"]);
						/**
						 * Кто создаёт документ
						 * Проще говоря - это школа и т. п.
						 */
						pdfDoc.setProducer(jsonPars[typeMenu]["produser"]);
						/**
						 * Приложение, которое создаёт документ.
						 * Данную строчку по лицензии MIT удалять нельзя ни в коем случае!!!
						 * Производителем файла должна быть программа, которая является официальной версией!
						 * Мы сюда так же добавляем ссылку на библиотеку pdf-lib.js
						 */
						pdfDoc.setCreator("https://github.com/Hopding/pdf-lib https://github.com/KSOSH/scan-images-menu2pdf");
						/**
						 * Формируем маску имени файла и директории файла
						 * Формат: dd-mm-yyyy
						 */
						let d = date.getDate();
						let m = date.getMonth() + 1;
						let y = date.getFullYear();
						let dd = d < 10 ? `0${d}` : d;
						m = m < 10 ? `0${m}` : m;
						let mask = `${dd}.${m}.${y}`;
						let pdfDir = await isDir(outDir + mask +"/");
						if(!pdfDir){
							fs.mkdirSync(outDir + mask +"/");
							console.log('Директория создана:'.bold.cyan + " " + (outDir + mask +"/").bold.yellow);
						}
						/**
						 * Заполнение метатегов документа
						 * Это обязательное действие.
						 **
						 * Заголовок
						 * Ключевые слова
						 * Тема (Описание)
						 */
						pdfDoc.setTitle(mapsFiles[k].title + " на " + mask);
						pdfDoc.setKeywords([mapsFiles[k].title + " на " + mask]);
						pdfDoc.setSubject(mapsFiles[k].title + " на " + mask);
						/**
						 * Время создания файла
						 * Время модификации файла
						 */
						pdfDoc.setCreationDate(new Date());
						pdfDoc.setModificationDate(new Date());
						/**
						 * Сохраняем
						 */
						let pdfBytes = await pdfDoc.save();
						/**
						 * Формируем путь и имя файла
						 */
						let pdfFile = `${mask}${mapsFiles[k].sufix}.pdf`;
						/**
						 * Пишем в файл
						 */
						fs.writeFileSync(outDir + mask +"/" + pdfFile, pdfBytes);
						console.log(String('     Запись в файл:').bold.cyan + " " + pdfFile + " УСПЕШНО!".bold.yellow);
						/**
						 * Увеличиваем счётчик типов меню
						 */
						++k;
						/**
						 * Если счётчик равен кол-ву типов меню
						 * Увеличиваем дату
						 * Счётчик обнуляем
						 */
						if(k == f){
							day = date.getDay();
							/**
							 * Если пятница - увеличиваем на 3 дня
							 * или увеличиваем на один.
							 */
							if(day == 5){
								day = 3
							}else{
								day = 1;
							}
							k = 0;
							date.setDate(d + day);
						}
						i = 0;
					}
				}
				/**
				 * Открываем проводник к PDF файлам
				 */
				openExplorerin(outDir, function(){});
				resolve(String("\nВсе PDF файлы созданы!\n").bold.yellow);
			}else{
				reject(String("Директория пустая:").bold.red + " " + imgs);
			}
		}catch(e){
			reject(e);
		}
	});
}

/**
 * Запускаем
 * 
 * Выбор даты
 */
calendar().then(async function(data){
	if(data == ''){
		console.log("Вы не указали дату".red.bold);
		return;
	}
	/**
	 * Проверяем дату.
	 * Если что ни так, уж извените...)))
	 */
	date = new Date(data);
	let day = date.getDay();
	if(day == 6){
		day = 2
	}else if(day == 0){
		day = 1;
	}else{
		day = 0
	}
	date.setDate(date.getDate() + day);
	/**
	 * Тип меню
	 */
	typemenu(jsonType).then(async function(data){

		typeMenu = parseInt(data);
		/**
		 * Выбор директории (диалоговое окно)
		 */
		dialog().then(async function(direct){
			dir = path.normalize(direct);
			dir = dir.replace(/\\/g, '/') + '/';

			let is_dir = await isDir(dir);
			if(is_dir) {
				/**
				 * Ресайз изображения
				 * Каждодневное меню width = 1134
				 * Десятидневное меню width = 1604
				 */
				readDirectory(dir).then(async function(images){
					startTime = new Date().getTime();
					if(await isDir(`${dir}pdf`)){
						console.log("Удаляем директорию с PDF файлами".bold.yellow);
						fs.rmSync(`${dir}pdf`, { recursive: true, force: true });
					}
					let resize_dir = `${dir}resize/`,
						is_res_dir = await isDir(resize_dir);
					if(!is_res_dir){
						fs.mkdirSync(resize_dir);
					}
					for(let image of images){
						let inputFile = `${dir}${image}`,
							outputFile = `${resize_dir}${image}`;
						console.log(`Чтение изображения:`.cyan.bold + ` ${inputFile} `);
						await resize(inputFile, outputFile, jsonPars[typeMenu]["size"]);
						console.log(`Ресайз изображения:`.bold.cyan + ` ${outputFile} ` + `УСПЕШНО!`.bold.yellow);
					}
					
					/**
					 * Оптимизация изображений
					 */
					const mask = `${dir}resize/*.{jpg,png,jpeg,JPG,PNG,JPEG}`;
					console.log("Старт оптимизации изображений...".bold.yellow);
					compress(mask, dir).then(function(res){
						console.log("Все изображения оптимизированы!".bold.yellow);
						let outPdf = dir + "pdf/",
							imgs = dir + "png/";
						/**
						 * Генерация PDF файлов
						 */
						pdfGenerator(outPdf, imgs).then(function(str){
							// clear
							console.log(str);
							console.log("Удаление директорий с оптимизированными изображениями...".bold.yellow);

							fs.rmSync(`${dir}resize`, { recursive: true, force: true });
							fs.rmSync(`${dir}png`, { recursive: true, force: true });
							endTime = new Date().getTime();
							let time = endTime - startTime;
							time = parseFloat(time / 1000).toFixed(2);
							console.log(" ");
							console.log("Затраченное время в секундах:".bold.yellow + ' ' + time + "s");
							console.log(" ");
						}).catch(function(err){
							console.log("Ошибка при генерации PDF!".bold.red);
							console.log(err);
							// clear
							fs.rmSync(`${dir}resize`, { recursive: true, force: true });
							fs.rmSync(`${dir}png`, { recursive: true, force: true });
							console.log("Удаление директорий с оптимизированными изображениями...".bold.yellow);
							console.log(" ");
						})
					}).catch(function(err){
						console.log("Ошибка оптимизации изображений!".bold.red);
						console.log(err);
						// clear
						console.log("Удаление директорий с оптимизированными изображениями...".bold.yellow);
						fs.rmSync(`${dir}resize`, { recursive: true, force: true });
						fs.rmSync(`${dir}png`, { recursive: true, force: true });
						console.log(" ");
					});
				}).catch(function(err){
					console.log(`Ошибка!: ${dir}`.bold.red);
					console.log(err);
					// clear
					console.log("Удаление директорий с оптимизированными изображениями...".bold.yellow);
					fs.rmSync(`${dir}resize`, { recursive: true, force: true });
					fs.rmSync(`${dir}png`, { recursive: true, force: true });
					console.log(" ");
				})
			}
		}).catch(function(err){
			console.log(`Ошибка!: ${dir}`.bold.red);
			console.log(err);
			console.log("Удаление директорий с оптимизированными изображениями...".bold.yellow);
			fs.rmSync(`${dir}resize`, { recursive: true, force: true });
			fs.rmSync(`${dir}png`, { recursive: true, force: true });
			console.log(" ");
		});
	});
});
