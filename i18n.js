const fs = require("fs");
const xlsx = require("node-xlsx");

const worksheets = xlsx.parse(`${__dirname}/i18n.xlsx`);
const cells = worksheets[0].data;
const i18n = JSON.parse(fs.readFileSync(`${__dirname}/assets/i18n.json`, "utf8"));

cells.forEach(row => {
    const key = row[0].trim();

    if (key) {
        i18n.ru[key] = row[1];
        i18n.en[key] = row[2];
        i18n.he[key] = row[3];
        i18n.ro[key] = row[4];
    }
});

fs.writeFileSync(`${__dirname}/i18n.json`, JSON.stringify(i18n));

