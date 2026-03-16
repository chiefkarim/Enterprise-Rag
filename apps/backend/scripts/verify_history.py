
import httpx
import asyncio
import json

async def send_query(client, query, history=[]):
    url = "http://localhost:8000/chat"
    payload = {
        "query": query,
        "history": history
    }
    
    print(f"\nUser: {query}")
    print("Assistant: ", end="", flush=True)
    
    response_content = ""
    async with client.stream("POST", url, json=payload) as response:
        if response.status_code != 200:
            print(f"Error: {response.status_code}")
            print(await response.aread())
            return ""

        async for line in response.aiter_lines():
            if line.startswith("data: "):
                data_str = line[len("data: "):]
                if data_str == "[DONE]":
                    break
                
                try:
                    data = json.loads(data_str)
                    if "token" in data:
                        token = data["token"]
                        print(token, end="", flush=True)
                        response_content += token
                    elif "error" in data:
                        print(f"\nError in stream: {data['error']}")
                except json.JSONDecodeError:
                    pass
    print()
    return response_content

async def main():
    async with httpx.AsyncClient(timeout=60.0) as client:
        # Turn 1
        history = []
        q1 = "My name is Karim. Remember that."
        ans1 = await send_query(client, q1, history)
        
        history.append({"role": "user", "content": q1})
        history.append({"role": "assistant", "content": ans1})
        
        # Turn 2
        q2 = "What is my name?"
        ans2 = await send_query(client, q2, history)
        
        if "Karim" in ans2:
            print("\n✅ Success: Assistant remembered the name!")
        else:
            print("\n❌ Failure: Assistant did NOT remember the name.")

if __name__ == "__main__":
    asyncio.run(main())
