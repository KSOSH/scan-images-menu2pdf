var date;

const fs = require('fs'),
	path = require('path'),
	colors = require('colors'),
	compress_images = require('compress-images'),
	dialog = require('node-file-dialog'),
	{ PDFDocument } =  require('./modules/pdf-lib/pdf-lib.js'),
	config = {type:'directory'};

var mapsFiles = [
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
	];


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
					command: ["-quality", "60"]
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
			var files = fs.readdirSync(imgs).filter(function(fn) {
				if(fn.endsWith('.jpg') || fn.endsWith('.jpeg') || fn.endsWith('.png') || fn.endsWith('.JPG') || fn.endsWith('.JPEG') || fn.endsWith('.PNG')){
					return true;
				}
				return false;
			});
			if(files.length){
				// Создать возможность переключения меню с обычного на 10-ти дневное
				/**
				 * created.
				 */

				/**
				 * done.
				 */
				let i = 0;
				// Кол-во файлов в файле PDF
				let c = 2;
				let k = 0;
				// Количество типов меню
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
					 * Изображение нужно уменьшить до 27.44%
					 */
					let pdfDims = pdfImage.scale(0.2744);
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
				resolve(String("Done create pdf`s files!").bold.yellow);
			}else{
				reject(String("Empty directory:").bold.red + " " + imgs);
			}
		}catch(e){
			reject(e);
		}
	});
}
/**
 * Старт промпта
 * Нужна дата
 */
var prompt = require('prompt');
var schema = {
	properties: {
		date: {
			pattern: /\d{4}-\d{2}-\d{2}$/,
			message: 'Введите дату. Формат записи даты yyyy-mm-dd',
			description: 'Введите дату. Формат записи даты yyyy-mm-dd',
			type: 'string',
			required: true
		},
	}
};
prompt.start();
/**
 * Запускаем промпт
 */
prompt.get(schema, function(err, result){
	if(err == null){
		/**
		 * Проверяем дату.
		 * Если что ни так, уж извените...)))
		 */
		date = new Date(result.date);
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
		 * Выбор директории (диалоговое окно)
		 */
		dialog(config).then(function(direct){
			let dir = direct[0].replace(/\\/g, '/') + '/';
			console.log(dir.cyan.bold);
			if(fs.existsSync(dir)) {
				const mask = `${dir}*.{jpg,png,jpeg,JPG,PNG,JPEG}`;
				console.log("Start compressed images...".bold.cyan);
				/**
				 * Оптимизация изображений
				 */
				compress(mask, dir).then(function(res){
					console.log("Compressed images DONE!".bold.yellow);
					let outPdf = dir + "pdf/",
						imgs = dir + "png/";
					/**
					 * Генерация PDF файлов
					 */
					pdfGenerator(outPdf, imgs).then(function(pdfs){
						console.log(pdfs)
					}).catch(function(err){
						console.log("PDF Error!".bold.red);
						console.log(err)
					})
				}).catch(function(err){
					console.log("Compress Error!".bold.red);
					console.log(err);
				});
			}
		}).catch(function(error){
			console.log(error)
		});
	}
});
