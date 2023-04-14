var date;

const fs = require('fs'),
	path = require('path'),
	colors = require('colors'),
	compress_images = require('compress-images'),
	{ spawn } = require('child_process'),
	dialog = require('node-file-dialog'),
	{ PDFDocument } =  require('./modules/pdf-lib/pdf-lib.js'),
	config = {type:'directory'};

var filesOne = [
		{
			title: "Меню питания для 1-​4 классов",
			sufix: "-1-4",
		},
		{
			title: "Меню питания для учащихся с ОВЗ",
			sufix: "-ovz",
		},
		{
			title: "Индивидуальное меню питания",
			sufix: "-ind",
		},
		{
			title: "Меню питания для школьников",
			sufix: "",
		},
		{
			title: "Меню питания для детей мобилизованных родителей",
			sufix: "-mob",
		}
	],
	filesTen = [
		{
			title: "Примерное двухнедельное меню рациона питания для детей учащихся 1-​4 класса",
			sufix: "-1-4",
		},
		{
			title: "Примерное двухнедельное меню рациона питания для детей c ОВЗ",
			sufix: "-ovz",
		},
		{
			title: "Примерное двухнедельное индивидуальное меню рациона питания",
			sufix: "-ind",
		},
		{
			title: "Примерное двухнедельное меню рациона питания для учащихся",
			sufix: "",
		},
		{
			title: "Примерное двухнедельное меню рациона питания для детей мобилизованных родителей",
			sufix: "-mob",
		}
	],
	typeMenu = false,
	mapsFiles;

function openExplorerin(path, callback) {
	var cmd = ``;
	switch (require(`os`).platform().toLowerCase().replace(/[0-9]/g, ``).replace(`darwin`, `macos`)) {
		case `win`:
			path = path || '=';
			path = path.replace(/\//g, `\\`);
			path = path.replace(/\\$/, ``);
			cmd = `explorer`;
			break;
		case `linux`:
			path = path || '/';
			cmd = `xdg-open`;
			break;
		case `macos`:
			path = path || '/';
			cmd = `open`;
			break;
	}
	let p = require(`child_process`).spawn(cmd, [path]);
	p.on('error', (err) => {
		p.kill();
		return callback(err);
	});
}

function isDir(dir){
	return new Promise(function(resolve, reject){
		try {
			let stats = fs.lstatSync(dir);
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

function readDirectory(dir){
	return new Promise(function(resolve, reject) {
		let files = fs.readdirSync(dir).filter(function(fn) {
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
			console.log(`ImageMagick process exited with code ${code}`.bold.cyan);
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
			function(err, completed){
				if(!err){
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
		if(!fs.existsSync(outDir)){
			fs.mkdirSync(outDir);
		}
		try {
			var files = await readDirectory(imgs);
			if(files.length){
				// Создать возможность переключения меню с обычного на 10-ти дневное
				/**
				 * created.
				 */
				mapsFiles = typeMenu ? filesTen : filesOne;
				/**
				 * done.
				 */
				let i = 0;
				// Кол-во файлов в файле PDF
				// Зависит от типа меню
				let c = typeMenu ? 11 : 2;
				let k = 0;
				// Количество пунктов меню
				let f = 5;
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
						pdfDoc.setAuthor('ГБОУ СОШ пос. Комсомольский');
						pdfDoc.setCreator('ГБОУ СОШ пос. Комсомольский');
						pdfDoc.setProducer('ГБОУ СОШ пос. Комсомольский');
						/**
						 * Заголовок
						 * Ключевые слова
						 * Тема (Описание)
						 */
						pdfDoc.setTitle(mapsFiles[k].title);
						pdfDoc.setKeywords([mapsFiles[k].title]);
						pdfDoc.setSubject(mapsFiles[k].title);
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
						 * Формируем имя файла
						 * Формат: dd-mm-yyyy-sufix.pdf
						 */
						let d = date.getDate();
						let m = date.getMonth() + 1;
						let y = date.getFullYear();
						let dd = d < 10 ? `0${d}` : d;
						m = m < 10 ? `0${m}` : m;
						let pdfFile = `${dd}.${m}.${y}${mapsFiles[k].sufix}.pdf`;
						/**
						 * Пишем в файл
						 */
						fs.writeFileSync(outDir + pdfFile, pdfBytes);
						console.log(String('Write file:').bold.cyan + " " + pdfFile);
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
				openExplorerin(outDir, function(){});
				resolve(String("Done create pdf`s files!").bold.yellow);
			}else{
				reject(String("Empty directory:").bold.red + " " + imgs);
			}
		}catch(e){
			reject(e);
		}
	});
}

function promptDialog(tp) {
	// tp == 0 - schema, ввод Даты
	// tp == 1 - types, тип меню (каждодневное, двухнедельное)
	return new Promise(function(resolve, reject){
			let prompt = require('prompt'),
			schema = {
				properties: {
					date: {
						pattern: /\d{4}-\d{2}-\d{2}$/,
						message: 'Введите дату. Формат записи даты yyyy-mm-dd',
						description: 'Введите дату. Формат записи даты yyyy-mm-dd',
						type: 'string',
						required: true
					},
				}
			},
			types = {
				properties: {
					date: {
						pattern: /\d{1,2}$/,
						message: 'Тип меню. 1 - каждодневное, 2 - двухнедельное',
						description: 'Тип меню. 1 - каждодневное, 2 - двухнедельное',
						type: 'string',
						required: true
					},
				}
			},
			schemas = tp ? types : schema;
		prompt.start();
		prompt.get(schemas, function(err, result){
			if(err == null){
				resolve(result.date);
			}else{
				reject(err);
			}
		});
	});
}

/**
 * Запускаем промпт
 */
promptDialog(0).then(function(data){
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
	console.log('Start date:'.cyan.bold + " " + date.toString());
	/**
	 * Тип меню
	 */
	promptDialog(1).then(function(data){
		/**
		 * Выбор директории (диалоговое окно)
		 */
		typeMenu = data == 1 ? false : true;
		dialog(config).then(async function(direct){
			let dir = direct[0].replace(/\\/g, '/') + '/';
			console.log(dir.cyan.bold);
			let is_dir = await isDir(dir);
			if(is_dir) {
				/**
				 * Ресайз изображения
				 * Каждодневное меню width = 1134
				 * Десятидневное меню width = 1604
				 */
				readDirectory(dir).then(async function(images){
					if(await isDir(`${dir}pdf`)){
						fs.rmSync(`${dir}pdf`, { recursive: true, force: true });
					}
					let resize_dir = `${dir}resize/`,
						is_res_dir = await isDir(resize_dir);
					if(!is_res_dir){
						console.log('Create resize'.bold.yellow);
						fs.mkdirSync(resize_dir);
					}
					for(let image of images){
						let inputFile = `${dir}${image}`,
							outputFile = `${resize_dir}${image}`;
						console.log(`Resize ${inputFile} ...`.cyan.bold);
						await resize(inputFile, outputFile, typeMenu ? 1604 : 1134);
						console.log(`Resizeed image ${outputFile} DONE!`.bold.yellow);
					}
					
					/**
					 * Оптимизация изображений
					 */
					const mask = `${dir}resize/*.{jpg,png,jpeg,JPG,PNG,JPEG}`;
					console.log("Start compressed images...".bold.cyan);
					compress(mask, dir).then(function(res){
						console.log("Compressed images DONE!".bold.yellow);
						let outPdf = dir + "pdf/",
							imgs = dir + "png/";
						/**
						 * Генерация PDF файлов
						 */
						pdfGenerator(outPdf, imgs).then(function(pdfs){
							console.log(pdfs);
							// clear
							fs.rmSync(`${dir}resize`, { recursive: true, force: true });
							fs.rmSync(`${dir}png`, { recursive: true, force: true });
						}).catch(function(err){
							console.log("PDF Error!".bold.red);
							console.log(err);
							// clear
							//fs.rmSync(`${dir}resize`, { recursive: true, force: true });
							//fs.rmSync(`${dir}png`, { recursive: true, force: true });
						})
					}).catch(function(err){
						console.log("Compress Error!".bold.red);
						console.log(err);
						// clear
						//fs.rmSync(`${dir}resize`, { recursive: true, force: true });
						//fs.rmSync(`${dir}png`, { recursive: true, force: true });
					});
				}).catch(function(){
					console.log(`Error: ${dir}`.bold.red);
					// clear
					//fs.rmSync(`${dir}resize`, { recursive: true, force: true });
					//fs.rmSync(`${dir}png`, { recursive: true, force: true });
				})
			}
		}).catch(function(error){
			console.log(error)
			//fs.rmSync(`${dir}resize`, { recursive: true, force: true });
			//fs.rmSync(`${dir}png`, { recursive: true, force: true });
		});
	});
});