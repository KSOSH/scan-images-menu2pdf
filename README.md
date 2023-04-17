# scan-images-menu2pdf
Конвертирование отсканированных листов каждодневного меню в файлы pdf.

### Параметры сканирования:
| Наименование | Значение |
| --- | --- |
| Цветовой формат | Цветное |
| Тип файла | JPG (Файл "JPG") |
| Разрешение (DPI) | 300 |

### Описание
Обробатывается два типа меню. Каждодневное и Двухнедельное.

Каждодневное меню одного файла включает в себя два файла изображений. Двухнедельное состоит из одиннадцати файлов изображений. Править можно под себя. 
Файл для правки [menu.json](https://github.com/KSOSH/scan-images-menu2pdf/blob/main/menu.json). 
Формат данных в JSON:
<details>

  <summary>Spoiler warning</summary>

  

  Spoiler text. Note that it's important to have a space after the summary tag. You should be able to write any markdown you want inside the `<details>` tag... just make sure you close `<details>` afterward.

  

  ```javascript

  console.log("I'm a code block!");

  ```

  

</details>
<details>
	<summary>Формат данных в JSON</summary>
	
```json
[
	{
		"name": "Каждодневное меню",
		"files": 2,
		"size": 1134,
		"items": [
			{
				"title": "Меню питания для 1-4 классов",
				"sufix": "-1-4"
			},
			{
				"title": "Меню питания для учащихся с ОВЗ",
				"sufix": "-ovz"
			},
			{
				"title": "Индивидуальное меню питания",
				"sufix": "-ind"
			},
			{
				"title": "Меню питания для школьников",
				"sufix": ""
			},
			{
				"title": "Меню питания для детей мобилизованных родителей",
				"sufix": "-mob"
			}
		]
	},
	{
		"name": "Двухнедельное меню",
		"files": 2,
		"size": 1134,
		"items": [
			{
				"title": "Двухнедельное меню питания для 1-4 классов",
				"sufix": "-1-4"
			},
			{
				"title": "Двухнедельное меню питания для учащихся с ОВЗ",
				"sufix": "-ovz"
			},
			{
				"title": "Двухнедельное меню индивидуального питания",
				"sufix": "-ind"
			},
			{
				"title": "Двухнедельное меню питания для школьников",
				"sufix": ""
			},
			{
				"title": "Двухнедельное меню питания для детей мобилизованных родителей",
				"sufix": "-mob"
			}
		]
	}
]
```
</details>
Согласно JSON данных можно добавить ещё типы меню не правя код самого модуля, а правя только код файла `menu.json`. Внимательно следите за форматом JSON файла!!!

Обязательная установка Python не ниже версии 3.10.11 глобально для всех пользователей.

#### Так же установить в Python:
Tkinter (если его нет)
```Batchfile
$ pip install tk
```
tkcalendar
```Batchfile
$ pip install tkcalendar
```
### Дополнительные установки
Подключена обработка отсканированных изображений (ресайз) с помощю [**ImageMagick**](https://imagemagick.org/script/download.php) (скачать и установить от имени Администратора, проверить запуск magick)

Обработка оптимизации изображений осуществляется модулем [**compress-images**](https://github.com/semiromid/compress-images)

Создание PDF файлов посредством библиотеки [**pdf-lib**](https://pdf-lib.js.org/)

### Установка:
```Batchfile
$ git clone https://github.com/KSOSH/scan-images-menu2pdf.git
$ cd scan-images-menu2pdf
$ npm install
```
### Запуск
```Batchfile
$ node index.js
```
### Сборка проекта
```Batchfile
$ minify main.js > index.js
```
Должен быть установлен глобально пакет [**minify**](https://www.npmjs.com/package/minify)
### Тест проекта
```Batchfile
$ node main.js
```
