# scan-images-menu2pdf
Конвертирование отсканированных листов каждодневного меню в файлы pdf.

### Параметры сканирования:
| Наименование     | Значение         |
| ---------------- | ---------------- |
| Цветовой формат  | Цветное          |
| Тип файла        | JPG (Файл "JPG") |
| Разрешение (DPI) | 300              |

### Описание
Обробатывается два типа меню. Каждодневное и Двухнедельное.
#### Формат данных в JSON
Каждодневное меню одного файла включает в себя два файла изображений. Двухнедельное состоит из одиннадцати файлов изображений. Править можно под себя.   
Файл для правки [menu.json](https://github.com/KSOSH/scan-images-menu2pdf/blob/main/menu.json).   
<details>
	<summary><u><strong>Формат данных в JSON</strong>s</u></summary>

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
## Этапы работы программы

![Выбор даты](/KSOSH/scan-images-menu2pdf/blob/main/assets/screenshots/0001.png?raw=true "Выбор даты")

![Определение типа меню](/KSOSH/scan-images-menu2pdf/blob/main/assets/screenshots/0002.png?raw=true "Определение типа меню")

![Выбор папки с изображениями](/KSOSH/scan-images-menu2pdf/blob/main/assets/screenshots/0003.png?raw=true "Выбор папки с изображениями")

![Старт программы](/KSOSH/scan-images-menu2pdf/blob/main/assets/screenshots/0004.png?raw=true "Старт программы")

![Выполнение программы](/KSOSH/scan-images-menu2pdf/blob/main/assets/screenshots/0005.png?raw=true "Выполнение программы")

![Дирректория с полученными PDF файлами](/KSOSH/scan-images-menu2pdf/blob/main/assets/screenshots/0006.png?raw=true "Дирректория с полученными PDF файлами")
