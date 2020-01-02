const express = require('express')
const LanguageService = require('./language-service')
const { requireAuth } = require('../middleware/jwt-auth')

const languageRouter = express.Router();
const jsonBodyParser = express.json();

languageRouter
  .use(requireAuth)
  .use(async (req, res, next) => {
    try {
      const language = await LanguageService.getUsersLanguage(
        req.app.get('db'),
        req.params.id
      );

      if (!language)
        return res.status(404).json({
          error: `You don't have any languages`,
        });

      req.language = language;
      next();
    } catch (error) {
      next(error)
    }
  });

languageRouter
  .get('/', async (req, res, next) => {
    try {
      //req.language.id is requesting a word from the database to be translated.
      //matching the word with the language id and then requesting that language
      //and returning the translated word.
      const words = await LanguageService.getLanguageWords(
        req.app.get('db'),
        req.language.id
      );

      res.json({
        language: req.language,
        words,
      });
      next();
    } catch (error) {
      next(error);
    }
  });

languageRouter
  .get('/head', async (req, res, next) => {
  try {
    const head = await LanguageService.getLanguageHead(req.app.get('db'),
    req.language.id);
    // res.send('implement me!')
    res.json({
      nextWord: head.original,
      totalScore: head.total_score,
      wordCorrectCount: head.correct_count,
      wordIncorrectCount: head.incorrect_count
    });
    next();
} catch (error) {
    next(error);
  }
});

languageRouter
  .post('/guess', jsonBodyParser, async (req, res, next) => {
   try {
     const { guess, original, language_id } = req.body;
     if (!guess) {
       return res.status(400).json({ error: "Missing 'guess' in request body" });
     }
     const translation = await LanguageService.getWordTranslation (req.app.get('db'), original);
     if ( guess === translation.translation) {
        const word = await LanguageService.handleCorrectCount(req.app.get('db'), language_id, original);
        res.json({ answer: guess, isCorrect: true, ...word });
     } else {
       const word = await LanguageService.handleIncorrectCount(req.app.get('db'), language_id, original);
       res.json({ answer: guess, isCorrect: false, ...word});
     }
     next();
   } catch (error) {
     next(error);
   }
});

module.exports = languageRouter;
