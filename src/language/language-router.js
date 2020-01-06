const express = require('express')
const LanguageService = require('./language-service')
const { requireAuth } = require('../middleware/jwt-auth')
const LinkedList = require('./LinkedList');

const languageRouter = express.Router();
const jsonBodyParser = express.json();

languageRouter
.use(requireAuth)
.get('/head', async (req, res, next) => {
  try {
    const language = await LanguageService.getUsersLanguage(
      req.app.get('db'),
      req.user.id  
    );
    const words = await LanguageService.getLanguageWords(
      req.app.get('db'),
      language.id, //Test to see if its referring to this id
    );
    const currentWord = words.find(element => element.id === language.head);
    const responseObject = {
      next: currentWord.original,
      wordCorrectCount: currentWord.correct_count,
      wordIncorrectCount: currentWord.incorrect_count,
      score: language.total_score
    };
    res.json(responseObject);
    console.log(responseObject,language, words,'test')
} catch (error) {
    next(error);
  }


languageRouter
  .get('/:id', async (req, res, next) => {
    try {
      //req.language.id is requesting a word from the database to be translated.
      //matching the word with the language id and then requesting that language
      //and returning the translated word.
      const words = await LanguageService.getLanguageWords(
        req.app.get('db'),
        req.params.id
      );
      res.json({
        // language: req.params.id,
        words
      });
      next();
    } catch (error) {
      next(error);
    }
  });
});

languageRouter
// jsonBodyParser,
  .post('/userInput', jsonBodyParser, async (req, res, next) => {
    const {userInput} = req.body;
    if (userInput === undefined) {
      return res.status(400).json({error: 'Missing \'userInput\' in request body'});
    }
    try {
      const language = await LanguageService.getUsersLanguage(
        req.app.get('db'), 
        req.user.id
      );
      const words = await LanguageService.getLanguageWords(
        req.app.get('db'), 
        language.id
      );
      const word = words.find(element => element.id === language.head);
      const list = new LinkedList();
      await LanguageService.updateLanguageHead(req.app.get('db'), language.user_id, words.find(element => element.id === language.head).next);
      let currWord = words.find(element => element.id === language.head);
      console.log(currWord)
      console.log(currWord.next);
      while (currWord.next !== null) {
        currWord = words.find(element => element.id === currWord.next);
        list.insertLast(currWord);
      }
      list.display();
      list.remove(word);
      if (userInput === word.translation) {
        console.log('userinput is equal to word.translation')
        await LanguageService.correctAnswer(req.app.get('db'), word.id, word.correct_count);
        await LanguageService.incrementTotalScore(req.app.get('db'), req.user.id, language.total_score);
        await LanguageService.updateMemValue(req.app.get('db'), word.id, word.memory_value * 2);
        list.insertAt(word, word.memory_value * 2);
      } else {
        console.log('userinput incorrect')
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
      const newLanguage = await LanguageService.getUsersLanguage(req.app.get('db'), req.user.id);

      await LanguageService.updateNextValue(req.app.get('db'), currWord.value.id, null);
      const responseObject = {
        nextWord: newWords.find(nw => nw.id === newLanguage.head).original,
        wordCorrectCount: newWord.correct_count,
        wordIncorrectCount: newWord.incorrect_count,
        totalScore: newLanguage.total_score,
        answer: word.translation,
        isCorrect: userInput === word.translation
      };
      res.json(responseObject);
    } catch (error) {
      next(error);
    }
  });

module.exports = languageRouter;
