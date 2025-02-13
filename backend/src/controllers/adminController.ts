import { Request, Response } from 'express';
import db from '../db/drizzle';
import { sentences, sentenceAudio } from '../db/schema';
import { eq } from 'drizzle-orm';

export const adminController = {
  // Sentences endpoints
  createSentence: async (req: Request, res: Response): Promise<void> => {
    try {
      const { sentenceId, text, languageId } = req.body;
      
      if (!text || !languageId) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const newSentence = await db.insert(sentences).values({
        character_id: 21,
        text: String(text),
        language_id: Number(languageId)  // Changed from languageId to language_id to match schema
      }).returning();

      res.status(201).json(newSentence[0]);
    } catch (error) {
      console.error('Error creating sentence:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  getSentences: async (req: Request, res: Response) => {
    try {
      const allSentences = await db.select().from(sentences);
      res.status(200).json(allSentences);
    } catch (error) {
      console.error('Error fetching sentences:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  // Sentence Audio endpoints
  createSentenceAudio: async (req: Request, res: Response): Promise<void> => {
    try {
      const { sentenceId, characterId, audioUrl, durationMs } = req.body;
      
      if (!sentenceId || !audioUrl || !durationMs) {
        res.status(400).json({ error: 'Missing required fields' });
        return;
      }

      const newSentenceAudio = await db.insert(sentenceAudio).values({
        id: Number(sentenceId),
        character_id: characterId ? Number(characterId) : undefined,
        audio_url: String(audioUrl),
        duration_ms: Number(durationMs)
      }).returning();

      res.status(201).json(newSentenceAudio[0]);
    } catch (error) {
      console.error('Error creating sentence audio:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  },

  getSentenceAudios: async (req: Request, res: Response) => {
    try {
      const allSentenceAudios = await db.select().from(sentenceAudio);
      res.status(200).json(allSentenceAudios);
    } catch (error) {
      console.error('Error fetching sentence audios:', error);
      res.status(500).json({ error: 'Internal server error' });
    }
  }
};