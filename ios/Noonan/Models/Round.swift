import Foundation

struct Round: Codable, Identifiable {
    let id: UUID
    let userId: UUID
    var courseId: UUID?
    var score: Int?
    var datePlayed: String
    var highlights: String?
    var mood: String?
    let createdAt: Date?

    // Joined data
    var course: Course?

    enum CodingKeys: String, CodingKey {
        case id
        case userId = "user_id"
        case courseId = "course_id"
        case score
        case datePlayed = "date_played"
        case highlights
        case mood
        case createdAt = "created_at"
        case course = "courses"
    }
}
