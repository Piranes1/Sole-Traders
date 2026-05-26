const bcrypt = require('bcrypt');

// Hashes with salt plaintext password
exports.hashPassword = async function(password) {
    const saltRounds = 12;
    return await bcrypt.hash(password, saltRounds);
};

// Compares passwords - bcrypt takes the plain text password and re-hashes it using same salt and algorithm
exports.comparePassword = async function(password, hashedPassword) {
    return await bcrypt.compare(password, hashedPassword);
};
