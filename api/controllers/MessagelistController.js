/**
 * MessagelistController
 *
 * @description :: Server-side logic for managing Messagelists
 * @help        :: See http://sailsjs.org/#!/documentation/concepts/Controllers
 */
var twilio = require('twilio');
var moment = require("moment");
var cc = require('currency-codes');

// var data = require('./assests/data/ccode');

const VoiceResponse = require('twilio').twiml.VoiceResponse;

module.exports = {

  messageLists: function (req, res) {

    var reqData = {};

    reqData['commonvalidation'] = [
        "mobilnumberrequired",
        "useridrequired",
        "verificationcoderequired",
        "groupidrequired",
        "eventidrequired",
      ],

      reqData['responses'] = [
        "somethingwentwrong",
        "servererror"
      ],

      reqData['user'] = [
        "verificationcodesent",
        "wrongVerificationcode",
        "verificationsucess",
        "usernotexist",
        "userupdatesucess",
        "resenterificationcode",
        "usercreated",
        "userlist",
        "userdetail",
        "userblocksuccess",
        "userunblockuccess",
        "blockeduserlist",
        "blockedusernotfound",
        "userblocked",
        "usermutesuccess",
        "userunmutesuccess",
      ],

      reqData['contacts'] = [
        "contactnotexist",
        "contactaddsuccess",
        "contactfetchsuccess",
        "invitesuccess"
      ],

      reqData['usersettings'] = [
        "usersettingsnotexist",
        "usersettingsaddsuccess",
        "usersettingsfetchsuccess"
      ],

      reqData['groups'] = [
        "groupnotexist",
        "groupcreatesuccess",
        "groupfetchsuccess",
        "groupjoinsuccess",
        "groupjoinrequestsuccess",
        "groupleavesuccess",
        "groupremovedsuccess",
        "memberrequestnotexist",
        "memberrequestlist",
        "memberrequestrejected",
        "groupmutesuccess",
        "groupunmutesuccess",
        "groupmessageidfetchsuccess"
      ],

      reqData['chat'] = [
        "chatmessagesuccess",
        "chathistoryfetch",
        "usertypingmessage",
        "chatDetail",
        "chatstatusupdate",
        "chatnotexist",
      ],

      res.send({
        message: "message code listing",
        data: reqData
      });

  },

  currencyCodeLists: function (req, res) {

    var currencycodes = [{
      code: 'AED',
      number: '784',
      currency: 'United Arab Emirates dirham',
      countries: ['united arab emirates']
    }, {
      code: 'AFN',
      number: '971',
      currency: 'Afghan afghani',
      countries: ['afghanistan']
    }, {
      code: 'ALL',
      number: '008',
      currency: 'Albanian lek',
      countries: ['albania']
    }, {
      code: 'AMD',
      number: '051',
      currency: 'Armenian dram',
      countries: ['armenia']
    }, {
      code: 'ANG',
      number: '532',
      currency: 'Netherlands Antillean guilder',
      countries: ['curaçao', 'sint maarten']
    }, {
      code: 'AOA',
      number: '973',
      currency: 'Angolan kwanza',
      countries: ['angola']
    }, {
      code: 'ARS',
      number: '032',
      currency: 'Argentine peso',
      countries: ['argentina']
    }, {
      code: 'AUD',
      number: '036',
      currency: 'Australian dollar',
      countries: ['australia', 'australian antarctic territory', 'christmas island', 'cocos (keeling) islands', 'heard and mcdonald islands', 'kiribati', 'nauru', 'norfolk island', 'tuvalu']
    }, {
      code: 'AWG',
      number: '533',
      currency: 'Aruban florin',
      countries: ['aruba']
    }, {
      code: 'AZN',
      number: '944',
      currency: 'Azerbaijani manat',
      countries: ['azerbaijan']
    }, {
      code: 'BAM',
      number: '977',
      currency: 'Bosnia and Herzegovina convertible mark',
      countries: ['bosnia and herzegovina']
    }, {
      code: 'BBD',
      number: '052',
      currency: 'Barbados dollar',
      countries: ['barbados']
    }, {
      code: 'BDT',
      number: '050',
      currency: 'Bangladeshi taka',
      countries: ['bangladesh']
    }, {
      code: 'BGN',
      number: '975',
      currency: 'Bulgarian lev',
      countries: ['bulgaria']
    }, {
      code: 'BHD',
      number: '048',
      currency: 'Bahraini dinar',
      countries: ['bahrain']
    }, {
      code: 'BIF',
      number: '108',
      currency: 'Burundian franc',
      countries: ['burundi']
    }, {
      code: 'BMD',
      number: '060',
      currency: 'Bermudian dollar',
      countries: ['bermuda']
    }, {
      code: 'BND',
      number: '096',
      currency: 'Brunei dollar',
      countries: ['brunei', 'singapore']
    }, {
      code: 'BOB',
      number: '068',
      currency: 'Boliviano',
      countries: ['bolivia']
    }, {
      code: 'BOV',
      number: '984',
      currency: 'Bolivian Mvdol (funds code)',
      countries: ['bolivia']
    }, {
      code: 'BRL',
      number: '986',
      currency: 'Brazilian real',
      countries: ['brazil']
    }, {
      code: 'BSD',
      number: '044',
      currency: 'Bahamian dollar',
      countries: ['bahamas']
    }, {
      code: 'BTN',
      number: '064',
      currency: 'Bhutanese ngultrum',
      countries: ['bhutan']
    }, {
      code: 'BWP',
      number: '072',
      currency: 'Botswana pula',
      countries: ['botswana']
    }, {
      code: 'BYR',
      number: '974',
      currency: 'Belarusian ruble',
      countries: ['belarus']
    }, {
      code: 'BZD',
      number: '084',
      currency: 'Belize dollar',
      countries: ['belize']
    }, {
      code: 'CAD',
      number: '124',
      currency: 'Canadian dollar',
      countries: ['canada', 'saint pierre and miquelon']
    }, {
      code: 'CDF',
      number: '976',
      currency: 'Congolese franc',
      countries: ['democratic republic of congo']
    }, {
      code: 'CHE',
      number: '947',
      currency: 'WIR Euro (complementary currency)',
      countries: ['switzerland']
    }, {
      code: 'CHF',
      number: '756',
      currency: 'Swiss franc',
      countries: ['switzerland', 'liechtenstein']
    }, {
      code: 'CHW',
      number: '948',
      currency: 'WIR Franc (complementary currency)',
      countries: ['switzerland']
    }, {
      code: 'CLF',
      number: '990',
      currency: 'Unidad de Fomento (funds code)',
      countries: ['chile']
    }, {
      code: 'CLP',
      number: '152',
      currency: 'Chilean peso',
      countries: ['chile']
    }, {
      code: 'CNY',
      number: '156',
      currency: 'Chinese yuan',
      countries: ['china']
    }, {
      code: 'COP',
      number: '170',
      currency: 'Colombian peso',
      countries: ['colombia']
    }, {
      code: 'COU',
      number: '970',
      currency: 'Unidad de Valor Real',
      countries: ['colombia']
    }, {
      code: 'CRC',
      number: '188',
      currency: 'Costa Rican colon',
      countries: ['costa rica']
    }, {
      code: 'CUC',
      number: '931',
      currency: 'Cuban convertible peso',
      countries: ['cuba']
    }, {
      code: 'CUP',
      number: '192',
      currency: 'Cuban peso',
      countries: ['cuba']
    }, {
      code: 'CVE',
      number: '132',
      currency: 'Cape Verde escudo',
      countries: ['cape verde']
    }, {
      code: 'CZK',
      number: '203',
      currency: 'Czech koruna',
      countries: ['czech republic']
    }, {
      code: 'DJF',
      number: '262',
      currency: 'Djiboutian franc',
      countries: ['djibouti']
    }, {
      code: 'DKK',
      number: '208',
      currency: 'Danish krone',
      countries: ['denmark', 'faroe islands', 'greenland']
    }, {
      code: 'DOP',
      number: '214',
      currency: 'Dominican peso',
      countries: ['dominican republic']
    }, {
      code: 'DZD',
      number: '012',
      currency: 'Algerian dinar',
      countries: ['algeria']
    }, {
      code: 'EGP',
      number: '818',
      currency: 'Egyptian pound',
      countries: ['egypt', 'palestinian territories']
    }, {
      code: 'ERN',
      number: '232',
      currency: 'Eritrean nakfa',
      countries: ['eritrea']
    }, {
      code: 'ETB',
      number: '230',
      currency: 'Ethiopian birr',
      countries: ['ethiopia']
    }, {
      code: 'EUR',
      number: '978',
      currency: 'Euro',
      countries: ['andorra', 'austria', 'belgium', 'cyprus', 'estonia', 'finland', 'france', 'germany', 'greece', 'ireland', 'italy', 'kosovo', 'luxembourg', 'malta', 'monaco', 'montenegro', 'netherlands', 'portugal', 'san marino', 'slovakia', 'slovenia', 'spain', 'vatican city']
    }, {
      code: 'FJD',
      number: '242',
      currency: 'Fiji dollar',
      countries: ['fiji']
    }, {
      code: 'FKP',
      number: '238',
      currency: 'Falkland Islands pound',
      countries: ['falkland islands']
    }, {
      code: 'GBP',
      number: '826',
      currency: 'Pound sterling',
      countries: ['united kingdom', 'british crown dependencies (the  isle of man and the channel islands)', 'south georgia and the south sandwich islands', 'british antarctic territory', 'british indian ocean territory']
    }, {
      code: 'GEL',
      number: '981',
      currency: 'Georgian lari',
      countries: ['georgia']
    }, {
      code: 'GHS',
      number: '936',
      currency: 'Ghanaian cedi',
      countries: ['ghana']
    }, {
      code: 'GIP',
      number: '292',
      currency: 'Gibraltar pound',
      countries: ['gibraltar']
    }, {
      code: 'GMD',
      number: '270',
      currency: 'Gambian dalasi',
      countries: ['gambia']
    }, {
      code: 'GNF',
      number: '324',
      currency: 'Guinean franc',
      countries: ['guinea']
    }, {
      code: 'GTQ',
      number: '320',
      currency: 'Guatemalan quetzal',
      countries: ['guatemala']
    }, {
      code: 'GYD',
      number: '328',
      currency: 'Guyanese dollar',
      countries: ['guyana']
    }, {
      code: 'HKD',
      number: '344',
      currency: 'Hong Kong dollar',
      countries: ['hong kong', 'macao']
    }, {
      code: 'HNL',
      number: '340',
      currency: 'Honduran lempira',
      countries: ['honduras']
    }, {
      code: 'HRK',
      number: '191',
      currency: 'Croatian kuna',
      countries: ['croatia']
    }, {
      code: 'HTG',
      number: '332',
      currency: 'Haitian gourde',
      countries: ['haiti']
    }, {
      code: 'HUF',
      number: '348',

      currency: 'Hungarian forint',
      countries: ['hungary']
    }, {
      code: 'IDR',
      number: '360',

      currency: 'Indonesian rupiah',
      countries: ['indonesia']
    }, {
      code: 'ILS',
      number: '376',

      currency: 'Israeli new shekel',
      countries: ['israel', 'palestinian territories']
    }, {
      code: 'INR',
      number: '356',

      currency: 'Indian rupee',
      countries: ['india']
    }, {
      code: 'IQD',
      number: '368',

      currency: 'Iraqi dinar',
      countries: ['iraq']
    }, {
      code: 'IRR',
      number: '364',

      currency: 'Iranian rial',
      countries: ['iran']
    }, {
      code: 'ISK',
      number: '352',

      currency: 'Icelandic króna',
      countries: ['iceland']
    }, {
      code: 'JMD',
      number: '388',

      currency: 'Jamaican dollar',
      countries: ['jamaica']
    }, {
      code: 'JOD',
      number: '400',

      currency: 'Jordanian dinar',
      countries: ['jordan']
    }, {
      code: 'JPY',
      number: '392',

      currency: 'Japanese yen',
      countries: ['japan']
    }, {
      code: 'KES',
      number: '404',

      currency: 'Kenyan shilling',
      countries: ['kenya']
    }, {
      code: 'KGS',
      number: '417',

      currency: 'Kyrgyzstani som',
      countries: ['kyrgyzstan']
    }, {
      code: 'KHR',
      number: '116',

      currency: 'Cambodian riel',
      countries: ['cambodia']
    }, {
      code: 'KMF',
      number: '174',

      currency: 'Comoro franc',
      countries: ['comoros']
    }, {
      code: 'KPW',
      number: '408',

      currency: 'North Korean won',
      countries: ['north korea']
    }, {
      code: 'KRW',
      number: '410',
      currency: 'South Korean won',
      countries: ['south korea']
    }, {
      code: 'KWD',
      number: '414',
      currency: 'Kuwaiti dinar',
      countries: ['kuwait']
    }, {
      code: 'KYD',
      number: '136',
      currency: 'Cayman Islands dollar',
      countries: ['cayman islands']
    }, {
      code: 'KZT',
      number: '398',
      currency: 'Kazakhstani tenge',
      countries: ['kazakhstan']
    }, {
      code: 'LAK',
      number: '418',
      currency: 'Lao kip',
      countries: ['laos']
    }, {
      code: 'LBP',
      number: '422',

      currency: 'Lebanese pound',
      countries: ['lebanon']
    }, {
      code: 'LKR',
      number: '144',
      currency: 'Sri Lankan rupee',
      countries: ['sri lanka']
    }, {
      code: 'LRD',
      number: '430',
      currency: 'Liberian dollar',
      countries: ['liberia']
    }, {
      code: 'LSL',
      number: '426',

      currency: 'Lesotho loti',
      countries: ['lesotho']
    }, {
      code: 'LTL',
      number: '440',

      currency: 'Lithuanian litas',
      countries: ['lithuania']
    }, {
      code: 'LVL',
      number: '428',

      currency: 'Latvian lats',
      countries: ['latvia']
    }, {
      code: 'LYD',
      number: '434',

      currency: 'Libyan dinar',
      countries: ['libya']
    }, {
      code: 'MAD',
      number: '504',

      currency: 'Moroccan dirham',
      countries: ['morocco']
    }, {
      code: 'MDL',
      number: '498',

      currency: 'Moldovan leu',
      countries: ['moldova (except  transnistria)']
    }, {
      code: 'MGA',
      number: '969',

      currency: '*[8]	Malagasy ariary',
      countries: ['madagascar']
    }, {
      code: 'MKD',
      number: '807',

      currency: 'Macedonian denar',
      countries: ['macedonia']
    }, {
      code: 'MMK',
      number: '104',

      currency: 'Myanma kyat',
      countries: ['myanmar']
    }, {
      code: 'MNT',
      number: '496',

      currency: 'Mongolian tugrik',
      countries: ['mongolia']
    }, {
      code: 'MOP',
      number: '446',

      currency: 'Macanese pataca',
      countries: ['macao']
    }, {
      code: 'MRO',
      number: '478',

      currency: '*[8]	Mauritanian ouguiya',
      countries: ['mauritania']
    }, {
      code: 'MUR',
      number: '480',

      currency: 'Mauritian rupee',
      countries: ['mauritius']
    }, {
      code: 'MVR',
      number: '462',

      currency: 'Maldivian rufiyaa',
      countries: ['maldives']
    }, {
      code: 'MWK',
      number: '454',

      currency: 'Malawian kwacha',
      countries: ['malawi']
    }, {
      code: 'MXN',
      number: '484',

      currency: 'Mexican peso',
      countries: ['mexico']
    }, {
      code: 'MXV',
      number: '979',

      currency: 'Mexican Unidad de Inversion (UDI) (funds code)',
      countries: ['mexico']
    }, {
      code: 'MYR',
      number: '458',

      currency: 'Malaysian ringgit',
      countries: ['malaysia']
    }, {
      code: 'MZN',
      number: '943',

      currency: 'Mozambican metical',
      countries: ['mozambique']
    }, {
      code: 'NAD',
      number: '516',

      currency: 'Namibian dollar',
      countries: ['namibia']
    }, {
      code: 'NGN',
      number: '566',

      currency: 'Nigerian naira',
      countries: ['nigeria']
    }, {
      code: 'NIO',
      number: '558',

      currency: 'Nicaraguan córdoba',
      countries: ['nicaragua']
    }, {
      code: 'NOK',
      number: '578',

      currency: 'Norwegian krone',
      countries: ['norway', 'svalbard', 'jan mayen', 'bouvet island', 'queen maud land', 'peter i island']
    }, {
      code: 'NPR',
      number: '524',

      currency: 'Nepalese rupee',
      countries: ['nepal']
    }, {
      code: 'NZD',
      number: '554',

      currency: 'New Zealand dollar',
      countries: ['cook islands', 'new zealand', 'niue', 'pitcairn', 'tokelau', 'ross dependency']
    }, {
      code: 'OMR',
      number: '512',

      currency: 'Omani rial',
      countries: ['oman']
    }, {
      code: 'PAB',
      number: '590',

      currency: 'Panamanian balboa',
      countries: ['panama']
    }, {
      code: 'PEN',
      number: '604',

      currency: 'Peruvian nuevo sol',
      countries: ['peru']
    }, {
      code: 'PGK',
      number: '598',

      currency: 'Papua New Guinean kina',
      countries: ['papua new guinea']
    }, {
      code: 'PHP',
      number: '608',

      currency: 'Philippine peso',
      countries: ['philippines']
    }, {
      code: 'PKR',
      number: '586',

      currency: 'Pakistani rupee',
      countries: ['pakistan']
    }, {
      code: 'PLN',
      number: '985',

      currency: 'Polish złoty',
      countries: ['poland']
    }, {
      code: 'PYG',
      number: '600',

      currency: 'Paraguayan guaraní',
      countries: ['paraguay']
    }, {
      code: 'QAR',
      number: '634',

      currency: 'Qatari riyal',
      countries: ['qatar']
    }, {
      code: 'RON',
      number: '946',

      currency: 'Romanian new leu',
      countries: ['romania']
    }, {
      code: 'RSD',
      number: '941',

      currency: 'Serbian dinar',
      countries: ['serbia']
    }, {
      code: 'RUB',
      number: '643',

      currency: 'Russian rouble',
      countries: ['russia', 'abkhazia', 'south ossetia']
    }, {
      code: 'RWF',
      number: '646',

      currency: 'Rwandan franc',
      countries: ['rwanda']
    }, {
      code: 'SAR',
      number: '682',

      currency: 'Saudi riyal',
      countries: ['saudi arabia']
    }, {
      code: 'SBD',
      number: '090',

      currency: 'Solomon Islands dollar',
      countries: ['solomon islands']
    }, {
      code: 'SCR',
      number: '690',

      currency: 'Seychelles rupee',
      countries: ['seychelles']
    }, {
      code: 'SDG',
      number: '938',

      currency: 'Sudanese pound',
      countries: ['sudan']
    }, {
      code: 'SEK',
      number: '752',

      currency: 'Swedish krona/kronor',
      countries: ['sweden']
    }, {
      code: 'SGD',
      number: '702',

      currency: 'Singapore dollar',
      countries: ['singapore', 'brunei']
    }, {
      code: 'SHP',
      number: '654',

      currency: 'Saint Helena pound',
      countries: ['saint helena']
    }, {
      code: 'SLL',
      number: '694',

      currency: 'Sierra Leonean leone',
      countries: ['sierra leone']
    }, {
      code: 'SOS',
      number: '706',

      currency: 'Somali shilling',
      countries: ['somalia']
    }, {
      code: 'SRD',
      number: '968',

      currency: 'Surinamese dollar',
      countries: ['suriname']
    }, {
      code: 'SSP',
      number: '728',

      currency: 'South Sudanese pound',
      countries: ['south sudan']
    }, {
      code: 'STD',
      number: '678',

      currency: 'São Tomé and Príncipe dobra',
      countries: ['são tomé and príncipe']
    }, {
      code: 'SYP',
      number: '760',

      currency: 'Syrian pound',
      countries: ['syria']
    }, {
      code: 'SZL',
      number: '748',

      currency: 'Swazi lilangeni',
      countries: ['swaziland']
    }, {
      code: 'THB',
      number: '764',

      currency: 'Thai baht',
      countries: ['thailand']
    }, {
      code: 'TJS',
      number: '972',

      currency: 'Tajikistani somoni',
      countries: ['tajikistan']
    }, {
      code: 'TMT',
      number: '934',

      currency: 'Turkmenistani manat',
      countries: ['turkmenistan']
    }, {
      code: 'TND',
      number: '788',

      currency: 'Tunisian dinar',
      countries: ['tunisia']
    }, {
      code: 'TOP',
      number: '776',

      currency: 'Tongan paʻanga',
      countries: ['tonga']
    }, {
      code: 'TRY',
      number: '949',

      currency: 'Turkish lira',
      countries: ['turkey', 'northern cyprus']
    }, {
      code: 'TTD',
      number: '780',

      currency: 'Trinidad and Tobago dollar',
      countries: ['trinidad and tobago']
    }, {
      code: 'TWD',
      number: '901',

      currency: 'New Taiwan dollar',
      countries: ['republic of china (taiwan)']
    }, {
      code: 'TZS',
      number: '834',

      currency: 'Tanzanian shilling',
      countries: ['tanzania']
    }, {
      code: 'UAH',
      number: '980',

      currency: 'Ukrainian hryvnia',
      countries: ['ukraine']
    }, {
      code: 'UGX',
      number: '800',

      currency: 'Ugandan shilling',
      countries: ['uganda']
    }, {
      code: 'USD',
      number: '840',

      currency: 'United States dollar',
      countries: ['american samoa', 'barbados', 'bermuda', 'british indian ocean territory', 'british virgin islands, caribbean netherlands', 'ecuador', 'el salvador', 'guam', 'haiti', 'marshall islands', 'federated states of micronesia', 'northern mariana islands', 'palau', 'panama', 'puerto rico', 'timor-leste', 'turks and caicos islands', 'united states', 'u.s. virgin islands', 'zimbabwe']
    }, {
      code: 'USN',
      number: '997',

      currency: 'United States dollar (next day) (funds code)',
      countries: ['united states']
    }, {
      code: 'USS',
      number: '998',

      currency: 'United States dollar',
      countries: ['united states']
    }, {
      code: 'UYI',
      number: '940',

      currency: 'Uruguay Peso en Unidades Indexadas',
      countries: ['uruguay']
    }, {
      code: 'UYU',
      number: '858',

      currency: 'Uruguayan peso',
      countries: ['uruguay']
    }, {
      code: 'UZS',
      number: '860',

      currency: 'Uzbekistan som',
      countries: ['uzbekistan']
    }, {
      code: 'VEF',
      number: '937',

      currency: 'Venezuelan bolívar',
      countries: ['venezuela']
    }, {
      code: 'VND',
      number: '704',

      currency: 'Vietnamese dong',
      countries: ['vietnam']
    }, {
      code: 'VUV',
      number: '548',

      currency: 'Vanuatu vatu',
      countries: ['vanuatu']
    }, {
      code: 'WST',
      number: '882',

      currency: 'Samoan tala',
      countries: ['samoa']
    }, {
      code: 'XAF',
      number: '950',

      currency: 'CFA franc BEAC',
      countries: ['cameroon', 'central african republic', 'republic of the congo', 'chad', 'equatorial guinea', 'gabon']
    }, {
      code: 'XAG',
      number: '961',
      currency: 'Silver (one troy ounce)',
    }, {
      code: 'XAU',
      number: '959',
      currency: 'Gold (one troy ounce)',
    }, {
      code: 'XBA',
      number: '955',
      currency: 'European Composite Unit (EURCO) (bond market unit)	',
    }, {
      code: 'XBB',
      number: '956',
      currency: 'European Monetary Unit (E.M.U.-6) (bond market unit)	',
    }, {
      code: 'XBC',
      number: '957',
      currency: 'European Unit of Account 9 (E.U.A.-9) (bond market unit)	',
    }, {
      code: 'XBD',
      number: '958',
      currency: 'European Unit of Account 17 (E.U.A.-17) (bond market unit)	',
    }, {
      code: 'XBT',
      currency: 'Bitcoin',
    }, {
      code: 'XCD',
      number: '951',

      currency: 'East Caribbean dollar',
      countries: ['anguilla', 'antigua and barbuda', 'dominica', 'grenada', 'montserrat', 'saint kitts and nevis', 'saint lucia', 'saint vincent and the grenadines']
    }, {
      code: 'XDR',
      number: '960',
      currency: 'Special drawing rights',
      countries: ['international monetary fund']
    }, {
      code: 'XFU',
      currency: 'UIC franc (special settlement currency)',
      countries: ['international union of railways']
    }, {
      code: 'XOF',
      number: '952',

      currency: 'CFA franc BCEAO',
      countries: ['benin', 'burkina faso', 'côte d\'ivoire', 'guinea-bissau', 'mali', 'niger', 'senegal', 'togo']
    }, {
      code: 'XPD',
      number: '964',
      currency: 'Palladium (one troy ounce)',
    }, {
      code: 'XPF',
      number: '953',

      currency: 'CFP franc (Franc du Pacifique)',
      countries: ['french polynesia', 'new caledonia', 'wallis and futuna']
    }, {
      code: 'XPT',
      number: '962',
      currency: 'Platinum (one troy ounce)',
    }, {
      code: 'XTS',
      number: '963',
      currency: 'Code reserved for testing purposes',
    }, {
      code: 'XXX',
      number: '999',
      currency: 'No currency',
    }, {
      code: 'YER',
      number: '886',

      currency: 'Yemeni rial',
      countries: ['yemen']
    }, {
      code: 'ZAR',
      number: '710',

      currency: 'South African rand',
      countries: ['south africa']
    }, {
      code: 'ZMW',
      number: '967',

      currency: 'Zambian kwacha',
      countries: ['zambia']
    }];

    var currencylist = [];
    async.eachSeries(currencycodes, function (objcountry, cb) {
        console.log("Country currency detail ", objcountry.code);
        var getSymbol = require('currency-symbol-map');
        console.log("Currency symbol ",getSymbol(objcountry.code));

        objcountry.symbol = '';
        if(getSymbol(objcountry.code))
            objcountry.symbol = getSymbol(objcountry.code);
        currencylist.push(objcountry);
        // console.log(cc.code(objcountry.code));

        cb();
    }, function (err) {
      res.send({
        message: "Currency code list",
        data: currencylist
      });
    });
  },

  twiliocallresponse: function (req, res) {

    var verificationcode = req.param("verificationcode");

    console.log(verificationcode);

    var twimlResponse = new VoiceResponse();

    twimlResponse.say('Welcome! Your verification code is ' + verificationcode, {
      voice: 'alice'
    });
    console.log(twimlResponse.toString());
    res.type('text/xml');
    res.send(twimlResponse.toString());
    //return twimlResponse.toString();
  },

  testcode: function (req, res) {

    // var localTime = moment("2017-09-03T00:24:59.000Z");

    // // var createdAtFormated = localTime.utc().format("YYYY-MM-DD HH:mm:ss");

    // sails.log("Converted time ", createdAtFormated);
    // res.send(localTime);

    // var folderPath = sails.config.paths.public;

    // if (req._fileparser.upstreams.length) {

    //     req.file('profile').upload({
    //         maxBytes: 10000000,
    //         dirname: folderPath
    //     }, function whenDone(err, uploadedFiles) {
    //         if (err) {
    //             return res.serverError(err);
    //         }

    //         if (_.isEmpty(uploadedFiles)) {
    //             sails.log('its empty file');
    //         }
    //     });

    //     req.file('profile1').upload({
    //         maxBytes: 10000000,
    //         dirname: folderPath
    //     }, function whenDone(err, uploadedFiles) {
    //         if (err) {
    //             return res.serverError(err);
    //         }
    //         if (_.isEmpty(uploadedFiles)) {
    //             sails.log('its empty file');
    //             return res.send('test code');
    //         }

    //         sails.log('uploaded file name', uploadedFiles[0].filename);

    // return res.ok({
    //     files: uploadedFiles,
    //     textParams: req.params.all()
    // });
    //     });
    // }
    // var userlistByLang;
    // async.series([
    //     function (getuserbylangcb) {
    //         var query = 'SELECT CONCAT(languagecode) as  lcode,GROUP_CONCAT(id) as userids FROM user WHERE FIND_IN_SET(id, (SELECT GROUP_CONCAT(user_groups) FROM `user_groups__usergroup_users` WHERE `usergroup_users` = 2)) group BY languagecode';
    //         User.query(query, [], function (err, userlistbylang) {
    //             if (err) {
    //                 getuserbylangcb(err);
    //             }
    //             console.log("eventlist total record", userlistbylang);

    //             userlistByLang = userlistbylang;
    //             getuserbylangcb();
    //         });
    //     },
    //     function (updatecode) {

    //         async.eachSeries(userlistByLang, function (usersByLang, cb) {
    //             sails.log("Language code ", usersByLang.lcode);
    //             sails.log("Users with Lang code ", usersByLang.userids);
    //             if (!usersByLang.lcode || usersByLang.lcode == 'aut') { "Language code not exist"; return cb(); }

    //             var translatedString;
    //             async.series([
    //                 function (translatecb) {
    //                     var textString = 'Hello check out this functions';
    //                     const translate = require('google-translate-api');

    //                     translate(textString, { to: usersByLang.lcode }).then(restranslate => {
    //                         console.log(restranslate.text);
    //                         translatedString = restranslate.text;
    //                         translatecb();
    //                     }).catch(err => {
    //                         console.error(err);
    //                         console.log("Error", err);
    //                         translatecb();
    //                     });
    //                 },
    //                 function (findchatobjectcb) {
    //                     async.eachSeries(usersByLang.userids.split(','), function (user_id, insidecb) {
    //                         sails.log("User id to send message ", user_id);

    //                         Chat.find({ touser: user_id, messagegroup: 7 })
    //                             .exec(function afterwards(err, chatObject) {
    //                                 if (err) {
    //                                     insidecb(err);//return res.serverError({ message: sails.config.localised.responses.somethingwentwrong, err });
    //                                 }
    //                                 if (typeof chatObject != "undefined" && chatObject.length > 0) {
    //                                     sails.log("Chat object id", chatObject[0]);
    //                                     chatObject[0].translatedmediadata = translatedString;
    //                                     chatObject[0].save(function (err) {
    //                                         insidecb();
    //                                     });
    //                                 }
    //                                 else {
    //                                     insidecb();
    //                                 }
    //                             });
    //                     }, function (err) {
    //                         findchatobjectcb();
    //                     });
    //                 },
    //             ],
    //                 function (err, finalresult) {
    //                     if (err)
    //                         cb(err);
    //                     else
    //                         cb();
    //                 }
    //             );
    //         }, function (err) {
    //             updatecode();
    //         });
    //     }],
    //     function (err, finalresult) {
    //         if (err)
    //             res.serverError({ message: err.message });
    //         else
    //             res.send({ message: sails.config.localised.user.verificationcodesent });
    //     }
    // );

    // console.log(cc.countries());
    // var getSymbolFromCurrency = require('currency-symbol-map').getSymbolFromCurrency;
    // console.log(getSymbolFromCurrency('GBP'));

    var currencycodes = [{
      code: 'AED',
      number: '784',
      currency: 'United Arab Emirates dirham',
      countries: ['united arab emirates']
    }, {
      code: 'AFN',
      number: '971',
      currency: 'Afghan afghani',
      countries: ['afghanistan']
    }, {
      code: 'ALL',
      number: '008',
      currency: 'Albanian lek',
      countries: ['albania']
    }, {
      code: 'AMD',
      number: '051',
      currency: 'Armenian dram',
      countries: ['armenia']
    }, {
      code: 'ANG',
      number: '532',
      currency: 'Netherlands Antillean guilder',
      countries: ['curaçao', 'sint maarten']
    }, {
      code: 'AOA',
      number: '973',
      currency: 'Angolan kwanza',
      countries: ['angola']
    }, {
      code: 'ARS',
      number: '032',
      currency: 'Argentine peso',
      countries: ['argentina']
    }, {
      code: 'AUD',
      number: '036',
      currency: 'Australian dollar',
      countries: ['australia', 'australian antarctic territory', 'christmas island', 'cocos (keeling) islands', 'heard and mcdonald islands', 'kiribati', 'nauru', 'norfolk island', 'tuvalu']
    }, {
      code: 'AWG',
      number: '533',
      currency: 'Aruban florin',
      countries: ['aruba']
    }, {
      code: 'AZN',
      number: '944',
      currency: 'Azerbaijani manat',
      countries: ['azerbaijan']
    }, {
      code: 'BAM',
      number: '977',
      currency: 'Bosnia and Herzegovina convertible mark',
      countries: ['bosnia and herzegovina']
    }, {
      code: 'BBD',
      number: '052',
      currency: 'Barbados dollar',
      countries: ['barbados']
    }, {
      code: 'BDT',
      number: '050',
      currency: 'Bangladeshi taka',
      countries: ['bangladesh']
    }, {
      code: 'BGN',
      number: '975',
      currency: 'Bulgarian lev',
      countries: ['bulgaria']
    }, {
      code: 'BHD',
      number: '048',
      currency: 'Bahraini dinar',
      countries: ['bahrain']
    }, {
      code: 'BIF',
      number: '108',
      currency: 'Burundian franc',
      countries: ['burundi']
    }, {
      code: 'BMD',
      number: '060',
      currency: 'Bermudian dollar',
      countries: ['bermuda']
    }, {
      code: 'BND',
      number: '096',
      currency: 'Brunei dollar',
      countries: ['brunei', 'singapore']
    }, {
      code: 'BOB',
      number: '068',
      currency: 'Boliviano',
      countries: ['bolivia']
    }, {
      code: 'BOV',
      number: '984',
      currency: 'Bolivian Mvdol (funds code)',
      countries: ['bolivia']
    }, {
      code: 'BRL',
      number: '986',
      currency: 'Brazilian real',
      countries: ['brazil']
    }, {
      code: 'BSD',
      number: '044',
      currency: 'Bahamian dollar',
      countries: ['bahamas']
    }, {
      code: 'BTN',
      number: '064',
      currency: 'Bhutanese ngultrum',
      countries: ['bhutan']
    }, {
      code: 'BWP',
      number: '072',
      currency: 'Botswana pula',
      countries: ['botswana']
    }, {
      code: 'BYR',
      number: '974',
      currency: 'Belarusian ruble',
      countries: ['belarus']
    }, {
      code: 'BZD',
      number: '084',
      currency: 'Belize dollar',
      countries: ['belize']
    }, {
      code: 'CAD',
      number: '124',
      currency: 'Canadian dollar',
      countries: ['canada', 'saint pierre and miquelon']
    }, {
      code: 'CDF',
      number: '976',
      currency: 'Congolese franc',
      countries: ['democratic republic of congo']
    }, {
      code: 'CHE',
      number: '947',
      currency: 'WIR Euro (complementary currency)',
      countries: ['switzerland']
    }, {
      code: 'CHF',
      number: '756',
      currency: 'Swiss franc',
      countries: ['switzerland', 'liechtenstein']
    }, {
      code: 'CHW',
      number: '948',
      currency: 'WIR Franc (complementary currency)',
      countries: ['switzerland']
    }, {
      code: 'CLF',
      number: '990',
      currency: 'Unidad de Fomento (funds code)',
      countries: ['chile']
    }, {
      code: 'CLP',
      number: '152',
      currency: 'Chilean peso',
      countries: ['chile']
    }, {
      code: 'CNY',
      number: '156',
      currency: 'Chinese yuan',
      countries: ['china']
    }, {
      code: 'COP',
      number: '170',
      currency: 'Colombian peso',
      countries: ['colombia']
    }, {
      code: 'COU',
      number: '970',
      currency: 'Unidad de Valor Real',
      countries: ['colombia']
    }, {
      code: 'CRC',
      number: '188',
      currency: 'Costa Rican colon',
      countries: ['costa rica']
    }, {
      code: 'CUC',
      number: '931',
      currency: 'Cuban convertible peso',
      countries: ['cuba']
    }, {
      code: 'CUP',
      number: '192',
      currency: 'Cuban peso',
      countries: ['cuba']
    }, {
      code: 'CVE',
      number: '132',
      currency: 'Cape Verde escudo',
      countries: ['cape verde']
    }, {
      code: 'CZK',
      number: '203',
      currency: 'Czech koruna',
      countries: ['czech republic']
    }, {
      code: 'DJF',
      number: '262',
      currency: 'Djiboutian franc',
      countries: ['djibouti']
    }, {
      code: 'DKK',
      number: '208',
      currency: 'Danish krone',
      countries: ['denmark', 'faroe islands', 'greenland']
    }, {
      code: 'DOP',
      number: '214',
      currency: 'Dominican peso',
      countries: ['dominican republic']
    }, {
      code: 'DZD',
      number: '012',
      currency: 'Algerian dinar',
      countries: ['algeria']
    }, {
      code: 'EGP',
      number: '818',
      currency: 'Egyptian pound',
      countries: ['egypt', 'palestinian territories']
    }, {
      code: 'ERN',
      number: '232',
      currency: 'Eritrean nakfa',
      countries: ['eritrea']
    }, {
      code: 'ETB',
      number: '230',
      currency: 'Ethiopian birr',
      countries: ['ethiopia']
    }, {
      code: 'EUR',
      number: '978',
      currency: 'Euro',
      countries: ['andorra', 'austria', 'belgium', 'cyprus', 'estonia', 'finland', 'france', 'germany', 'greece', 'ireland', 'italy', 'kosovo', 'luxembourg', 'malta', 'monaco', 'montenegro', 'netherlands', 'portugal', 'san marino', 'slovakia', 'slovenia', 'spain', 'vatican city']
    }, {
      code: 'FJD',
      number: '242',
      currency: 'Fiji dollar',
      countries: ['fiji']
    }, {
      code: 'FKP',
      number: '238',
      currency: 'Falkland Islands pound',
      countries: ['falkland islands']
    }, {
      code: 'GBP',
      number: '826',
      currency: 'Pound sterling',
      countries: ['united kingdom', 'british crown dependencies (the  isle of man and the channel islands)', 'south georgia and the south sandwich islands', 'british antarctic territory', 'british indian ocean territory']
    }, {
      code: 'GEL',
      number: '981',
      currency: 'Georgian lari',
      countries: ['georgia']
    }, {
      code: 'GHS',
      number: '936',
      currency: 'Ghanaian cedi',
      countries: ['ghana']
    }, {
      code: 'GIP',
      number: '292',
      currency: 'Gibraltar pound',
      countries: ['gibraltar']
    }, {
      code: 'GMD',
      number: '270',
      currency: 'Gambian dalasi',
      countries: ['gambia']
    }, {
      code: 'GNF',
      number: '324',
      currency: 'Guinean franc',
      countries: ['guinea']
    }, {
      code: 'GTQ',
      number: '320',
      currency: 'Guatemalan quetzal',
      countries: ['guatemala']
    }, {
      code: 'GYD',
      number: '328',
      currency: 'Guyanese dollar',
      countries: ['guyana']
    }, {
      code: 'HKD',
      number: '344',
      currency: 'Hong Kong dollar',
      countries: ['hong kong', 'macao']
    }, {
      code: 'HNL',
      number: '340',
      currency: 'Honduran lempira',
      countries: ['honduras']
    }, {
      code: 'HRK',
      number: '191',
      currency: 'Croatian kuna',
      countries: ['croatia']
    }, {
      code: 'HTG',
      number: '332',
      currency: 'Haitian gourde',
      countries: ['haiti']
    }, {
      code: 'HUF',
      number: '348',

      currency: 'Hungarian forint',
      countries: ['hungary']
    }, {
      code: 'IDR',
      number: '360',

      currency: 'Indonesian rupiah',
      countries: ['indonesia']
    }, {
      code: 'ILS',
      number: '376',

      currency: 'Israeli new shekel',
      countries: ['israel', 'palestinian territories']
    }, {
      code: 'INR',
      number: '356',

      currency: 'Indian rupee',
      countries: ['india']
    }, {
      code: 'IQD',
      number: '368',

      currency: 'Iraqi dinar',
      countries: ['iraq']
    }, {
      code: 'IRR',
      number: '364',

      currency: 'Iranian rial',
      countries: ['iran']
    }, {
      code: 'ISK',
      number: '352',

      currency: 'Icelandic króna',
      countries: ['iceland']
    }, {
      code: 'JMD',
      number: '388',

      currency: 'Jamaican dollar',
      countries: ['jamaica']
    }, {
      code: 'JOD',
      number: '400',

      currency: 'Jordanian dinar',
      countries: ['jordan']
    }, {
      code: 'JPY',
      number: '392',

      currency: 'Japanese yen',
      countries: ['japan']
    }, {
      code: 'KES',
      number: '404',

      currency: 'Kenyan shilling',
      countries: ['kenya']
    }, {
      code: 'KGS',
      number: '417',

      currency: 'Kyrgyzstani som',
      countries: ['kyrgyzstan']
    }, {
      code: 'KHR',
      number: '116',

      currency: 'Cambodian riel',
      countries: ['cambodia']
    }, {
      code: 'KMF',
      number: '174',

      currency: 'Comoro franc',
      countries: ['comoros']
    }, {
      code: 'KPW',
      number: '408',

      currency: 'North Korean won',
      countries: ['north korea']
    }, {
      code: 'KRW',
      number: '410',
      currency: 'South Korean won',
      countries: ['south korea']
    }, {
      code: 'KWD',
      number: '414',
      currency: 'Kuwaiti dinar',
      countries: ['kuwait']
    }, {
      code: 'KYD',
      number: '136',
      currency: 'Cayman Islands dollar',
      countries: ['cayman islands']
    }, {
      code: 'KZT',
      number: '398',
      currency: 'Kazakhstani tenge',
      countries: ['kazakhstan']
    }, {
      code: 'LAK',
      number: '418',
      currency: 'Lao kip',
      countries: ['laos']
    }, {
      code: 'LBP',
      number: '422',

      currency: 'Lebanese pound',
      countries: ['lebanon']
    }, {
      code: 'LKR',
      number: '144',
      currency: 'Sri Lankan rupee',
      countries: ['sri lanka']
    }, {
      code: 'LRD',
      number: '430',
      currency: 'Liberian dollar',
      countries: ['liberia']
    }, {
      code: 'LSL',
      number: '426',

      currency: 'Lesotho loti',
      countries: ['lesotho']
    }, {
      code: 'LTL',
      number: '440',

      currency: 'Lithuanian litas',
      countries: ['lithuania']
    }, {
      code: 'LVL',
      number: '428',

      currency: 'Latvian lats',
      countries: ['latvia']
    }, {
      code: 'LYD',
      number: '434',

      currency: 'Libyan dinar',
      countries: ['libya']
    }, {
      code: 'MAD',
      number: '504',

      currency: 'Moroccan dirham',
      countries: ['morocco']
    }, {
      code: 'MDL',
      number: '498',

      currency: 'Moldovan leu',
      countries: ['moldova (except  transnistria)']
    }, {
      code: 'MGA',
      number: '969',

      currency: '*[8]	Malagasy ariary',
      countries: ['madagascar']
    }, {
      code: 'MKD',
      number: '807',

      currency: 'Macedonian denar',
      countries: ['macedonia']
    }, {
      code: 'MMK',
      number: '104',

      currency: 'Myanma kyat',
      countries: ['myanmar']
    }, {
      code: 'MNT',
      number: '496',

      currency: 'Mongolian tugrik',
      countries: ['mongolia']
    }, {
      code: 'MOP',
      number: '446',

      currency: 'Macanese pataca',
      countries: ['macao']
    }, {
      code: 'MRO',
      number: '478',

      currency: '*[8]	Mauritanian ouguiya',
      countries: ['mauritania']
    }, {
      code: 'MUR',
      number: '480',

      currency: 'Mauritian rupee',
      countries: ['mauritius']
    }, {
      code: 'MVR',
      number: '462',

      currency: 'Maldivian rufiyaa',
      countries: ['maldives']
    }, {
      code: 'MWK',
      number: '454',

      currency: 'Malawian kwacha',
      countries: ['malawi']
    }, {
      code: 'MXN',
      number: '484',

      currency: 'Mexican peso',
      countries: ['mexico']
    }, {
      code: 'MXV',
      number: '979',

      currency: 'Mexican Unidad de Inversion (UDI) (funds code)',
      countries: ['mexico']
    }, {
      code: 'MYR',
      number: '458',

      currency: 'Malaysian ringgit',
      countries: ['malaysia']
    }, {
      code: 'MZN',
      number: '943',

      currency: 'Mozambican metical',
      countries: ['mozambique']
    }, {
      code: 'NAD',
      number: '516',

      currency: 'Namibian dollar',
      countries: ['namibia']
    }, {
      code: 'NGN',
      number: '566',

      currency: 'Nigerian naira',
      countries: ['nigeria']
    }, {
      code: 'NIO',
      number: '558',

      currency: 'Nicaraguan córdoba',
      countries: ['nicaragua']
    }, {
      code: 'NOK',
      number: '578',

      currency: 'Norwegian krone',
      countries: ['norway', 'svalbard', 'jan mayen', 'bouvet island', 'queen maud land', 'peter i island']
    }, {
      code: 'NPR',
      number: '524',

      currency: 'Nepalese rupee',
      countries: ['nepal']
    }, {
      code: 'NZD',
      number: '554',

      currency: 'New Zealand dollar',
      countries: ['cook islands', 'new zealand', 'niue', 'pitcairn', 'tokelau', 'ross dependency']
    }, {
      code: 'OMR',
      number: '512',

      currency: 'Omani rial',
      countries: ['oman']
    }, {
      code: 'PAB',
      number: '590',

      currency: 'Panamanian balboa',
      countries: ['panama']
    }, {
      code: 'PEN',
      number: '604',

      currency: 'Peruvian nuevo sol',
      countries: ['peru']
    }, {
      code: 'PGK',
      number: '598',

      currency: 'Papua New Guinean kina',
      countries: ['papua new guinea']
    }, {
      code: 'PHP',
      number: '608',

      currency: 'Philippine peso',
      countries: ['philippines']
    }, {
      code: 'PKR',
      number: '586',

      currency: 'Pakistani rupee',
      countries: ['pakistan']
    }, {
      code: 'PLN',
      number: '985',

      currency: 'Polish złoty',
      countries: ['poland']
    }, {
      code: 'PYG',
      number: '600',

      currency: 'Paraguayan guaraní',
      countries: ['paraguay']
    }, {
      code: 'QAR',
      number: '634',

      currency: 'Qatari riyal',
      countries: ['qatar']
    }, {
      code: 'RON',
      number: '946',

      currency: 'Romanian new leu',
      countries: ['romania']
    }, {
      code: 'RSD',
      number: '941',

      currency: 'Serbian dinar',
      countries: ['serbia']
    }, {
      code: 'RUB',
      number: '643',

      currency: 'Russian rouble',
      countries: ['russia', 'abkhazia', 'south ossetia']
    }, {
      code: 'RWF',
      number: '646',

      currency: 'Rwandan franc',
      countries: ['rwanda']
    }, {
      code: 'SAR',
      number: '682',

      currency: 'Saudi riyal',
      countries: ['saudi arabia']
    }, {
      code: 'SBD',
      number: '090',

      currency: 'Solomon Islands dollar',
      countries: ['solomon islands']
    }, {
      code: 'SCR',
      number: '690',

      currency: 'Seychelles rupee',
      countries: ['seychelles']
    }, {
      code: 'SDG',
      number: '938',

      currency: 'Sudanese pound',
      countries: ['sudan']
    }, {
      code: 'SEK',
      number: '752',

      currency: 'Swedish krona/kronor',
      countries: ['sweden']
    }, {
      code: 'SGD',
      number: '702',

      currency: 'Singapore dollar',
      countries: ['singapore', 'brunei']
    }, {
      code: 'SHP',
      number: '654',

      currency: 'Saint Helena pound',
      countries: ['saint helena']
    }, {
      code: 'SLL',
      number: '694',

      currency: 'Sierra Leonean leone',
      countries: ['sierra leone']
    }, {
      code: 'SOS',
      number: '706',

      currency: 'Somali shilling',
      countries: ['somalia']
    }, {
      code: 'SRD',
      number: '968',

      currency: 'Surinamese dollar',
      countries: ['suriname']
    }, {
      code: 'SSP',
      number: '728',

      currency: 'South Sudanese pound',
      countries: ['south sudan']
    }, {
      code: 'STD',
      number: '678',

      currency: 'São Tomé and Príncipe dobra',
      countries: ['são tomé and príncipe']
    }, {
      code: 'SYP',
      number: '760',

      currency: 'Syrian pound',
      countries: ['syria']
    }, {
      code: 'SZL',
      number: '748',

      currency: 'Swazi lilangeni',
      countries: ['swaziland']
    }, {
      code: 'THB',
      number: '764',

      currency: 'Thai baht',
      countries: ['thailand']
    }, {
      code: 'TJS',
      number: '972',

      currency: 'Tajikistani somoni',
      countries: ['tajikistan']
    }, {
      code: 'TMT',
      number: '934',

      currency: 'Turkmenistani manat',
      countries: ['turkmenistan']
    }, {
      code: 'TND',
      number: '788',

      currency: 'Tunisian dinar',
      countries: ['tunisia']
    }, {
      code: 'TOP',
      number: '776',

      currency: 'Tongan paʻanga',
      countries: ['tonga']
    }, {
      code: 'TRY',
      number: '949',

      currency: 'Turkish lira',
      countries: ['turkey', 'northern cyprus']
    }, {
      code: 'TTD',
      number: '780',

      currency: 'Trinidad and Tobago dollar',
      countries: ['trinidad and tobago']
    }, {
      code: 'TWD',
      number: '901',

      currency: 'New Taiwan dollar',
      countries: ['republic of china (taiwan)']
    }, {
      code: 'TZS',
      number: '834',

      currency: 'Tanzanian shilling',
      countries: ['tanzania']
    }, {
      code: 'UAH',
      number: '980',

      currency: 'Ukrainian hryvnia',
      countries: ['ukraine']
    }, {
      code: 'UGX',
      number: '800',

      currency: 'Ugandan shilling',
      countries: ['uganda']
    }, {
      code: 'USD',
      number: '840',

      currency: 'United States dollar',
      countries: ['american samoa', 'barbados', 'bermuda', 'british indian ocean territory', 'british virgin islands, caribbean netherlands', 'ecuador', 'el salvador', 'guam', 'haiti', 'marshall islands', 'federated states of micronesia', 'northern mariana islands', 'palau', 'panama', 'puerto rico', 'timor-leste', 'turks and caicos islands', 'united states', 'u.s. virgin islands', 'zimbabwe']
    }, {
      code: 'USN',
      number: '997',

      currency: 'United States dollar (next day) (funds code)',
      countries: ['united states']
    }, {
      code: 'USS',
      number: '998',

      currency: 'United States dollar',
      countries: ['united states']
    }, {
      code: 'UYI',
      number: '940',

      currency: 'Uruguay Peso en Unidades Indexadas',
      countries: ['uruguay']
    }, {
      code: 'UYU',
      number: '858',

      currency: 'Uruguayan peso',
      countries: ['uruguay']
    }, {
      code: 'UZS',
      number: '860',

      currency: 'Uzbekistan som',
      countries: ['uzbekistan']
    }, {
      code: 'VEF',
      number: '937',

      currency: 'Venezuelan bolívar',
      countries: ['venezuela']
    }, {
      code: 'VND',
      number: '704',

      currency: 'Vietnamese dong',
      countries: ['vietnam']
    }, {
      code: 'VUV',
      number: '548',

      currency: 'Vanuatu vatu',
      countries: ['vanuatu']
    }, {
      code: 'WST',
      number: '882',

      currency: 'Samoan tala',
      countries: ['samoa']
    }, {
      code: 'XAF',
      number: '950',

      currency: 'CFA franc BEAC',
      countries: ['cameroon', 'central african republic', 'republic of the congo', 'chad', 'equatorial guinea', 'gabon']
    }, {
      code: 'XAG',
      number: '961',
      currency: 'Silver (one troy ounce)',
    }, {
      code: 'XAU',
      number: '959',
      currency: 'Gold (one troy ounce)',
    }, {
      code: 'XBA',
      number: '955',
      currency: 'European Composite Unit (EURCO) (bond market unit)	',
    }, {
      code: 'XBB',
      number: '956',
      currency: 'European Monetary Unit (E.M.U.-6) (bond market unit)	',
    }, {
      code: 'XBC',
      number: '957',
      currency: 'European Unit of Account 9 (E.U.A.-9) (bond market unit)	',
    }, {
      code: 'XBD',
      number: '958',
      currency: 'European Unit of Account 17 (E.U.A.-17) (bond market unit)	',
    }, {
      code: 'XBT',
      currency: 'Bitcoin',
    }, {
      code: 'XCD',
      number: '951',

      currency: 'East Caribbean dollar',
      countries: ['anguilla', 'antigua and barbuda', 'dominica', 'grenada', 'montserrat', 'saint kitts and nevis', 'saint lucia', 'saint vincent and the grenadines']
    }, {
      code: 'XDR',
      number: '960',
      currency: 'Special drawing rights',
      countries: ['international monetary fund']
    }, {
      code: 'XFU',
      currency: 'UIC franc (special settlement currency)',
      countries: ['international union of railways']
    }, {
      code: 'XOF',
      number: '952',

      currency: 'CFA franc BCEAO',
      countries: ['benin', 'burkina faso', 'côte d\'ivoire', 'guinea-bissau', 'mali', 'niger', 'senegal', 'togo']
    }, {
      code: 'XPD',
      number: '964',
      currency: 'Palladium (one troy ounce)',
    }, {
      code: 'XPF',
      number: '953',

      currency: 'CFP franc (Franc du Pacifique)',
      countries: ['french polynesia', 'new caledonia', 'wallis and futuna']
    }, {
      code: 'XPT',
      number: '962',
      currency: 'Platinum (one troy ounce)',
    }, {
      code: 'XTS',
      number: '963',
      currency: 'Code reserved for testing purposes',
    }, {
      code: 'XXX',
      number: '999',
      currency: 'No currency',
    }, {
      code: 'YER',
      number: '886',

      currency: 'Yemeni rial',
      countries: ['yemen']
    }, {
      code: 'ZAR',
      number: '710',

      currency: 'South African rand',
      countries: ['south africa']
    }, {
      code: 'ZMW',
      number: '967',

      currency: 'Zambian kwacha',
      countries: ['zambia']
    }];

    var symbolCurrencyMap = require('currency-symbol-map').symbolCurrencyMap;
    console.log("Symbol list", currencycodes);

    var getSymbol = require('currency-symbol-map');
    console.log(getSymbol('GBP'));
    console.log(cc.code('EUR'));

    var currencysymbol = getSymbol('AED');
    var currencydetail = cc.code('AED');

    var stringCurrency = _.compact([_.capitalize(currencydetail.currency), '(', _.capitalize(currencydetail.code), currencysymbol, ')']).join(' ');

    res.send({
      message: sails.config.localised.user.verificationcodesent,
      data: stringCurrency
    });
  },
  sendNotification: function (req, res) {

    var deviceToken = "2BCF7147C22AA903B40714CFCDC78D9DB73D9D2D7BEA070B19EB92055AECFAB3";

    var payloadData = {};
    payloadData['EndpointArn'] = 'arn:aws:sns:us-west-2:173552633359:endpoint/APNS_VOIP_SANDBOX/Connect_iOS_VoIP/7bd227ee-7f0c-3df1-bcd0-5f0971b79ed4';

    // if (user.userdevice == 'iphone') {
    payloadData['AWSArn'] = sails.config.AWSArn.iOSArn;
    // }
    // else {
    //     payloadData['AWSArn'] = sails.config.AWSArn.AndroidArn;
    // }
    payloadData['devicetoken'] = deviceToken;

    var mediadata = {};
    mediadata['mediatitle'] = 'Push test';
    mediadata['sender'] = 'Sails';
    mediadata['chat'] = 'Hello test';

    payloadData['payloadData'] = mediadata;


    pushService.sendPushNotification({
      payloadData: payloadData
    }, function (err, users) {
      if (err) {
        sails.log("Sails error");
        return res.serverError(err);
      }
      res.send({
        message: "Test Push sent successfully"
      });
    });
  }
};
