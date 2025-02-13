import express from 'express';
import { 
    createSentence,
    getSentences,
    createSentenceAudio,
    // getSentenceAudio 
} from '../controllers/adminController';

const router = express.Router();

// Sentence routes
router.post('/sentences', createSentence);
router.get('/sentences', getSentences);

// Sentence audio routes
// router.post('/sentence-audio', createSentenceAudio);
// router.get('/sentence-audio', getSentenceAudio);

export default router; 