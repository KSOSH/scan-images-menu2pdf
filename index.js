var date;const fs=require("fs"),path=require("path"),colors=require("colors"),compress_images=require("compress-images"),{spawn:spawn,exec:exec}=require("child_process"),dialog=require("node-file-dialog"),{PDFDocument:PDFDocument}=require("./modules/pdf-lib/pdf-lib.js"),calendar=require("./modules/calendar/calendar.js"),typemenu=require("./modules/typemenu/typemenu.js"),config={type:"directory"};json=fs.readFileSync("menu.json"),jsonPars=JSON.parse(json),console.log("\n                            НАПОМИНАЕМ".red.bold+"\n                               ****".yellow.bold+"\n  Приложение не поддерживает русские символы в выбранной директории!\nУбедительная просьба, все изображения разместить в директории, в пути\n               которой не импользуются русские символы.\n\n                      Приносим свои извенения.\n                        Мы над этим работаем.\n".cyan.bold);let startTime,endTime,mapsFiles,dir="",typeMenu=!1;function openExplorerin(e,o){var n="";switch(require("os").platform().toLowerCase().replace(/[0-9]/g,"").replace("darwin","macos")){case"win":e=(e=(e=e||"=").replace(/\//g,"\\")).replace(/\\$/,""),n="explorer";break;case"linux":e=e||"/",n="xdg-open";break;case"macos":e=e||"/",n="open"}let r=require("child_process").spawn(n,[e]);r.on("error",(e=>(r.kill(),o(e))))}function isDir(e){return new Promise((function(o,n){try{fs.lstatSync(e).isDirectory()?o(!0):o(!1)}catch(e){o(!1)}}))}function readDirectory(e){return new Promise((function(o,n){o(fs.readdirSync(e).filter((function(e){return!!(e.endsWith(".jpg")||e.endsWith(".jpeg")||e.endsWith(".png")||e.endsWith(".JPG")||e.endsWith(".JPEG")||e.endsWith(".PNG"))})))}))}function resize(e,o,n){return new Promise((function(r,t){const s=spawn("magick",["convert",e,"-filter","Catrom","-resize",`${n}x`,"-quality","80",o]);s.stdout.on("data",(e=>{console.log(`stdout: ${e}`)})),s.stderr.on("data",(e=>{console.error(`stderr: ${e}`)})),s.on("close",(e=>{0==e?r(o):t(e)}))}))}function compress(e,o){return new Promise((function(n,r){compress_images(e,o+"png/",{compress_force:!0,statistic:!1,autoupdate:!0},!1,{jpg:{engine:"mozjpeg",command:["-quality","80"]}},{png:{engine:"pngquant",command:["--quality=20-50","-o"]}},{svg:{engine:"svgo",command:"--multipass"}},{gif:{engine:"gifsicle",command:["--colors","64","--use-col=web"]}},(function(e,o,t){console.log("Чтение изображения:".cyan.bold+` ${t.input} `),e?r(e):(console.log("Сжатие изображения:".bold.cyan+` ${t.path_out_new} `+"УСПЕШНО!".bold.yellow),o&&n(o))}))}))}function pdfGenerator(e,o){return new Promise((async function(n,r){await isDir(e)||fs.mkdirSync(e);try{var t=await readDirectory(o);if(t.length){mapsFiles=jsonPars[typeMenu].items;let r,s=0,i=jsonPars[typeMenu].files,l=0,c=mapsFiles.length;for(let n of t){let t=o+n,a=path.extname(n);a=a.toLowerCase();let d,g=await fs.readFileSync(t);0==s&&(console.log("Создаём PDF документ...".bold.cyan),r=await PDFDocument.create()),".jpg"==a||".jpeg"==a?d=await r.embedJpg(g):".png"==a&&(d=await r.embedPng(g));let u=d.scale(.7);if(r.addPage([u.width,u.height]).drawImage(d,{x:0,y:0,width:u.width,height:u.height}),++s,s==i){r.setAuthor(jsonPars[typeMenu].creator),r.setCreator(jsonPars[typeMenu].creator),r.setProducer(jsonPars[typeMenu].creator);let o=date.getDate(),n=date.getMonth()+1,t=date.getFullYear(),i=o<10?`0${o}`:o;n=n<10?`0${n}`:n;let a=`${i}.${n}.${t}`;await isDir(e+a+"/")||(fs.mkdirSync(e+a+"/"),console.log("Директория создана:".bold.cyan+" "+(e+a+"/").bold.yellow)),r.setTitle(mapsFiles[l].title+" на "+a),r.setKeywords([mapsFiles[l].title+" на "+a]),r.setSubject(mapsFiles[l].title+" на "+a),r.setCreationDate(new Date),r.setModificationDate(new Date);let d=await r.save(),g=`${a}${mapsFiles[l].sufix}.pdf`;fs.writeFileSync(e+a+"/"+g,d),console.log(String("     Запись в файл:").bold.cyan+" "+g+" УСПЕШНО!".bold.yellow),++l,l==c&&(day=date.getDay(),5==day?day=3:day=1,l=0,date.setDate(o+day)),s=0}}openExplorerin(e,(function(){})),n(String("\nВсе PDF файлы созданы!\n").bold.yellow)}else r(String("Директория пустая:").bold.red+" "+o)}catch(e){r(e)}}))}calendar().then((async function(e){if(""==e)return void console.log("Вы не указали дату".red.bold);let o=(date=new Date(e)).getDay();o=6==o?2:0==o?1:0,date.setDate(date.getDate()+o),typemenu(json).then((async function(e){typeMenu=parseInt(e),dialog(config).then((async function(e){dir=path.normalize(e[0]),dir=dir.replace(/\\/g,"/")+"/",await isDir(dir)&&readDirectory(dir).then((async function(e){startTime=(new Date).getTime(),await isDir(`${dir}pdf`)&&(console.log("Удаляем директорию с PDF файлами".bold.yellow),fs.rmSync(`${dir}pdf`,{recursive:!0,force:!0}));let o=`${dir}resize/`;await isDir(o)||fs.mkdirSync(o);for(let n of e){let e=`${dir}${n}`,r=`${o}${n}`;console.log("Чтение изображения:".cyan.bold+` ${e} `),await resize(e,r,jsonPars[typeMenu].size),console.log("Ресайз изображения:".bold.cyan+` ${r} `+"УСПЕШНО!".bold.yellow)}const n=`${dir}resize/*.{jpg,png,jpeg,JPG,PNG,JPEG}`;console.log("Старт оптимизации изображений...".bold.yellow),compress(n,dir).then((function(e){console.log("Все изображения оптимизированы!".bold.yellow),pdfGenerator(dir+"pdf/",dir+"png/").then((function(e){console.log(e),console.log("Удаление директорий с оптимизированными изображениями...".bold.yellow),fs.rmSync(`${dir}resize`,{recursive:!0,force:!0}),fs.rmSync(`${dir}png`,{recursive:!0,force:!0}),endTime=(new Date).getTime();let o=endTime-startTime;o=parseFloat(o/1e3).toFixed(2),console.log(" "),console.log("Затраченное время в секундах:".bold.yellow+" "+o+"s"),console.log(" ")})).catch((function(e){console.log("Ошибка при генерации PDF!".bold.red),console.log(e),fs.rmSync(`${dir}resize`,{recursive:!0,force:!0}),fs.rmSync(`${dir}png`,{recursive:!0,force:!0}),console.log("Удаление директорий с оптимизированными изображениями...".bold.yellow),console.log(" ")}))})).catch((function(e){console.log("Ошибка оптимизации изображений!".bold.red),console.log(e),console.log("Удаление директорий с оптимизированными изображениями...".bold.yellow),fs.rmSync(`${dir}resize`,{recursive:!0,force:!0}),fs.rmSync(`${dir}png`,{recursive:!0,force:!0}),console.log(" ")}))})).catch((function(e){console.log(`Ошибка!: ${dir}`.bold.red),console.log(e),console.log("Удаление директорий с оптимизированными изображениями...".bold.yellow),fs.rmSync(`${dir}resize`,{recursive:!0,force:!0}),fs.rmSync(`${dir}png`,{recursive:!0,force:!0}),console.log(" ")}))})).catch((function(e){console.log(`Ошибка!: ${dir}`.bold.red),console.log(e),console.log("Удаление директорий с оптимизированными изображениями...".bold.yellow),fs.rmSync(`${dir}resize`,{recursive:!0,force:!0}),fs.rmSync(`${dir}png`,{recursive:!0,force:!0}),console.log(" ")}))}))}));
