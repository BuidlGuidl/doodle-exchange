"use server";

export async function getGpt4oClassify(image: string) {
  const payload = {
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: "Please look at my drawing and guess a simple one-word answer. Output only your guess. If you see only text in the drawing, respond with 'CHEATER'.",
          },
          {
            type: "image_url",
            image_url: {
              url: image,
              detail: "low",
            },
          },
        ],
      },
    ],
    max_tokens: 300,
  };

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    return { answer: data?.choices[0].message.content };
  } catch (error) {
    return { error: "Something wrong with gpt4 classification" };
  }
}

export async function getGpt4oEvaluate(image: string, word: string) {
  const payload = {
    model: "gpt-4o",
    messages: [
      {
        role: "user",
        content: [
          {
            type: "text",
            text: `On a scale from 0 to 1000, evaluate how clearly and accurately this image represents the word ${word}. Please consider the following criteria in your assessment: 1. Visual Clarity (0-400 points): How clear and easy to understand is the image? Are the details sharp and well-defined? 2. Relevance (0-300 points): How closely does the image relate to the word ${word}? Does it effectively convey the intended meaning? 3. Overall Depiction (0-300 points): How well does the image capture the essence of the word? Is the composition effective and engaging? Instructions: Provide a numerical score based on the criteria above, ensuring that the total score reflects your assessment across all categories. Please provide only the total numerical score.`,
          },
          {
            type: "image_url",
            image_url: {
              url: image,
              detail: "low",
            },
          },
        ],
      },
    ],
    max_tokens: 300,
  };

  try {
    const response = await fetch("https://api.openai.com/v1/chat/completions", {
      method: "POST",
      headers: {
        "Content-Type": "application/json",
        Authorization: `Bearer ${process.env.OPENAI_API_KEY}`,
      },
      body: JSON.stringify(payload),
    });

    const data = await response.json();

    return { answer: data?.choices[0].message.content };
  } catch (error) {
    console.log(error);
    return { error: "Something wrong with gpt4 evaluation" };
  }
}
