import Foundation
import Supabase

struct ChatResponse: Codable {
    let message: String
    let conversationId: UUID

    enum CodingKeys: String, CodingKey {
        case message
        case conversationId = "conversation_id"
    }
}

private struct ChatRequestBody: Encodable {
    let message: String
    let conversationId: String?

    enum CodingKeys: String, CodingKey {
        case message
        case conversationId = "conversation_id"
    }
}

private struct MemoryRequestBody: Encodable {
    let conversationId: String

    enum CodingKeys: String, CodingKey {
        case conversationId = "conversation_id"
    }
}

class ChatService {
    func sendMessage(_ text: String, conversationId: UUID?) async throws -> ChatResponse {
        let body = ChatRequestBody(
            message: text,
            conversationId: conversationId?.uuidString
        )

        let response: ChatResponse = try await supabase.functions.invoke(
            "chat",
            options: .init(body: body)
        )

        return response
    }

    func updateMemory(conversationId: UUID) async throws {
        let body = MemoryRequestBody(conversationId: conversationId.uuidString)
        try await supabase.functions.invoke(
            "update-memory",
            options: .init(body: body)
        )
    }

    func loadConversations() async throws -> [Conversation] {
        return try await supabase
            .from("conversations")
            .select()
            .order("last_message_at", ascending: false)
            .execute()
            .value
    }

    func loadMessages(conversationId: UUID) async throws -> [ChatMessage] {
        return try await supabase
            .from("messages")
            .select()
            .eq("conversation_id", value: conversationId)
            .order("created_at", ascending: true)
            .execute()
            .value
    }

    func createFirstConversation(introMessage: String) async throws -> UUID {
        let session = try await supabase.auth.session

        struct ConvInsert: Encodable {
            let user_id: String
            let conversation_type: String
        }

        let conv: Conversation = try await supabase
            .from("conversations")
            .insert(ConvInsert(user_id: session.user.id.uuidString, conversation_type: "general"))
            .select()
            .single()
            .execute()
            .value

        struct MsgInsert: Encodable {
            let conversation_id: String
            let role: String
            let content: String
        }

        try await supabase
            .from("messages")
            .insert(MsgInsert(
                conversation_id: conv.id.uuidString,
                role: "assistant",
                content: introMessage
            ))
            .execute()

        return conv.id
    }
}
