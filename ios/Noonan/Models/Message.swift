import Foundation

struct ChatMessage: Codable, Identifiable {
    let id: UUID
    let conversationId: UUID
    let role: String
    let content: String
    let createdAt: Date?

    enum CodingKeys: String, CodingKey {
        case id
        case conversationId = "conversation_id"
        case role
        case content
        case createdAt = "created_at"
    }

    var isUser: Bool { role == "user" }
}
