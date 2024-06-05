import * as fs from 'fs';
import * as path from 'path';
import ffmpeg from 'fluent-ffmpeg';

function findAudio(dir: string): string[] {
   const exts = ['.mp3', '.ogg', '.flac', '.m4a', '.wav'];
   const files: string[] = [];
   fs.readdirSync(dir).forEach(filename=>{
      const fullPath = path.resolve(dir, filename);
      const stat = fs.statSync(fullPath);
      if( stat && stat.isDirectory() ) files.push(...findAudio(fullPath));
      else if( stat && stat.isFile() && exts.includes(path.extname(filename).toLowerCase()) ) files.push(fullPath);
   });
   return files;
}

function convertAudio(files: string[], dest: string) {
   files.forEach(fullpath=>{
      const ext = path.extname(fullpath);
      const name = path.basename(fullpath, ext);
      ffmpeg(fullpath)
         .output(path.resolve(dest, name + '.ogg'))
         .run();
   })
}

const sfxResourcePath = path.resolve('resources', 'sfx');
const sfxPublicPath = path.resolve('public', 'sfx');
if (!fs.existsSync(sfxPublicPath)) fs.mkdirSync(sfxPublicPath);
convertAudio(findAudio(sfxResourcePath), sfxPublicPath);
