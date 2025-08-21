import React, { useEffect, useState } from "react";
import {
  View,
  Text,
  FlatList,
  TouchableOpacity,
  RefreshControl,
  StyleSheet,
  ActivityIndicator,
} from "react-native";
import { useRouter } from "expo-router";
import {
  fetchUsers,
  listConversations,
  type User,
  type Conversation,
} from "../../src/lib/api";
import { useAuth } from "../../src/context/AuthContext";

export default function HomeScreen() {
  const { logout, user } = useAuth();
  const router = useRouter();
  const [users, setUsers] = useState<User[]>([]);
  const [conversations, setConversations] = useState<Conversation[]>([]);
  const [refreshing, setRefreshing] = useState(false);
  const [loading, setLoading] = useState(true);

  const load = async () => {
    setRefreshing(true);
    try {
      const [u, c] = await Promise.all([fetchUsers(), listConversations()]);
      setUsers(u.filter((x) => x._id !== user?.id));
      setConversations(c);
    } catch (err) {
      console.error("Failed to load chats:", err);
    } finally {
      setRefreshing(false);
      setLoading(false);
    }
  };

  useEffect(() => {
    load();
  }, []);

  // Helper: generate initials
  const getInitials = (name: string) => {
    return name
      .split(" ")
      .map((part) => part.charAt(0).toUpperCase())
      .slice(0, 2)
      .join("");
  };

  const renderUserItem = ({ item }: { item: User }) => (
    <TouchableOpacity
      style={styles.item}
      onPress={() =>
        router.push({
          pathname: "/(app)/chat",
          params: { userId: item._id, username: item.username },
        })
      }
    >
      <View style={styles.itemContent}>
        {/* Avatar with initials */}
        <View style={styles.avatar}>
          <Text style={styles.avatarText}>{getInitials(item.username)}</Text>
        </View>

        <View style={{ flex: 1 }}>
          <Text style={styles.name}>{item.username}</Text>
          <Text
            style={[
              styles.status,
              { color: item.status === "online" ? "#4caf50" : "#999" },
            ]}
          >
            {item.status === "online" ? "● Online" : "○ Offline"}
          </Text>
        </View>
      </View>
    </TouchableOpacity>
  );

  return (
    <View style={styles.container}>

      {/* Loading Indicator */}
      {loading ? (
        <View style={styles.loadingContainer}>
          <ActivityIndicator size="large" color="#007bff" />
          <Text style={{ marginTop: 8, color: "#555" }}>Loading chats...</Text>
        </View>
      ) : (
        <FlatList
          data={users}
          keyExtractor={(item) => item._id}
          refreshControl={
            <RefreshControl refreshing={refreshing} onRefresh={load} />
          }
          renderItem={renderUserItem}
          ListHeaderComponent={() => (
            <View style={styles.section}>
              <Text style={styles.sectionTitle}>Recent Conversations</Text>
              {conversations.length === 0 ? (
                <Text style={styles.emptyText}>No recent chats yet</Text>
              ) : (
                conversations.map((c) => {
                  const other = (c.participants as any[]).find(
                    (p) => (p._id || p) !== user?.id
                  );
                  const otherName =
                    typeof other === "string" ? other : other?.username;

                  return (
                    <TouchableOpacity
                      key={c._id}
                      style={styles.item}
                      onPress={() =>
                        router.push({
                          pathname: "/(app)/chat",
                          params: { conversationId: c._id, username: otherName },
                        })
                      }
                    >
                      <View style={styles.itemContent}>
                        {/* Avatar */}
                        <View style={styles.avatar}>
                          <Text style={styles.avatarText}>
                            {getInitials(otherName || "?")}
                          </Text>
                        </View>

                        <View style={{ flex: 1 }}>
                          <Text style={styles.name}>{otherName}</Text>
                          <Text style={styles.lastMessage} numberOfLines={1}>
                            {c.lastMessage?.text ?? "No messages yet"}
                          </Text>
                        </View>
                      </View>
                    </TouchableOpacity>
                  );
                })
              )}
              <Text style={[styles.sectionTitle, { marginTop: 16 }]}>
                All Users
              </Text>
            </View>
          )}
          ListEmptyComponent={() => (
            <Text style={styles.emptyText}>No users found</Text>
          )}
        />
      )}
    </View>
  );
}

const styles = StyleSheet.create({
  container: { flex: 1, backgroundColor: "#fff" },

  header: {
    flexDirection: "row",
    alignItems: "center",
    justifyContent: "space-between",
    padding: 16,
    borderBottomWidth: 1,
    borderBottomColor: "#eee",
  },
  headerText: { fontSize: 20, fontWeight: "700" },
  logout: { color: "#f55", fontWeight: "600" },

  section: { paddingHorizontal: 16, paddingTop: 8, paddingBottom: 12 },
  sectionTitle: { fontWeight: "600", fontSize: 16, marginBottom: 8 },

  item: {
    paddingHorizontal: 16,
    paddingVertical: 12,
    borderBottomWidth: 1,
    borderBottomColor: "#f1f1f1",
  },
  itemContent: { flexDirection: "row", alignItems: "center" },

  avatar: {
    width: 46,
    height: 46,
    borderRadius: 23,
    backgroundColor: "#007bff",
    justifyContent: "center",
    alignItems: "center",
    marginRight: 12,
  },
  avatarText: { color: "#fff", fontWeight: "700", fontSize: 16 },

  name: { fontSize: 16, fontWeight: "600" },
  status: { fontSize: 13, marginTop: 2 },
  lastMessage: { color: "#666", marginTop: 2, fontSize: 13 },

  emptyText: { textAlign: "center", color: "#999", marginTop: 12 },

  loadingContainer: {
    flex: 1,
    justifyContent: "center",
    alignItems: "center",
  },
});
