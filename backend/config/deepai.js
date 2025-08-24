const fetch = (...args) => import('node-fetch').then(mod => mod.default(...args));
const DEEPAI_API_KEY = process.env.DEEPAI_API_KEY;


const deepai = {
  chat: {
    completions: {
      create: async ({ model, messages }) => {
        // Combine messages into a single prompt
        const prompt = messages.map(m => m.content).join("\n").slice(0, 2000);
console.log("Sending to DeepAI:", prompt, DEEPAI_API_KEY);
        const response = await fetch("https://api.deepai.org/api/text-generator", {
          method: "POST",
          headers: {
            "Api-Key": DEEPAI_API_KEY,
            
            "Content-Type": "application/x-www-form-urlencoded",
          },
          
          body: new URLSearchParams({ text: prompt }),
        });

        const data = await response.json();
console.log("DeepAI response:", data);
        // Mimic OpenAI response structure
        return {
          choices: [
            {
              message: {
                content: data.output,
              },
            },
          ],
        };
      },
    },
  },
};

module.exports = { deepai };
