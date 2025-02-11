import { Request, Response, RequestHandler } from 'express';
import { db } from "../db";
import { words, wordAudio } from "../db/schema";
import { NodePgDatabase } from 'drizzle-orm/node-postgres';
import * as schema from '../db/schema';

interface VoiceType {
  type: string;
  audioUrl: string;
  characterId: number;
}

interface WordData {
  word: string;
  partOfSpeech: string;
  languageId: number;
  voiceTypes: VoiceType[];
}

interface CourseWordsRequest extends Request {
  body: {
    source: WordData;
    target: WordData;
  }
}

export const addCourseWords: RequestHandler = async (
  req: CourseWordsRequest, 
  res: Response
): Promise<void> => {
    console.log('req.body', req.body);
    
    try {
        const { source, target } = req.body;

        await db.transaction(async (tx: NodePgDatabase<typeof schema>) => {
            // Insert source word
            const [sourceWordResult] = await tx
                .insert(words)
                .values({
                    languageId: source.languageId,
                    text: source.word,
                    partOfSpeech: source.partOfSpeech,
                })
                .returning({ id: words.id });

            // Insert source word audio entries
            if (source.voiceTypes.length > 0) {
                await tx.insert(wordAudio).values(
                    source.voiceTypes.map((voice: VoiceType) => ({
                        wordId: sourceWordResult.id,
                        characterId: voice.characterId,
                        audioUrl: voice.audioUrl,
                    }))
                );
            }

            // Insert target word
            const [targetWordResult] = await tx
                .insert(words)
                .values({
                    languageId: target.languageId,
                    text: target.word,
                    partOfSpeech: target.partOfSpeech,
                })
                .returning({ id: words.id });

            // Insert target word audio entries
            if (target.voiceTypes.length > 0) {
                await tx.insert(wordAudio).values(
                    target.voiceTypes.map((voice: VoiceType) => ({
                        wordId: targetWordResult.id,
                        characterId: voice.characterId,
                        audioUrl: voice.audioUrl,
                    }))
                );
            }
        });

        res.status(200).json({ message: "Words added successfully" });
    } catch (error) {
        console.error("Error adding course words:", error);
        res.status(500).json({ error: "Failed to add course words" });
    }
};