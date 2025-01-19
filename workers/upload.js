export default {
    async fetch(request, env, ctx) {
      // Handle CORS
      if (request.method === "OPTIONS") {
        return new Response(null, {
          headers: {
            "Access-Control-Allow-Origin": "*",
            "Access-Control-Allow-Methods": "GET, POST, OPTIONS",
            "Access-Control-Allow-Headers": "Content-Type, Authorization",
          },
        })
      }
  
      // Verify authorization
      const authHeader = request.headers.get("Authorization")
      if (!authHeader || authHeader !== `Bearer ${env.API_TOKEN}`) {
        return new Response("Unauthorized", { status: 401 })
      }
  
      if (request.method === "POST") {
        try {
          const formData = await request.formData()
          const file = formData.get("file")
          
          if (!file) {
            return new Response("No file provided", { status: 400 })
          }
  
          // Generate a unique filename
          const timestamp = Date.now()
          const fileName = `${timestamp}-${file.name}`
  
          // Upload to R2
          await env.MY_BUCKET.put(fileName, file, {
            httpMetadata: {
              contentType: file.type,
            },
          })
  
          return new Response(JSON.stringify({
            success: true,
            fileName: fileName
          }), {
            headers: {
              "Content-Type": "application/json",
              "Access-Control-Allow-Origin": "*",
            },
          })
  
        } catch (error) {
          console.error("Upload error:", error)
          return new Response("Upload failed", { status: 500 })
        }
      }
  
      return new Response("Method not allowed", { status: 405 })
    },
  } 