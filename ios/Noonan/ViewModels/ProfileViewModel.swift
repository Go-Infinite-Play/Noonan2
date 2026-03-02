import Foundation

@MainActor
class ProfileViewModel: ObservableObject {
    @Published var user: AppUser?
    @Published var isLoading = false

    func loadProfile() async {
        isLoading = true
        do {
            let session = try await supabase.auth.session
            user = try await supabase
                .from("users")
                .select()
                .eq("id", value: session.user.id)
                .single()
                .execute()
                .value
        } catch {
            print("Load profile error: \(error)")
        }
        isLoading = false
    }

    func updateDisplayName(_ name: String) async {
        guard let userId = user?.id else { return }
        do {
            try await supabase
                .from("users")
                .update(["display_name": name])
                .eq("id", value: userId)
                .execute()
            user?.displayName = name
        } catch {
            print("Update name error: \(error)")
        }
    }

    func updateHandicap(_ handicap: Double?) async {
        guard let userId = user?.id else { return }
        do {
            if let handicap = handicap {
                try await supabase
                    .from("users")
                    .update(["handicap": handicap])
                    .eq("id", value: userId)
                    .execute()
            }
            user?.handicap = handicap
        } catch {
            print("Update handicap error: \(error)")
        }
    }
}
