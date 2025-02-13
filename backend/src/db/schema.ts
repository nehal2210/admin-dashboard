import { relations } from "drizzle-orm";
import { boolean, date, integer, pgEnum, pgTable, primaryKey, serial, text, timestamp, uuid, varchar } from "drizzle-orm/pg-core";


// Enums
export const difficultyLevelEnum = pgEnum('difficulty_level', ['A1', 'A2', 'B1', 'B2', 'C1', 'C2']);
export const gameTypesEnum = pgEnum("type", ["ChoosePic", "DragDrop", "AstroTrash", "SpeakMatch", "ListenChoice", "Conversation", "MatchPairs"]);
export const listenChoiceTypesEnum = pgEnum("type", ["wordAnswer", "sentenceAnswer"]);
export const matchPairsEnum = pgEnum("match_type", ["SentToSent", "ListenToSent"]);
export const matchPairsPartEnum = pgEnum("match_part_type", ["word", "sentence"]);
export const lessonStatusEnum = pgEnum("status", ["ACTIVE", "COMPLETE", "INCOMPLETE"]);

export const languages = pgTable('languages', {
  id: serial("id").primaryKey(),
  code: varchar('code', { length: 10 }).unique().notNull(),
  name: varchar('name', { length: 50 }).notNull(),
  flagImage: text('flag_image')
});

// Users Table
export const users = pgTable("users", {
  id: uuid("id").primaryKey().defaultRandom(),
  googleId: varchar("google_id"),
  courseId: integer("course_id").references(() => courses.id, { onDelete: "cascade" }).notNull(),
  username: varchar("username", { length: 50 }).notNull(),
  email: varchar("email", { length: 100 }).notNull(), // new feild
  avatar: text("avatar").notNull(),
  current_level: difficultyLevelEnum('current_level').default('A1'),
  hearts: integer("hearts").notNull().default(5),
  totalXp: integer("total_xp").notNull().default(0),
  dailyXp: integer("daily_xp").notNull().default(0),
  weeklyXp: integer("weekly_xp").notNull().default(0),
  streakDays: integer("streak_days").notNull().default(0),
  birthday: date("birthday"), // new feild
  gender: text("gender"),
  // add this for getting new users count
  createdAt: timestamp('created_at').defaultNow(),
  activityTime: timestamp('activity_time').defaultNow()
});

export const leaderboard = pgTable('leaderboard', {
  id: serial("id").primaryKey(),
  userId: uuid('user_id').references(() => users.id).notNull(),
  rank: integer('rank').notNull(),
  score: integer('score').notNull()
});

export const characters = pgTable('characters', {
  id: serial('id').primaryKey(),
  name: varchar('name', { length: 100 }).notNull().unique(),
  riveFile: text('rive_file'),
});

// Courses Table
export const courses = pgTable("courses", {
  id: serial("id").primaryKey(),
  title: text("title").notNull(),
  image: text("image").notNull(),
  baseLanguage: integer("base_language").references(() => languages.id).notNull(),
  targetLanguage: integer("target_language").references(() => languages.id).notNull(),
});

// Sections Table
export const sections = pgTable("sections", {
  id: serial("id").primaryKey(),
  courseId: integer("course_id").references(() => courses.id),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  difficultyLevel: difficultyLevelEnum('current_level'),
  order: integer("order"),
  unlockThreshold: integer("unlock_threshold"),
});

// Units Table
export const units = pgTable("units", {
  id: serial("id").primaryKey(),
  sectionId: integer("section_id").references(() => sections.id),
  title: varchar("title", { length: 200 }).notNull(),
  description: text("description"),
  order: integer("order").notNull(),
});

// Lessons Table
export const lessons = pgTable("lessons", {
  id: serial("id").primaryKey(),
  title: varchar("title",).notNull(),
  unitId: integer("unit_id").references(() => units.id, { onDelete: "cascade" }).notNull(),
  valueXp: integer("value_xp").default(100),
  order: integer("order").notNull(),
});

// lesson Progress Table
export const lessonProgress = pgTable("game_progress", {
  id: serial("id").primaryKey(),
  lessonId: integer("lesson_id").references(() => lessons.id, { onDelete: "cascade" }).notNull(),
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }).notNull(),
  status: lessonStatusEnum("status").notNull().default("INCOMPLETE"),
});

// Words Table
export const words = pgTable("words", {
  id: serial("id").primaryKey(),
  languageId: integer("language_id").references(() => languages.id, { onDelete: "cascade" }),
  text: varchar("text", { length: 50 }).notNull(),
  partOfSpeech: varchar("part_of_speech", { length: 50 }),
  createdAt: timestamp("created_at").defaultNow(),
});

// Word Audio Table
export const wordAudio = pgTable("word_audio", {
  id: serial("id").primaryKey(),
  wordId: integer("word_id").references(() => words.id, { onDelete: "cascade" }),
  characterId: integer('character_id').references(() => characters.id, { onDelete: 'cascade' }),
  audioUrl: text("audio_url"),
  // durationMs: integer("duration_ms"),
});

// Word Translations Table
export const wordTranslations = pgTable("word_translations", {
  baseWordId: integer("base_word_id").references(() => words.id, { onDelete: "cascade" }),
  targetWordId: integer("target_word_id").references(() => words.id, { onDelete: "cascade" }),
  confidence: integer("confidence"),  // Confidence score for the translation
}, (t) => {
  return { pk: primaryKey({ columns: [t.baseWordId, t.targetWordId] }) };
});

// User Vocabulary Table
export const userVocabulary = pgTable("user_vocabulary", {
  userId: uuid("user_id").references(() => users.id, { onDelete: "cascade" }),
  wordId: integer("word_id").references(() => words.id, { onDelete: "cascade" }),
  strength: integer("strength"),
  lastPracticed: timestamp("last_practiced"),
  nextReview: timestamp("next_review"),
}, (t) => {
  return { pk: primaryKey({ columns: [t.userId, t.wordId] }) };
});

// Sentences Table
export const sentences = pgTable('sentences', {
  id: serial('id').primaryKey(),
  text: text('text').notNull(),
  languageId: integer('language_id')
    .references(() => languages.id, { onDelete: "cascade" })
    .notNull()
});

// Sentence Audio Table
export const sentenceAudio = pgTable('sentence_audio', {
  id: serial('id').primaryKey(),
  sentenceId: integer('sentence_id')
    .references(() => sentences.id, { onDelete: "cascade" })
    .notNull(),
  characterId: integer('character_id').references(() => characters.id, { onDelete: 'cascade' }),
  audioUrl: text('audio_url').notNull(),
  durationMs: integer('duration_ms'),
});

// Sentence Translations Table
export const sentenceTranslations = pgTable('sentence_translations', {
  baseSentenceId: integer('base_sentence_id')
    .references(() => sentences.id, { onDelete: "cascade" })
    .notNull(),
  targetSentenceId: integer('target_sentence_id')
    .references(() => sentences.id, { onDelete: "cascade" })
    .notNull(),
  confidence: integer('confidence').default(1)
}, (table) => { return { pk: primaryKey({ columns: [table.baseSentenceId, table.targetSentenceId] }) } }

);

// Games Table
export const games = pgTable("games", {
  id: serial("id").primaryKey(),
  lessonId: integer("lesson_id").references(() => lessons.id, { onDelete: "cascade" }).notNull(),
  type: gameTypesEnum("type").notNull(),
  order: integer("order").notNull(),
});

// ChoosePic Table
export const choosePic = pgTable("choose_pic", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").references(() => games.id, { onDelete: "cascade" }).notNull(),
  baseSentenceId: integer('base_sentence_id').references(() => sentences.id).notNull(),
});

// ChoosePicOptions Table
export const choosePicOptions = pgTable("choose_pic_options", {
  id: serial("id").primaryKey(),
  choosePicId: integer("choose_pic_id").references(() => choosePic.id, { onDelete: "cascade" }).notNull(),
  targetWordId: integer("target_word_id").references(() => words.id, { onDelete: "cascade" }).notNull(),
  image: text("image"),
  isCorrect: boolean("is_correct").notNull(),
  order: integer("order").notNull(),
});

// DragDrop Table
export const dragDrop = pgTable("drag_drop", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").references(() => games.id, { onDelete: "cascade" }).notNull(),
  baseSentenceId: integer("base_sentence_id").references(() => sentences.id, { onDelete: "cascade" }).notNull(),
  targetSentenceId: integer("target_sentence_id").references(() => sentences.id, { onDelete: "cascade" }).notNull(),
  image: text("image"),
});

// DragDropPart Table
export const dragDropPart = pgTable("drag_drop_part", {
  id: serial("id").primaryKey(),
  dragDropId: integer("drag_drop_id").references(() => dragDrop.id, { onDelete: "cascade" }).notNull(),
  wordTargetId: integer("word_target_id")
    .references(() => words.id, { onDelete: "cascade" })  // Corrected to reference words table
    .notNull(),
  order: integer("order").notNull(),
});

// AstroTrash Table
export const astroTrash = pgTable("astro_trash", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").references(() => games.id, { onDelete: "cascade" }).notNull(),
});

// AstroTrashGarbage Table
export const astroTrashGarbage = pgTable("astro_trash_garbage", {
  id: serial("id").primaryKey(),
  astroTrashId: integer("astro_trash_id").references(() => astroTrash.id, { onDelete: "cascade" }).notNull(),
  baseWordId: integer("base_word_id")
    .references(() => words.id, { onDelete: "cascade" }),  // Corrected to reference words table
  targetWordId: integer("target_word_id")
    .references(() => words.id, { onDelete: "cascade" })   // Corrected to reference words table
    .notNull(),
  image: text("image"),
  order: integer("order").notNull(),
});

// SpeakMatch Table
export const speakMatch = pgTable("speak_match", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").references(() => games.id, { onDelete: "cascade" }).notNull(),
  targetSentenceId: integer("target_sentence_id").references(() => sentences.id, { onDelete: "cascade" })  // Reference sentence directly
    .notNull(),
  image: text("image"),
});

// ListenChoice Table
export const listenChoice = pgTable("listen_choice", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").references(() => games.id, { onDelete: "cascade" }).notNull(),
  targetSentenceId: integer("target_sentence_id").references(() => sentences.id, { onDelete: "cascade" })  // Reference sentence directly
    .notNull(),
  image: text("image"),
  type: listenChoiceTypesEnum("listen_type").default('wordAnswer').notNull(),
});

// ListenChoiceOptions Table
export const listenChoiceOptions = pgTable("listen_choice_options", {
  id: serial("id").primaryKey(),
  listenChoiceId: integer("listen_choice_id").references(() => listenChoice.id, { onDelete: "cascade" }).notNull(),
  targetSentenceId: integer("target_sentence_id").references(() => sentences.id, { onDelete: "cascade" }),
  targetWordId: integer("target_word_id").references(() => words.id, { onDelete: "cascade" }),
  isCorrect: boolean("is_correct").notNull(),
  order: integer("order").notNull(),
});

// Conversation Table
export const conversation = pgTable("conversation", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").references(() => games.id, { onDelete: "cascade" }).notNull(),
  title: text("title").notNull(),
  description: text("description"),
});

// ConversationDialogue Table
export const conversationDialogue = pgTable("conversation_dialogue", {
  id: serial("id").primaryKey(),
  conversationId: integer("conversation_id").references(() => conversation.id, { onDelete: "cascade" }).notNull(),
  characterRole: text("character_role").notNull(),
  targetSentenceId: integer("target_sentence_id").references(() => sentences.id, { onDelete: "cascade" }).notNull(),
  baseSentenceId: integer("base_sentence_id").references(() => sentences.id, { onDelete: "cascade" }),
  order: integer("order").notNull(),
});

// ConversationDialogueResponse Table
export const conversationDialogueResponse = pgTable("conversation_dialogue_response", {
  id: serial("id").primaryKey(),
  dialogueId: integer("dialogue_id").references(() => conversationDialogue.id, { onDelete: "cascade" }).notNull(),
  targetSentenceId: integer("target_sentence_id").references(() => sentences.id, { onDelete: "cascade" }).notNull(),
  baseSentenceId: integer("base_sentence_id").references(() => sentences.id, { onDelete: "cascade" }),
  isCorrect: boolean("is_correct").notNull(),
  order: integer("order").notNull(),
});

// MatchPairs Table
export const matchPairs = pgTable("match_pairs", {
  id: serial("id").primaryKey(),
  gameId: integer("game_id").references(() => games.id, { onDelete: "cascade" }).notNull(),
  type: matchPairsEnum("match_type").notNull(),
  partType: matchPairsPartEnum("match_part_type").notNull(),
});

// MatchPairsPart Table
export const matchPairsWordPart = pgTable("match_pairs_part_word", {
  id: serial("id").primaryKey(),
  matchPairId: integer("match_pair_id").references(() => matchPairs.id, { onDelete: "cascade" }).notNull(),
  baseWordId: integer("base_word_id").references(() => words.id, { onDelete: "cascade" }),
  targetWordId: integer("target_word_id").references(() => words.id, { onDelete: "cascade" }),
  order: integer("order").notNull(),
});

export const matchPairsSentencePart = pgTable("match_pairs_part_sentence", {
  id: serial("id").primaryKey(),
  matchPairId: integer("match_pair_id").references(() => matchPairs.id, { onDelete: "cascade" }).notNull(),
  targetSentenceId: integer("target_sentence_id").references(() => sentences.id, { onDelete: "cascade" }).notNull(),
  baseSentenceId: integer("base_sentence_id").references(() => sentences.id, { onDelete: "cascade" }).notNull(),
  order: integer("order").notNull(),
});


// ############################################Relations#################################################3


// user relation
export const usersRelations = relations(users, ({ one, many }) => ({
  course: one(courses, {
    fields: [users.courseId],
    references: [courses.id],
  }),
  lessonProgress: many(lessonProgress),
  userVocabulary: many(userVocabulary),
  leaderboard: many(leaderboard),
}));

export const leaderboardRelations = relations(leaderboard, ({ one }) => ({
  user: one(users, {
    fields: [leaderboard.userId],
    references: [users.id],
  }),
}));


// Languages Relations
export const languagesRelations = relations(languages, ({ many }) => ({
  coursesBase: many(courses, { relationName: 'baseLanguage' }),
  coursesTarget: many(courses, { relationName: 'targetLanguage' }),
  words: many(words),
  sentences: many(sentences)
}));

// Courses Relations
export const coursesRelations = relations(courses, ({ many, one }) => ({
  users: many(users),
  sections: many(sections),
  baseLanguage: one(languages, {
    fields: [courses.baseLanguage],
    references: [languages.id],
    relationName: 'baseLanguage'
  }),
  targetLanguage: one(languages, {
    fields: [courses.targetLanguage],
    references: [languages.id],
    relationName: 'targetLanguage'
  })
}));

export const charactersRelations = relations(characters, ({ many }) => ({
  wordAudios: many(wordAudio),
  sentenceAudios: many(sentenceAudio),
}));

// Sections Relationships
export const sectionsRelations = relations(sections, ({ one, many }) => ({
  course: one(courses, {
    fields: [sections.courseId],
    references: [courses.id],
  }),
  units: many(units),
}));

// Units Relationships
export const unitsRelations = relations(units, ({ one, many }) => ({
  section: one(sections, {
    fields: [units.sectionId],
    references: [sections.id],
  }),
  lessons: many(lessons),
}));

// lesson relationship
export const lessonsRelations = relations(lessons, ({ one, many }) => ({
  unit: one(units, {
    fields: [lessons.unitId],
    references: [units.id],
  }),
  games: many(games), // One lesson can have many games
  lessonProgress: many(lessonProgress), // One lesson can have many progress records
}));

// lesson progress
export const lessonProgressRelations = relations(lessonProgress, ({ one }) => ({
  lesson: one(lessons, {
    fields: [lessonProgress.lessonId],
    references: [lessons.id],
  }),
  user: one(users, {
    fields: [lessonProgress.userId],
    references: [users.id],
  }),
}));


// Words Relations
export const wordsRelations = relations(words, ({ many, one }) => ({
  language: one(languages, {
    fields: [words.languageId],
    references: [languages.id]
  }),
  audio: many(wordAudio),
  translations: many(wordTranslations, { relationName: 'baseTranslations' }),
  translatedBy: many(wordTranslations, { relationName: 'targetTranslations' }),
  users: many(userVocabulary),
  choosePicOptions: many(choosePicOptions),
  dragDropParts: many(dragDropPart),
  astroGarbagebases: many(astroTrashGarbage, { relationName: 'baseWord' }),
  astroGarbageTargets: many(astroTrashGarbage, { relationName: 'targetWord' }),
  matchPairsbases: many(matchPairsWordPart, { relationName: 'baseWord' }),
  matchPairsTargets: many(matchPairsWordPart, { relationName: 'targetWord' })
}));

export const wordAudioRelations = relations(wordAudio, ({ one }) => ({
  word: one(words, {
    fields: [wordAudio.wordId],
    references: [words.id],
  }),

  character: one(characters, {
    fields: [wordAudio.characterId],
    references: [characters.id],
  }),
}));

export const wordTranslationsRelations = relations(wordTranslations, ({ one }) => ({
  baseWord: one(words, {
    fields: [wordTranslations.baseWordId],
    references: [words.id],
  }),
  targetWord: one(words, {
    fields: [wordTranslations.targetWordId],
    references: [words.id],
  }),
}));

// User Vocabulary Relations
export const userVocabularyRelations = relations(userVocabulary, ({ one }) => ({
  user: one(users, {
    fields: [userVocabulary.userId],
    references: [users.id]
  }),
  word: one(words, {
    fields: [userVocabulary.wordId],
    references: [words.id]
  })
}));


// Sentences Relations
export const sentencesRelations = relations(sentences, ({ many, one }) => ({
  language: one(languages, {
    fields: [sentences.languageId],
    references: [languages.id]
  }),
  audio: many(sentenceAudio),
  translations: many(sentenceTranslations, { relationName: 'baseTranslations' }),
  translatedBy: many(sentenceTranslations, { relationName: 'targetTranslations' }),
  choosePics: many(choosePic),
  dragDropsAsBase: many(dragDrop, { relationName: 'baseSentence' }),
  dragDropsAsTarget: many(dragDrop, { relationName: 'targetSentence' }),
  speakMatches: many(speakMatch),
  listenChoices: many(listenChoice),
  conversationDialogues: many(conversationDialogue),
  conversationResponses: many(conversationDialogueResponse),
  matchPairsBases: many(matchPairsSentencePart, { relationName: 'baseSentence' }),
  matchPairsTargets: many(matchPairsSentencePart, { relationName: 'targetSentence' })
}));

// Sentence Audio Relations
export const sentenceAudioRelations = relations(sentenceAudio, ({ one }) => ({
  sentence: one(sentences, {
    fields: [sentenceAudio.sentenceId],
    references: [sentences.id]
  }),
  character: one(characters, {
    fields: [sentenceAudio.characterId],
    references: [characters.id]
  })
}));

// Sentence Translations Relations
export const sentenceTranslationsRelations = relations(sentenceTranslations, ({ one }) => ({
  baseSentence: one(sentences, {
    fields: [sentenceTranslations.baseSentenceId],
    references: [sentences.id],
    relationName: 'baseTranslations'
  }),
  targetSentence: one(sentences, {
    fields: [sentenceTranslations.targetSentenceId],
    references: [sentences.id],
    relationName: 'targetTranslations'
  })
}));


// Games Relations
export const gamesRelations = relations(games, ({ many, one }) => ({
  lesson: one(lessons, {
    fields: [games.lessonId],
    references: [lessons.id]
  }),
  choosePics: many(choosePic),
  dragDrops: many(dragDrop),
  astroTrashGames: many(astroTrash),
  speakMatches: many(speakMatch),
  listenChoices: many(listenChoice),
  conversations: many(conversation),
  matchPairs: many(matchPairs)
}));


// ChoosePic Relations
export const choosePicRelations = relations(choosePic, ({ many, one }) => ({
  game: one(games, {
    fields: [choosePic.gameId],
    references: [games.id]
  }),
  baseSentence: one(sentences, {
    fields: [choosePic.baseSentenceId],
    references: [sentences.id]
  }),
  options: many(choosePicOptions)
}));


// ChoosePicOptions Relations
export const choosePicOptionsRelations = relations(choosePicOptions, ({ one }) => ({
  choosePic: one(choosePic, {
    fields: [choosePicOptions.choosePicId],
    references: [choosePic.id]
  }),
  targetWord: one(words, {
    fields: [choosePicOptions.targetWordId],
    references: [words.id]
  })
}));

// DragDrop Relations
export const dragDropRelations = relations(dragDrop, ({ many, one }) => ({
  game: one(games, {
    fields: [dragDrop.gameId],
    references: [games.id]
  }),
  baseSentence: one(sentences, {
    fields: [dragDrop.baseSentenceId],
    references: [sentences.id]
  }),
  targetSentence: one(sentences, {
    fields: [dragDrop.targetSentenceId],
    references: [sentences.id]
  }),
  parts: many(dragDropPart)
}));

// DragDropPart Relationships
export const dragDropPartRelations = relations(dragDropPart, ({ one }) => ({
  dragDrop: one(dragDrop, {
    fields: [dragDropPart.dragDropId],
    references: [dragDrop.id],
  }),
  wordTarget: one(words, {
    fields: [dragDropPart.wordTargetId],
    references: [words.id],
  }),
}));

export const astroTrashRelations = relations(astroTrash, ({ one, many }) => ({
  game: one(games, {
    fields: [astroTrash.gameId],
    references: [games.id],
  }),
  garbage: many(astroTrashGarbage),
}));


export const astroTrashGarbageRelations = relations(astroTrashGarbage, ({ one }) => ({
  astroTrash: one(astroTrash, {
    fields: [astroTrashGarbage.astroTrashId],
    references: [astroTrash.id],
  }),
  baseWord: one(words, {
    fields: [astroTrashGarbage.baseWordId],
    references: [words.id],
  }),
  targetWord: one(words, {
    fields: [astroTrashGarbage.targetWordId],
    references: [words.id],
  }),
}));

export const speakMatchRelations = relations(speakMatch, ({ one }) => ({
  game: one(games, {
    fields: [speakMatch.gameId],
    references: [games.id],
  }),
  targetSentence: one(sentences, {
    fields: [speakMatch.targetSentenceId],
    references: [sentences.id],
  }),
}));

export const listenChoiceRelations = relations(listenChoice, ({ one, many }) => ({
  game: one(games, {
    fields: [listenChoice.gameId],
    references: [games.id],
  }),
  options: many(listenChoiceOptions),
  targetSentence: one(sentences, {
    fields: [listenChoice.targetSentenceId],
    references: [sentences.id]
  }),
}));

// ListenChoiceOptions Relations
export const listenChoiceOptionsRelations = relations(listenChoiceOptions, ({ one }) => ({
  listenChoice: one(listenChoice, {
    fields: [listenChoiceOptions.listenChoiceId],
    references: [listenChoice.id]
  }),
  targetSentence: one(sentences, {
    fields: [listenChoiceOptions.targetSentenceId],
    references: [sentences.id]
  }),
  targetWord: one(words, {
    fields: [listenChoiceOptions.targetWordId],
    references: [words.id]
  })
}));

// MatchPairs Relations
export const matchPairsRelations = relations(matchPairs, ({ many, one }) => ({
  game: one(games, {
    fields: [matchPairs.gameId],
    references: [games.id]
  }),
  wordParts: many(matchPairsWordPart),
  sentenceParts: many(matchPairsSentencePart)
}));

export const matchPairsWordPartRelations = relations(matchPairsWordPart, ({ one }) => ({
  matchPair: one(matchPairs, {
    fields: [matchPairsWordPart.matchPairId],
    references: [matchPairs.id],
  }),

  baseWord: one(words, {
    fields: [matchPairsWordPart.baseWordId],
    references: [words.id],
  }),

  targetWord: one(words, {
    fields: [matchPairsWordPart.targetWordId],
    references: [words.id],
  }),
}));


// matchPairsSentencePart Relations
export const matchPairsSentencePartRelations = relations(matchPairsSentencePart, ({ one }) => ({
  matchPair: one(matchPairs, {
    fields: [matchPairsSentencePart.matchPairId],
    references: [matchPairs.id]
  }),
  targetSentence: one(sentences, {
    fields: [matchPairsSentencePart.targetSentenceId],
    references: [sentences.id]
  }),
  baseSentence: one(sentences, {
    fields: [matchPairsSentencePart.baseSentenceId],
    references: [sentences.id]
  })
}));

// Conversation Relations
export const conversationRelations = relations(conversation, ({ many, one }) => ({
  game: one(games, {
    fields: [conversation.gameId],
    references: [games.id]
  }),
  dialogues: many(conversationDialogue)
}));


// ConversationDialogue Relations
export const conversationDialogueRelations = relations(conversationDialogue, ({ many, one }) => ({
  conversation: one(conversation, {
    fields: [conversationDialogue.conversationId],
    references: [conversation.id]
  }),
  targetSentence: one(sentences, {
    fields: [conversationDialogue.targetSentenceId],
    references: [sentences.id]
  }),
  baseSentence: one(sentences, {
    fields: [conversationDialogue.baseSentenceId],
    references: [sentences.id]
  }),
  responses: many(conversationDialogueResponse)
}));


// ConversationDialogueResponse Relations
export const conversationDialogueResponseRelations = relations(conversationDialogueResponse, ({ one }) => ({
  dialogue: one(conversationDialogue, {
    fields: [conversationDialogueResponse.dialogueId],
    references: [conversationDialogue.id]
  }),
  targetSentence: one(sentences, {
    fields: [conversationDialogueResponse.targetSentenceId],
    references: [sentences.id]
  }),
  baseSentence: one(sentences, {
    fields: [conversationDialogueResponse.baseSentenceId],
    references: [sentences.id]
  })
}));

