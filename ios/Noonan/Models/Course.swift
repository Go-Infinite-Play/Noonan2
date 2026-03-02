import Foundation

struct Course: Codable, Identifiable {
    let id: UUID
    var externalId: String?
    let name: String
    var city: String?
    var state: String?
    var country: String?
    var par: Int?

    enum CodingKeys: String, CodingKey {
        case id
        case externalId = "external_id"
        case name
        case city
        case state
        case country
        case par
    }
}
