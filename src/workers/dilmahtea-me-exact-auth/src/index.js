export default {
  async scheduled(_, env, ctx) {
    ctx.waitUntil(
      new Promise(async (resolve, reject) => {
        const refresh_token = await env.EXACT_TOKENS.get("REFRESH_TOKEN");

        const data = {
          refresh_token,
          grant_type: "refresh_token",
          client_id: env.EXACT_OAUTH_CLIENT_ID,
          client_secret: env.EXACT_OAUTH_CLIENT_SECRET,
        };

        const response = await fetch(env.EXACT_OAUTH_TOKEN_API_ENDPOINT, {
          method: "POST",
          headers: {
            "Content-Type": "application/x-www-form-urlencoded;",
          },
          body: new URLSearchParams(data).toString(),
        }).then((res) => res.json());

        if (response.error) {
          reject(response.error + " | " + response.error_description);
        }

        await Promise.all([
          env.EXACT_TOKENS.put("ACCESS_TOKEN", response.access_token),
          env.EXACT_TOKENS.put("REFRESH_TOKEN", response.refresh_token),
        ]);

        resolve();
      }),
    );
  },
};
