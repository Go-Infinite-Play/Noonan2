import Foundation

struct Conversation: Codable, Identifiable {
    let id: UUID
    let userId: UUID
    var roundId: UUID?
    var conversationType: String
    let startedAt: Date?
    var lastMessageAt: Date?

    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case roundId = "round_id"
        case conversationType = "conversation_type"
        case startedAt = "started_at"
        case lastMessageAt = "last_message_at"
    }
}
