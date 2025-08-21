import React, { useEffect, useRef, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TextInput,
  TouchableOpacity,
  KeyboardAvoidingView,
  Platform,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useLocalSearchParams } from "expo-router";
import {
  getMessages,
  getOrCreateConversation,
  type Message,
} from "../../src/lib/api";
import { useAuth } from "../../src/context/AuthContext";
import { getSocket } from "../../src/lib/socket";

export default function ChatScreen() {
  const { user } = useAuth();
  const params = useLocalSearchParams<{
    userId?: string;
    username?: string;
    conversationId?: string;
  }>();

  const [conversationId, setConversationId] = useState<string | undefined>(
    params.conversationId
  );
  const [messages, setMessages] = useState<Message[]>([]);
  const [input, setInput] = useState("");
  const [typing, setTyping] = useState(false);
  const [loading, setLoading] = useState(true);

  const listRef = useRef<FlatList<Message>>(null);
  const otherUserId = params.userId as string | undefined;
  const otherUsername = params.username ?? "User";

  // Profile initials
  const initials = otherUsername
    .split(" ")
    .map((w) => w[0])
    .join("")
    .slice(0, 2)
    .toUpperCase();

  // Get or create conversation
  useEffect(() => {
    (async () => {
      if (!conversationId && otherUserId) {
        const convo = await getOrCreateConversation(otherUserId);
        setConversationId(convo._id);
      }
    })();
  }, [otherUserId, conversationId]);

  // Fetch messages
  useEffect(() => {
    (async () => {
      if (!conversationId) return;
      setLoading(true);
      try {
        const data = await getMessages(conversationId);
        setMessages(data);
        setTimeout(() => listRef.current?.scrollToEnd({ animated: false }), 100);
      } finally {
        setLoading(false);
      }
    })();
  }, [conversationId]);

  // Socket listeners
  useEffect(() => {
    const s = getSocket();
    if (!s) return;

    const onNew = (msg: Message) => {
      if (msg.conversationId === conversationId) {
        setMessages((prev) => [...prev, msg]);
        listRef.current?.scrollToEnd({ animated: true });
      }
    };

    const onTyping = (payload: { typing: boolean; conversationId: string }) => {
      if (payload.conversationId === conversationId) {
        setTyping(payload.typing);
      }
    };

    s.on("message:new", onNew);
    s.on("typing", onTyping);

    return () => {
      s.off("message:new", onNew);
      s.off("typing", onTyping);
    };
  }, [conversationId]);

  // Send message
  const send = () => {
    const s = getSocket();
    if (!s || !conversationId || !input.trim() || !user?.id) return;

    const text = input.trim();
    s.emit("message:send", {
      conversationId,
      sender: user.id,
      to: otherUserId,
      text,
    });

    setMessages((prev) => [
      ...prev,
      {
        _id: Math.random().toString(36).slice(2),
        conversationId,
        sender: user.id,
        text,
        createdAt: new Date().toISOString(),
      },
    ]);

    setInput("");
    setTyping(false);
  };

  // Typing event
  const onChangeText = (t: string) => {
    setInput(t);
    const s = getSocket();
    if (!s || !otherUserId || !conversationId) return;
    s.emit("typing", { to: otherUserId, conversationId, typing: !!t });
  };

  // Format time
  const formatTime = (iso: string) => {
    const d = new Date(iso);
    return d.toLocaleTimeString([], { hour: "2-digit", minute: "2-digit" });
  };

  const renderItem = ({ item }: { item: Message }) => {
    const mine =
      (typeof item.sender === "string"
        ? item.sender
        : item.sender._id) === user?.id;
    return (
      <View
        style={[
          styles.bubble,
          mine ? styles.mine : styles.theirs,
          mine ? { alignSelf: "flex-end" } : { alignSelf: "flex-start" },
        ]}
      >
        <Text style={{ color: "#111" }}>{item.text}</Text>
        <Text style={styles.time}>{formatTime(item.createdAt)}</Text>
      </View>
    );
  };

  return (
    <KeyboardAvoidingView
      style={{ flex: 1, backgroundColor: "#e5ddd5" }}
      behavior={Platform.OS === "ios" ? "padding" : undefined}
    >
      {/* Header like WhatsApp */}
      <View style={styles.header}>
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{initials}</Text>
        </View>
        <Text style={styles.headerName}>{otherUsername}</Text>
      </View>

      <View style={{ flex: 1 }}>
        {typing && <Text style={styles.typingText}>Typing...</Text>}

        {loading ? (
          <ActivityIndicator
            style={{ marginTop: 20 }}
            size="large"
            color="#075e54"
          />
        ) : (
          <FlatList
            ref={listRef}
            data={messages}
            keyExtractor={(item) => item._id}
            renderItem={renderItem}
            contentContainerStyle={{ padding: 12, paddingBottom: 4 }}
            onContentSizeChange={() =>
              listRef.current?.scrollToEnd({ animated: false })
            }
          />
        )}

        {/* Input Row */}
        <View style={styles.inputRow}>
          <TextInput
            style={styles.textInput}
            placeholder="Message"
            value={input}
            onChangeText={onChangeText}
            onSubmitEditing={send}
          />
          <TouchableOpacity style={styles.sendBtn} onPress={send}>
            <Text style={{ color: "#fff", fontWeight: "600" }}>Send</Text>
          </TouchableOpacity>
        </View>
      </View>
    </KeyboardAvoidingView>
  );
}

const styles = StyleSheet.create({
  header: {
    flexDirection: "row",
    alignItems: "center",
    backgroundColor: "#075e54",
    paddingVertical: 12,
    paddingHorizontal: 16,
  },
  headerName: { color: "#fff", fontSize: 16, fontWeight: "600" },
  avatar: {
    width: 36,
    height: 36,
    borderRadius: 18,
    backgroundColor: "#25d366",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 10,
  },
  avatarText: { color: "#fff", fontWeight: "700" },

  inputRow: {
    flexDirection: "row",
    padding: 8,
    borderTopWidth: 1,
    borderTopColor: "#ddd",
    backgroundColor: "#fff",
  },
  textInput: {
    flex: 1,
    backgroundColor: "#f6f6f6",
    borderRadius: 20,
    paddingHorizontal: 12,
    paddingVertical: 10,
    marginRight: 8,
  },
  sendBtn: {
    backgroundColor: "#075e54",
    paddingHorizontal: 16,
    justifyContent: "center",
    borderRadius: 20,
  },

  bubble: {
    maxWidth: "75%",
    padding: 10,
    borderRadius: 12,
    marginVertical: 6,
    elevation: 1,
  },
  mine: {
    backgroundColor: "#dcf8c6",
  },
  theirs: {
    backgroundColor: "#fff",
  },
  time: {
    fontSize: 10,
    color: "#555",
    alignSelf: "flex-end",
    marginTop: 4,
  },

  typingText: {
    textAlign: "center",
    padding: 4,
    color: "#666",
    fontStyle: "italic",
  },
});
