import React, { useState } from "react";
import { Bell, Moon, Sparkles, Sun, Send, Bot, User, X } from "lucide-react";
import { SidebarTrigger } from "@/components/ui/sidebar";
import { Input } from "@/components/ui/input";
import { Button } from "@/components/ui/button";
import { Avatar, AvatarFallback } from "@/components/ui/avatar";
import { Sheet, SheetContent, SheetHeader, SheetTitle } from "@/components/ui/sheet";
import {
  DropdownMenu,
  DropdownMenuContent,
  DropdownMenuItem,
  DropdownMenuLabel,
  DropdownMenuSeparator,
  DropdownMenuTrigger,
} from "@/components/ui/dropdown-menu";
import { useAuthStore } from "@/store/auth";
import { useUIStore } from "@/store/ui";
import { useLogout } from "@/hooks/useAuth";

interface Message {
  sender: "user" | "ai";
  text: string;
}

export function TopNavbar() {
  const user = useAuthStore((s) => s.user);
  const theme = useUIStore((s) => s.theme);
  const toggleTheme = useUIStore((s) => s.toggleTheme);
  const logout = useLogout();
  const initials = user?.name?.split(" ").map((p) => p[0]).slice(0, 2).join("") ?? "EA";

  // Side panel open/close state
  const [isOpen, setIsOpen] = useState(false);
  const [inputMessage, setInputMessage] = useState("");
  const [messages, setMessages] = useState<Message[]>([
    { sender: "ai", text: "Hello! I am EcoSphere AI. Ask me anything about your ESG data, carbon emissions, or employee leaderboard rankings." }
  ]);

  const sendMessage = (e: React.FormEvent) => {
    e.preventDefault();
    if (!inputMessage.trim()) return;

    const userText = inputMessage;
    const newMessages = [...messages, { sender: "user" as const, text: userText }];
    setMessages(newMessages);
    setInputMessage("");

    // Simulate AI thinking and replying
    setTimeout(() => {
      const query = userText.toLowerCase();
      let reply = "";

      if (query.includes("emission") || query.includes("co2") || query.includes("carbon")) {
        reply = "Total CO2 Emissions are sitting at 1,240 kg. The environmental track is currently stable (Green status).";
      } else if (query.includes("employee") || query.includes("xp") || query.includes("leaderboard") || query.includes("performer")) {
        reply = "Lena Kaur is currently leading the dashboard leaderboard with 520 XP points, closely followed by Ayesha Rao at 410 XP.";
      } else if (query.includes("issue") || query.includes("compliance") || query.includes("governance")) {
        reply = "There are 3 open governance compliance issues that require urgent review. None are marked critically overdue yet.";
      } else {
        reply = `I've analyzed your question about "${userText}". All EcoSphere services are synchronized with your PostgreSQL database, and your current modules are operational! Let me know if you need specific breakdowns.`;
      }

      setMessages([...newMessages, { sender: "ai", text: reply }]);
    }, 600);
  };

  return (
    <>
      <header className="sticky top-0 z-30 flex h-14 items-center gap-4 border-b bg-background px-4 lg:px-6">
        <SidebarTrigger />
        <div className="hidden items-center gap-2 rounded-md border bg-muted/50 px-2 py-1 sm:flex">
          <span className="rounded-md bg-primary/15 px-2 text-xs font-medium text-primary">
            Acme Corp
          </span>
          <span className="text-xs text-muted-foreground">Q3 2026</span>
        </div>

        <div className="ml-auto flex items-center gap-2">
          {/* Ask EcoSphere AI Button */}
          <Button
            variant="ghost"
            size="sm"
            className="flex gap-2 text-primary hover:bg-primary/10"
            onClick={() => setIsOpen(true)}
          >
            <Sparkles className="h-4 w-4" /> Ask EcoSphere AI
          </Button>

          {/* Theme Toggle */}
          <Button variant="ghost" size="icon" onClick={toggleTheme} aria-label="Toggle theme">
            {theme === "dark" ? <Sun className="h-4 w-4" /> : <Moon className="h-4 w-4" />}
          </Button>

          {/* User Account Menu */}
          <DropdownMenu>
            <DropdownMenuTrigger asChild>
              <button className="ml-1 flex items-center gap-2 rounded-full focus:outline-none">
                <Avatar className="h-7 w-7">
                  <AvatarFallback className="bg-primary/20 text-xs font-bold">
                    {initials.toUpperCase()}
                  </AvatarFallback>
                </Avatar>
                <span className="hidden text-sm font-medium sm:block">
                  {user?.name ?? "Guest"}
                </span>
              </button>
            </DropdownMenuTrigger>
            <DropdownMenuContent align="end" className="w-56">
              <DropdownMenuLabel>{user?.email ?? "Not signed in"}</DropdownMenuLabel>
              <DropdownMenuSeparator />
              <DropdownMenuItem onClick={logout} className="text-destructive">
                Sign out
              </DropdownMenuItem>
            </DropdownMenuContent>
          </DropdownMenu>
        </div>
      </header>

      {/* Right-Side Slide-Out AI Panel */}
      <Sheet open={isOpen} onOpenChange={setIsOpen}>
        <SheetContent side="right" className="w-[400px] sm:w-[440px] h-full flex flex-col p-0 gap-0 border-l bg-zinc-950 text-zinc-50 border-zinc-800">
          <SheetHeader className="p-4 border-b border-zinc-800 flex flex-row items-center justify-between">
            <SheetTitle className="flex items-center gap-2 text-base font-semibold text-zinc-50">
              <Bot className="h-5 w-5 text-emerald-500" /> EcoSphere AI Copilot
            </SheetTitle>
          </SheetHeader>

          {/* Chat Conversational Viewport */}
          <div className="flex-1 overflow-y-auto p-4 flex flex-col gap-3">
            {messages.map((msg, i) => (
              <div
                key={i}
                className={`flex gap-2.5 max-w-[85%] rounded-lg p-3 text-sm ${
                  msg.sender === "user"
                    ? "bg-emerald-600 text-white ml-auto"
                    : "bg-zinc-900 text-zinc-100 border border-zinc-800"
                }`}
              >
                {msg.sender === "ai" && <Bot className="h-4 w-4 text-emerald-400 mt-0.5 shrink-0" />}
                <p className="whitespace-pre-line leading-relaxed">{msg.text}</p>
              </div>
            ))}
          </div>

          {/* Message Input Workspace Container */}
          <form onSubmit={sendMessage} className="p-4 border-t border-zinc-800 bg-zinc-900/50 flex gap-2 mb-safe">
            <Input
              value={inputMessage}
              onChange={(e) => setInputMessage(e.target.value)}
              placeholder="Ask about data, emissions, rankings..."
              className="flex-1 bg-zinc-950 border-zinc-800 text-zinc-100 placeholder:text-zinc-500 focus-visible:ring-emerald-500"
            />
            <Button type="submit" size="icon" className="bg-emerald-600 hover:bg-emerald-700 text-white shrink-0">
              <Send className="h-4 w-4" />
            </Button>
          </form>
        </SheetContent>
      </Sheet>
    </>
  );
}