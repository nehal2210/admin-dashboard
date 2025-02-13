import express, { Router } from 'express';
import { adminController } from '../controllers/adminController';

const router: Router = express.Router();

// Sentences routes
router.post('/sentences', adminController.createSentence as express.RequestHandler);
router.get('/sentences', adminController.getSentences as express.RequestHandler);

// Sentence Audio routes
router.post('/sentence-audio', adminController.createSentenceAudio as express.RequestHandler);
router.get('/sentence-audio', adminController.getSentenceAudios as express.RequestHandler);

export default router;