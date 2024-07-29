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
