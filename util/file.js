const fs = require('fs');

const deleteFile = (filePath) => {
    if (filePath.startsWith('http')) {
        return Promise.resolve();
    }
    return new Promise((resolve, reject) => {
        fs.unlink(filePath, (err) => {
            if (err) {
                reject(err);
            } else {
                resolve();
            }
        });
    });
};

exports.deleteFile = deleteFile;