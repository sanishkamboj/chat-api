module.exports = {
  languageAdd: function(req, res) {
    var language = [
      {
        languagecode: "aut",
        language: "Automatic",
        id: 1,
      },
      {
        languagecode: "af",
        language: "Afrikaans",
        id: 2,
      },
      {
        languagecode: "sq",
        language: "Albanian",
        id: 3,
      },
      {
        languagecode: "am",
        language: "Amharic",
        id: 4,
      },
      {
        languagecode: "ar",
        language: "Arabic",
        id: 5,
      },
      {
        languagecode: "hy",
        language: "Armenian",
        id: 6,
      },
      {
        languagecode: "az",
        language: "Azerbaijani",
        id: 7,
      },
      {
        languagecode: "eu",
        language: "Basque",
        id: 8,
      },
      {
        languagecode: "be",
        language: "Belarusian",
        id: 9,
      },
      {
        languagecode: "bn",
        language: "Bengali",
        id: 10,
      },
      {
        languagecode: "bs",
        language: "Bosnian",
        id: 11,
      },
      {
        languagecode: "bg",
        language: "Bulgarian",
        id: 12,
      },
      {
        languagecode: "ca",
        language: "Catalan",
        id: 13,
      },
      {
        languagecode: "ceb",
        language: "Cebuano",
        id: 14,
      },
      {
        languagecode: "ny",
        language: "Chichewa",
        id: 15,
      },
      {
        languagecode: "zh-n",
        language: "Chinese Simplified",
        id: 16,
      },
      {
        languagecode: "zh-w",
        language: "Chinese Traditional",
        id: 17,
      },
      {
        languagecode: "co",
        language: "Corsican",
        id: 18,
      },
      {
        languagecode: "hr",
        language: "Croatian",
        id: 19,
      },
      {
        languagecode: "cs",
        language: "Czech",
        id: 20,
      },
      {
        languagecode: "da",
        language: "Danish",
        id: 21,
      },
      {
        languagecode: "nl",
        language: "Dutch",
        id: 22,
      },
      {
        languagecode: "en",
        language: "English",
        id: 23,
      },
      {
        languagecode: "eo",
        language: "Esperanto",
        id: 24,
      },
      {
        languagecode: "et",
        language: "Estonian",
        id: 25,
      },
      {
        languagecode: "tl",
        language: "Filipino",
        id: 26,
      },
      {
        languagecode: "fi",
        language: "Finnish",
        id: 27,
      },
      {
        languagecode: "fr",
        language: "French",
        id: 28,
      },
      {
        languagecode: "fy",
        language: "Frisian",
        id: 29,
      },
      {
        languagecode: "gl",
        language: "Galician",
        id: 30,
      },
      {
        languagecode: "ka",
        language: "Georgian",
        id: 31,
      },
      {
        languagecode: "de",
        language: "German",
        id: 32,
      },
      {
        languagecode: "el",
        language: "Greek",
        id: 33,
      },
      {
        languagecode: "gu",
        language: "Gujarati",
        id: 34,
      },
      {
        languagecode: "ht",
        language: "Haitian Creole",
        id: 35,
      },
      {
        languagecode: "ha",
        language: "Hausa",
        id: 36,
      },
      {
        languagecode: "haw",
        language: "Hawaiian",
        id: 37,
      },
      {
        languagecode: "iw",
        language: "Hebrew",
        id: 38,
      },
      {
        languagecode: "hi",
        language: "Hindi",
        id: 39,
      },
      {
        languagecode: "hmn",
        language: "Hmong",
        id: 40,
      },
      {
        languagecode: "hu",
        language: "Hungarian",
        id: 41,
      },
      {
        languagecode: "is",
        language: "Icelandic",
        id: 42,
      },
      {
        languagecode: "ig",
        language: "Igbo",
        id: 43,
      },
      {
        languagecode: "id",
        language: "Indonesian",
        id: 44,
      },
      {
        languagecode: "ga",
        language: "Irish",
        id: 45,
      },
      {
        languagecode: "it",
        language: "Italian",
        id: 46,
      },
      {
        languagecode: "ja",
        language: "Japanese",
        id: 47,
      },
      {
        languagecode: "jw",
        language: "Javanese",
        id: 48,
      },
      {
        languagecode: "kn",
        language: "Kannada",
        id: 49,
      },
      {
        languagecode: "kk",
        language: "Kazakh",
        id: 50,
      },
      {
        languagecode: "km",
        language: "Khmer",
        id: 51,
      },
      {
        languagecode: "ko",
        language: "Korean",
        id: 52,
      },
      {
        languagecode: "ku",
        language: "Kurdish (Kurmanji)",
        id: 53,
      },
      {
        languagecode: "ky",
        language: "Kyrgyz",
        id: 54,
      },
      {
        languagecode: "lo",
        language: "Lao",
        id: 55,
      },
      {
        languagecode: "la",
        language: "Latin",
        id: 56,
      },
      {
        languagecode: "lv",
        language: "Latvian",
        id: 57,
      },
      {
        languagecode: "lt",
        language: "Lithuanian",
        id: 58,
      },
      {
        languagecode: "lb",
        language: "Luxembourgish",
        id: 59,
      },
      {
        languagecode: "mk",
        language: "Macedonian",
        id: 60,
      },
      {
        languagecode: "mg",
        language: "Malagasy",
        id: 61,
      },
      {
        languagecode: "ms",
        language: "Malay",
        id: 62,
      },
      {
        languagecode: "ml",
        language: "Malayalam",
        id: 63,
      },
      {
        languagecode: "mt",
        language: "Maltese",
        id: 64,
      },
      {
        languagecode: "mi",
        language: "Maori",
        id: 65,
      },
      {
        languagecode: "mr",
        language: "Marathi",
        id: 66,
      },
      {
        languagecode: "mn",
        language: "Mongolian",
        id: 67,
      },
      {
        languagecode: "my",
        language: "Myanmar (Burmese)",
        id: 68,
      },
      {
        languagecode: "ne",
        language: "Nepali",
        id: 69,
      },
      {
        languagecode: "no",
        language: "Norwegian",
        id: 70,
      },
      {
        languagecode: "ps",
        language: "Pashto",
        id: 71,
      },
      {
        languagecode: "fa",
        language: "Persian",
        id: 72,
      },
      {
        languagecode: "pl",
        language: "Polish",
        id: 73,
      },
      {
        languagecode: "pt",
        language: "Portuguese",
        id: 74,
      },
      {
        languagecode: "ma",
        language: "Punjabi",
        id: 75,
      },
      {
        languagecode: "ro",
        language: "Romanian",
        id: 76,
      },
      {
        languagecode: "ru",
        language: "Russian",
        id: 77,
      },
      {
        languagecode: "sm",
        language: "Samoan",
        id: 78,
      },
      {
        languagecode: "gd",
        language: "Scots Gaelic",
        id: 79,
      },
      {
        languagecode: "sr",
        language: "Serbian",
        id: 80,
      },
      {
        languagecode: "st",
        language: "Sesotho",
        id: 81,
      },
      {
        languagecode: "sn",
        language: "Shona",
        id: 82,
      },
      {
        languagecode: "sd",
        language: "Sindhi",
        id: 83,
      },
      {
        languagecode: "si",
        language: "Sinhala",
        id: 84,
      },
      {
        languagecode: "sk",
        language: "Slovak",
        id: 85,
      },
      {
        languagecode: "sl",
        language: "Slovenian",
        id: 86,
      },
      {
        languagecode: "so",
        language: "Somali",
        id: 87,
      },
      {
        languagecode: "es",
        language: "Spanish",
        id: 88,
      },
      {
        languagecode: "su",
        language: "Sundanese",
        id: 89,
      },
      {
        languagecode: "sw",
        language: "Swahili",
        id: 90,
      },
      {
        languagecode: "sv",
        language: "Swedish",
        id: 91,
      },
      {
        languagecode: "tg",
        language: "Tajik",
        id: 92,
      },
      {
        languagecode: "ta",
        language: "Tamil",
        id: 93,
      },
      {
        languagecode: "te",
        language: "Telugu",
        id: 94,
      },
      {
        languagecode: "th",
        language: "Thai",
        id: 95,
      },
      {
        languagecode: "tr",
        language: "Turkish",
        id: 96,
      },
      {
        languagecode: "uk",
        language: "Ukrainian",
        id: 97,
      },
      {
        languagecode: "ur",
        language: "Urdu",
        id: 98,
      },
      {
        languagecode: "uz",
        language: "Uzbek",
        id: 99,
      },
      {
        languagecode: "vi",
        language: "Vietnamese",
        id: 100,
      },
      {
        languagecode: "cy",
        language: "Welsh",
        id: 101,
      },
      {
        languagecode: "xh",
        language: "Xhosa",
        id: 102,
      },
      {
        languagecode: "yi",
        language: "Yiddish",
        id: 103,
      },
      {
        languagecode: "yo",
        language: "Yoruba",
        id: 104,
      },
      {
        languagecode: "zu",
        language: "Zulu",
        id: 105,
      },
    ];

    Languages.findOrCreate(language, language).exec(function(err, result) {
      console.log("err", err);
      res.send({ data: result });
    });
  },

  languageList: function(req, res) {
    Languages.find({}).exec(function(err, result) {
      res.send({
        message: "languagelist",
        data: result,
      });
    });
  },

  userLanguageUpdate: function(req, res) {
    var users;
    async.series(
      [
        function(userCb) {
          User.find().exec(function(err, result) {
            users = result;
            userCb();
          });
        },
        function(languageCb) {
          async.eachSeries(
            users,
            function(user, cb) {
              Languages.find()
                .where({ languagecode: user.languagecode })
                .exec(function(err, result) {
                  if (result.length == 0) {
                    cb();
                    return;
                  }
                  User.update({ id: user.id }, { languageid: result[0].id }).exec(function(errUser, resultUser) {
                    cb();
                  });
                });
            },
            function(err) {
              languageCb();
            }
          );
        },
      ],
      function(err, finalresult) {
        if (err) {
          res.serverError(err);
        } else {
          res.send({ message: "User languageid update successfully" });
        }
      }
    );
  },
};
