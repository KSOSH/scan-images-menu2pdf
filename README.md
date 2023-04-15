# scan-images-menu2pdf
Конвертирование отсканированных листов каждодневного меню в файлы pdf.

Обробатывается два типа меню. Каждодневное и Двухнедельное.

Каждодневное меню одного файла включает в себя два файла изображений. Двухнедельное состоит из одиннадцати файлов изображений. Править можно под себя.

Подключена обработка отсканированных изображений (ресайз) с помощю [**ImageMagick**](https://imagemagick.org/script/download.php) (скачать и установить от имени Администратора, проверить запуск magick)

Обработка оптимизации изображений осуществляется модулем [**compress-images**](https://github.com/semiromid/compress-images)

Создание PDF файлов посредством библиотеки [**pdf-lib**](https://pdf-lib.js.org/)

### Установка:
```
$ git clone https://github.com/KSOSH/scan-images-menu2pdf.git
$ cd scan-images-menu2pdf
$ npm install
```
### Запуск
```
$ node index.js
```
### Сборка проекта
```
$ minify main.js > index.js
```
Должен быть установлен глобально пакет [**minify**](https://www.npmjs.com/package/minify)
### Тест проекта
```
$ node main.js
```
