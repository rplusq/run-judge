export async function GET() {
  try {
    console.log("Received health check request");
    console.log("Checking agent service health...");

    const agentServiceUrl = process.env.NEXT_PUBLIC_AGENT_SERVICE_URL;
    if (!agentServiceUrl) {
      throw new Error(
        "NEXT_PUBLIC_AGENT_SERVICE_URL environment variable is not set"
      );
    }

    const response = await fetch(`${agentServiceUrl}/health`);
    const data = await response.json();

    if (!response.ok) {
      throw new Error(`Agent service returned status ${response.status}`);
    }

    return Response.json({ status: "OK", agent: data });
  } catch (error) {
    console.error("Error in health check:", error);
    return Response.json(
      {
        status: "ERROR",
        message: error instanceof Error ? error.message : "Unknown error",
      },
      { status: 500 }
    );
  }
}
