import { useState } from "react";
import { Button } from "./ui/button";
import { Sheet, SheetContent, SheetTrigger } from "./ui/sheet";
import { Input } from "./ui/input";
import { MessageCircle, Send, X } from "lucide-react";
import { toast } from "sonner";
import { sendChatMessage } from "@/services/api";
import { LineChart, Line, XAxis, YAxis, Tooltip, ResponsiveContainer } from "recharts";
import { useQuery } from "@tanstack/react-query";
import { fetchTopAssets } from "@/services/api";

interface Message {
  role: "user" | "assistant";
  content: string;
  chart?: {
    data: any[];
    type: "line";
    title: string;
  };
}

export const ChatBot = () => {
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [isLoading, setIsLoading] = useState(false);

  // Fetch crypto data
  const { data: cryptoData } = useQuery({
    queryKey: ["assets"],
    queryFn: fetchTopAssets,
    refetchInterval: 30000,
  });

  const handleSubmit = async (e: React.FormEvent) => {
    e.preventDefault();
    if (!input.trim()) return;

    const userMessage = input.trim();
    setInput("");
    
    const newUserMessage: Message = { role: "user", content: userMessage };
    setMessages(prev => [...prev, newUserMessage]);
    setIsLoading(true);

    try {
      console.log("Sending chat message:", userMessage);
      const recentMessages = messages.slice(-5);
      const response = await sendChatMessage(userMessage, recentMessages);
      console.log("Received chat response:", response);
      
      const newAssistantMessage: Message = {
        role: "assistant",
        content: response.message,
        chart: response.chart
      };
      
      if (response.chart) {
        console.log("Chart data received:", response.chart);
      }
      
      setMessages(prev => [...prev, newAssistantMessage]);
    } catch (error) {
      console.error("Chat error:", error);
      toast.error("Failed to get response from chatbot");
    } finally {
      setIsLoading(false);
    }
  };

  const renderChart = (chartData: Message["chart"]) => {
    if (!chartData?.data || !Array.isArray(chartData.data) || chartData.data.length === 0) {
      console.log("Invalid chart data:", chartData);
      return null;
    }

    console.log("Rendering chart with data:", chartData);

    return (
      <div className="w-full h-[300px] mt-4 border-2 border-black p-4 bg-white rounded-lg">
        <p className="text-lg font-bold mb-4">{chartData.title}</p>
        <ResponsiveContainer width="100%" height="100%">
          <LineChart data={chartData.data}>
            <XAxis 
              dataKey="time" 
              tickFormatter={(timestamp) => new Date(timestamp).toLocaleDateString()}
              stroke="#000000"
            />
            <YAxis 
              domain={["auto", "auto"]}
              stroke="#000000"
              tickFormatter={(value) => `$${value.toLocaleString()}`}
            />
            <Tooltip
              contentStyle={{
                backgroundColor: "#ffffff",
                border: "2px solid #000000",
                borderRadius: "4px",
                padding: "8px"
              }}
              formatter={(value: any) => [`$${Number(value).toLocaleString()}`, "Price"]}
              labelFormatter={(label) => new Date(label).toLocaleDateString()}
            />
            <Line
              type="monotone"
              dataKey="priceUsd"
              stroke="#FF1F8F"
              strokeWidth={2}
              dot={false}
              activeDot={{ r: 6 }}
            />
          </LineChart>
        </ResponsiveContainer>
      </div>
    );
  };

  return (
    <Sheet>
      <SheetTrigger asChild>
        <Button
          className="fixed bottom-4 right-4 h-12 w-12 rounded-full bg-[#FF1F8F] p-0 text-white hover:bg-[#FF1F8F]/90"
          size="icon"
        >
          <MessageCircle className="h-6 w-6" />
        </Button>
      </SheetTrigger>
      <SheetContent className="w-[90vw] sm:w-[400px]">
        <div className="flex h-full flex-col">
          <div className="flex items-center justify-between border-b pb-4">
            <h2 className="text-lg font-bold">Crypto Assistant</h2>
            <SheetTrigger asChild>
              <Button variant="ghost" size="icon">
                <X className="h-4 w-4" />
              </Button>
            </SheetTrigger>
          </div>

          <div className="flex-1 overflow-y-auto py-4">
            {messages.map((message, index) => (
              <div
                key={index}
                className={`mb-4 flex ${
                  message.role === "user" ? "justify-end" : "justify-start"
                }`}
              >
                <div
                  className={`max-w-[80%] rounded-lg px-4 py-2 ${
                    message.role === "user"
                      ? "bg-[#FF1F8F] text-white"
                      : "border-2 border-black bg-[#FFE800]"
                  }`}
                >
                  <div>{message.content}</div>
                  {message.chart && renderChart(message.chart)}
                </div>
              </div>
            ))}
            {isLoading && (
              <div className="flex justify-start">
                <div className="max-w-[80%] animate-pulse rounded-lg border-2 border-black bg-gray-100 px-4 py-2">
                  Thinking...
                </div>
              </div>
            )}
          </div>

          <form onSubmit={handleSubmit} className="flex gap-2 border-t pt-4">
            <Input
              value={input}
              onChange={(e) => setInput(e.target.value)}
              placeholder="Ask about crypto..."
              className="flex-1"
              disabled={isLoading}
            />
            <Button
              type="submit"
              disabled={isLoading}
              className="bg-[#FF1F8F] hover:bg-[#FF1F8F]/90"
            >
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </div>
      </SheetContent>
    </Sheet>
  );
};