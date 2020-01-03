const express = require('express')
const LanguageService = require('./language-service')
const { requireAuth } = require('../middleware/jwt-auth')
const LinkedList = require('./LinkedList');

const languageRouter = express.Router();
const jsonBodyParser = express.json();

// languageRouter
//   .use(requireAuth)
//   .use(async (req, res, next) => {
//     try {
//       console.log(req.params)
//       console.log(req.body)
//       const language = await LanguageService.getUsersLanguage(
//         req.app.get('db'),
//         req.params.id
//       );

//       if (!language)
//         return res.status(404).json({
//           error: `You don't have any languages`,
//         });

//       req.language = language;
//       next();
//     } catch (error) {
//       next(error)
//     }
//   });

languageRouter
  .use(requireAuth)
  .get('/:id', async (req, res, next) => {
    try {
      //req.language.id is requesting a word from the database to be translated.
      //matching the word with the language id and then requesting that language
      //and returning the translated word.
      console.log(req.params, 'here')
      console.log(req.body)
      const words = await LanguageService.getLanguageWords(
        req.app.get('db'),
        req.params.id
      );
        console.log(words)
      res.json({
        language: req.params.id,
        words,
      });
      next();
    } catch (error) {
      next(error);
    }
  });

languageRouter
.get('/head', async (req, res, next) => {
  // implement me
  try {
    const language = await LanguageService.getUsersLanguage(
      req.app.get('db'),
      req.language.user_id
      // req.params.id
    );
    const words = await LanguageService.getLanguageWords(
      req.app.get('db'),
      req.language.id,
    );
    const currentWord = words.find(element => element.id === language.head);
    const responseObject = {
      nextWord: currentWord.original,
      wordCorrectCount: currentWord.correct_count,
      wordIncorrectCount: currentWord.incorrect_count,
      totalScore: language.total_score
    };
    res.json(responseObject);
} catch (error) {
    next(error);
  }
});

languageRouter
  .post('/guess', jsonBodyParser, async (req, res, next) => {
    const {guess} = req.body;
    if (guess === undefined) {
      return res.status(400).json({error: 'Missing \'guess\' in request body'});
    }
    try {
      const language = await LanguageService.getUsersLanguage(req.app.get('db'), req.language.user_id);
      const words = await LanguageService.getLanguageWords(req.app.get('db'), req.language.id);
      const word = words.find(element => element.id === language.head);
      const list = new LinkedList();
      await LanguageService.updateLanguageHead(req.app.get('db'), req.language.user_id, words.find(element => element.id === language.head).next);
      let currWord = words.find(element => element.id === language.head);
      while (currWord.next !== null) {
        list.insertLast(currWord);
        currWord = words.find(element => element.id === currWord.next);
      }
      list.insertLast(currWord);

      list.display();
      list.remove(word);
      if (guess === word.translation) {
        await LanguageService.correctAnswer(req.app.get('db'), word.id, word.correct_count);
        await LanguageService.incrementTotalScore(req.app.get('db'), req.language.user_id, language.total_score);
        await LanguageService.updateMemValue(req.app.get('db'), word.id, word.memory_value * 2);
        list.insertAt(word, word.memory_value * 2);
      } else {
        await LanguageService.incorrectAnswer(req.app.get('db'), word.id, word.incorrect_count);
        await LanguageService.updateMemValue(req.app.get('db'), word.id, 1);
        list.insertAt(word, 1);
      }
      currWord = list.head;
      list.display();
      while (currWord.next !== null) {
        await LanguageService.updateNextValue(req.app.get('db'), currWord.value.id, currWord.next.value.id);
        currWord = currWord.next;
      }

      const newWords = await LanguageService.getLanguageWords(req.app.get('db'), req.language.id);
      const newWord = newWords.find(element => element.id === language.head);
      const newLanguage = await LanguageService.getUsersLanguage(req.app.get('db'), req.language.user_id);

      await LanguageService.updateNextValue(req.app.get('db'), currWord.value.id, null);
      const responseObject = {
        nextWord: newWords.find(nw => nw.id === newLanguage.head).original,
        wordCorrectCount: newWord.correct_count,
        wordIncorrectCount: newWord.incorrect_count,
        totalScore: newLanguage.total_score,
        answer: word.translation,
        isCorrect: guess === word.translation
      };
      res.json(responseObject);
    } catch (error) {
      next(error);
    }
  });

module.exports = languageRouter;
