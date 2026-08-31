import Groq from "groq-sdk";

const groqOne = new Groq({
  apiKey: process.env.GROQ_API_KEY_ONE,
});

const groqTwo = new Groq({
  apiKey: process.env.GROQ_API_KEY_TWO,
});

const groqThree = new Groq({
  apiKey: process.env.GROQ_API_KEY_THREE,
});

const groqFour = new Groq({
  apiKey: process.env.GROQ_API_KEY_FOUR,
});

const groqFive = new Groq({
  apiKey: process.env.GROQ_API_KEY_FIVE,
});

const groqSix = new Groq({
  apiKey: process.env.GROQ_API_KEY_SIX,
});

export { groqOne, groqTwo, groqThree, groqFour, groqFive, groqSix };
