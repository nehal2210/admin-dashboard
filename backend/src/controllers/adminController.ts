import { db } from "@/db";
import { words, wordAudio } from "@/db/schema";
import { eq } from "drizzle-orm";
import { NextResponse } from "next/server";

export async function addCourseWord(req: Request) {
  try {
    const body = await req.json();
    const { source, target } = body;

    // Insert source word
    const [sourceWordResult] = await db.insert(words)
      .values({
        languageId: 1, // Replace with actual language ID
        text: source.word,
        partOfSpeech: source.partOfSpeech,
      })
      .returning();

    // Insert source word audio entries
    if (source.voiceTypes.length > 0) {
      await db.insert(wordAudio)
        .values(
          source.voiceTypes.map((voice: any) => ({
            wordId: sourceWordResult.id,
            characterId: 1, // Replace with actual character mapping
            audioUrl: voice.audioUrl,
          }))
        );
    }

    // Insert target word
    const [targetWordResult] = await db.insert(words)
      .values({
        languageId: 2, // Replace with actual language ID
        text: target.word,
        partOfSpeech: target.partOfSpeech,
      })
      .returning();

    // Insert target word audio entries
    if (target.voiceTypes.length > 0) {
      await db.insert(wordAudio)
        .values(
          target.voiceTypes.map((voice: any) => ({
            wordId: targetWordResult.id,
            characterId: 1, // Replace with actual character mapping
            audioUrl: voice.audioUrl,
          }))
        );
    }

    return NextResponse.json({ 
      success: true, 
      message: "Words stored successfully",
      data: { sourceWord: sourceWordResult, targetWord: targetWordResult }
    });

  } catch (error) {
    console.error("Error storing course words:", error);
    return NextResponse.json(
      { success: false, message: "Error storing words" },
      { status: 500 }
    );
  }
}
