import Foundation

struct AppUser: Codable, Identifiable {
    let id: UUID
    var displayName: String?
    var handicap: Double?
    var homeCourseId: UUID?
    let createdAt: Date?
    var updatedAt: Date?

    enum CodingKeys: String, CodingKey {
        case id
        case displayName = "display_name"
        case handicap
        case homeCourseId = "home_course_id"
        case createdAt = "created_at"
        case updatedAt = "updated_at"
    }
}
