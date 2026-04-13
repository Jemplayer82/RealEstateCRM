const multer = require('multer');
const path = require('path');
const fs = require('fs');

const ALLOWED_IMAGE_TYPES = ['image/jpeg', 'image/png', 'image/gif', 'image/webp'];
const ALLOWED_DOC_TYPES = [
    ...ALLOWED_IMAGE_TYPES,
    'application/pdf',
    'application/msword',
    'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    'application/vnd.ms-excel',
    'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
];
const ALLOWED_VIDEO_TYPES = ['video/mp4', 'video/webm', 'video/quicktime'];
const ALLOWED_MEDIA_TYPES = [...ALLOWED_IMAGE_TYPES, ...ALLOWED_VIDEO_TYPES];

const MAX_IMAGE_SIZE = 5 * 1024 * 1024;    // 5 MB
const MAX_DOC_SIZE   = 10 * 1024 * 1024;   // 10 MB
const MAX_VIDEO_SIZE = 50 * 1024 * 1024;   // 50 MB

function createFileFilter(allowedTypes) {
    return (req, file, cb) => {
        if (allowedTypes.includes(file.mimetype)) {
            cb(null, true);
        } else {
            cb(new Error(`File type "${file.mimetype}" not allowed.`), false);
        }
    };
}

function createUpload(destination, { allowedTypes = ALLOWED_DOC_TYPES, maxSize = MAX_DOC_SIZE } = {}) {
    return multer({
        storage: multer.diskStorage({
            destination: (req, file, cb) => {
                fs.mkdirSync(destination, { recursive: true });
                cb(null, destination);
            },
            filename: (req, file, cb) => {
                const uniqueSuffix = Date.now() + '-' + Math.round(Math.random() * 1e9);
                cb(null, uniqueSuffix + path.extname(file.originalname).toLowerCase());
            }
        }),
        fileFilter: createFileFilter(allowedTypes),
        limits: { fileSize: maxSize }
    });
}

module.exports = {
    createUpload,
    ALLOWED_IMAGE_TYPES,
    ALLOWED_DOC_TYPES,
    ALLOWED_VIDEO_TYPES,
    ALLOWED_MEDIA_TYPES,
    MAX_IMAGE_SIZE,
    MAX_DOC_SIZE,
    MAX_VIDEO_SIZE,
};
