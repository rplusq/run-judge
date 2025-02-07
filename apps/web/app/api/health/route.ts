import { Agent } from "@/lib/agent";

export async function GET() {
  const agent = new Agent();

  try {
   console.log("Received health check request");

    console.log("Initializing agent...");
    await agent.initialize();
    console.log("Agent initialized successfully");

    console.log("Starting agent analysis...");
    // const stream = await agentAnalyze(agent);
    // console.log("Analysis stream created");

    // for await (const chunk of stream) {
    //   console.log("Stream chunk:", chunk);
    // }

    return Response.json({ status: "OK" });
  } catch (error) {
    console.error("Error in health check:", error);
    return Response.json({
      status: "ERROR",
      message: error instanceof Error ? error.message : "Unknown error"
    }, { status: 500 });
  }
}
