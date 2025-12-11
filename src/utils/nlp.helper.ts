export class NLPHelper {
  private static readonly textToNumber: Record<string, number> = {
    'zero': 0, 'one': 1, 'two': 2, 'three': 3, 'four': 4, 'five': 5,
    'six': 6, 'seven': 7, 'eight': 8, 'nine': 9, 'ten': 10,
    'eleven': 11, 'twelve': 12, 'thirteen': 13, 'fourteen': 14, 'fifteen': 15,
    'sixteen': 16, 'seventeen': 17, 'eighteen': 18, 'nineteen': 19, 'twenty': 20,
    'twenty one': 21, 'twenty two': 22, 'twenty three': 23, 'twenty four': 24,
    'twenty five': 25, 'twenty six': 26, 'twenty seven': 27, 'twenty eight': 28,
    'twenty nine': 29, 'thirty': 30, 'forty': 40, 'fifty': 50, 'sixty': 60,
    'seventy': 70, 'eighty': 80, 'ninety': 90, 'hundred': 100
  };

  static parseQuestionNumber(input: string): { 
    number: number | null; 
    confidence: 'high' | 'medium' | 'low';
    userInput: string;
  } {
    const cleaned = input.trim().toLowerCase();
    const originalInput = input.trim();
    
    const directNum = Number(cleaned);
    if (!isNaN(directNum) && directNum >= 1 && directNum <= 100) {
      return { 
        number: Math.floor(directNum), 
        confidence: 'high',
        userInput: originalInput
      };
    }

    if (this.textToNumber[cleaned]) {
      const num = this.textToNumber[cleaned];
      if (num >= 1 && num <= 100) {
        return { 
          number: num, 
          confidence: 'high',
          userInput: originalInput
        };
      }
    }

    const words = cleaned.split(/[\s-]+/);
    if (words.length === 2) {
      const first = this.textToNumber[words[0]] || 0;
      const second = this.textToNumber[words[1]] || 0;
      if (first >= 20 && first <= 90 && second >= 1 && second <= 9) {
        return { 
          number: first + second, 
          confidence: 'high',
          userInput: originalInput
        };
      }
    }

    const phraseMatch = cleaned.match(/(?:question|number|q|#)\s*(\w+)/);
    if (phraseMatch) {
      const extracted = phraseMatch[1];
      const numFromPhrase = Number(extracted);
      if (!isNaN(numFromPhrase) && numFromPhrase >= 1 && numFromPhrase <= 100) {
        return { 
          number: Math.floor(numFromPhrase), 
          confidence: 'high',
          userInput: originalInput
        };
      }
      if (this.textToNumber[extracted]) {
        const num = this.textToNumber[extracted];
        if (num >= 1 && num <= 100) {
          return { 
            number: num, 
            confidence: 'high',
            userInput: originalInput
          };
        }
      }
    }

    const typoMatch = this.findClosestNumber(cleaned);
    if (typoMatch) {
      return {
        number: typoMatch.number,
        confidence: 'medium',
        userInput: originalInput
      };
    }

    const numMatch = cleaned.match(/\d+/);
    if (numMatch) {
      const num = parseInt(numMatch[0]);
      if (num >= 1 && num <= 100) {
        return { 
          number: num, 
          confidence: 'low',
          userInput: originalInput
        };
      }
    }

    return { number: null, confidence: 'low', userInput: originalInput };
  }

  private static findClosestNumber(input: string): { number: number } | null {
    const candidates = Object.keys(this.textToNumber);
    let bestMatch = null;
    let bestDistance = Infinity;

    for (const candidate of candidates) {
      const distance = this.levenshteinDistance(input, candidate);
      if (distance < bestDistance && distance <= 2) {
        bestDistance = distance;
        bestMatch = candidate;
      }
    }

    if (bestMatch) {
      const num = this.textToNumber[bestMatch];
      if (num >= 1 && num <= 100) {
        return { number: num };
      }
    }

    return null;
  }

  private static levenshteinDistance(a: string, b: string): number {
    const matrix = Array(b.length + 1).fill(null).map(() => Array(a.length + 1).fill(0));
    
    for (let i = 0; i <= a.length; i++) matrix[0][i] = i;
    for (let j = 0; j <= b.length; j++) matrix[j][0] = j;
    
    for (let j = 1; j <= b.length; j++) {
      for (let i = 1; i <= a.length; i++) {
        const cost = a[i - 1] === b[j - 1] ? 0 : 1;
        matrix[j][i] = Math.min(
          matrix[j][i - 1] + 1,
          matrix[j - 1][i] + 1,
          matrix[j - 1][i - 1] + cost
        );
      }
    }
    
    return matrix[b.length][a.length];
  }

  static generateConversationalMessage(context: {
    type: 'welcome' | 'invalid_input' | 'generating' | 'question_ready' | 
          'correct' | 'incorrect' | 'trials_exhausted' | 'qualified' | 
          'already_answered' | 'need_more' | 'uncertain_parse' | 
          'range_error' | 'missing_answer' | 'short_answer' | 
          'server_error' | 'validation_error';
    data?: any;
  }): string {
    const messages = {
      welcome: [
        "Hey there!  Ready to test your tech knowledge? Give me a number between 1 and 100, and I'll generate a question for you!",
        "Welcome! I'm here to challenge your technical expertise. Pick any number from 1 to 100 to get started!",
        "Hi!  Let's see what you've got! Choose a number from 1-100 and I'll whip up a question for you.",
        "Ready to dive in? Pick any number between 1 and 100, and let's test your tech skills!",
        "Welcome aboard!  Give me a number (1-100) and I'll generate an awesome tech question for you!",
      ],
      invalid_input: [
        `Hmm, I'm not sure what "${context.data?.input || 'that'}" means. Could you give me a number between 1 and 100? You can type '5', 'five', or even 'question 5' - I understand them all! `,
        `I didn't quite catch that! Try a number from 1 to 100. Feel free to spell it out like 'twenty three' or just type '23' - whatever's easier for you!`,
        `Oops! I need a number between 1 and 100 to generate your question. You can say it however you like: '42', 'forty two', or 'question 42' all work!`,
        `I'm a bit confused by "${context.data?.input || 'that'}". Can you try again with a number from 1-100? Numbers or words both work - '7' or 'seven'! `,
        `Hmm, "${context.data?.input || 'that'}" isn't ringing a bell. Give me something like '15', 'fifteen', or 'number 15' - I'm flexible!`,
        `Not quite getting that one!  Try entering a number between 1 and 100. You can write '8', 'eight', 'q8', or 'question 8' - I'll understand!`,
      ],
      range_error: [
        `Hold on! I can only work with numbers between 1 and 100. You gave me ${context.data?.number}. Pick something in that range!`,
        `Whoa there! ${context.data?.number} is outside my range. I need a number from 1 to 100. Try again! `,
        `Oops! ${context.data?.number} won't work - I only have questions numbered 1-100. Pick one in that range!`,
        `That's ${context.data?.number}! Way too ${context.data?.number > 100 ? 'high' : 'low'}! Stick with 1-100 please. `,
        `Nice try, but ${context.data?.number} is out of bounds! I've got questions 1-100 ready for you. Choose one of those!`,
      ],
      generating: [
        `Great choice!  Let me think of an interesting question about ${context.data?.topic || 'tech'} for you... This'll just take a moment!`,
        `Alright! Generating question #${context.data?.number || ''}... I'm cooking up something challenging! `,
        `Perfect! Working on question ${context.data?.number || ''} for you. Hang tight while I craft something good!`,
        `Nice! Let me whip up a ${context.data?.topic || 'tech'} question for you... Thinking... `,
        `Question ${context.data?.number || ''} coming right up! Give me a sec to generate something interesting about ${context.data?.topic || 'tech'}...`,
        `Love it!  Generating a fresh question on ${context.data?.topic || 'tech'}. Stand by!`,
      ],
      question_ready: [
        `Here's your question! Take your time and give me a thoughtful answer (2-5 sentences works great). Good luck! `,
        `Alright, here we go! Read carefully and share your best answer. Remember, I'm looking for understanding, not just memorization!`,
        `Question ready! Show me what you know - explain your reasoning and I'll evaluate your understanding. You've got this! `,
        `Here it is! Give me a detailed answer that shows you understand the concept. A few sentences should do it! `,
        `Check this out! Take a moment to think, then explain your answer in 2-5 sentences. Let's see what you've got! `,
        `Boom! Question delivered. Write out your answer with some explanation so I can see how well you understand this! `,
      ],
      correct: [
        ` Excellent! That's absolutely right! You really know your stuff. Score: ${context.data?.score}/${context.data?.trials}. ${context.data?.remaining > 0 ? `${context.data?.remaining} trials left!` : ''}`,
        `Brilliant!  Your answer demonstrates solid understanding. Current score: ${context.data?.score}. ${context.data?.qualified ? "You're qualified to spin the wheel! " : `Keep going - you're doing great!`}`,
        `Yes! Spot on!  I can tell you really understand this concept. Score: ${context.data?.score}. ${context.data?.remaining > 0 ? `${context.data?.remaining} more chances to improve!` : ''}`,
        `Perfect!  That's exactly what I was looking for. You're at ${context.data?.score} correct now. ${context.data?.remaining > 0 ? `${context.data?.remaining} tries remaining!` : 'Nice work!'}`,
        `Nailed it!  Your explanation shows you've got this down. Current score: ${context.data?.score}. ${context.data?.qualified ? 'Time to spin that wheel! ' : 'Keep this momentum!'}`,
        `Absolutely correct!  Well explained! Score: ${context.data?.score}/${context.data?.trials}. ${context.data?.remaining > 0 ? `Still have ${context.data?.remaining} more shots!` : ''}`,
      ],
      incorrect: [
        `Not quite, but that's okay - learning happens through trying! The key point is: ${context.data?.feedback || 'check the explanation'}. Score: ${context.data?.score}/${context.data?.trials}. ${context.data?.remaining > 0 ? `${context.data?.remaining} trials remaining!` : ''}`,
        `Hmm, not this time, but I appreciate the effort! ${context.data?.feedback || ''} Your score: ${context.data?.score}. ${context.data?.remaining > 0 ? `Don't give up - ${context.data?.remaining} more chances!` : ''}`,
        `Close, but missing some key details. ${context.data?.feedback || ''} Keep pushing! Score: ${context.data?.score}. ${context.data?.remaining > 0 ? `${context.data?.remaining} trials left to qualify!` : ''}`,
        `Not exactly right. ${context.data?.feedback || 'Review the core concept and try another one!'} Current: ${context.data?.score}/${context.data?.trials}. ${context.data?.remaining > 0 ? `${context.data?.remaining} more to go!` : ''}`,
        `That's not it, but good attempt! ${context.data?.feedback || ''} Score: ${context.data?.score}. ${context.data?.remaining > 0 ? `You've got ${context.data?.remaining} more chances - keep trying!` : ''}`,
        `Ooh, missed that one. ${context.data?.feedback || 'The answer needs more detail.'} Current score: ${context.data?.score}. ${context.data?.remaining > 0 ? `${context.data?.remaining} attempts left!` : ''}`,
      ],
      trials_exhausted: [
        `You've used all ${context.data?.trials || ''} of your trials! Your final score is ${context.data?.score}. ${context.data?.qualified ? "Great news - you qualified for the wheel spin! " : "Better luck next time!"}`,
        `That's all your attempts! You finished with ${context.data?.score} correct answers. ${context.data?.qualified ? "Congratulations! You can spin the wheel now! " : "Keep practicing and you'll do better next time!"}`,
        `Game over! You've exhausted all ${context.data?.trials || ''} tries. Final score: ${context.data?.score}. ${context.data?.qualified ? "But hey, you qualified! Go spin!" : "Come back and try again later!"}`,
        `That's a wrap! All ${context.data?.trials || ''} attempts used. You got ${context.data?.score} correct. ${context.data?.qualified ? "You made it! Head to the wheel! " : "Practice makes perfect - try again soon!"}`,
      ],
      qualified: [
        ` Amazing! You've hit ${context.data?.score} correct answers - you're qualified to spin the wheel! Want to try more questions or head to the wheel?`,
        `Congratulations! With ${context.data?.score} correct answers, you've earned your spin! Feel free to keep playing or claim your reward!`,
        `You did it!  ${context.data?.score} correct answers means you qualify! Ready to spin the wheel or keep going?`,
        `Woohoo! You've reached ${context.data?.score} correct - that's qualification territory! Spin the wheel whenever you're ready!`,
        `Success!  ${context.data?.score} right answers puts you over the top! You can spin now or keep building your score!`,
      ],
      already_answered: [
        `Hold on! ${context.data?.byYou ? "You've already answered this question" : "Someone else already grabbed this one"}. Pick a different number and let's keep going! `,
        `Oops! Question ${context.data?.number || 'that one'} is taken. ${context.data?.byYou ? "You answered it already!" : "Another player beat you to it!"} Try another number!`,
        `Whoa there! ${context.data?.byYou ? "You've tackled this one before" : "This question's already been claimed"}. Choose a different number! `,
        `Not so fast! ${context.data?.byYou ? "You already did this one!" : "Someone snagged this question already."} Pick another number between 1-100!`,
        `Question ${context.data?.number || 'that'} is off the table - ${context.data?.byYou ? "you've answered it" : "it's been answered"}. Try a different one! `,
      ],
      need_more: [
        `You're making progress! You need ${context.data?.needed || ''} more correct ${context.data?.needed === 1 ? 'answer' : 'answers'} to qualify for the spin. Current score: ${context.data?.score}. You have ${context.data?.remaining || ''} ${context.data?.remaining === 1 ? 'trial' : 'trials'} left - keep going! `,
        `Getting there! ${context.data?.needed || ''} more correct to qualify. Score: ${context.data?.score}. ${context.data?.remaining || ''} attempts remaining. You can do this! `,
        `Almost there! Just ${context.data?.needed || ''} more right to qualify! Current: ${context.data?.score}. ${context.data?.remaining || ''} ${context.data?.remaining === 1 ? 'try' : 'tries'} left. Keep pushing! `,
        `So close! You need ${context.data?.needed || ''} more to spin the wheel. You're at ${context.data?.score} with ${context.data?.remaining || ''} attempts left! `,
        `Making progress! ${context.data?.needed || ''} more correct ${context.data?.needed === 1 ? 'gets' : 'get'} you qualified. Score: ${context.data?.score}/${context.data?.remaining || ''} remaining! `,
      ],
      uncertain_parse: [
        `I think you meant question ${context.data?.number || ''}? Let me know if that's right, or give me a different number! (I interpreted "${context.data?.input}" as ${context.data?.number})`,
        `Just checking - did you mean #${context.data?.number || ''}? I'm like 80% sure that's what "${context.data?.input}" means, but correct me if I'm wrong!`,
        `Is ${context.data?.number || ''} what you wanted? I got that from "${context.data?.input}" but I might be off. Confirm or give me another number! `,
        `I'm guessing question ${context.data?.number || ''} based on "${context.data?.input}". That right? If not, just tell me the correct number!`,
      ],
      missing_answer: [
        "I didn't see your answer! Could you write out your response? I'm looking for 2-5 sentences explaining your thinking. ",
        "Hold up - where's your answer?  Write out your explanation so I can evaluate it!",
        "Oops! You forgot to include your answer. Give me 2-5 sentences explaining your response!",
        "I need your answer to grade this! Write out what you think with some explanation. ",
        "No answer detected! Type out your response (a few sentences) so I can check if you're right!",
      ],
      short_answer: [
        "That's a bit short! Could you explain a bit more? I need at least a few sentences to properly evaluate your understanding. Think of it like explaining to a friend! ",
        "Too brief! Give me more detail - I need to see that you really understand this. Aim for 2-5 sentences! ",
        "Expand on that! Your answer needs more explanation. Write a few sentences showing your reasoning. ",
        "A bit too short there! I need more depth to properly grade this. Explain your thinking in 2-5 sentences! ",
        "Can you elaborate? That's not quite enough for me to evaluate. Give me a fuller explanation (2-5 sentences)! ",
      ],
      server_error: [
        "Oops! Something went wrong on my end. Mind trying that again? ",
        "Yikes! I hit a technical snag. Can you give that another shot? ",
        "Hmm, I ran into trouble processing that. Try again? ",
        "Server hiccup! Give me another chance - try that again!",
        "Technical difficulties! My bad. Can you retry that? ",
      ],
      validation_error: [
        "Hmm, I ran into trouble validating your answer. Mind trying again? ",
        "My validation system glitched. Can you resubmit your answer? ",
        "Error checking your answer! Try submitting it again. ",
        "Validation hiccup! Give me another shot at grading that. ",
      ],
    };

    const options = messages[context.type];
    return options[Math.floor(Math.random() * options.length)];
  }
}