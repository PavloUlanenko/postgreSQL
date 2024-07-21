const convertToPascalCase = (str) => {
    return str.replace(/[-_][a-z]/gi, ($1) => {
        return $1.toUpperCase().replace('-', '').replace('_', '');
    });
};

const toCamelCase = (rows) => {
    return rows.map((row) => {
        const obj = {};
        for (let key in row) {
            obj[convertToPascalCase(key)] = row[key];
        }
        return obj;
    });
};

module.exports = {
    toCamelCase
};