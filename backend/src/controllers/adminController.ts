import { Request, Response } from 'express';
import db from '../db/drizzle';
import { sentences, sentenceAudio } from '../db/schema';
import { eq } from 'drizzle-orm';
import { CreateSentenceRequest, SentenceResponse } from '../types/sentence';

// Create sentences with audio
export const createSentence = async (req: Request, res: Response) => {
    try {
        const data: CreateSentenceRequest = req.body;

        // Insert source sentence
        const [sourceSentence] = await db.insert(sentences)
            .values({
                id: 32,
                text: data.source.sentence,
                languageId: 2 // Source language ID
            })
            .returning();

        // Insert target sentence
        const [targetSentence] = await db.insert(sentences)
            .values({
                id: 43,
                text: data.target.sentence,
                languageId: 1 // Target language ID
            })
            .returning();

        // Insert source sentence audio records
        // const sourceAudioPromises = data.source.voiceTypes[0]
            await db.insert(sentenceAudio)
                .values({
                    id: 2223,
                    sentenceId: sourceSentence.id,
                    characterId: data.source.voiceTypes[0].characterId,
                    audioUrl: data.source.voiceTypes[0].audioUrl,
                    durationMs: 1
                })
                .returning()
        // );

        // Insert target sentence audio records
        //  await data.target.voiceTypes[0]
            await db.insert(sentenceAudio)
                .values({
                    id: 2213,
                    sentenceId: targetSentence.id,
                    characterId: data.target.voiceTypes[0].characterId,
                    audioUrl: data.target.voiceTypes[0].audioUrl,
                    durationMs: 1
                })
                .returning()

        // Wait for all audio insertions to complete
        // await Promise.all([...sourceAudioPromises, ...targetAudioPromises]);

        res.status(201).json({
            message: 'Sentences and audio created successfully',
            data: {
                sourceSentenceId: sourceSentence.id,
                targetSentenceId: targetSentence.id
            }
        });

    } catch (error) {
        console.error('Error creating sentences:', error);
        res.status(500).json({ error: 'Failed to create sentences and audio' });
    }
};

// Get sentences with audio
export const getSentences = async (req: Request, res: Response) => {
    try {
        // Get all target sentences (languageId = 1)
        const allSentences = await db.select()
            .from(sentences)
            .where(eq(sentences.languageId, 1))
            .execute();

        const response: SentenceResponse[] = [];

        for (const targetSent of allSentences) {
            // Find corresponding source sentence
            const sourceSent = await db.select()
                .from(sentences)
                .where(eq(sentences.languageId, 2))
                .execute();

            if (sourceSent.length > 0) {
                // Get audio for both sentences
                const sourceAudio = await db.select()
                    .from(sentenceAudio)
                    .where(eq(sentenceAudio.sentenceId, sourceSent[0].id))
                    .execute();

                const targetAudio = await db.select()
                    .from(sentenceAudio)
                    .where(eq(sentenceAudio.sentenceId, targetSent.id))
                    .execute();

                response.push({
                    source: {
                        sentence: sourceSent[0].text,
                        voiceTypes: sourceAudio.map(audio => ({
                            characterId: audio.characterId!,
                            audioUrl: audio.audioUrl
                        }))
                    },
                    target: {
                        sentence: targetSent.text,
                        voiceTypes: targetAudio.map(audio => ({
                            characterId: audio.characterId!,
                            audioUrl: audio.audioUrl
                        }))
                    }
                });
            }
        }

        res.status(200).json(response);

    } catch (error) {
        console.error('Error fetching sentences:', error);
        res.status(500).json({ error: 'Failed to fetch sentences' });
    }
};

// Create sentence audio
export const createSentenceAudio = async (req: Request, res: Response) => {
    try {
        const { sentenceId, characterId, audioUrl, durationMs } = req.body;

        if (!sentenceId || !audioUrl || !durationMs) {
            return res.status(400).json({ 
                error: 'SentenceId, audioUrl, and durationMs are required' 
            });
        }

        const newAudio = await db.insert(sentenceAudio)
            .values({
                sentenceId,
                characterId,
                audioUrl,
                durationMs
            })
            .returning();

        res.status(201).json(newAudio[0]);
    } catch (error) {
        console.error('Error creating sentence audio:', error);
        res.status(500).json({ error: 'Failed to create sentence audio' });
    }
};

// Get sentence audio
// export const getSentenceAudio = async (req: Request, res: Response) => {
//     try {
//         const { sentenceId } = req.query;

//         let query = db.select().from(sentenceAudio);
        
//         if (sentenceId) {
//             query = query.where(eq(sentenceAudio.sentenceId, Number(sentenceId)));
//         }

//         const audioRecords = await query;
//         res.status(200).json(audioRecords);
//     } catch (error) {
//         console.error('Error fetching sentence audio:', error);
//         res.status(500).json({ error: 'Failed to fetch sentence audio' });
//     }
// };
