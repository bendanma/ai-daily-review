export default {
  async fetch(request, env) {
    if (request.method === "OPTIONS") {
      return new Response(null, {
        headers: {
          "Access-Control-Allow-Origin": "*",
          "Access-Control-Allow-Methods": "POST, OPTIONS",
          "Access-Control-Allow-Headers": "Content-Type",
        },
      });
    }

    if (request.method !== "POST") {
      return new Response("Method not allowed", { status: 405 });
    }

    try {
      const { content, mood, problem, apiKey } = await request.json();

      if (!apiKey || !apiKey.trim()) {
        return new Response(JSON.stringify({ error: "请提供 DeepSeek API Key" }), {
          status: 400,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }

      if (!content || !content.trim()) {
        return new Response(JSON.stringify({ error: "请填写今日做了什么" }), {
          status: 400,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }

      const systemPrompt = `你是一个专业的个人成长分析助手，专注于帮助中国大学生和研究生进行每日复盘分析。

你的任务是根据用户输入内容，生成结构化复盘。

输出必须严格按照以下格式：

【今日总结】
对用户一天行为进行结构化总结

【情绪分析】
分析用户当前心理状态，用中文表达，不要说教

【问题识别】
指出核心问题，如果没有问题则输出"暂无明显问题"

【明日建议】
给出1-3条可执行建议，必须具体、可执行，不要空话

要求：
- 全部中文输出
- 语气自然
- 不要使用英文术语
- 不要扩展无关内容
- 不要输出多余标题或解释`;

      const userMessage = `今日做了：\n${content}\n\n情绪评分：\n${mood}/10\n\n当前问题：\n${problem || "无"}`;

      const res = await fetch("https://api.deepseek.com/chat/completions", {
        method: "POST",
        headers: {
          "Content-Type": "application/json",
          Authorization: `Bearer ${apiKey}`,
        },
        body: JSON.stringify({
          model: "deepseek-chat",
          messages: [
            { role: "system", content: systemPrompt },
            { role: "user", content: userMessage },
          ],
          temperature: 0.7,
          max_tokens: 2000,
        }),
      });

      if (!res.ok) {
        const errText = await res.text();
        return new Response(JSON.stringify({ error: `AI 调用失败 (${res.status})` }), {
          status: 500,
          headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
        });
      }

      const data = await res.json();
      const result = data.choices[0].message.content;

      return new Response(JSON.stringify({ result }), {
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    } catch (err) {
      return new Response(JSON.stringify({ error: "服务异常，请稍后重试" }), {
        status: 500,
        headers: { "Content-Type": "application/json", "Access-Control-Allow-Origin": "*" },
      });
    }
  },
};
