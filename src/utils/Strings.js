import LocalizedStrings from "react-localization";
import { string } from "prop-types";

const i18n = require("../assets/i18n");
const strings = new LocalizedStrings(i18n);

strings.getCategory = category => {
    switch (category) {
        case "Повар":
            return strings["cook"];
        case "Официант":
            return strings["waiter"];
        case "Уборщик":
            return strings["cleaner"];
        case "Бармен":
            return strings["bartender"];
        case "Суши мен":
            return strings['sushi_men'];
        case "Пас мен":
            return strings['pas_men'];
        case "Помощник":
            return strings['assistant'];
        case "Холодная кухня":
            return strings['cold_kitchen'];
        case "Горячая кухня":
            return strings['hot_kitchen'];
        case "Мясник":
            return strings['butcher'];
        case "Кондитер":
            return strings['confectioner'];
        case "Молочная кухня":
            return strings['dairy_cuisine'];
        case "Пекарь":
            return strings['baker'];
        case "Су-шеф":
            return strings['sous_chef'];
        case "Шеф":
            return strings['chef'];
        case "Работа за границей":
            return strings['work_abroad'];
        case "Гриль":
            return strings['grill'];
        case "Старший по смене":
            return strings['swift_supervisor'];
        case "Хостес":
            return strings['hostess'];

        // ===== New categories =====
        case "Ресторан":
            return strings["direction_restaurant"];
        case "Повар":
            return strings["category_cook"];
        case "Мойщик посуды":
            return strings["category_dishwasher"];
        case "Официант":
            return strings["category_waiter"];
        case "Кондитер":
            return strings["category_confectioner"];
        case "Уборка":
            return strings["direction_cleaning"];
        case "Разнорабочий":
            return strings["category_handyman"];
        case "Перевозки":
            return strings["direction_transportation"];
        case "Крановщик":
            return strings["category_hoistman"];
        case "Общие перевозки":
            return strings["category_general_transportation"];
        case "Склады":
            return strings["direction_warehouse"];
        case "Погрузчик":
            return strings["category_loader"];
        case "Сборщик":
            return strings["category_adjuster"];
        case "Кладовщик":
            return strings["category_storekeeper"];
        case "Ремонт":
            return strings["direction_building"];
        case "Гипсокартон":
            return strings["category_drywall"];
        case "Слесарь":
            return strings["category_locksmith"];
        case "Маляр":
            return strings["category_painter"];
        case "Столяр":
            return strings["category_carpenter"];
        case "Сварщик":
            return strings["category_welder"];
        case "Плиточник":
            return strings["category_tiler"];
        case "Бухгалтерия":
            return strings["direction_bookkeeping"];
        case "Главбух":
            return strings["category_chief_accountant"];
        case "Счетовод":
            return strings["category_accountant"];
        case "Отели":
            return strings["direction_hotels"];
        case "Администратор":
            return strings["category_administrator"];
        case "Горничная":
            return strings["category_housemaid"];
        case "Разнорабочие без опыта":
            return strings["direction_no_experience"];
        case "Разное":
            return strings["category_sundry"];
        case "Водитель категории \"Б\"":
            return strings["category_driver_b"];
        case "Офисная работа":
            return strings["category_office"];
        case "Доставщик":
            return strings["category_deliveryman"];
        case "Кассир":
            return strings["category_cashier"];
        case "Почтальон":
            return strings["category_postman"];
        case "Уборщик":
            return strings["category_cleaner"];
        case "Грузчик":
            return strings["category_mover"];
        case "Няня":
            return strings["category_nanny"];

        default:
            return category;
    }
};

strings.getRegion = region => {
    switch (region) {
        case "centre":
            return strings["centre"];
        case "jerusalem":
        case "region_jerusalem":
            return strings["region_jerusalem"];
        case "north":
            return strings["north"];
        case "sharon":
        case "region_sharon":
            return strings["region_sharon"];
        case "south":
            return strings["south"];
        case "arava":
        case "region_arava":
            return strings["region_arava"];
        default:
            return region;
    }
}

strings.getRole = role => {
    switch(role){
        case "Performer":
        case "performer":
            return strings["performer"]
        case "Employer":
        case "creator":
            return strings["creator"]
    }
}

export default strings;