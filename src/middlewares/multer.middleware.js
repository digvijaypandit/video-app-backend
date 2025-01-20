import multer from 'multer'

const storage = multer.diskStorage({
    destination: function (req, file, cb) {
      cb(null, './public/temp')
    },
    filename: function (req, file, cb) {
      cb(null, file.originalname)
    }
  })

  const fileFilter = (req, file, cb) => {
    // Accept image and video file types only
    const allowedTypes = ['image/jpeg', 'image/png', 'video/mp4', 'video/webm', 'video/avi'];
    if (allowedTypes.includes(file.mimetype)) {
        cb(null, true);  // Accept the file
    } else {
        cb(new Error('Invalid file type'), false);  // Reject the file
    }
};

export const upload = multer({ storage,fileFilter })
