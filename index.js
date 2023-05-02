var date;const fs=require("fs"),path=require("path"),colors=require("colors"),compress_images=require("compress-images"),{spawn:spawn,exec:exec}=require("child_process"),{PDFDocument:PDFDocument}=require("./modules/pdf-lib/pdf-lib.js"),dialogs=require("./modules/dialogs/dialogs.js"),json=fs.readFileSync("menu.json"),jsonPars=JSON.parse(json);let startTime,endTime,mapsFiles,jsonType=[],dir="",typeMenu=!1;for(let e of jsonPars)jsonType.push({name:e.name});function openExplorerin(e,o){var n="";switch(require("os").platform().toLowerCase().replace(/[0-9]/g,"").replace("darwin","macos")){case"win":e=(e=(e=e||"=").replace(/\//g,"\\")).replace(/\\$/,""),n="explorer";break;case"linux":e=e||"/",n="xdg-open";break;case"macos":e=e||"/",n="open"}let r=require("child_process").spawn(n,[e]);r.on("error",(e=>(r.kill(),o(e))))}function isDir(e){return new Promise((function(o,n){try{fs.lstatSync(e).isDirectory()?o(!0):o(!1)}catch(e){o(!1)}}))}function readDirectory(e){return new Promise((function(o,n){o(fs.readdirSync(e).filter((function(e){return!!(e.endsWith(".jpg")||e.endsWith(".jpeg")||e.endsWith(".png")||e.endsWith(".JPG")||e.endsWith(".JPEG")||e.endsWith(".PNG"))})))}))}function resize(e,o,n){return new Promise((function(r,s){const t=spawn("magick",["convert",e,"-filter","Catrom","-resize",`${n}x`,"-quality","80",o]);t.stdout.on("data",(e=>{console.log(`stdout: ${e}`)})),t.stderr.on("data",(e=>{console.error(`stderr: ${e}`)})),t.on("close",(e=>{0==e?r(o):s(e)}))}))}function compress(e,o){return new Promise((function(n,r){compress_images(e,o+"png/",{compress_force:!0,statistic:!1,autoupdate:!0},!1,{jpg:{engine:"mozjpeg",command:["-quality","80"]}},{png:{engine:"pngquant",command:["--quality=20-50","-o"]}},{svg:{engine:"svgo",command:"--multipass"}},{gif:{engine:"gifsicle",command:["--colors","64","--use-col=web"]}},(function(e,o,s){console.log("Чтение изображения:".cyan.bold+` ${s.input} `),e?r(e):(console.log("Сжатие изображения:".bold.cyan+` ${s.path_out_new} `+"УСПЕШНО!".bold.yellow),o&&n(o))}))}))}function pdfGenerator(e,o){return new Promise((async function(n,r){await isDir(e)||fs.mkdirSync(e);try{var s=await readDirectory(o);if(s.length){mapsFiles=jsonPars[typeMenu].items;let r=0,t=jsonPars[typeMenu].files;const i=jsonPars[typeMenu].format;let l,a=0,c=mapsFiles.length;for(let n of s){let s=o+n,d=path.extname(n);d=d.toLowerCase();let p,g=await fs.readFileSync(s);0==r&&(console.log("Создаём PDF документ...".bold.cyan),l=await PDFDocument.create()),".jpg"==d||".jpeg"==d?p=await l.embedJpg(g):".png"==d&&(p=await l.embedPng(g));let u=p.scale(.7);if(l.addPage([u.width,u.height]).drawImage(p,{x:0,y:0,width:u.width,height:u.height}),++r,r==t){l.setAuthor(jsonPars[typeMenu].author),l.setProducer(jsonPars[typeMenu].produser),l.setCreator("https://github.com/Hopding/pdf-lib https://github.com/KSOSH/scan-images-menu2pdf");let o=date.getDate(),n=date.getMonth()+1,s=date.getFullYear(),t=o<10?`0${o}`:o;n=n<10?`0${n}`:n;let d=`${t}.${n}.${s}`,p=i.replace("%d",t).replace("%m",n).replace("%y",s);!await isDir(`${e}${d}/`)&&jsonPars[typeMenu].multidir&&(fs.mkdirSync(`${e}${d}/`),console.log("Директория создана:".bold.cyan+" "+`${e}${d}/`.bold.yellow)),l.setTitle(mapsFiles[a].title+" на "+d),l.setKeywords([mapsFiles[a].title+" на "+d]),l.setSubject(mapsFiles[a].title+" на "+d),l.setCreationDate(new Date),l.setModificationDate(new Date);let g=await l.save(),u=`${p}${mapsFiles[a].sufix}.pdf`;d=jsonPars[typeMenu].multidir?`${d}/`:"",console.log(`${e}${d}${u}`),fs.writeFileSync(`${e}${d}${u}`,g),console.log(String("     Запись в файл:").bold.cyan+" "+u+" УСПЕШНО!".bold.yellow),++a,a==c&&(day=date.getDay(),5==day?day=3:day=1,a=0,date.setDate(o+day)),r=0}}openExplorerin(e,(function(){})),n(String("\nВсе PDF файлы созданы!\n").bold.yellow)}else r(String("Директория пустая:").bold.red+" "+o)}catch(e){r(e)}}))}dialogs(jsonType).then((async function(e){if(e=JSON.parse(e),parseInt(e.typemenu)>-1&&"None"!=e.directory&&e.data.length){typeMenu=parseInt(e.typemenu),dir=e.directory+"/";let o=(date=new Date(e.data)).getDay();o=6==o?2:0==o?1:0,date.setDate(date.getDate()+o),await isDir(dir)&&readDirectory(dir).then((async function(e){startTime=(new Date).getTime(),await isDir(`${dir}pdf`)&&(console.log("Удаляем директорию с PDF файлами".bold.yellow),fs.rmSync(`${dir}pdf`,{recursive:!0,force:!0}));let o,n=`${dir}resize/`;switch(await isDir(n)||fs.mkdirSync(n),jsonPars[typeMenu].size){case"portrait":default:o=1130;break;case"landscape":o=1600}for(let r of e){let e=`${dir}${r}`,s=`${n}${r}`;console.log("Чтение изображения:".cyan.bold+` ${e} `),await resize(e,s,o),console.log("Ресайз изображения:".bold.cyan+` ${s} `+"УСПЕШНО!".bold.yellow)}const r=`${dir}resize/*.{jpg,png,jpeg,JPG,PNG,JPEG}`;console.log("Старт оптимизации изображений...".bold.yellow),compress(r,dir).then((function(e){console.log("Все изображения оптимизированы!".bold.yellow),pdfGenerator(dir+"pdf/",dir+"png/").then((function(e){console.log(e),console.log("Удаление директорий с оптимизированными изображениями...".bold.yellow),fs.rmSync(`${dir}resize`,{recursive:!0,force:!0}),fs.rmSync(`${dir}png`,{recursive:!0,force:!0}),endTime=(new Date).getTime();let o=endTime-startTime;o=parseFloat(o/1e3).toFixed(2),console.log(" "),console.log("Затраченное время в секундах:".bold.yellow+" "+o+"s"),console.log(" ")})).catch((function(e){console.log("Ошибка при генерации PDF!".bold.red),console.log(e),fs.rmSync(`${dir}resize`,{recursive:!0,force:!0}),fs.rmSync(`${dir}png`,{recursive:!0,force:!0}),console.log("Удаление директорий с оптимизированными изображениями...".bold.yellow),console.log(" ")}))})).catch((function(e){console.log("Ошибка оптимизации изображений!".bold.red),console.log(e),console.log("Удаление директорий с оптимизированными изображениями...".bold.yellow),fs.rmSync(`${dir}resize`,{recursive:!0,force:!0}),fs.rmSync(`${dir}png`,{recursive:!0,force:!0}),console.log(" ")}))})).catch((function(e){console.log(`Ошибка!: ${dir}`.bold.red),console.log(e),console.log("Удаление директорий с оптимизированными изображениями...".bold.yellow),fs.rmSync(`${dir}resize`,{recursive:!0,force:!0}),fs.rmSync(`${dir}png`,{recursive:!0,force:!0}),console.log(" ")}))}else console.log("Завершено пользователем".bold.yellow)})).catch((e=>{console.log("Ошибка!".bold.red),console.log(e)}));
