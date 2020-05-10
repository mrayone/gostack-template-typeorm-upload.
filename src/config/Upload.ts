import multer from 'multer';
import path from 'path';
import crypto from 'crypto';

const tmpDir = path.resolve('../', '../', 'tmp');
export default {
  homeDir: tmpDir,
  storage: multer.diskStorage({
    destination: tmpDir,
    filename(request, file, callback) {
      const fileHash = crypto.randomBytes(10).toString('HEX');
      const fileName = `${fileHash}-${file.originalname}`;

      callback(null, fileName);
    },
  }),
};
